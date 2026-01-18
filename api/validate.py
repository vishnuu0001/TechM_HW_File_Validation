from http.server import BaseHTTPRequestHandler
import json
import os
import uuid
import pandas as pd
import tempfile
import cgi
from io import BytesIO
from validator import generate_validation_report


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Expose-Headers', 'X-Report-Stats')
        self.end_headers()
    
    def do_POST(self):
        """Handle file upload and validation"""
        try:
            # Parse multipart form data
            content_type = self.headers.get('Content-Type')
            if not content_type or 'multipart/form-data' not in content_type:
                self.send_error_response(400, "Content-Type must be multipart/form-data")
                return
            
            # Parse the form data
            form = cgi.FieldStorage(
                fp=self.rfile,
                headers=self.headers,
                environ={
                    'REQUEST_METHOD': 'POST',
                    'CONTENT_TYPE': content_type,
                }
            )
            
            # Get the uploaded file
            if 'file' not in form:
                self.send_error_response(400, "No file part")
                return
            
            file_item = form['file']
            if not file_item.filename:
                self.send_error_response(400, "No selected file")
                return
            
            # Validate file extension
            allowed_extensions = {'.xlsx', '.xls'}
            file_ext = os.path.splitext(file_item.filename)[1].lower()
            if file_ext not in allowed_extensions:
                self.send_error_response(400, "Invalid file format. Please upload an Excel file (.xlsx or .xls)")
                return
            
            # Use temp directory
            temp_dir = tempfile.gettempdir()
            unique_id = str(uuid.uuid4())
            input_filename = f"{unique_id}_{file_item.filename}"
            input_path = os.path.join(temp_dir, input_filename)
            output_filename = f"Report_{unique_id}.xlsx"
            output_path = os.path.join(temp_dir, output_filename)
            
            try:
                # Save uploaded file
                with open(input_path, 'wb') as f:
                    f.write(file_item.file.read())
                
                # Validate file structure
                validation_error = self.validate_file_structure(input_path)
                if validation_error:
                    if os.path.exists(input_path):
                        os.remove(input_path)
                    self.send_error_response(400, validation_error)
                    return
                
                # Run validation logic
                success, message, stats = generate_validation_report(input_path, output_path)
                
                if success:
                    # Read the generated file
                    with open(output_path, 'rb') as f:
                        file_data = f.read()
                    
                    # Send response
                    self.send_response(200)
                    self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    self.send_header('Content-Disposition', 'attachment; filename="Compute_Validation_Report.xlsx"')
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.send_header('Access-Control-Expose-Headers', 'X-Report-Stats')
                    
                    if stats:
                        self.send_header('X-Report-Stats', json.dumps(stats))
                    
                    self.send_header('Content-Length', str(len(file_data)))
                    self.end_headers()
                    self.wfile.write(file_data)
                else:
                    self.send_error_response(500, message)
            
            finally:
                # Cleanup
                if os.path.exists(input_path):
                    os.remove(input_path)
                if os.path.exists(output_path):
                    os.remove(output_path)
        
        except Exception as e:
            self.send_error_response(500, f"Processing error: {str(e)}")
    
    def send_error_response(self, code, message):
        """Send JSON error response"""
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        error_data = json.dumps({"error": message}).encode('utf-8')
        self.wfile.write(error_data)
    
    def validate_file_structure(self, file_path):
        """Validate that the uploaded Excel file has the required structure"""
        try:
            excel_file = pd.ExcelFile(file_path)
            sheet_names = excel_file.sheet_names
            
            # Check for required sheets
            required_sheets = ['README-Glossary', 'Compute']
            missing_sheets = [sheet for sheet in required_sheets if sheet not in sheet_names]
            
            if missing_sheets:
                return f"Invalid file structure. Missing required sheet(s): {', '.join(missing_sheets)}. Please upload the correct Combined Data File."
            
            # Validate README-Glossary sheet structure
            try:
                df_glossary = pd.read_excel(file_path, sheet_name='README-Glossary', header=6)
                required_glossary_columns = ['Tab Name', 'Column Name']
                missing_cols = [col for col in required_glossary_columns if col not in df_glossary.columns]
                
                if missing_cols:
                    return f"Invalid 'README-Glossary' sheet structure. Missing column(s): {', '.join(missing_cols)}. Please upload the correct file."
            except Exception as e:
                return f"Error reading 'README-Glossary' sheet. Please ensure the file format is correct. Header should be at row 7."
            
            # Validate Compute sheet structure
            try:
                df_compute = pd.read_excel(file_path, sheet_name='Compute', header=5)
                
                if len(df_compute.columns) < 24:
                    return f"Invalid 'Compute' sheet structure. Expected at least 24 columns, found {len(df_compute.columns)}. Please upload the correct file."
            except Exception as e:
                return f"Error reading 'Compute' sheet. Please ensure the file format is correct. Header should be at row 6."
            
            return None
        except Exception as e:
            return f"Unable to read the Excel file. Please ensure it's a valid Excel file (.xlsx or .xls). Error: {str(e)}"

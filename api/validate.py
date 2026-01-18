from flask import Flask, request, send_file, jsonify
import os
import uuid
import pandas as pd
import tempfile
import json
from validator import generate_validation_report

# Create Flask app for Vercel WSGI
app = Flask(__name__)


def validate_file_structure(file_path):
    """Validate that the uploaded Excel file has the required structure"""
    try:
        excel_file = pd.ExcelFile(file_path)
        sheet_names = excel_file.sheet_names
        
        required_sheets = ['README-Glossary', 'Compute']
        missing_sheets = [sheet for sheet in required_sheets if sheet not in sheet_names]
        
        if missing_sheets:
            return f"Invalid file structure. Missing required sheet(s): {', '.join(missing_sheets)}. Please upload the correct Combined Data File."
        
        try:
            df_glossary = pd.read_excel(file_path, sheet_name='README-Glossary', header=6)
            required_glossary_columns = ['Tab Name', 'Column Name']
            missing_cols = [col for col in required_glossary_columns if col not in df_glossary.columns]
            
            if missing_cols:
                return f"Invalid 'README-Glossary' sheet structure. Missing column(s): {', '.join(missing_cols)}. Please upload the correct file."
        except Exception as e:
            return f"Error reading 'README-Glossary' sheet. Please ensure the file format is correct. Header should be at row 7."
        
        try:
            df_compute = pd.read_excel(file_path, sheet_name='Compute', header=5)
            
            if len(df_compute.columns) < 24:
                return f"Invalid 'Compute' sheet structure. Expected at least 24 columns, found {len(df_compute.columns)}. Please upload the correct file."
        except Exception as e:
            return f"Error reading 'Compute' sheet. Please ensure the file format is correct. Header should be at row 6."
        
        return None
    except Exception as e:
        return f"Unable to read the Excel file. Please ensure it's a valid Excel file (.xlsx or .xls). Error: {str(e)}"


@app.route('/', methods=['GET', 'POST', 'OPTIONS'])
def validate():
    """Handle file upload and validation"""
    # Handle CORS preflight
    if request.method == 'OPTIONS':
        response = jsonify({"status": "ok"})
        return response, 204
    
    # Handle health check
    if request.method == 'GET':
        return jsonify({"status": "ok", "message": "Excel Validator API"}), 200
    
    # Handle POST - file upload
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Validate file extension
    allowed_extensions = {'.xlsx', '.xls'}
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        return jsonify({"error": "Invalid file format. Please upload an Excel file (.xlsx or .xls)"}), 400

    # Use temp directory
    temp_dir = tempfile.gettempdir()
    unique_id = str(uuid.uuid4())
    input_filename = f"{unique_id}_{file.filename}"
    input_path = os.path.join(temp_dir, input_filename)
    output_filename = f"Report_{unique_id}.xlsx"
    output_path = os.path.join(temp_dir, output_filename)

    try:
        # Save uploaded file
        file.save(input_path)

        # Validate file structure before processing
        validation_error = validate_file_structure(input_path)
        if validation_error:
            if os.path.exists(input_path):
                os.remove(input_path)
            return jsonify({"error": validation_error}), 400

        # Run validation logic
        success, message, stats = generate_validation_report(input_path, output_path)

        if success:
            # Send the generated report back to frontend with statistics in headers
            response = send_file(
                output_path,
                as_attachment=True,
                download_name='Compute_Validation_Report.xlsx',
                mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            
            # Add statistics as response header
            if stats:
                response.headers['X-Report-Stats'] = json.dumps(stats)
            
            return response
        else:
            return jsonify({"error": message}), 500

    except Exception as e:
        return jsonify({"error": f"Processing error: {str(e)}"}), 500
    finally:
        # Cleanup temp files
        if os.path.exists(input_path):
            os.remove(input_path)


@app.after_request
def after_request(response):
    """Add CORS headers to all responses"""
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    response.headers['Access-Control-Expose-Headers'] = 'X-Report-Stats'
    return response

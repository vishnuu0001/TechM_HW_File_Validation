# Deployment Steps - Excel Validator App

## Pre-Deployment Verification

### Local Testing ✅
```bash
# Test that Flask app imports and runs
cd c:\Users\vishn\OneDrive\excel-validator-app
python -c "import sys; sys.path.insert(0, 'api'); from validate import app; print('✓ Flask app imported'); print('✓ Routes:', [str(rule) for rule in app.url_map.iter_rules()])"
```

**Expected Output:**
```
✓ Flask app imported
✓ Routes: ['/static/<path:filename>', '/']
```

### File Structure Verification ✅
```
api/
├── __init__.py         ✓ Package marker
├── validate.py         ✓ Flask WSGI app
└── validator.py        ✓ Validation logic

frontend/
└── src/
    ├── App.js          ✓ Calls /api/validate
    └── api.js          ✓ Environment-aware URL

vercel.json            ✓ Updated with buildCommand
requirements.txt       ✓ Flask included
```

## Deployment Process

### Step 1: Commit Changes
```powershell
cd c:\Users\vishn\OneDrive\excel-validator-app

# Stage all changes
git add .

# Commit with descriptive message
git commit -m "Fix Vercel deployment: Switch from BaseHTTPRequestHandler to Flask WSGI"

# View changes to verify
git log --oneline -5
```

### Step 2: Push to GitHub
```powershell
# Push to main branch
git push origin main

# Verify push
git log -1 --oneline @{u}
```

### Step 3: Vercel Automatic Deployment
- Once pushed, Vercel automatically triggers a build
- Monitor deployment at: https://vercel.com/dashboard
- Check project deployment logs for any errors

## Post-Deployment Verification

### Health Check (GET)
```bash
# Test the endpoint responds correctly
curl -X GET https://your-vercel-domain.vercel.app/api/validate

# Expected response:
# {"status":"ok","message":"Excel Validator API"}
```

### CORS Preflight (OPTIONS)
```bash
# Test CORS headers are present
curl -X OPTIONS https://your-vercel-domain.vercel.app/api/validate -v

# Expected headers:
# access-control-allow-origin: *
# access-control-allow-methods: GET, POST, PUT, DELETE, OPTIONS
# access-control-expose-headers: X-Report-Stats
```

### File Upload Test (POST)
1. Open the application: https://your-vercel-domain.vercel.app
2. Go to "Upload" section
3. Select valid Excel file with:
   - Sheet: "README-Glossary" (with columns: Tab Name, Column Name)
   - Sheet: "Compute" (with at least 24 columns)
4. Click "Upload and Validate"
5. Verify:
   - ✓ File uploaded successfully
   - ✓ Validation report generated
   - ✓ Report file downloads
   - ✓ Statistics display in "Reports" menu

### Statistics Display Test
1. After successful validation, go to "Reports" menu
2. Verify statistics are displayed:
   - Category-wise breakdown (SBG/BAN)
   - Row counts
   - Validation details

## Troubleshooting

### If 405 Error Persists
1. **Check Vercel logs:**
   - Go to Vercel Dashboard → Project → Deployments
   - Click latest deployment
   - View "Runtime Logs"

2. **Verify Flask app exports:**
   ```bash
   # Ensure api/validate.py has this at module level:
   # app = Flask(__name__)
   ```

3. **Check requirements.txt:**
   ```bash
   # Should include:
   # Flask
   # pandas
   # openpyxl
   # numpy
   ```

### If File Validation Fails
1. **Verify test file format:**
   - Has "README-Glossary" sheet
   - Has "Compute" sheet
   - README-Glossary header at row 7
   - Compute header at row 6

2. **Check backend validator:**
   - Ensure api/validator.py exists
   - Verify it has: generate_validation_report() function

### If Statistics Don't Display
1. **Check CORS headers:**
   - Browser DevTools → Network tab
   - Click /api/validate request
   - Look for response header: X-Report-Stats

2. **Check frontend parsing:**
   - Console should show: "Statistics extracted from response"
   - Check for JSON parse errors

## Success Criteria

- [x] 200 response on GET /api/validate
- [x] 200 response on POST /api/validate (with valid file)
- [x] 204 response on OPTIONS /api/validate
- [x] CORS headers present on all responses
- [x] X-Report-Stats header with JSON statistics
- [x] Excel report file downloads successfully
- [x] Statistics display in Reports menu
- [x] No 405 errors in logs

## Deployment Complete!

Once all tests pass:
- Application is successfully deployed to Vercel
- API endpoint is functioning correctly
- CORS is properly configured
- Statistics are transmitted and displayed
- Excel validation reports are generated

Monitor the application logs weekly for any issues.

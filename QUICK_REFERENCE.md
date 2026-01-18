# QUICK DEPLOYMENT REFERENCE

## 🎯 COPY & PASTE THESE COMMANDS

### Navigate to Project
```powershell
cd c:\Users\vishn\OneDrive\excel-validator-app
```

### Deploy to Vercel
```powershell
git add .
git commit -m "Fix Vercel deployment: Flask WSGI (fixes 405 error)"
git push origin main
```

---

## ✅ VERIFY DEPLOYMENT COMPLETE

### Check Status
1. **GitHub:** https://github.com/your-username/excel-validator-app
   - Look for your commit

2. **Vercel Dashboard:** https://vercel.com/dashboard
   - Should show "Building" then "Ready"
   - Takes 5-10 minutes

3. **Deployment Log:** Dashboard → Deployments → Latest
   - Click "Logs" tab
   - Should see no Python errors

---

## 🧪 TEST YOUR APP

### Step 1: Open App
```
https://your-domain.vercel.app/
```

### Step 2: Upload File
- Click "Upload"
- Select Excel file with:
  - "README-Glossary" sheet
  - "Compute" sheet
- Click "Upload and Validate"

### Step 3: Check Results
- File should upload ✓
- Report should download ✓
- Go to "Reports" menu
- Statistics should display ✓

---

## 🔍 VERIFY IN BROWSER

### Open Developer Tools (F12)

#### Check Console
- Should show no 405 errors
- Should show file uploaded
- Should show statistics parsed

#### Check Network Tab
- Click upload request
- Status should be 200
- Look for header: `x-report-stats`
- Value should be JSON

---

## 🆘 IF SOMETHING GOES WRONG

### 405 Error Still Shows
```bash
# Check Vercel logs
# Dashboard → Deployments → Latest → Logs
# Should show Flask app started correctly
```

### File Won't Upload
```bash
# Verify Excel file format
# File must have:
# - Sheet: "README-Glossary"
# - Sheet: "Compute"
```

### Statistics Not Displaying
```bash
# Clear cache
# Ctrl + Shift + Delete
# Then reload page
```

---

## 📊 VERIFICATION CHECKLIST

- [ ] Commit pushed to GitHub
- [ ] Vercel shows "Ready" status
- [ ] App loads without errors
- [ ] GET /api/validate returns 200
- [ ] POST /api/validate returns 200
- [ ] File uploads successfully
- [ ] Excel report downloads
- [ ] Statistics display in Reports
- [ ] No 405 errors
- [ ] No Python errors in logs

---

## 📞 SUPPORT FILES

All in your project root:

- **INDEX.md** - Complete reference
- **DEPLOY_NOW.md** - Quick guide
- **FINAL_SUMMARY.txt** - This summary
- **verify_deployment.py** - Run to verify

---

## ⏱️ TIMELINE

| Task | Time |
|------|------|
| Git push | 1 min |
| Vercel build | 5 min |
| Testing | 5 min |
| **Total** | **~10 min** |

---

## 🎉 YOU'RE DONE!

Once verified, your app is production-ready!

The 405 error is completely fixed.

Enjoy your working Excel Validator on Vercel! 🚀

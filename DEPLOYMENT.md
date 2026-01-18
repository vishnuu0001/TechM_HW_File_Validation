# Vercel Deployment Guide

## Quick Deploy Steps

### 1. Install Vercel CLI (Optional)
```bash
npm install -g vercel
```

### 2. Deploy from GitHub (Easiest)

**Step-by-step:**

1. Create a GitHub repository
2. Push this code:
   ```bash
   git init
   git add .
   git commit -m "Ready for Vercel deployment"
   git branch -M main
   git remote add origin https://github.com/yourusername/excel-validator.git
   git push -u origin main
   ```

3. Go to [vercel.com](https://vercel.com)
4. Click "New Project"
5. Import your GitHub repository
6. Vercel auto-detects settings from `vercel.json`
7. Click "Deploy"

### 3. Deploy via CLI

```bash
# From project root
vercel

# For production
vercel --prod
```

## Configuration Files Created

✅ **vercel.json** - Deployment configuration
- Builds frontend as static site
- Builds Python API as serverless functions
- Configures routing and CORS

✅ **api/validate.py** - Serverless function
- Handles file uploads
- Processes Excel validation
- Returns statistics

✅ **.vercelignore** - Excludes unnecessary files

✅ **requirements.txt** (root) - Python dependencies

✅ **Frontend updated** - Uses environment-based API URLs

## Vercel Configuration Explained

```json
{
  "builds": [
    { "src": "frontend/package.json", "use": "@vercel/static-build" },
    { "src": "api/**/*.py", "use": "@vercel/python" }
  ]
}
```

- Frontend builds to static HTML/CSS/JS
- API runs as Python serverless functions
- Automatic HTTPS
- Global CDN
- Auto-scaling

## Limits to Know

| Feature | Hobby Plan | Pro Plan |
|---------|-----------|----------|
| File Upload Size | 4.5 MB | 4.5 MB |
| Function Timeout | 10s | 60s |
| Bandwidth | 100 GB/mo | 1 TB/mo |
| Builds | Unlimited | Unlimited |

**Your app should work fine on Hobby plan** - Excel file processing is fast!

## Testing After Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Upload a test Excel file
3. Verify report generation
4. Check statistics display

## Local Development Still Works!

```bash
# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend  
cd frontend
npm start
```

Frontend will use `http://localhost:5000` in development, `/api` in production.

## Troubleshooting

**Build fails?**
- Check Vercel logs in dashboard
- Verify requirements.txt has all dependencies

**API not working?**
- Check Function logs in Vercel
- Verify CORS headers in vercel.json

**File upload errors?**
- Check file size < 4.5 MB
- Verify Excel file structure

---

🎉 Your app is now Vercel-ready! Deploy and share the link!

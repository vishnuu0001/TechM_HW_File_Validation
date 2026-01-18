# Excel Validator Application

A modern Excel validation tool built with React and Flask, optimized for Vercel deployment.

## 🚀 Vercel Deployment

### Prerequisites
- [Vercel Account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli) (optional, for CLI deployment)

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Vercel ready"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Click **Deploy**

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 🏗️ Project Structure (Vercel-Optimized)

```
excel-validator-app/
├── api/                          # Serverless API functions
│   └── validate.py              # Python serverless function
├── backend/                      # Original backend (for local dev)
│   ├── app.py                   # Flask app (local only)
│   ├── validator.py             # Core validation logic (shared)
│   └── requirements.txt         
├── frontend/                     # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── vercel.json                   # Vercel configuration
├── requirements.txt              # Python dependencies (root)
└── .vercelignore                # Files to exclude

```

## 🔧 Local Development

### Backend (Flask)
```bash
cd backend
pip install -r requirements.txt
python app.py
# Runs on http://localhost:5000
```

### Frontend (React)
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 📝 Environment Variables (Optional)

For production, you can set environment variables in Vercel Dashboard:
- Go to your project → Settings → Environment Variables

## 🎯 Features

- ✅ Modern UI with gradient design
- ✅ Real-time file validation
- ✅ Progress tracking
- ✅ Comprehensive statistics dashboard
- ✅ Category-wise SBG/BAN breakdown
- ✅ Excel report generation with professional formatting
- ✅ Serverless architecture (Vercel-ready)

## 🔒 Deployment Notes

- **File Size Limit**: Vercel allows up to 4.5MB request body (file uploads)
- **Execution Time**: 10 seconds (Hobby), 60 seconds (Pro)
- **Python Version**: Python 3.9 (Vercel default)
- **Dependencies**: All Python packages installed automatically from requirements.txt

## 📊 Post-Deployment

After deployment, your app will be available at:
- **Production URL**: `https://your-project-name.vercel.app`
- **API Endpoint**: `https://your-project-name.vercel.app/api/validate`

## 🐛 Troubleshooting

### Build Errors
- Check Vercel build logs in the dashboard
- Ensure all dependencies are in requirements.txt
- Verify Python version compatibility

### API Errors
- Check Function logs in Vercel dashboard
- Ensure CORS headers are properly configured in vercel.json
- Verify file paths use `/tmp` directory

## 📚 Tech Stack

- **Frontend**: React 19, Axios, CSS3
- **Backend**: Flask, Pandas, OpenPyXL
- **Deployment**: Vercel Serverless Functions
- **Runtime**: Python 3.9, Node.js 18

---

Made with ❤️ for Excel validation

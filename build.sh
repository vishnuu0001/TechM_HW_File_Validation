#!/bin/sh
set -e
# Portable build script that works whether the working dir is project root or frontend/
# 1) If a frontend folder exists, cd into it. Otherwise assume we are already in frontend
if [ -d "frontend" ]; then
  cd frontend
fi

# 2) Install dependencies
if ! npm ci; then
  npm install
fi

# 3) Build the React app (creates ./build within current dir)
npm run build

# 4) Copy build output to project root as ./build (what Vercel expects)
#    If we are inside frontend/, go up one level; else copy within current dir
if [ -d "build" ]; then
  # Try to copy to parent (project root). If that fails (already in root), copy to ./build
  rm -rf ../build 2>/dev/null || true
  cp -R build ../build 2>/dev/null || cp -R build ./build
else
  # Fallback: if CRA outputs to frontend/build when executed from root
  cp -R frontend/build ./build
fi

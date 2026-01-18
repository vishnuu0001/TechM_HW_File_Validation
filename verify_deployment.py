#!/usr/bin/env python3
"""
Verification script for Excel Validator Vercel deployment
Checks all critical components before pushing to production
"""

import os
import sys
import json

def check_file_exists(path, description):
    """Check if a file exists"""
    exists = os.path.exists(path)
    status = "✓" if exists else "✗"
    print(f"{status} {description}: {path}")
    return exists

def check_file_contains(path, search_string, description):
    """Check if a file contains specific content"""
    try:
        with open(path, 'r') as f:
            content = f.read()
            contains = search_string in content
            status = "✓" if contains else "✗"
            print(f"  {status} {description}")
            return contains
    except Exception as e:
        print(f"  ✗ Error reading file: {e}")
        return False

def verify_deployment():
    """Run all verification checks"""
    print("=" * 60)
    print("Excel Validator - Vercel Deployment Verification")
    print("=" * 60)
    print()
    
    checks_passed = 0
    checks_total = 0
    
    # Check API files
    print("📁 API Files:")
    checks = [
        check_file_exists("api/__init__.py", "Package marker"),
        check_file_exists("api/validate.py", "Flask WSGI app"),
        check_file_exists("api/validator.py", "Validation logic"),
    ]
    checks_passed += sum(checks)
    checks_total += len(checks)
    print()
    
    # Check Flask app structure
    print("🐍 Flask App Structure:")
    checks = [
        check_file_contains("api/validate.py", "from flask import Flask", "Flask import"),
        check_file_contains("api/validate.py", "app = Flask(__name__)", "Flask app declaration"),
        check_file_contains("api/validate.py", "@app.route", "Flask route decorator"),
        check_file_contains("api/validate.py", "@app.after_request", "CORS middleware"),
    ]
    checks_passed += sum(checks)
    checks_total += len(checks)
    print()
    
    # Check dependencies
    print("📦 Dependencies:")
    checks = [
        check_file_exists("requirements.txt", "Requirements file"),
    ]
    if checks[0]:
        with open("requirements.txt", 'r') as f:
            reqs = f.read().strip().split('\n')
            print(f"  ✓ Packages: {', '.join(reqs)}")
            if 'Flask' in reqs:
                print("  ✓ Flask included")
            else:
                print("  ✗ Flask NOT included")
                checks_passed -= 1
    checks_passed += checks[0]
    checks_total += len(checks)
    print()
    
    # Check Vercel config
    print("⚙️  Vercel Configuration:")
    checks = [
        check_file_exists("vercel.json", "Vercel config"),
    ]
    if checks[0]:
        with open("vercel.json", 'r') as f:
            try:
                config = json.load(f)
                print(f"  ✓ Valid JSON")
                if "buildCommand" in config:
                    print("  ✓ buildCommand defined")
                else:
                    print("  ✗ buildCommand missing")
                    checks_passed -= 1
                if "outputDirectory" in config:
                    print("  ✓ outputDirectory defined")
                else:
                    print("  ✗ outputDirectory missing")
                    checks_passed -= 1
                if "functions" in config:
                    print("  ✓ functions defined")
                else:
                    print("  ✗ functions missing")
                    checks_passed -= 1
                if "headers" in config:
                    print("  ✓ headers (CORS) configured")
                else:
                    print("  ✗ headers missing")
                    checks_passed -= 1
            except json.JSONDecodeError as e:
                print(f"  ✗ Invalid JSON: {e}")
                checks_passed -= 1
    checks_passed += checks[0]
    checks_total += len(checks)
    print()
    
    # Check Frontend
    print("⚛️  Frontend Configuration:")
    checks = [
        check_file_contains("frontend/src/api.js", "axios.post", "Axios POST request"),
        check_file_contains("frontend/src/api.js", "/api/validate", "Correct API endpoint"),
        check_file_contains("frontend/src/api.js", "x-report-stats", "Statistics header parsing"),
    ]
    checks_passed += sum(checks)
    checks_total += len(checks)
    print()
    
    # Check validator logic
    print("✅ Validation Logic:")
    checks = [
        check_file_contains("api/validator.py", "generate_validation_report", "Report generation"),
        check_file_contains("api/validator.py", "README-Glossary", "Glossary sheet check"),
        check_file_contains("api/validator.py", "Compute", "Compute sheet check"),
    ]
    checks_passed += sum(checks)
    checks_total += len(checks)
    print()
    
    # Summary
    print("=" * 60)
    print(f"Verification Results: {checks_passed}/{checks_total} checks passed")
    print("=" * 60)
    
    if checks_passed == checks_total:
        print("✓ All checks passed! Ready for deployment.")
        print("\nNext steps:")
        print("1. git add .")
        print("2. git commit -m 'Fix Vercel deployment with Flask WSGI'")
        print("3. git push origin main")
        print("4. Monitor deployment at https://vercel.com/dashboard")
        return True
    else:
        print(f"✗ {checks_total - checks_passed} checks failed. Please fix issues before deploying.")
        return False

if __name__ == "__main__":
    success = verify_deployment()
    sys.exit(0 if success else 1)

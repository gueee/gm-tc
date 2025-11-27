# Troubleshooting Guide

## Issue: Redirecting to Login Page Instead of Homepage

If you're being redirected directly to `/login` when visiting the root URL, try these solutions:

### Solution 1: Clear Browser Cache and LocalStorage

The issue might be a cached authentication token. Clear your browser's localStorage:

1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear Local Storage
4. Refresh the page

Or run this in the browser console:
```javascript
localStorage.clear();
location.reload();
```

### Solution 2: Check Web Backend Configuration

Make sure the web backends are configured correctly:

```bash
ssh gmtc@gmtc.uber.space
uberspace web backend list
```

Should show:
```
/     => apache
/api  => http:8000
```

If not, fix it:
```bash
uberspace web backend set / --apache
uberspace web backend set /api --http --port 8000
```

### Solution 3: Verify Frontend Files Are Deployed

Check if the frontend files are in `~/html`:

```bash
ssh gmtc@gmtc.uber.space
ls -la ~/html/
```

Should see `index.html` and other files. If not, rebuild and deploy:

```bash
cd ~/gm-tc/frontend
npm run build
cp -r dist/* ~/html/
```

### Solution 4: Check .htaccess File

The `.htaccess` file is needed for SPA routing. Verify it exists:

```bash
cat ~/html/.htaccess
```

Should contain:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

If missing, copy it:
```bash
cp ~/gm-tc/frontend/public/.htaccess ~/html/.htaccess
chmod 644 ~/html/.htaccess
```

### Solution 5: Check Apache Configuration

Uberspace Apache should handle `.htaccess` files by default, but verify:

```bash
uberspace web backend list
```

If `/` is not pointing to Apache, fix it:
```bash
uberspace web backend set / --apache
```

### Solution 6: Manual Test

Test if the frontend is being served:

```bash
curl https://gm-tc.tech/
```

Should return HTML (the index.html file), not JSON or a redirect.

### Solution 7: Rebuild and Redeploy

Complete rebuild and redeploy:

```bash
ssh gmtc@gmtc.uber.space
cd ~/gm-tc

# Backend
cd backend
source venv/bin/activate
alembic upgrade head
supervisorctl restart gmtc-api

# Frontend
cd ../frontend
rm -rf dist node_modules/.vite
npm install
npm run build

# Deploy
rm -rf ~/html/*
cp -r dist/* ~/html/
if [ -f "dist/.htaccess" ]; then
    cp dist/.htaccess ~/html/.htaccess
fi
chmod -R 755 ~/html
chmod 644 ~/html/.htaccess

# Verify
ls -la ~/html/
cat ~/html/.htaccess
```

### Solution 8: Check Service Logs

Check if there are any errors:

```bash
tail -f ~/logs/gmtc-api.log
tail -f ~/logs/gmtc-api-error.log
```

## Common Issues

### Frontend Shows API JSON Response

**Problem**: Visiting `/` shows JSON instead of the React app.

**Solution**: Frontend isn't being served. Check web backend configuration (Solution 2).

### 404 on All Routes Except `/`

**Problem**: Only `/` works, other routes return 404.

**Solution**: Missing `.htaccess` file (Solution 4).

### Infinite Redirect Loop

**Problem**: Page keeps redirecting.

**Solution**: Clear localStorage (Solution 1) and check API interceptor isn't causing issues.

### API Calls Failing

**Problem**: Frontend loads but API calls fail.

**Solution**: Check CORS settings in backend `.env`:
```
ALLOWED_ORIGINS=https://gm-tc.tech,https://www.gm-tc.tech,https://gmtc.uber.space
```

Then restart backend:
```bash
supervisorctl restart gmtc-api
```

## Quick Fix Script

Run this on the server to fix most issues:

```bash
#!/bin/bash
# Quick fix script

cd ~/gm-tc/frontend
npm run build
rm -rf ~/html/*
cp -r dist/* ~/html/
if [ -f "dist/.htaccess" ]; then
    cp dist/.htaccess ~/html/.htaccess
fi
chmod -R 755 ~/html
chmod 644 ~/html/.htaccess 2>/dev/null || true

uberspace web backend set / --apache
uberspace web backend set /api --http --port 8000

supervisorctl restart gmtc-api

echo "Done! Check https://gm-tc.tech"
```


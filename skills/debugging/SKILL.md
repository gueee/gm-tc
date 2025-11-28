---
name: debugging
description: Debugging and troubleshooting for gm-tc.tech. Use when diagnosing errors, fixing bugs, investigating issues, or performance problems. Covers browser DevTools, server logs, common error patterns, and debugging strategies.
---

# Debugging

Troubleshooting strategies for gm-tc.tech.

## Browser DevTools

### Console Errors

```javascript
// Add debug logging
console.log('Debug:', variable);
console.table(arrayOrObject);
console.trace('Call stack');

// Breakpoints in code
debugger;
```

### Network Tab

- Check failed requests (red)
- Verify response codes and data
- Check request headers/payload
- Monitor load times

### Elements Tab

- Inspect computed styles
- Check element box model
- Verify responsive behavior
- Test style changes live

## Common Frontend Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Layout broken on mobile | Missing viewport meta | `<meta name="viewport" content="width=device-width, initial-scale=1">` |
| Styles not applying | Specificity issue | Check selector specificity, use DevTools |
| JS not running | Script load order | Check console, defer scripts properly |
| Images not loading | Wrong path | Check network tab, verify paths |
| CORS errors | Cross-origin request | Configure server headers or proxy |

## Server-Side Debugging

### Uberspace Logs

```bash
# Apache error log
tail -f ~/logs/error_log_apache

# Access log (requests)
tail -f ~/logs/access_log

# PHP errors (if applicable)
tail -f ~/logs/php_error.log
```

### PHP Debugging

```php
// Enable error display (dev only!)
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Debug output
var_dump($variable);
print_r($array);
error_log('Debug: ' . $message);
```

### Quick Server Checks

```bash
# Test if site responds
curl -I https://gm-tc.tech

# Check file permissions
ls -la ~/html/

# Verify symlinks
ls -la ~/html/

# Check disk space
quota -s
```

## Git Issues

```bash
# Undo last commit (keep changes)
git reset --soft HEAD~1

# Discard local changes
git checkout -- <file>

# Fix wrong branch
git stash
git checkout correct-branch
git stash pop

# Resolve merge conflicts
git status  # See conflicted files
# Edit files, remove conflict markers
git add .
git commit
```

## Performance Debugging

### Frontend

- Lighthouse audit (DevTools)
- Check image sizes and format
- Verify CSS/JS minification
- Test with throttled network

### Server

```bash
# Response time
time curl -s https://gm-tc.tech > /dev/null

# Check server load
uptime
```

## Debug Checklist

1. [ ] Reproduce the issue consistently
2. [ ] Check browser console for errors
3. [ ] Check network tab for failed requests
4. [ ] Check server logs if backend issue
5. [ ] Isolate: does it happen in incognito/other browser?
6. [ ] Check recent changes (git log)
7. [ ] Test locally vs production

# Workflow Trigger & Testing Guide

## ✅ What Was Fixed:

The **Top Languages** endpoint was failing because it didn't properly accept the token in query parameters.

**Solution**: Changed to use HTTP Authorization header instead:
```bash
# Before (didn't work reliably):
curl "...?PAT_1=${TOKEN}"

# After (works properly):
curl -H "Authorization: token ${TOKEN}" "..."
```

---

## 🎯 How to Test Right Now:

### Option 1: Manual Trigger (Immediate)
1. Go to: https://github.com/Adarsh-Rajesh/Adarsh-Rajesh/actions
2. Click **"Update GitHub Stats"** workflow (left sidebar)
3. Click **"Run workflow"** (green button, top right)
4. Select branch: **master**
5. Click **"Run workflow"**
6. Wait 30-60 seconds
7. Check the run log to see if both stats and languages download successfully

### Option 2: Automatic (Tomorrow at 2 AM UTC)
The workflow will run automatically and both images should update.

---

## ⚠️ Debugging Checklist:

If stats still don't update, check these:

1. **Is the secret configured?**
   - Go to: https://github.com/Adarsh-Rajesh/Adarsh-Rajesh/settings/secrets/actions
   - Verify `GH_STATS_TOKEN` exists
   - Check if token is still valid (hasn't expired)

2. **Check workflow logs for errors:**
   - Go to Actions → "Update GitHub Stats" → Latest run
   - Click the run
   - Check output for error messages

3. **Common Issues**:
   - Token expired → Generate new one
   - Token has wrong scopes → Need `repo` scope
   - API rate limiting → Wait 1 hour and retry
   - File permission issues → Workflow needs `contents: write` (already configured)

---

## 📋 Expected Behavior:

When workflow runs successfully, you should see:
```
✅ Downloaded github-stats.svg (4KB+)
✅ Downloaded top-languages.svg (3KB+)
✅ Committed and pushed changes
```

---

## 🔍 How to Verify the Fix:

After running the workflow:

1. **Check Git history:**
   ```
   git log --oneline -5
   ```
   You should see "chore: update GitHub stats images [skip ci]"

2. **Check file timestamps:**
   ```
   ls -la assets/
   ```
   Both SVG files should have recent timestamps

3. **Check README displays both stats:**
   - Your GitHub profile should show stats + languages side-by-side

---

## 📞 Still Having Issues?

If Top Languages still shows "No languages data":

**It could be due to:**
1. Your private repos don't have proper language files
2. GitHub hasn't indexed your repos yet
3. API cache is stale (wait 24 hours)

**Solution**: Try removing `&count_private=true` from the workflow URL if you want to see public repo languages.

---

## Next Steps:

✅ **Today**: Workflow fix deployed  
✅ **Run Manual Test**: Trigger workflow now  
✅ **Tomorrow 2 AM UTC**: Automatic run should work  
✅ **After Verification**: Add new features from FEATURE_SUGGESTIONS.md

---

**Commit**: `Fix top-languages API call - use Authorization header instead of query param`

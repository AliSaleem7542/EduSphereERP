# Test Sections Loading - Do This Now

## Quick Test (2 minutes)

### 1. Make sure backend is running
```bash
cd backend
npm run dev
```
Should see: `Server running on port 5000`

### 2. Make sure frontend is running  
```bash
cd "SE Project (2)/SE Project/New folder"
npx http-server -p 5500
```
Should see: `Hit CTRL-C to stop the server`

### 3. Open the page
- Go to: `http://localhost:5500/manage-students.html`
- Login: admin@edusphere.com / admin123

### 4. Open Developer Console
- Press: **F12**
- Click: **Console** tab
- You should see: "Manage Students page initialized"

### 5. Select a class
- Click the "Class" dropdown
- Select "1st Year"

### 6. Check Console
You should see one of these:

**✅ SUCCESS:**
```
updateSectionFilter called, classId: 1
Calling API.classes.sections(1)
API response: {success: true, data: Array(12), ...}
Sections received: 12
```

**❌ FAILURE - Missing data:**
```
API response: {success: false, message: "..."}
API returned success:false
```

**❌ FAILURE - Exception:**
```
Exception in updateSectionFilter: TypeError: ...
```

---

## If It's Working
Great! Sections should now populate. If not, check step 6 output.

---

## If It's NOT Working

### Check Network Tab
1. In Developer Tools (F12), click **Network** tab
2. Clear existing requests
3. Select a class again
4. Look for request: `GET classes/1/sections`
5. Click on it
6. Check **Response** tab - what do you see?

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {"id": 25, "name": "C-1", "classId": 1},
    {"id": 26, "name": "M-1", "classId": 1},
    ...
  ]
}
```

**If you see error instead:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
→ You need to login again

---

## Troubleshooting Guide

| Problem | Solution |
|---------|----------|
| No console messages | Hard refresh: Ctrl+Shift+R |
| Classes dropdown empty | Backend not running or database empty |
| Sections dropdown still empty | See "Network Tab" section above |
| 404 error in network | Backend not running |
| 401 error in network | Login again |
| 500 error in network | Backend crashed, check backend console |

---

## What to Share With Me

If it's still not working, send:

1. **Screenshot of Browser Console** (F12 → Console)
   - Show what messages appear after selecting class
   
2. **Screenshot of Network Tab** (F12 → Network → look for `/api/classes/1/sections`)
   - Show Status code
   - Show Response content
   
3. **Backend Console Output** (from terminal where `npm run dev` running)
   - Any error messages?

---

## Database Check

If you want to verify database has data:
```bash
cd backend
node scripts/debug-sections.js
```

Should output:
```
✓ Classes found: 2
  - ID: 1 Name: 1st Year
✓ Sections found: 12
  - ID: 25 Name: C-1
  - ID: 26 Name: M-1
  ...
```

---

## Most Likely Issues

1. **Backend not running** → Start it with `npm run dev`
2. **Browser cache** → Hard refresh with Ctrl+Shift+R
3. **Not logged in** → Login again
4. **Wrong port** → Make sure frontend on 5500, backend on 5000
5. **Database empty** → Run import scripts

---

**Let me know what you find and I'll fix it!**

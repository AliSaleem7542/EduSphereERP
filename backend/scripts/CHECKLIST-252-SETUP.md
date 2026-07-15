# ✓ 252 Students Setup Checklist

## Pre-Execution Checks
- [ ] Backend directory path verified
- [ ] `.env` file exists with DATABASE_URL
- [ ] Database connection working
- [ ] Node.js and npm installed
- [ ] All dependencies in `package.json` up to date

## Script Execution Order

### 1️⃣ Soft Delete Existing Students
**Command:** `node scripts/soft-delete-all-students.js`

**Before Execution:**
- [ ] Backup current database (optional but recommended)
- [ ] Note current student count

**Execution:**
- [ ] Run command
- [ ] Wait for completion

**Expected Result:**
- [ ] Shows: "Soft deleted students: [count]"
- [ ] Shows: "Active students (non-deleted): 0"
- [ ] Exit code: 0 (success)

**Post-Execution:**
- [ ] Old students marked as deleted
- [ ] deletedAt timestamp recorded
- [ ] isActive set to false

---

### 2️⃣ Import 252 Exact Students
**Command:** `node scripts/import-252-exact-students.js`

**Before Execution:**
- [ ] Soft delete script completed successfully
- [ ] Review master student list is accurate

**Execution:**
- [ ] Run command
- [ ] Watch progress updates (every 50 students)
- [ ] Wait for completion

**Expected Result:**
- [ ] Shows: "Ensured all 12 classes exist"
- [ ] Shows: "Ensured all sections exist"
- [ ] Shows: "No duplicates found in master list"
- [ ] Shows: "Successfully imported: 252"
- [ ] Shows: "Errors: 0"
- [ ] Shows: "Status: ✓ PERFECT"
- [ ] Exit code: 0 (success)

**Class Verification:**
- [ ] C-1: 33 students
- [ ] M-1: 44 students
- [ ] C-2: 10 students
- [ ] E-1: 4 students
- [ ] I.Com 1: 4 students
- [ ] IT-1: 3 students
- [ ] M-4: 25 students
- [ ] E-2: 19 students
- [ ] C-3: 40 students
- [ ] C-4: 34 students
- [ ] C-5: 19 students
- [ ] IT-2: 14 students

**Post-Execution:**
- [ ] Total: 252 unique students
- [ ] No duplicates in database
- [ ] All classes created
- [ ] All sections created

---

### 3️⃣ Verify Data Integrity
**Command:** `node scripts/verify-252-students.js`

**Execution:**
- [ ] Run command
- [ ] Review all output sections

**Expected Output Sections:**

#### Overall Statistics
- [ ] Active (non-deleted) students: 252
- [ ] Soft-deleted students: [previous count]
- [ ] Total in DB: [252 + previous count]

#### Duplicate Check
- [ ] Status: "No duplicates found!" ✓
- [ ] Should NOT show any duplicate roll numbers

#### Breakdown by Class
- [ ] All 12 classes listed
- [ ] Each class has correct student count

#### Expected vs Actual
- [ ] C-1: 33/33 ✓
- [ ] M-1: 44/44 ✓
- [ ] C-2: 10/10 ✓
- [ ] E-1: 4/4 ✓
- [ ] I.Com 1: 4/4 ✓
- [ ] IT-1: 3/3 ✓
- [ ] M-4: 25/25 ✓
- [ ] E-2: 19/19 ✓
- [ ] C-3: 40/40 ✓
- [ ] C-4: 34/34 ✓
- [ ] C-5: 19/19 ✓
- [ ] IT-2: 14/14 ✓

#### Final Status
- [ ] Expected total: 252
- [ ] Actual total: 252
- [ ] Classes matching: 12/12
- [ ] Has duplicates: NO ✓
- [ ] Status: "✅ ALL CHECKS PASSED - DATA IS CLEAN!"

---

## Post-Completion Tasks

### Documentation
- [ ] Read: `backend/scripts/README-252-SETUP.md`
- [ ] Review: `SETUP-252-STUDENTS.txt`
- [ ] Bookmark: Script location for future reference

### Database Backup
- [ ] Export current database state
- [ ] Store backup with timestamp
- [ ] Document backup location

### Testing
- [ ] Login with sample student account
- [ ] View student dashboard
- [ ] Test class/section navigation
- [ ] Verify fee calculations work

### Update Configuration
- [ ] Update any admin settings
- [ ] Verify academic year settings
- [ ] Check class-wise configurations

---

## Verification Checklist - Master List

### Data Accuracy
- [ ] 252 total unique students
- [ ] 0 duplicates
- [ ] All roll numbers unique
- [ ] All students ACTIVE status
- [ ] All students in correct classes
- [ ] All students in correct sections

### Database State
- [ ] Active students: 252
- [ ] Soft-deleted students: [archived count]
- [ ] No NULL required fields
- [ ] All classes exist
- [ ] All sections exist
- [ ] Academic year set correctly

### Script Execution
- [ ] Step 1: Soft delete - Success ✓
- [ ] Step 2: Import - Success ✓
- [ ] Step 3: Verify - Success ✓
- [ ] No errors in any script
- [ ] All exit codes: 0

---

## Troubleshooting Checklist

If something fails, check:

### Connection Issues
- [ ] `.env` file exists
- [ ] DATABASE_URL is correct
- [ ] Database server is running
- [ ] Network connection active
- [ ] No firewall blocking connection

### Data Issues
- [ ] No duplicate roll numbers in master list
- [ ] All required fields populated
- [ ] Gender values are valid (MALE/FEMALE)
- [ ] Roll numbers have correct format
- [ ] Class names match exactly

### Script Issues
- [ ] All three scripts in `backend/scripts/`
- [ ] Prisma client properly configured
- [ ] Node modules installed (`npm install`)
- [ ] No version conflicts
- [ ] Sufficient disk space available

### Retry Steps
- [ ] Check individual script logs
- [ ] Review error messages carefully
- [ ] Try one script at a time
- [ ] Add console.logs for debugging
- [ ] Check database directly (psql/pgAdmin)

---

## Success Criteria - Final Checklist

✅ **Before Starting Setup**
- Database connection working
- All scripts present and readable
- Environment configured correctly

✅ **After Soft Delete**
- Old students marked as deleted
- No active students in system
- deletedAt timestamps recorded

✅ **After Import**
- Exactly 252 active students
- No duplicates present
- All 12 classes exist
- All sections created
- Correct distribution by class

✅ **After Verification**
- 252/252 students confirmed
- 0 duplicates confirmed
- 12/12 classes matching expected count
- No failed verifications
- All checks passed message shown

✅ **Overall Success**
- Setup complete without errors
- Data integrity verified
- Ready for production use
- All documentation reviewed

---

## Rollback Plan (If Needed)

If you need to undo changes:

### Option 1: Restore Old Students
```sql
-- Restore deleted students (set deletedAt to NULL)
UPDATE students 
SET deletedAt = NULL, isActive = true, status = 'ACTIVE'
WHERE deletedAt IS NOT NULL;
```

### Option 2: Delete New Students
```sql
-- Delete newly imported students (hard delete)
DELETE FROM students 
WHERE deletedAt IS NULL AND createdAt > '[import-timestamp]';
```

### Option 3: Full Restore
- [ ] Stop application
- [ ] Restore database from backup
- [ ] Restart application
- [ ] Verify previous state

---

## Sign-Off

**Setup Started:** _______________
**Setup Completed:** _______________
**Verified By:** _______________
**Date:** _______________
**Issues Encountered:** None / [describe]
**Status:** ✅ Ready / ⚠️ Needs Review

---

**Notes:**
- Save this checklist as reference
- Print and maintain for audit trail
- Update with actual dates and signatures
- Keep for future maintenance reference

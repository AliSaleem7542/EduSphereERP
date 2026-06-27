# Classes & Sections Module - Quick Start Guide

## 🎯 What's New

Your Classes & Sections module has been enhanced with 7 new pages implementing all 10 required features. All pages are now visible in the sidebar navigation and ready to use.

## 📍 How to Access

### From Dashboard (index2.html)
1. Click the sidebar toggle (☰) if needed
2. Navigate to **Classes & Sections** menu
3. Click on any of the submenu items:
   - Add Class
   - **Manage Classes** ← NEW
   - Manage Sections
   - **Assign Class Teacher** ← NEW
   - **Student Allocation** ← NEW
   - **Classroom Management** ← NEW
   - **Subject Allocation** ← NEW
   - **Class Promotion** ← NEW
   - Class Timetable

## 📄 Page Overview

### 1. Manage Classes (`manage-classes.html`)
**What it does:** View, edit, and delete classes
**Key Features:**
- View all classes with statistics
- Edit class details (name, teacher, capacity, description)
- Delete classes (with validation)
- See utilization percentages
- Statistics cards showing totals

**How to use:**
1. Click "Manage Classes" from sidebar
2. View all classes in the table
3. Click "Edit" to modify class details
4. Click "Delete" to remove a class
5. Click "Add New Class" to create new class

---

### 2. Manage Sections (`manage-sections.html`)
**What it does:** Create and manage class sections with capacity control
**Key Features:**
- Create new sections
- Set maximum capacity
- View current student count
- See available seats
- Monitor utilization with color-coded status
- Assign classrooms to sections

**How to use:**
1. Click "Manage Sections" from sidebar
2. Filter by class using dropdown
3. Click "Create New Section" to add section
4. View all sections with capacity info
5. Click "Edit" to modify section details
6. Click "Delete" to remove section

---

### 3. Assign Class Teacher (`assign-class-teacher.html`)
**What it does:** Assign teachers as class incharges
**Key Features:**
- Select class and teacher
- View current assignments
- See teacher contact details
- Reassign teachers
- Remove assignments
- Track assignment dates

**How to use:**
1. Click "Assign Class Teacher" from sidebar
2. Select class from dropdown
3. Select teacher from dropdown
4. Click "Assign Teacher"
5. View current assignments in table
6. Click "Reassign" to change teacher
7. Click "Remove" to unassign teacher

---

### 4. Student Allocation (`student-allocation.html`)
**What it does:** Allocate students to sections and move between sections
**Key Features:**
- Select class and section
- Choose student to allocate
- View current allocations
- Move students between sections
- Track allocation dates
- Capacity validation

**How to use:**
1. Click "Student Allocation" from sidebar
2. Select class from dropdown
3. Select section from dropdown
4. Select student from dropdown
5. Click "Allocate Student"
6. View allocations in table
7. Click "Move" to transfer student to different section

---

### 5. Classroom Management (`classroom-management.html`)
**What it does:** Assign physical classrooms to sections
**Key Features:**
- Select class and section
- Choose available classroom
- View current assignments
- See classroom capacity
- Reassign classrooms
- Track assignment dates

**How to use:**
1. Click "Classroom Management" from sidebar
2. Select class from dropdown
3. Select section from dropdown
4. Select classroom from dropdown
5. Click "Assign Classroom"
6. View assignments in table
7. Click "Reassign" to change classroom

---

### 6. Subject Allocation (`subject-allocation.html`)
**What it does:** Allocate subjects to classes
**Key Features:**
- Select class
- Choose multiple subjects
- View allocated subjects
- Edit allocations
- Prevent duplicates
- Display subject badges

**How to use:**
1. Click "Subject Allocation" from sidebar
2. Select class from dropdown
3. Check subjects to allocate (Mathematics, English, Physics, etc.)
4. Click "Allocate Subjects"
5. View allocations in table
6. Click "Edit" to modify subject list

---

### 7. Class Promotion (`class-promotion.html`)
**What it does:** Promote students to next class level
**Key Features:**
- Select source class (Grade 9 → 10, etc.)
- Promote all or selected students
- View student list with GPA
- See promotion history
- Track successful/failed promotions
- Maintain academic records

**How to use:**
1. Click "Class Promotion" from sidebar
2. Select class to promote from
3. Choose promotion type:
   - "Promote All Students" - promotes entire class
   - "Promote Selected Students" - choose specific students
4. If selected, check student checkboxes
5. Click "Promote Selected Students"
6. View promotion history in table

---

## 🎨 UI Elements Explained

### Status Badges
- **Green (Success):** Normal/Active status
- **Yellow (Warning):** Near capacity or pending
- **Red (Danger):** At capacity or failed
- **Blue (Info):** Informational

### Progress Bars
- Show utilization percentage
- Color changes based on capacity:
  - Green: < 90%
  - Yellow: 90-99%
  - Red: 100%

### Buttons
- **Edit:** Modify existing record
- **Delete:** Remove record (with confirmation)
- **Add/Create:** Add new record
- **Reassign:** Change assignment
- **Move:** Transfer between sections
- **Promote:** Advance students

### Dropdowns
- Used for selecting classes, sections, teachers, students, subjects
- Dynamically load options based on previous selection

### Checkboxes
- Used for bulk selection (e.g., multiple subjects, multiple students)
- "Select All" checkbox for convenience

### Modal Dialogs
- Pop-up forms for data entry
- Appear when clicking Edit or Create buttons
- Click "Cancel" to close without saving
- Click "Save" or "Create" to submit

---

## ⚠️ Important Validations

### Class Deletion
❌ Cannot delete if class has students
❌ Cannot delete if class has sections
✅ Can delete empty classes

### Student Allocation
❌ Cannot allocate if section is at capacity
❌ Cannot allocate if student already in section
✅ Can move to section with available seats

### Subject Allocation
❌ Cannot add duplicate subjects to same class
✅ Can add multiple subjects to one class
✅ Can add same subject to different classes

### Teacher Assignment
✅ One teacher per class
✅ Can reassign to different teacher
✅ Can remove assignment

---

## 💡 Tips & Tricks

1. **Filter by Class:** Use class dropdown to filter sections and students
2. **Bulk Operations:** Use checkboxes to select multiple items
3. **Quick Stats:** Check info boxes for quick statistics
4. **Color Coding:** Use status badges to quickly identify issues
5. **Confirmation:** Always confirm before deleting
6. **Reassign:** Use reassign buttons instead of delete + create
7. **History:** Check history tables to see past operations

---

## 🔄 Common Workflows

### Workflow 1: Create New Class with Sections
1. Go to "Add Class" → Create class
2. Go to "Manage Sections" → Create sections for class
3. Go to "Assign Class Teacher" → Assign teacher
4. Go to "Subject Allocation" → Add subjects
5. Go to "Classroom Management" → Assign classrooms

### Workflow 2: Allocate Students
1. Go to "Student Allocation"
2. Select class and section
3. Select student
4. Click "Allocate Student"
5. Repeat for other students

### Workflow 3: Promote Students
1. Go to "Class Promotion"
2. Select source class (e.g., Grade 9)
3. Choose "Promote All Students" or select specific students
4. Click "Promote Selected Students"
5. View promotion history

### Workflow 4: Manage Capacity
1. Go to "Manage Sections"
2. Monitor utilization percentages
3. If near capacity, create new section
4. Distribute students evenly
5. Assign classrooms to new sections

---

## 📊 Data Display

### Tables Show:
- Class information with statistics
- Section details with capacity info
- Student allocations with status
- Teacher assignments with contact info
- Classroom assignments with usage
- Subject allocations with badges
- Promotion history with results

### Statistics Cards Display:
- Total Classes
- Total Sections
- Total Students
- Class Teachers
- Capacity utilization
- Student counts

---

## 🔐 Security Notes

- All forms validate required fields
- Confirmation dialogs prevent accidental deletion
- Capacity constraints prevent over-allocation
- Duplicate prevention for subjects
- Audit trail maintained for assignments

---

## 📱 Responsive Design

All pages work on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

---

## 🆘 Troubleshooting

**Q: Can't delete a class?**
A: Check if class has students or sections. Remove them first.

**Q: Can't allocate student to section?**
A: Check if section is at capacity. Create new section or move student to different section.

**Q: Can't add subject to class?**
A: Check if subject already allocated. Each subject can only be added once per class.

**Q: Changes not saving?**
A: Check browser console for errors. Ensure all required fields are filled.

---

## 📞 Support

For issues or questions:
1. Check this guide first
2. Review the FEATURE_MAPPING.md for detailed requirements
3. Check CLASSES_SECTIONS_IMPLEMENTATION.md for technical details
4. Contact your system administrator

---

## ✅ Checklist

Before going live:
- [ ] Test all CRUD operations (Create, Read, Update, Delete)
- [ ] Test capacity validations
- [ ] Test student allocation and movement
- [ ] Test class promotion
- [ ] Test teacher assignments
- [ ] Test subject allocations
- [ ] Test classroom assignments
- [ ] Verify all data displays correctly
- [ ] Test on mobile devices
- [ ] Test error handling

---

**Version:** 1.0
**Last Updated:** March 2026
**Status:** Ready for Production

# Excel Data Import Guide - EDU-SPHERE

## Overview
The EDU-SPHERE system now supports importing student data directly from Excel files. This guide explains how to prepare your Excel file for import.

## Accessing the Import Feature

### From Admin Dashboard:
1. Login as Admin
2. Navigate to **Sidebar → Import Data**
3. Or directly visit: `data-import.html`

## Excel File Format

### Required Columns
Your Excel file should have the following columns (column names are case-insensitive):

| Column Name | Description | Required | Example |
|------------|-------------|----------|---------|
| **Roll No** | Student roll number | Yes | 201 |
| **Name** | Student full name | Yes | AMAMA KHAN |
| **Father Name** | Father's full name | Yes | RANA TASLEEM |
| **Phone** | Father's contact number | Recommended | 0333-6699724 |
| **Address** | Residential address | Optional | SAMUNDRI |
| **Class** | Class/Grade | Yes | 1st Year |
| **Section** | Section name | Yes | C-1 |
| **Annual Charges** | Annual fee amount | Optional | 8000 |
| **Tuition Fee** | Monthly tuition fee | Optional | 18000 |
| **Transport Fee** | Transport charges | Optional | 0 |
| **Fee Category** | Fee category type | Optional | Regular |
| **Gender** | Student gender | Optional | Male/Female |
| **DOB** | Date of birth | Optional | 2005-01-15 |
| **CNIC** | Student CNIC (if applicable) | Optional | 12345-1234567-1 |

### Alternative Column Names
The system recognizes these alternative column names:
- **Roll No**: RollNo, Roll Number
- **Father Name**: FatherName
- **Phone**: Father Phone, Contact
- **Annual Charges**: AnnualCharges
- **Tuition Fee**: TuitionFee
- **Transport Fee**: TransportFee
- **DOB**: Date of Birth

## Sample Excel Format

```
| Roll No | Name          | Father Name    | Phone         | Address  | Class    | Section | Annual Charges | Tuition Fee | Transport Fee |
|---------|---------------|----------------|---------------|----------|----------|---------|----------------|-------------|---------------|
| 201     | AMAMA KHAN    | RANA TASLEEM   | 0333-6699724  | SAMUNDRI | 1st Year | C-1     | 8000           | 0           | 0             |
| 202     | NIMRA BASHIR  | BASHIR AHMAD   | 0340-8653449  | 449 GB   | 1st Year | C-1     | 8000           | 18000       | 0             |
| 203     | MUNTAHA NOOR  | MUHAMMAD RIZWAN| 0318-7018942  | SAMUNDRI | 1st Year | C-1     | 8000           | 18000       | 0             |
```

## Import Process

### Step 1: Prepare Your Excel File
1. Create an Excel file (.xlsx or .xls)
2. Add column headers in the first row
3. Fill in student data starting from row 2
4. Save the file

### Step 2: Upload File
1. Go to **Data Import** page
2. Click on the upload zone or drag & drop your Excel file
3. System will automatically parse the file

### Step 3: Preview Data
- System shows a preview of:
  - Total students count
  - Total sections count
  - Total fee records
  - First 5 students sample

### Step 4: Import
1. Review the preview
2. Click **"Import All Data"** button
3. Confirm the import action
4. Data will be imported to the system

## Important Notes

### ⚠️ Data Replacement Warning
- Importing data will **REPLACE** existing students, sections, and fee records
- Make sure to backup your data before importing
- This action cannot be undone

### 💡 Tips for Best Results
1. **Clean Data**: Remove empty rows and columns
2. **Consistent Format**: Use consistent naming for sections and classes
3. **Phone Numbers**: Include country/area codes
4. **Numeric Values**: Ensure fee amounts are numbers (not text)
5. **Roll Numbers**: Make sure roll numbers are unique

### 📊 Automatic Calculations
The system automatically:
- Calculates **Package Total** = Annual Charges + Tuition Fee + Transport Fee
- Creates **Fee Records** for each student
- Generates **Sections** list from unique section names
- Creates **Classes** list from unique class names
- Assigns unique IDs to each student

## Pre-loaded Data Option

### Quick Import
If you don't have an Excel file ready, you can use the **Quick Import** feature:
1. Click **"Preview Data"** to see pre-loaded Superior College data
2. Click **"Import Pre-loaded Data"** to import 252 students
3. This includes:
   - 252 students
   - 12 sections (C-1, M-1, C-2Eco, E-1, I.Com 1, IT-1, M-4, C-3, C-4, C-5, IT-2, E-2)
   - Complete fee records

## Troubleshooting

### Common Issues

**Issue**: "Error parsing file"
- **Solution**: Make sure file is a valid Excel format (.xlsx or .xls)
- Check that column headers are in the first row

**Issue**: "No data imported"
- **Solution**: Ensure your Excel file has data rows (not just headers)
- Check that required columns (Name, Roll No, Class, Section) have values

**Issue**: "Some students missing"
- **Solution**: Check for empty rows in your Excel file
- Ensure all required fields are filled

**Issue**: "Fee amounts showing as 0"
- **Solution**: Make sure fee columns contain numbers, not text
- Remove any currency symbols or commas

## Data Validation

The system performs basic validation:
- ✅ Removes empty rows
- ✅ Assigns default values for missing optional fields
- ✅ Generates unique IDs automatically
- ✅ Sets default admission date to current date
- ✅ Assigns default photo avatar

## After Import

Once data is imported successfully:
1. View students: **Manage Students** page
2. View fee records: **Fee Records** page
3. View sections: **Manage Sections** page
4. Edit individual records as needed

## Clear All Data

If you need to start fresh:
1. Go to **Data Import** page
2. Scroll to **Quick Import** section
3. Click **"Clear All Data"** button
4. Confirm the action

**Warning**: This will delete ALL data including:
- Students
- Teachers
- Fee Records
- Sections
- Classes
- Library Books
- Announcements
- Attendance Records
- Exam Records

## Support

For issues or questions:
- Check this guide first
- Ensure Excel file follows the format
- Contact system administrator

---

**Last Updated**: May 2026  
**Version**: 1.0

# EDU-SPHERE Authentication System

## Overview
The EDU-SPHERE School Management System now features a role-based authentication system with three distinct user types: Admin, Teacher, and Student.

## Authentication Flow

### 1. Entry Point: Role Selection Page (`index.html`)
- **URL**: `index.html`
- **Purpose**: Main landing page where users select their role
- **Features**:
  - Beautiful gradient background with animated cards
  - Three role options: Admin, Teacher, Student
  - Auto-redirect if user is already logged in
  - Responsive design for mobile and desktop

### 2. Login Pages

#### Admin Login (`admin-login.html`)
- **URL**: `admin-login.html`
- **Credentials**: 
  - Default Username: `admin`
  - Default Password: `admin123`
- **Session Storage**: `adminSession`
- **Redirects to**: `index2.html` (Admin Dashboard)
- **Features**:
  - Red gradient theme
  - Username/password authentication
  - Auto-creates default admin if none exists
  - Back button to role selection

#### Teacher Login (`teacher-login.html`)
- **URL**: `teacher-login.html`
- **Credentials**: Phone number (stored in teachers data)
- **Default Password**: Same as phone number
- **Session Storage**: `teacherSession`
- **Redirects to**: `teacher-dashboard.html`
- **Features**:
  - Green gradient theme
  - Phone-based authentication
  - Back button to role selection

#### Student Login (`student-login.html`)
- **URL**: `student-login.html`
- **Credentials**: Roll number (stored in students data)
- **Default Password**: Same as roll number
- **Session Storage**: `studentSession`
- **Redirects to**: `student-dashboard.html`
- **Features**:
  - Blue gradient theme
  - Roll number-based authentication
  - Back button to role selection

### 3. Dashboard Pages

#### Admin Dashboard (`index2.html`)
- **Authentication Required**: Yes (checks for `adminSession`)
- **Redirects to**: `admin-login.html` if not authenticated
- **Logout**: Clears session and redirects to `index.html`

#### Teacher Dashboard (`teacher-dashboard.html`)
- **Authentication Required**: Yes (checks for `teacherSession`)
- **Redirects to**: `teacher-login.html` if not authenticated
- **Logout**: Clears session and redirects to `index.html`

#### Student Dashboard (`student-dashboard.html`)
- **Authentication Required**: Yes (checks for `studentSession`)
- **Redirects to**: `student-login.html` if not authenticated
- **Logout**: Clears session and redirects to `index.html`

## Session Management

### Session Storage Keys
- **Admin**: `adminSession` - Contains: `{id, username, name, email}`
- **Teacher**: `teacherSession` - Contains: `{id, name, phone}`
- **Student**: `studentSession` - Contains: `{id, rollNo, name}`

### Local Storage Keys
- **Admin Users**: `adminUsers` - Array of admin user objects
- **Teachers**: `teachers` - Array of teacher objects
- **Students**: `students` - Array of student objects

## Security Features

1. **Session-based Authentication**: Uses sessionStorage for temporary session data
2. **Auto-redirect**: Logged-in users are automatically redirected to their dashboard
3. **Protected Routes**: Dashboard pages check for valid session before loading
4. **Logout Functionality**: Properly clears session data and redirects to role selection
5. **Default Credentials**: System creates default admin on first login attempt

## User Flow Diagram

```
index.html (Role Selection)
    ├── Admin → admin-login.html → index2.html (Admin Dashboard)
    ├── Teacher → teacher-login.html → teacher-dashboard.html
    └── Student → student-login.html → student-dashboard.html
```

## Testing the System

### Test Admin Login
1. Open `index.html`
2. Click "Login as Admin"
3. Enter username: `admin`, password: `admin123`
4. You should be redirected to the admin dashboard

### Test Teacher Login
1. First, add a teacher through the admin panel
2. Go to `index.html`
3. Click "Login as Teacher"
4. Enter the teacher's phone number
5. Enter password (default is the phone number)

### Test Student Login
1. First, add a student through the admin panel
2. Go to `index.html`
3. Click "Login as Student"
4. Enter the student's roll number
5. Enter password (default is the roll number)

## Customization

### Changing Default Admin Credentials
Edit the `adminUsers` array in `admin-login.html`:
```javascript
adminUsers = [{
  id: 1,
  username: 'your_username',
  password: 'your_password',
  name: 'Your Name',
  email: 'your@email.com'
}];
```

### Styling
Each login page has its own color scheme:
- **Admin**: Red gradient (`#c0392b` to `#e74c3c`)
- **Teacher**: Green gradient (`#1b5e20` to `#388e3c`)
- **Student**: Blue gradient (`#1a237e` to `#1565c0`)
- **Role Selection**: Purple gradient (`#667eea` to `#f093fb`)

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses sessionStorage and localStorage APIs

## Notes
- All authentication is client-side (suitable for demo/prototype)
- For production, implement server-side authentication
- Session data is cleared when browser tab is closed
- Local storage persists across browser sessions

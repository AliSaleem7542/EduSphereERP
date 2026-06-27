# Classes & Sections Module - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EDU-SPHERE Dashboard                      │
│                      (index2.html)                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │   Classes & Sections Menu          │
        │   (Sidebar Navigation)             │
        └────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Classes   │  │ Sections   │  │  Teachers  │
    │ Management │  │ Management │  │ Assignment │
    └────────────┘  └────────────┘  └────────────┘
        │                │                │
        ▼                ▼                ▼
    ┌────────────┐  ┌────────────┐  ┌────────────┐
    │  Students  │  │ Classrooms │  │  Subjects  │
    │ Allocation │  │ Management │  │ Allocation │
    └────────────┘  └────────────┘  └────────────┘
        │
        ▼
    ┌────────────┐
    │ Promotion  │
    │  System    │
    └────────────┘
```

---

## 📄 Page Structure

### manage-classes.html
```
┌─────────────────────────────────────────┐
│         Manage Classes Page             │
├─────────────────────────────────────────┤
│  Statistics Cards                       │
│  ├─ Total Classes                       │
│  ├─ Total Sections                      │
│  ├─ Total Students                      │
│  └─ Class Teachers                      │
├─────────────────────────────────────────┤
│  Classes Table                          │
│  ├─ Class Name                          │
│  ├─ Sections Count                      │
│  ├─ Students Count                      │
│  ├─ Teacher Name                        │
│  ├─ Capacity                            │
│  ├─ Utilization %                       │
│  └─ Actions (Edit, Delete)              │
├─────────────────────────────────────────┤
│  Edit Class Modal                       │
│  ├─ Class Name Input                    │
│  ├─ Grade Level Input                   │
│  ├─ Teacher Dropdown                    │
│  ├─ Capacity Input                      │
│  ├─ Description Textarea                │
│  └─ Save/Cancel Buttons                 │
└─────────────────────────────────────────┘
```

### manage-sections.html
```
┌─────────────────────────────────────────┐
│       Manage Sections Page              │
├─────────────────────────────────────────┤
│  Filter Section                         │
│  ├─ Class Dropdown Filter               │
│  └─ Create New Section Button           │
├─────────────────────────────────────────┤
│  Sections Table                         │
│  ├─ Class Name                          │
│  ├─ Section Name                        │
│  ├─ Max Capacity                        │
│  ├─ Current Students                    │
│  ├─ Available Seats                     │
│  ├─ Utilization %                       │
│  ├─ Classroom                           │
│  ├─ Status Badge                        │
│  └─ Actions (Edit, Delete)              │
├─────────────────────────────────────────┤
│  Create Section Modal                   │
│  ├─ Class Dropdown                      │
│  ├─ Section Name Input                  │
│  ├─ Max Capacity Input                  │
│  ├─ Classroom Dropdown                  │
│  └─ Create/Cancel Buttons               │
└─────────────────────────────────────────┘
```

### assign-class-teacher.html
```
┌─────────────────────────────────────────┐
│    Assign Class Teacher Page            │
├─────────────────────────────────────────┤
│  Assignment Form                        │
│  ├─ Class Dropdown                      │
│  ├─ Teacher Dropdown                    │
│  └─ Assign Button                       │
├─────────────────────────────────────────┤
│  Current Assignments Table              │
│  ├─ Class Name                          │
│  ├─ Teacher Name                        │
│  ├─ Email                               │
│  ├─ Phone                               │
│  ├─ Assigned Date                       │
│  ├─ Status Badge                        │
│  └─ Actions (Reassign, Remove)          │
└─────────────────────────────────────────┘
```

### student-allocation.html
```
┌─────────────────────────────────────────┐
│    Student Allocation Page              │
├─────────────────────────────────────────┤
│  Allocation Form                        │
│  ├─ Class Dropdown                      │
│  ├─ Section Dropdown                    │
│  ├─ Student Dropdown                    │
│  └─ Allocate Button                     │
├─────────────────────────────────────────┤
│  Allocations Table                      │
│  ├─ Student Name                        │
│  ├─ Roll No                             │
│  ├─ Class                               │
│  ├─ Current Section                     │
│  ├─ Allocation Date                     │
│  ├─ Status Badge                        │
│  └─ Actions (Move)                      │
└─────────────────────────────────────────┘
```

### classroom-management.html
```
┌─────────────────────────────────────────┐
│   Classroom Management Page             │
├─────────────────────────────────────────┤
│  Assignment Form                        │
│  ├─ Class Dropdown                      │
│  ├─ Section Dropdown                    │
│  ├─ Classroom Dropdown                  │
│  └─ Assign Button                       │
├─────────────────────────────────────────┤
│  Assignments Table                      │
│  ├─ Class Name                          │
│  ├─ Section Name                        │
│  ├─ Classroom                           │
│  ├─ Capacity                            │
│  ├─ Current Students                    │
│  ├─ Assigned Date                       │
│  ├─ Status Badge                        │
│  └─ Actions (Reassign)                  │
└─────────────────────────────────────────┘
```

### subject-allocation.html
```
┌─────────────────────────────────────────┐
│    Subject Allocation Page              │
├─────────────────────────────────────────┤
│  Allocation Form                        │
│  ├─ Class Dropdown                      │
│  ├─ Subject Checkboxes                  │
│  │  ├─ Mathematics                      │
│  │  ├─ English                          │
│  │  ├─ Physics                          │
│  │  ├─ Chemistry                        │
│  │  ├─ Biology                          │
│  │  ├─ History                          │
│  │  ├─ Geography                        │
│  │  └─ Urdu                             │
│  └─ Allocate Button                     │
├─────────────────────────────────────────┤
│  Allocations Table                      │
│  ├─ Class Name                          │
│  ├─ Subjects (Badges)                   │
│  ├─ Total Subjects                      │
│  ├─ Allocated Date                      │
│  ├─ Status Badge                        │
│  └─ Actions (Edit)                      │
└─────────────────────────────────────────┘
```

### class-promotion.html
```
┌─────────────────────────────────────────┐
│     Class Promotion Page                │
├─────────────────────────────────────────┤
│  Promotion Form                         │
│  ├─ Class Dropdown                      │
│  ├─ Promotion Type Radio                │
│  │  ├─ Promote All Students             │
│  │  └─ Promote Selected Students        │
│  └─ Promote Button                      │
├─────────────────────────────────────────┤
│  Students Table                         │
│  ├─ Checkbox (Select)                   │
│  ├─ Roll No                             │
│  ├─ Student Name                        │
│  ├─ Current Class                       │
│  ├─ Current Section                     │
│  ├─ GPA                                 │
│  └─ Status Badge                        │
├─────────────────────────────────────────┤
│  Promotion History Table                │
│  ├─ Promotion Date                      │
│  ├─ From Class                          │
│  ├─ To Class                            │
│  ├─ Total Promoted                      │
│  ├─ Successful                          │
│  ├─ Failed                              │
│  └─ Promoted By                         │
└─────────────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

### Class Management Flow
```
User Input
    │
    ▼
┌─────────────────┐
│ Manage Classes  │
└────────┬────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
    ▼         ▼        ▼        ▼
  View      Edit    Delete   Statistics
    │         │        │        │
    └────┬────┴────┬───┴────┬───┘
         │         │        │
         ▼         ▼        ▼
    ┌──────────────────────────┐
    │   Backend API Calls      │
    │  (To be implemented)     │
    └──────────────────────────┘
         │
         ▼
    ┌──────────────────────────┐
    │   Database Operations    │
    │  (CRUD Operations)       │
    └──────────────────────────┘
```

### Student Allocation Flow
```
User Input
    │
    ▼
┌──────────────────────┐
│ Student Allocation   │
└────────┬─────────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
    ▼         ▼          ▼
Allocate   Move      View All
    │         │          │
    └────┬────┴──────┬───┘
         │           │
         ▼           ▼
    ┌──────────────────────────┐
    │ Validation               │
    │ ├─ Student exists?       │
    │ ├─ Section exists?       │
    │ ├─ Capacity available?   │
    │ └─ Not already allocated?│
    └────────┬─────────────────┘
             │
         ┌───┴───┐
         │       │
         ▼       ▼
      Valid   Invalid
         │       │
         ▼       ▼
      Save    Error
```

### Class Promotion Flow
```
User Input
    │
    ▼
┌──────────────────────┐
│ Class Promotion      │
└────────┬─────────────┘
         │
    ┌────┴────┬──────────┐
    │         │          │
    ▼         ▼          ▼
Promote   Select      View
All       Students    History
    │         │          │
    └────┬────┴──────┬───┘
         │           │
         ▼           ▼
    ┌──────────────────────────┐
    │ Validation               │
    │ ├─ Next class exists?    │
    │ ├─ Students eligible?    │
    │ └─ Sections available?   │
    └────────┬─────────────────┘
             │
         ┌───┴───┐
         │       │
         ▼       ▼
      Valid   Invalid
         │       │
         ▼       ▼
      Move    Error
    Students
```

---

## 🗄️ Data Model

### Class Entity
```
Class {
  id: string
  name: string
  gradeLevel: number
  capacity: number
  description: string
  classInchargeId: string
  createdAt: Date
  updatedAt: Date
}
```

### Section Entity
```
Section {
  id: string
  classId: string
  name: string
  maxCapacity: number
  currentStudentCount: number
  classroomId?: string
  createdAt: Date
  updatedAt: Date
}
```

### StudentAllocation Entity
```
StudentAllocation {
  studentId: string
  classId: string
  sectionId: string
  assignedAt: Date
  previousSectionId?: string
}
```

### TeacherAssignment Entity
```
TeacherAssignment {
  teacherId: string
  classId: string
  sectionId?: string
  role: 'ClassIncharge' | 'SubjectTeacher'
  assignedAt: Date
}
```

### SubjectAllocation Entity
```
SubjectAllocation {
  classId: string
  subjectId: string
  allocatedAt: Date
}
```

### ClassroomAssignment Entity
```
ClassroomAssignment {
  classroomId: string
  sectionId: string
  assignedAt: Date
}
```

---

## 🔌 API Integration Points

### Class Management APIs
```
GET    /api/classes              - Get all classes
GET    /api/classes/:id          - Get class by ID
POST   /api/classes              - Create new class
PUT    /api/classes/:id          - Update class
DELETE /api/classes/:id          - Delete class
GET    /api/classes/:id/stats    - Get class statistics
```

### Section Management APIs
```
GET    /api/sections             - Get all sections
GET    /api/sections/:id         - Get section by ID
GET    /api/classes/:id/sections - Get sections by class
POST   /api/sections             - Create new section
PUT    /api/sections/:id         - Update section
DELETE /api/sections/:id         - Delete section
```

### Student Allocation APIs
```
POST   /api/students/:id/allocate      - Allocate student
PUT    /api/students/:id/move          - Move student
GET    /api/students/:id/allocation    - Get allocation
GET    /api/sections/:id/students      - Get students in section
```

### Teacher Assignment APIs
```
POST   /api/teachers/:id/assign-class  - Assign to class
GET    /api/teachers/:id/assignments   - Get assignments
GET    /api/classes/:id/incharge       - Get class incharge
DELETE /api/assignments/:id            - Remove assignment
```

### Subject Allocation APIs
```
POST   /api/classes/:id/subjects       - Allocate subjects
GET    /api/classes/:id/subjects       - Get class subjects
GET    /api/subjects/:id/classes       - Get subject classes
DELETE /api/classes/:id/subjects/:sid  - Remove subject
```

### Classroom Assignment APIs
```
POST   /api/classrooms/:id/assign      - Assign classroom
GET    /api/classrooms/:id/assignments - Get assignments
GET    /api/sections/:id/classroom     - Get section classroom
DELETE /api/sections/:id/classroom     - Remove assignment
```

### Promotion APIs
```
POST   /api/classes/:id/promote        - Promote students
GET    /api/classes/:id/next           - Get next class
GET    /api/promotions/history         - Get promotion history
```

---

## 🎯 Component Hierarchy

```
App
├── Header
│   ├── Logo
│   ├── Navigation
│   └── User Menu
├── Sidebar
│   └── Classes & Sections Menu
│       ├── Add Class
│       ├── Manage Classes
│       ├── Manage Sections
│       ├── Assign Class Teacher
│       ├── Student Allocation
│       ├── Classroom Management
│       ├── Subject Allocation
│       ├── Class Promotion
│       └── Class Timetable
├── Main Content
│   ├── Breadcrumb
│   ├── Statistics Cards
│   ├── Data Tables
│   ├── Modal Forms
│   └── Action Buttons
└── Footer
```

---

## 🔐 Validation Layer

```
┌─────────────────────────────────────┐
│      User Input                     │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Frontend Validation               │
│   ├─ Required fields                │
│   ├─ Data type checking             │
│   ├─ Format validation              │
│   └─ Business logic checks          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   API Call                          │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Backend Validation                │
│   ├─ Authentication                 │
│   ├─ Authorization                  │
│   ├─ Data validation                │
│   ├─ Business rules                 │
│   └─ Database constraints           │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Database Operation                │
└────────────┬────────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│   Response                          │
│   ├─ Success Message                │
│   ├─ Error Message                  │
│   └─ Updated Data                   │
└─────────────────────────────────────┘
```

---

## 📊 State Management

### Local State (Per Page)
```
manage-classes.html
├── classes: Array<Class>
├── selectedClass: Class | null
├── isEditModalOpen: boolean
├── formData: ClassFormData
└── filters: ClassFilters

manage-sections.html
├── sections: Array<Section>
├── selectedSection: Section | null
├── isCreateModalOpen: boolean
├── isEditModalOpen: boolean
├── formData: SectionFormData
└── filters: SectionFilters

class-promotion.html
├── students: Array<Student>
├── selectedStudents: Array<string>
├── promotionType: 'all' | 'selected'
├── promotionHistory: Array<Promotion>
└── filters: PromotionFilters
```

---

## 🔄 Event Flow

```
User Action
    │
    ▼
Event Handler
    │
    ▼
Validation
    │
    ├─ Valid ──┐
    │          │
    └─ Invalid─┤
               │
               ▼
            API Call
               │
               ├─ Success ──┐
               │            │
               └─ Error ────┤
                            │
                            ▼
                        Update UI
                            │
                            ▼
                        Display Message
                            │
                            ▼
                        Refresh Data
```

---

## 📈 Performance Considerations

### Optimization Strategies
1. **Lazy Loading** - Load data on demand
2. **Pagination** - Show limited records per page
3. **Caching** - Cache frequently accessed data
4. **Debouncing** - Debounce search/filter inputs
5. **Compression** - Compress API responses
6. **CDN** - Use CDN for static assets

### Scalability
- Modular component structure
- Reusable form components
- Centralized API service
- Efficient data structures
- Optimized queries

---

## 🔒 Security Measures

### Frontend Security
- Input validation
- XSS prevention
- CSRF protection
- Secure storage

### Backend Security
- Authentication
- Authorization
- Data encryption
- SQL injection prevention
- Rate limiting

---

## 📝 Summary

This architecture provides:
- ✅ Clear separation of concerns
- ✅ Modular component structure
- ✅ Scalable design
- ✅ Easy maintenance
- ✅ Flexible integration
- ✅ Robust validation
- ✅ Secure implementation
- ✅ Performance optimization

The system is designed to be maintainable, scalable, and easy to integrate with backend services.

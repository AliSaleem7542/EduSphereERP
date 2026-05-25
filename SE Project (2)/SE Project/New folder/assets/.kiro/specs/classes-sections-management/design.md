# Design Document: Classes & Sections Management

## Overview

The Classes & Sections Management module provides a comprehensive system for organizing academic classes, managing student allocations, assigning teachers and classrooms, and handling student progression. The design follows a modular architecture with clear separation of concerns between data models, business logic, and presentation layers.

The system supports:
- Hierarchical class organization (Grade levels with multiple sections)
- Dynamic section creation based on capacity constraints
- Teacher and classroom assignment
- Student allocation and movement between sections
- Automated student promotion to next class level
- Subject curriculum management per class

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Presentation Layer                     │
│  (Admin UI - Class Management, Section Management)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Service Layer                          │
│  (ClassService, SectionService, StudentAllocationSvc)   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Business Logic Layer                   │
│  (Validators, Capacity Manager, Promotion Engine)       │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Data Access Layer                      │
│  (Repository Pattern - ClassRepository, etc.)           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   Database Layer                         │
│  (Relational Database - Classes, Sections, Students)    │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Class Management Component

**Responsibilities:**
- CRUD operations for classes
- Class validation and constraints
- Class statistics calculation

**Key Interfaces:**

```typescript
interface Class {
  id: string;
  name: string;
  gradeLevel: number;
  capacity: number;
  description: string;
  classInchargeId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClassService {
  getAllClasses(): Promise<Class[]>;
  getClassById(id: string): Promise<Class>;
  createClass(data: CreateClassInput): Promise<Class>;
  updateClass(id: string, data: UpdateClassInput): Promise<Class>;
  deleteClass(id: string): Promise<boolean>;
  getClassStatistics(id: string): Promise<ClassStatistics>;
}

interface ClassStatistics {
  classId: string;
  totalStudents: number;
  totalSections: number;
  averageStudentsPerSection: number;
  capacityUtilization: number;
}
```

### 2. Section Management Component

**Responsibilities:**
- CRUD operations for sections
- Capacity management and validation
- Automatic section creation
- Section statistics

**Key Interfaces:**

```typescript
interface Section {
  id: string;
  classId: string;
  name: string;
  maxCapacity: number;
  currentStudentCount: number;
  classroomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SectionService {
  getSectionsByClass(classId: string): Promise<Section[]>;
  createSection(classId: string, data: CreateSectionInput): Promise<Section>;
  updateSection(id: string, data: UpdateSectionInput): Promise<Section>;
  deleteSection(id: string): Promise<boolean>;
  getAvailableCapacity(sectionId: string): Promise<number>;
  autoCreateSections(classId: string): Promise<Section[]>;
}

interface CapacityManager {
  canAddStudent(sectionId: string): Promise<boolean>;
  getCapacityStatus(sectionId: string): Promise<CapacityStatus>;
  distributeStudentsEvenly(classId: string, students: Student[]): Promise<void>;
}

interface CapacityStatus {
  sectionId: string;
  currentCount: number;
  maxCapacity: number;
  availableSeats: number;
  utilizationPercentage: number;
  isAtCapacity: boolean;
  isNearCapacity: boolean;
}
```

### 3. Student Allocation Component

**Responsibilities:**
- Assign students to sections
- Move students between sections
- Validate allocation constraints
- Track allocation history

**Key Interfaces:**

```typescript
interface StudentAllocation {
  studentId: string;
  classId: string;
  sectionId: string;
  assignedAt: Date;
  previousSectionId?: string;
}

interface StudentAllocationService {
  assignStudentToSection(studentId: string, sectionId: string): Promise<StudentAllocation>;
  moveStudentToSection(studentId: string, newSectionId: string): Promise<StudentAllocation>;
  getStudentAllocation(studentId: string): Promise<StudentAllocation>;
  getStudentsInSection(sectionId: string): Promise<Student[]>;
  validateAllocation(studentId: string, sectionId: string): Promise<ValidationResult>;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}
```

### 4. Teacher Assignment Component

**Responsibilities:**
- Assign teachers as class incharges
- Track teacher assignments
- Validate teacher availability

**Key Interfaces:**

```typescript
interface TeacherAssignment {
  teacherId: string;
  classId: string;
  sectionId?: string;
  role: 'ClassIncharge' | 'SubjectTeacher';
  assignedAt: Date;
}

interface TeacherAssignmentService {
  assignTeacherToClass(teacherId: string, classId: string): Promise<TeacherAssignment>;
  assignTeacherToSection(teacherId: string, sectionId: string): Promise<TeacherAssignment>;
  getTeacherAssignments(teacherId: string): Promise<TeacherAssignment[]>;
  getClassIncharge(classId: string): Promise<Teacher>;
  removeTeacherAssignment(assignmentId: string): Promise<boolean>;
}
```

### 5. Classroom Management Component

**Responsibilities:**
- Assign classrooms to sections
- Track classroom utilization
- Validate classroom availability

**Key Interfaces:**

```typescript
interface ClassroomAssignment {
  classroomId: string;
  sectionId: string;
  assignedAt: Date;
}

interface ClassroomService {
  assignClassroomToSection(classroomId: string, sectionId: string): Promise<ClassroomAssignment>;
  getClassroomAssignments(classroomId: string): Promise<ClassroomAssignment[]>;
  getSectionClassroom(sectionId: string): Promise<Classroom>;
  removeClassroomAssignment(sectionId: string): Promise<boolean>;
}
```

### 6. Subject Allocation Component

**Responsibilities:**
- Allocate subjects to classes
- Track subject-class relationships
- Validate subject assignments

**Key Interfaces:**

```typescript
interface SubjectAllocation {
  classId: string;
  subjectId: string;
  allocatedAt: Date;
}

interface SubjectService {
  allocateSubjectsToClass(classId: string, subjectIds: string[]): Promise<SubjectAllocation[]>;
  getClassSubjects(classId: string): Promise<Subject[]>;
  getSubjectClasses(subjectId: string): Promise<Class[]>;
  removeSubjectFromClass(classId: string, subjectId: string): Promise<boolean>;
}
```

### 7. Class Promotion Component

**Responsibilities:**
- Promote students to next class
- Validate promotion eligibility
- Handle section assignment for promoted students

**Key Interfaces:**

```typescript
interface PromotionRequest {
  classId: string;
  studentIds?: string[];
  promoteAll: boolean;
}

interface PromotionResult {
  promotedStudents: Student[];
  failedPromotions: PromotionFailure[];
  summary: PromotionSummary;
}

interface PromotionFailure {
  studentId: string;
  reason: string;
}

interface PromotionSummary {
  totalAttempted: number;
  totalSuccessful: number;
  totalFailed: number;
  timestamp: Date;
}

interface PromotionService {
  promoteStudents(request: PromotionRequest): Promise<PromotionResult>;
  getNextClass(classId: string): Promise<Class>;
  validatePromotionEligibility(studentId: string): Promise<boolean>;
}
```

## Data Models

### Class Entity

```typescript
class Class {
  id: string;
  name: string;
  gradeLevel: number;
  capacity: number;
  description: string;
  classInchargeId: string;
  sections: Section[];
  subjects: Subject[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  getTotalStudents(): number;
  getSectionCount(): number;
  canBeDeleted(): boolean;
  getStatistics(): ClassStatistics;
}
```

### Section Entity

```typescript
class Section {
  id: string;
  classId: string;
  name: string;
  maxCapacity: number;
  currentStudentCount: number;
  classroomId?: string;
  students: Student[];
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  hasAvailableCapacity(): boolean;
  getAvailableSeats(): number;
  getUtilizationPercentage(): number;
  isNearCapacity(threshold: number = 0.9): boolean;
  canAddStudent(): boolean;
}
```

### StudentAllocation Entity

```typescript
class StudentAllocation {
  studentId: string;
  classId: string;
  sectionId: string;
  assignedAt: Date;
  previousSectionId?: string;
  
  // Methods
  isValid(): boolean;
  getHistory(): AllocationHistory[];
}
```

### TeacherAssignment Entity

```typescript
class TeacherAssignment {
  teacherId: string;
  classId: string;
  sectionId?: string;
  role: 'ClassIncharge' | 'SubjectTeacher';
  assignedAt: Date;
  
  // Methods
  isActive(): boolean;
  getAssignmentDetails(): AssignmentDetails;
}
```

### SubjectAllocation Entity

```typescript
class SubjectAllocation {
  classId: string;
  subjectId: string;
  allocatedAt: Date;
  
  // Methods
  isValid(): boolean;
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Class Deletion Constraint

**For any** class, if the class has students or sections, deletion SHALL be prevented.

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 2: Section Capacity Invariant

**For any** section, the current student count SHALL never exceed the maximum capacity.

**Validates: Requirements 6.4, 6.5**

### Property 3: Student Allocation Uniqueness

**For any** student, the student SHALL be assigned to exactly one section at any given time.

**Validates: Requirements 5.4, 5.5**

### Property 4: Automatic Section Distribution

**For any** class where automatic section creation occurs, students SHALL be distributed evenly across all sections with no section exceeding capacity.

**Validates: Requirements 7.4, 7.5**

### Property 5: Class Incharge Assignment

**For any** class, there SHALL be exactly one assigned class incharge teacher at any time.

**Validates: Requirements 4.3, 4.4**

### Property 6: Subject Allocation Uniqueness

**For any** class, each subject SHALL be allocated at most once to that class.

**Validates: Requirements 10.7**

### Property 7: Classroom Assignment Exclusivity

**For any** classroom, it SHALL not be assigned to multiple sections simultaneously.

**Validates: Requirements 9.6, 9.7**

### Property 8: Student Promotion Consistency

**For any** student promotion, promoted students SHALL be moved to the next class level and their previous section assignment SHALL be cleared.

**Validates: Requirements 8.3, 8.4, 8.5**

### Property 9: Section Naming Convention

**For any** automatically created section, the section name SHALL follow the naming convention (Section A, Section B, etc.) and SHALL be unique within the class.

**Validates: Requirements 7.2, 7.3**

### Property 10: Capacity Status Accuracy

**For any** section, the available seats calculation SHALL equal (maxCapacity - currentStudentCount) and SHALL always be non-negative.

**Validates: Requirements 6.2, 6.3**

## Error Handling

### Class Management Errors

- **ClassNotFound**: Thrown when attempting to access a non-existent class
- **ClassDeletionFailed**: Thrown when attempting to delete a class with students or sections
- **InvalidClassData**: Thrown when class data fails validation
- **ClassCapacityExceeded**: Thrown when class capacity constraints are violated

### Section Management Errors

- **SectionNotFound**: Thrown when attempting to access a non-existent section
- **SectionCapacityExceeded**: Thrown when attempting to add a student to a full section
- **InvalidSectionData**: Thrown when section data fails validation
- **AutoSectionCreationFailed**: Thrown when automatic section creation fails

### Student Allocation Errors

- **StudentNotFound**: Thrown when attempting to allocate a non-existent student
- **AllocationFailed**: Thrown when student allocation fails validation
- **InvalidAllocationData**: Thrown when allocation data is invalid
- **StudentAlreadyAllocated**: Thrown when attempting to allocate an already-allocated student

### Teacher Assignment Errors

- **TeacherNotFound**: Thrown when attempting to assign a non-existent teacher
- **TeacherAlreadyAssigned**: Thrown when attempting to assign a teacher already assigned to a class
- **InvalidTeacherAssignment**: Thrown when teacher assignment fails validation

### Promotion Errors

- **PromotionFailed**: Thrown when student promotion fails
- **NextClassNotFound**: Thrown when the next class level doesn't exist
- **InvalidPromotionRequest**: Thrown when promotion request data is invalid

## Testing Strategy

### Unit Testing Approach

Unit tests verify specific examples, edge cases, and error conditions:

1. **Class Management Tests**
   - Test class creation with valid/invalid data
   - Test class update operations
   - Test class deletion with students/sections present
   - Test class statistics calculation

2. **Section Management Tests**
   - Test section creation and capacity validation
   - Test section capacity checks
   - Test automatic section creation logic
   - Test section naming conventions

3. **Student Allocation Tests**
   - Test student assignment to sections
   - Test student movement between sections
   - Test allocation validation
   - Test capacity constraints during allocation

4. **Teacher Assignment Tests**
   - Test teacher assignment to classes
   - Test teacher reassignment
   - Test teacher availability validation

5. **Classroom Management Tests**
   - Test classroom assignment to sections
   - Test classroom reassignment
   - Test classroom availability validation

6. **Subject Allocation Tests**
   - Test subject allocation to classes
   - Test duplicate subject prevention
   - Test subject removal

7. **Promotion Tests**
   - Test student promotion to next class
   - Test selective student promotion
   - Test promotion with missing next class
   - Test section assignment after promotion

### Property-Based Testing Approach

Property-based tests verify universal properties across all inputs using randomized test data:

1. **Property 1: Class Deletion Constraint**
   - Generate random classes with/without students and sections
   - Verify deletion is prevented when constraints are violated

2. **Property 2: Section Capacity Invariant**
   - Generate random sections and student assignments
   - Verify current count never exceeds maximum capacity

3. **Property 3: Student Allocation Uniqueness**
   - Generate random student allocations
   - Verify each student is in exactly one section

4. **Property 4: Automatic Section Distribution**
   - Generate classes with students exceeding capacity
   - Verify even distribution across new sections

5. **Property 5: Class Incharge Assignment**
   - Generate random class incharge assignments
   - Verify exactly one incharge per class

6. **Property 6: Subject Allocation Uniqueness**
   - Generate random subject allocations
   - Verify no duplicate subjects per class

7. **Property 7: Classroom Assignment Exclusivity**
   - Generate random classroom assignments
   - Verify no classroom assigned to multiple sections

8. **Property 8: Student Promotion Consistency**
   - Generate random student promotions
   - Verify students move to next class and sections are cleared

9. **Property 9: Section Naming Convention**
   - Generate automatic section creations
   - Verify naming follows convention and is unique

10. **Property 10: Capacity Status Accuracy**
    - Generate random sections with various student counts
    - Verify available seats calculation is accurate

### Testing Configuration

- **Minimum iterations per property test**: 100
- **Test framework**: Jest (for JavaScript/TypeScript) or equivalent
- **Property testing library**: fast-check (for JavaScript/TypeScript) or equivalent
- **Test organization**: Co-locate tests with source files using `.test.ts` suffix
- **Coverage target**: Minimum 80% code coverage

### Test Execution

- Run unit tests before each commit
- Run property-based tests as part of CI/CD pipeline
- Generate coverage reports for each test run
- Maintain test documentation for each property


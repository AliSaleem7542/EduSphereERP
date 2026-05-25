# Implementation Plan: Classes & Sections Management

## Overview

This implementation plan breaks down the Classes & Sections Management module into discrete, incremental coding tasks. Each task builds on previous steps, ensuring core functionality is validated early through tests. The plan follows a layered approach: data models → business logic → services → integration.

## Tasks

- [ ] 1. Set up project structure and core interfaces
  - Create directory structure for models, services, repositories, and utilities
  - Define TypeScript interfaces for all core entities (Class, Section, Student, Teacher, etc.)
  - Set up testing framework (Jest) and property-based testing library (fast-check)
  - Configure database connection and ORM (if applicable)
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1, 8.1, 9.1, 10.1_

- [ ] 2. Implement Class entity and repository
  - [ ] 2.1 Create Class model with all properties and validation methods
    - Define Class interface with id, name, gradeLevel, capacity, description, classInchargeId
    - Implement validation methods (canBeDeleted, getTotalStudents, etc.)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ] 2.2 Write property test for Class model persistence
    - **Property 2: Section Capacity Invariant** (partial - class level)
    - **Validates: Requirements 2.7**

  - [ ] 2.3 Create ClassRepository with CRUD operations
    - Implement getAllClasses, getClassById, createClass, updateClass, deleteClass
    - Add query methods for class statistics
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.7_

  - [ ] 2.4 Write unit tests for ClassRepository
    - Test CRUD operations with valid/invalid data
    - Test class statistics calculations
    - _Requirements: 1.1, 1.2, 1.3_

- [ ] 3. Implement Section entity and repository
  - [ ] 3.1 Create Section model with capacity management
    - Define Section interface with id, classId, name, maxCapacity, currentStudentCount
    - Implement capacity checking methods (hasAvailableCapacity, getAvailableSeats, isNearCapacity)
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 3.2 Write property test for Section capacity invariant
    - **Property 2: Section Capacity Invariant**
    - **Validates: Requirements 6.4, 6.5**

  - [ ] 3.3 Create SectionRepository with CRUD operations
    - Implement getSectionsByClass, createSection, updateSection, deleteSection
    - Add capacity query methods
    - _Requirements: 6.1, 6.2, 6.3_

  - [ ] 3.4 Write unit tests for SectionRepository
    - Test section creation with capacity validation
    - Test capacity checking logic
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 4. Implement StudentAllocation entity and repository
  - [ ] 4.1 Create StudentAllocation model
    - Define StudentAllocation interface with studentId, classId, sectionId, assignedAt, previousSectionId
    - Implement validation and history tracking methods
    - _Requirements: 5.1, 5.4, 5.8_

  - [ ] 4.2 Write property test for Student allocation uniqueness
    - **Property 3: Student Allocation Uniqueness**
    - **Validates: Requirements 5.4, 5.5**

  - [ ] 4.3 Create StudentAllocationRepository
    - Implement assignStudentToSection, moveStudentToSection, getStudentAllocation
    - Add methods to get students in section and allocation history
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.8_

  - [ ] 4.4 Write unit tests for StudentAllocationRepository
    - Test student assignment with capacity validation
    - Test student movement between sections
    - Test allocation history tracking
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.8_

- [ ] 5. Implement ClassService with business logic
  - [ ] 5.1 Create ClassService with view and edit operations
    - Implement getAllClasses with statistics
    - Implement getClassById, createClass, updateClass
    - Add validation for required fields
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 5.2 Write property test for class edit persistence
    - **Property 2: Class Edit Round Trip** (derived from requirements)
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5, 2.7**

  - [ ] 5.3 Implement class deletion with validation
    - Check for students and sections before deletion
    - Prevent deletion if constraints violated
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 5.4 Write property test for class deletion constraints
    - **Property 1: Class Deletion Constraint**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**

  - [ ] 5.5 Implement class statistics calculation
    - Calculate total students, total sections, average students per section
    - Calculate capacity utilization
    - _Requirements: 1.2, 1.3_

  - [ ] 5.6 Write unit tests for ClassService
    - Test class creation, update, deletion
    - Test statistics calculations
    - Test validation logic
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Implement SectionService with capacity management
  - [ ] 6.1 Create SectionService with capacity validation
    - Implement getSectionsByClass, createSection, updateSection
    - Add capacity checking before student assignment
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [ ] 6.2 Write property test for section capacity enforcement
    - **Property 2: Section Capacity Invariant**
    - **Validates: Requirements 6.4, 6.5**

  - [ ] 6.3 Implement automatic section creation logic
    - Detect when class exceeds capacity
    - Create new sections with naming convention
    - Distribute students evenly
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 6.4 Write property test for automatic section creation
    - **Property 4: Automatic Section Distribution**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5, 7.6**

  - [ ] 6.5 Implement capacity status calculation
    - Calculate available seats, utilization percentage
    - Determine if section is at or near capacity
    - _Requirements: 6.2, 6.3, 6.7_

  - [ ] 6.6 Write unit tests for SectionService
    - Test section creation and capacity validation
    - Test automatic section creation
    - Test capacity status calculations
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 7. Implement StudentAllocationService
  - [ ] 7.1 Create StudentAllocationService with assignment logic
    - Implement assignStudentToSection with validation
    - Implement moveStudentToSection with capacity checks
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 7.2 Write property test for student allocation uniqueness
    - **Property 3: Student Allocation Uniqueness**
    - **Validates: Requirements 5.4, 5.5**

  - [ ] 7.3 Implement allocation validation
    - Verify student exists in class
    - Check section capacity
    - Validate section belongs to class
    - _Requirements: 5.1, 5.2, 5.3, 5.7_

  - [ ] 7.4 Write unit tests for StudentAllocationService
    - Test student assignment with validation
    - Test student movement between sections
    - Test capacity constraint enforcement
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 8. Implement TeacherAssignmentService
  - [ ] 8.1 Create TeacherAssignmentService
    - Implement assignTeacherToClass, assignTeacherToSection
    - Implement getTeacherAssignments, getClassIncharge
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 8.2 Write property test for class incharge uniqueness
    - **Property 5: Class Incharge Assignment**
    - **Validates: Requirements 4.3, 4.4**

  - [ ] 8.3 Implement teacher assignment validation
    - Verify teacher exists
    - Check for duplicate assignments
    - Maintain audit trail
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 8.4 Write unit tests for TeacherAssignmentService
    - Test teacher assignment to class
    - Test teacher reassignment
    - Test audit trail maintenance
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 9. Implement ClassroomAssignmentService
  - [ ] 9.1 Create ClassroomAssignmentService
    - Implement assignClassroomToSection, getClassroomAssignments
    - Implement getSectionClassroom, removeClassroomAssignment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ] 9.2 Write property test for classroom assignment exclusivity
    - **Property 7: Classroom Assignment Exclusivity**
    - **Validates: Requirements 9.6, 9.7**

  - [ ] 9.3 Implement classroom assignment validation
    - Verify classroom exists
    - Check classroom availability
    - Prevent multiple section assignments
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ] 9.4 Write unit tests for ClassroomAssignmentService
    - Test classroom assignment to section
    - Test classroom reassignment
    - Test availability validation
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 10. Implement SubjectAllocationService
  - [ ] 10.1 Create SubjectAllocationService
    - Implement allocateSubjectsToClass, getClassSubjects
    - Implement getSubjectClasses, removeSubjectFromClass
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 10.2 Write property test for subject allocation uniqueness
    - **Property 6: Subject Allocation Uniqueness**
    - **Validates: Requirements 10.7**

  - [ ] 10.3 Implement subject allocation validation
    - Verify subject exists
    - Prevent duplicate allocations
    - Validate class exists
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 10.4 Write unit tests for SubjectAllocationService
    - Test subject allocation to class
    - Test duplicate prevention
    - Test subject removal
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 11. Implement PromotionService
  - [ ] 11.1 Create PromotionService with promotion logic
    - Implement promoteStudents with selective/all options
    - Implement getNextClass, validatePromotionEligibility
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.8_

  - [ ] 11.2 Write property test for student promotion consistency
    - **Property 8: Student Promotion Consistency**
    - **Validates: Requirements 8.3, 8.4, 8.5**

  - [ ] 11.3 Implement promotion validation
    - Verify next class exists
    - Check student eligibility
    - Validate section assignment in new class
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.7, 8.8_

  - [ ] 11.4 Implement promotion summary generation
    - Track promoted students
    - Record failed promotions with reasons
    - Generate promotion report
    - _Requirements: 8.6, 8.7_

  - [ ] 11.5 Write unit tests for PromotionService
    - Test student promotion to next class
    - Test selective promotion
    - Test promotion with missing next class
    - Test section assignment after promotion
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 12. Checkpoint - Ensure all core services are tested
  - Verify all unit tests pass
  - Verify all property-based tests pass
  - Check code coverage is above 80%
  - Review test results and ask user if questions arise

- [ ] 13. Implement API endpoints for Class management
  - [ ] 13.1 Create REST endpoints for class operations
    - GET /api/classes - Get all classes
    - GET /api/classes/:id - Get class by ID
    - POST /api/classes - Create new class
    - PUT /api/classes/:id - Update class
    - DELETE /api/classes/:id - Delete class
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

  - [ ] 13.2 Write integration tests for class endpoints
    - Test endpoint responses and status codes
    - Test error handling
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 14. Implement API endpoints for Section management
  - [ ] 14.1 Create REST endpoints for section operations
    - GET /api/classes/:classId/sections - Get sections by class
    - POST /api/classes/:classId/sections - Create section
    - PUT /api/sections/:id - Update section
    - DELETE /api/sections/:id - Delete section
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 14.2 Write integration tests for section endpoints
    - Test section creation with capacity validation
    - Test automatic section creation
    - _Requirements: 6.1, 6.2, 6.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

- [ ] 15. Implement API endpoints for Student Allocation
  - [ ] 15.1 Create REST endpoints for student allocation
    - POST /api/students/:studentId/allocate - Assign student to section
    - PUT /api/students/:studentId/move - Move student to new section
    - GET /api/students/:studentId/allocation - Get student allocation
    - GET /api/sections/:sectionId/students - Get students in section
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

  - [ ] 15.2 Write integration tests for allocation endpoints
    - Test student assignment with capacity validation
    - Test student movement between sections
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8_

- [ ] 16. Implement API endpoints for Teacher Assignment
  - [ ] 16.1 Create REST endpoints for teacher assignment
    - POST /api/teachers/:teacherId/assign-class - Assign teacher to class
    - POST /api/teachers/:teacherId/assign-section - Assign teacher to section
    - GET /api/teachers/:teacherId/assignments - Get teacher assignments
    - GET /api/classes/:classId/incharge - Get class incharge
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

  - [ ] 16.2 Write integration tests for teacher assignment endpoints
    - Test teacher assignment to class
    - Test teacher reassignment
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [ ] 17. Implement API endpoints for Classroom Assignment
  - [ ] 17.1 Create REST endpoints for classroom assignment
    - POST /api/classrooms/:classroomId/assign - Assign classroom to section
    - GET /api/classrooms/:classroomId/assignments - Get classroom assignments
    - GET /api/sections/:sectionId/classroom - Get section classroom
    - DELETE /api/sections/:sectionId/classroom - Remove classroom assignment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

  - [ ] 17.2 Write integration tests for classroom assignment endpoints
    - Test classroom assignment to section
    - Test classroom reassignment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 18. Implement API endpoints for Subject Allocation
  - [ ] 18.1 Create REST endpoints for subject allocation
    - POST /api/classes/:classId/subjects - Allocate subjects to class
    - GET /api/classes/:classId/subjects - Get class subjects
    - GET /api/subjects/:subjectId/classes - Get subject classes
    - DELETE /api/classes/:classId/subjects/:subjectId - Remove subject
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ] 18.2 Write integration tests for subject allocation endpoints
    - Test subject allocation to class
    - Test duplicate prevention
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [ ] 19. Implement API endpoints for Class Promotion
  - [ ] 19.1 Create REST endpoints for promotion
    - POST /api/classes/:classId/promote - Promote students
    - GET /api/classes/:classId/next - Get next class
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

  - [ ] 19.2 Write integration tests for promotion endpoints
    - Test student promotion to next class
    - Test selective promotion
    - Test promotion with missing next class
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8_

- [ ] 20. Checkpoint - Ensure all API endpoints are tested
  - Verify all integration tests pass
  - Verify all endpoints return correct status codes
  - Check error handling for all endpoints
  - Review test results and ask user if questions arise

- [ ] 21. Implement error handling and validation middleware
  - [ ] 21.1 Create error handling middleware
    - Handle validation errors
    - Handle not found errors
    - Handle capacity constraint errors
    - Return appropriate HTTP status codes
    - _Requirements: 3.2, 3.4, 5.3, 6.5, 7.1, 8.8, 9.7_

  - [ ] 21.2 Write unit tests for error handling
    - Test error responses for various scenarios
    - _Requirements: 3.2, 3.4, 5.3, 6.5, 7.1, 8.8, 9.7_

- [ ] 22. Implement logging and audit trail
  - [ ] 22.1 Create logging service
    - Log all CRUD operations
    - Log teacher assignments and changes
    - Log student allocations and movements
    - Log promotion operations
    - _Requirements: 4.6, 5.8, 7.5, 8.7_

  - [ ] 22.2 Write unit tests for logging
    - Test that operations are logged correctly
    - _Requirements: 4.6, 5.8, 7.5, 8.7_

- [ ] 23. Final checkpoint - Ensure all tests pass
  - Verify all unit tests pass
  - Verify all property-based tests pass
  - Verify all integration tests pass
  - Check code coverage is above 80%
  - Review test results and ask user if questions arise

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Property-based tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate API endpoints and workflows
- Checkpoints ensure incremental validation of functionality
- All tests must pass before proceeding to next task
- Code coverage target: minimum 80%

## Testing Configuration

- **Test Framework**: Jest
- **Property-Based Testing**: fast-check
- **Minimum iterations per property test**: 100
- **Test organization**: Co-locate tests with source files using `.test.ts` suffix
- **Coverage target**: Minimum 80% code coverage


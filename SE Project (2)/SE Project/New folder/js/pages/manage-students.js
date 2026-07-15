/**
 * EDU-SPHERE — Manage Students Page
 * Refactored with Phase 2 utilities
 * @version 2.0.0
 */

(function() {
  'use strict';
  
  // State
  let currentPage = 1;
  let totalPages = 1;
  let searchTimer = null;
  let editStudentData = null;
  
  /**
   * Initialize page
   */
  async function init() {
    Logger.info('Manage Students page initialized');
    Logger.time('Initial Load');
    
    // Load data
    await Promise.all([
      loadFilterDropdowns(),
      loadStats(),
      renderTable(),
    ]);
    
    Logger.timeEnd('Initial Load');
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize overlay scrollbars
    initScrollbars();
  }
  
  /**
   * Setup event listeners
   */
  function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Form submit prevention
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
    });
  }
  
  /**
   * Handle search input with debouncing
   */
  function handleSearchInput() {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentPage = 1;
      renderTable();
    }, 400);
  }
  
  /**
   * Load statistics
   */
  async function loadStats() {
    try {
      Logger.debug('Loading statistics...');
      
      const dashboardRes = await API.reports.dashboard();
      if (dashboardRes && dashboardRes.success) {
        const data = dashboardRes.data;
        updateStat('statTotal', data.totalStudents || 0);
        updateStat('statActive', data.totalStudents || 0);
      }
      
      // Load detailed stats
      const studentsRes = await API.students.list({ limit: 1000 });
      if (studentsRes && studentsRes.success) {
        const students = studentsRes.data.data || [];
        const maleCount = students.filter(s => s.gender === 'MALE').length;
        const femaleCount = students.filter(s => s.gender === 'FEMALE').length;
        
        updateStat('statMale', maleCount);
        updateStat('statFemale', femaleCount);
        
        Logger.debug('Stats loaded:', { total: students.length, male: maleCount, female: femaleCount });
      }
    } catch (error) {
      Logger.error('Failed to load stats:', error);
    }
  }
  
  /**
   * Update stat counter with animation
   */
  function updateStat(elementId, value) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = value;
    }
  }
  
  /**
   * Render students table
   */
  async function renderTable() {
    const tbody = document.getElementById('studentTableBody');
    
    // Show loading
    tbody.innerHTML = `
      <tr>
        <td colspan="12" class="text-center py-4">
          <span class="spinner-border spinner-border-sm me-2"></span>
          Loading students...
        </td>
      </tr>
    `;
    
    // Get filter values
    const search = document.getElementById('searchInput').value.trim();
    const classId = document.getElementById('filterClass').value;
    const gender = document.getElementById('filterGender').value;
    
    // Build params
    const params = { page: currentPage, limit: 10 };
    if (search) { params.search = search; }
    if (classId) { params.classId = classId; }
    if (gender) { params.gender = gender; }
    
    try {
      Logger.time('Load Students');
      const res = await API.students.list(params);
      Logger.timeEnd('Load Students');
      
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to load students');
      }
      
      const students = res.data.data || [];
      const pagination = res.data.pagination || {};
      
      totalPages = pagination.totalPages || 1;
      
      // Update count display
      const count = pagination.total || 0;
      document.getElementById('showingCount').textContent = `${count} student${count !== 1 ? 's' : ''}`;
      document.getElementById('pageInfo').textContent = `Page ${currentPage} of ${totalPages}`;
      
      // Render rows
      if (students.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="12" class="text-center text-muted py-4">
              <i class="bi bi-inbox fs-3 d-block mb-2"></i>
              No students found
            </td>
          </tr>
        `;
      } else {
        tbody.innerHTML = students.map((student, index) => renderStudentRow(student, index)).join('');
      }
      
      renderPagination();
      
      Logger.debug(`Rendered ${students.length} students`);
      
    } catch (error) {
      Logger.error('Failed to load students:', error);
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center text-danger py-4">
            <i class="bi bi-exclamation-triangle fs-3 d-block mb-2"></i>
            Error: ${SECURITY.escapeHtml(error.message)}
          </td>
        </tr>
      `;
      API.toast('Failed to load students', 'danger');
    }
  }
  
  /**
   * Render single student row
   */
  function renderStudentRow(student, index) {
    const rowNumber = (currentPage - 1) * 10 + index + 1;
    const photoUrl = student.photo 
      ? `${window.EDUSPHERE_API_URL || 'https://edusphereerp-scbr.onrender.com'}${student.photo}`
      : 'assets/img/avatar.png';
    
    return `
      <tr>
        <td>${rowNumber}</td>
        <td>
          <img src="${photoUrl}" 
               class="rounded-circle" 
               width="36" 
               height="36" 
               style="object-fit: cover"
               onerror="this.src='assets/img/avatar.png'"
               alt="Photo">
        </td>
        <td>
          <span class="badge text-bg-secondary">
            ${Formatters.formatRollNumber(student.rollNo)}
          </span>
        </td>
        <td>
          <strong>${SECURITY.escapeHtml(student.firstName + ' ' + (student.lastName || ''))}</strong>
        </td>
        <td>
          <span class="badge text-bg-primary">
            ${student.class ? SECURITY.escapeHtml(student.class.name) : '—'}
          </span>
        </td>
        <td>
          <span class="badge text-bg-info">
            ${student.section ? SECURITY.escapeHtml(student.section.name) : '—'}
          </span>
        </td>
        <td>${Formatters.formatGender(student.gender)}</td>
        <td>${Formatters.formatDate(student.dob, 'short')}</td>
        <td>${SECURITY.escapeHtml(student.fatherName || '—')}</td>
        <td>${Formatters.formatPhone(student.fatherPhone || '—')}</td>
        <td>${renderFeeBadge(student.feeCategory)}</td>
        <td>
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-info" 
                    onclick="window.ManageStudents.viewStudent(${student.id})" 
                    title="View">
              <i class="bi bi-eye"></i>
            </button>
            <button class="btn btn-outline-warning" 
                    onclick="window.ManageStudents.editStudent(${student.id})" 
                    title="Edit">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-outline-danger" 
                    onclick="window.ManageStudents.deleteStudent(${student.id})" 
                    title="Delete">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }
  
  /**
   * Render fee category badge
   */
  function renderFeeBadge(feeCategory) {
    const badges = {
      'REGULAR': 'success',
      'SCHOLARSHIP': 'primary',
      'HALF_FEE': 'warning',
      'FREE': 'info',
    };
    
    const badgeClass = badges[feeCategory] || 'secondary';
    const label = feeCategory ? SECURITY.escapeHtml(feeCategory.replace('_', ' ')) : '—';
    
    return `<span class="badge text-bg-${badgeClass}">${label}</span>`;
  }
  
  /**
   * Render pagination
   */
  function renderPagination() {
    const ul = document.getElementById('pagination');
    if (!ul) { return; }
    
    ul.innerHTML = '';
    
    if (totalPages <= 1) { return; }
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#" onclick="window.ManageStudents.changePage(${currentPage - 1}); return false;">«</a>`;
    ul.appendChild(prevLi);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
      const li = document.createElement('li');
      li.className = 'page-item';
      li.innerHTML = `<a class="page-link" href="#" onclick="window.ManageStudents.changePage(1); return false;">1</a>`;
      ul.appendChild(li);
      
      if (startPage > 2) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        dots.innerHTML = '<span class="page-link">...</span>';
        ul.appendChild(dots);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const li = document.createElement('li');
      li.className = 'page-item' + (i === currentPage ? ' active' : '');
      li.innerHTML = `<a class="page-link" href="#" onclick="window.ManageStudents.changePage(${i}); return false;">${i}</a>`;
      ul.appendChild(li);
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const dots = document.createElement('li');
        dots.className = 'page-item disabled';
        dots.innerHTML = '<span class="page-link">...</span>';
        ul.appendChild(dots);
      }
      
      const li = document.createElement('li');
      li.className = 'page-item';
      li.innerHTML = `<a class="page-link" href="#" onclick="window.ManageStudents.changePage(${totalPages}); return false;">${totalPages}</a>`;
      ul.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#" onclick="window.ManageStudents.changePage(${currentPage + 1}); return false;">»</a>`;
    ul.appendChild(nextLi);
  }
  
  /**
   * Change page
   */
  function changePage(pageNum) {
    if (pageNum < 1 || pageNum > totalPages) { return; }
    currentPage = pageNum;
    renderTable();
    
    // Scroll to top of table
    document.querySelector('.card.shadow')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  /**
   * Clear all filters
   */
  function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterClass').value = '';
    document.getElementById('filterSection').value = '';
    document.getElementById('filterGender').value = '';
    currentPage = 1;
    renderTable();
    
    Logger.info('Filters cleared');
  }
  
  /**
   * View student details
   */
  async function viewStudent(id) {
    try {
      Logger.debug('Viewing student:', id);
      
      const res = await API.students.get(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to load student');
      }
      
      const student = res.data;
      const photoUrl = student.photo 
        ? `${window.EDUSPHERE_API_URL || 'https://edusphereerp-scbr.onrender.com'}${student.photo}`
        : 'assets/img/avatar.png';
      
      const modalBody = document.getElementById('viewModalBody');
      modalBody.innerHTML = `
        <div class="row">
          <div class="col-md-3 text-center">
            <img src="${photoUrl}" 
                 class="rounded-circle mb-3" 
                 width="120" 
                 height="120" 
                 style="object-fit: cover"
                 onerror="this.src='assets/img/avatar.png'"
                 alt="Photo">
            <div class="fw-bold fs-5">${SECURITY.escapeHtml(student.firstName + ' ' + (student.lastName || ''))}</div>
            <span class="badge text-bg-secondary">${Formatters.formatRollNumber(student.rollNo)}</span>
          </div>
          <div class="col-md-9">
            <div class="row">
              <div class="col-md-6">
                <table class="table table-sm table-borderless">
                  <tr>
                    <th>Class</th>
                    <td>${student.class ? SECURITY.escapeHtml(student.class.name) : '—'}</td>
                  </tr>
                  <tr>
                    <th>Section</th>
                    <td>${student.section ? SECURITY.escapeHtml(student.section.name) : '—'}</td>
                  </tr>
                  <tr>
                    <th>Gender</th>
                    <td>${Formatters.formatGender(student.gender)}</td>
                  </tr>
                  <tr>
                    <th>Date of Birth</th>
                    <td>${Formatters.formatDate(student.dob, 'long')}</td>
                  </tr>
                  <tr>
                    <th>Blood Group</th>
                    <td>${SECURITY.escapeHtml(student.bloodGroup || '—')}</td>
                  </tr>
                  <tr>
                    <th>Fee Category</th>
                    <td>${renderFeeBadge(student.feeCategory)}</td>
                  </tr>
                </table>
              </div>
              <div class="col-md-6">
                <table class="table table-sm table-borderless">
                  <tr>
                    <th>Admission Date</th>
                    <td>${Formatters.formatDate(student.admissionDate, 'long')}</td>
                  </tr>
                  <tr>
                    <th>Admission Type</th>
                    <td>${SECURITY.escapeHtml(student.admissionType || '—')}</td>
                  </tr>
                  <tr>
                    <th>Father's Name</th>
                    <td>${SECURITY.escapeHtml(student.fatherName || '—')}</td>
                  </tr>
                  <tr>
                    <th>Father's Phone</th>
                    <td>${Formatters.formatPhone(student.fatherPhone || '—')}</td>
                  </tr>
                  <tr>
                    <th>Address</th>
                    <td>${SECURITY.escapeHtml(student.address || '—')}</td>
                  </tr>
                  <tr>
                    <th>Status</th>
                    <td>${Formatters.formatStatusBadge(student.status || 'ACTIVE')}</td>
                  </tr>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Show modal
      const viewModalEl = document.getElementById('viewModal');
      const existingModal = bootstrap.Modal.getInstance(viewModalEl);
      if (existingModal) { existingModal.dispose(); }
      new bootstrap.Modal(viewModalEl).show();
      
    } catch (error) {
      Logger.error('Failed to view student:', error);
      API.toast(error.message || 'Failed to load student', 'danger');
    }
  }
  
  /**
   * Edit student
   */
  async function editStudent(id) {
    try {
      Logger.debug('Editing student:', id);
      
      const res = await API.students.get(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Failed to load student');
      }
      
      const student = res.data;
      editStudentData = student;
      
      // Load classes
      const classesRes = await API.classes.list();
      const classes = (classesRes && classesRes.success) ? (classesRes.data || []) : [];
      
      // Populate class dropdown
      const editClass = document.getElementById('editClass');
      editClass.innerHTML = '<option value="">-- Select Class --</option>';
      classes.forEach(cls => {
        editClass.innerHTML += `<option value="${cls.id}">${SECURITY.escapeHtml(cls.name)}</option>`;
      });
      
      // Populate form
      document.getElementById('editId').value = student.id;
      document.getElementById('editFirstName').value = student.firstName || '';
      document.getElementById('editLastName').value = student.lastName || '';
      document.getElementById('editRollNo').value = student.rollNo || '';
      document.getElementById('editGender').value = student.gender || 'MALE';
      document.getElementById('editDob').value = student.dob ? student.dob.split('T')[0] : '';
      document.getElementById('editFee').value = student.feeCategory || 'REGULAR';
      document.getElementById('editFatherName').value = student.fatherName || '';
      document.getElementById('editFatherPhone').value = student.fatherPhone || '';
      document.getElementById('editAddress').value = student.address || '';
      
      // Set class and load sections
      if (student.classId) {
        editClass.value = student.classId;
        await updateEditSectionOptions();
        const editSection = document.getElementById('editSection');
        if (student.sectionId && editSection) {
          editSection.value = student.sectionId;
        }
      }
      
      // Show modal
      const editModalEl = document.getElementById('editModal');
      const existingModal = bootstrap.Modal.getInstance(editModalEl);
      if (existingModal) { existingModal.dispose(); }
      new bootstrap.Modal(editModalEl).show();
      
    } catch (error) {
      Logger.error('Failed to edit student:', error);
      API.toast(error.message || 'Failed to load student', 'danger');
    }
  }
  
  /**
   * Save edit
   */
  async function saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    if (!id) {
      API.toast('No student selected', 'danger');
      return;
    }
    
    // Get form data
    const formData = new FormData();
    formData.append('firstName', document.getElementById('editFirstName').value.trim());
    formData.append('lastName', document.getElementById('editLastName').value.trim());
    formData.append('rollNo', document.getElementById('editRollNo').value.trim());
    formData.append('gender', document.getElementById('editGender').value);
    formData.append('feeCategory', document.getElementById('editFee').value);
    formData.append('fatherName', document.getElementById('editFatherName').value.trim());
    formData.append('fatherPhone', document.getElementById('editFatherPhone').value.trim());
    formData.append('address', document.getElementById('editAddress').value.trim());
    
    const dob = document.getElementById('editDob').value;
    if (dob) {
      formData.append('dob', dob);
    }
    
    const classId = document.getElementById('editClass').value;
    const sectionId = document.getElementById('editSection').value;
    if (classId) { formData.append('classId', classId); }
    if (sectionId) { formData.append('sectionId', sectionId); }
    
    // Show loading
    API.spinner(true, 'saveEditBtn');
    
    try {
      Logger.time('Update Student');
      const res = await API.students.update(id, formData);
      Logger.timeEnd('Update Student');
      
      if (!res || !res.success) {
        throw new Error(res?.message || 'Update failed');
      }
      
      API.toast('Student updated successfully', 'success');
      
      // Close modal
      const modalEl = document.getElementById('editModal');
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) { modal.hide(); }
      
      // Reload data
      await Promise.all([renderTable(), loadStats()]);
      
    } catch (error) {
      Logger.error('Failed to update student:', error);
      API.toast(error.message || 'Failed to update student', 'danger');
    } finally {
      API.spinner(false, 'saveEditBtn');
    }
  }
  
  /**
   * Delete student
   */
  async function deleteStudent(id) {
    if (!confirm('Permanently DELETE this student?\n\nThis will remove all their records (attendance, fees, results) from the database.\n\nThis CANNOT be undone.')) {
      return;
    }
    
    try {
      Logger.warn('Deleting student:', id);
      
      const res = await API.students.remove(id);
      if (!res || !res.success) {
        throw new Error(res?.message || 'Delete failed');
      }
      
      API.toast('Student deleted permanently', 'success');
      
      // Reload data
      await Promise.all([renderTable(), loadStats()]);
      
    } catch (error) {
      Logger.error('Failed to delete student:', error);
      API.toast(error.message || 'Failed to delete student', 'danger');
    }
  }
  
  /**
   * Load filter dropdowns
   */
  async function loadFilterDropdowns() {
    try {
      console.log('Loading filter dropdowns...');
      const res = await API.classes.list();
      console.log('Classes response:', res);
      if (!res || !res.success) { 
        console.error('Failed to get classes:', res);
        return; 
      }
      
      const classes = res.data || [];
      console.log('Classes loaded:', classes);
      
      // Populate filter dropdown
      const filterClass = document.getElementById('filterClass');
      if (filterClass) {
        filterClass.innerHTML = '<option value="">All Classes</option>';
        classes.forEach(cls => {
          filterClass.innerHTML += `<option value="${cls.id}">${SECURITY.escapeHtml(cls.name)}</option>`;
        });
        console.log('Class dropdown populated with', classes.length, 'classes');
      }
      
      Logger.debug('Filter dropdowns loaded');
    } catch (error) {
      console.error('Failed to load filter dropdowns:', error);
      Logger.error('Failed to load filter dropdowns:', error);
    }
  }
  
  /**
   * Update section filter
   */
  async function updateSectionFilter() {
    const classId = document.getElementById('filterClass').value;
    const sectionSelect = document.getElementById('filterSection');
    
    if (!sectionSelect) { return; }
    
    sectionSelect.innerHTML = '<option value="">All Sections</option>';
    
    if (!classId) {
      renderTable();
      return;
    }
    
    try {
      const res = await API.classes.sections(classId);
      if (res && res.success) {
        (res.data || []).forEach(section => {
          sectionSelect.innerHTML += `<option value="${section.id}">${SECURITY.escapeHtml(section.name)}</option>`;
        });
      }
    } catch (error) {
      Logger.error('Failed to load sections:', error);
    }
  }
  
  /**
   * Update edit section options
   */
  async function updateEditSectionOptions() {
    const classId = document.getElementById('editClass').value;
    const sectionSelect = document.getElementById('editSection');
    
    if (!sectionSelect) { return; }
    
    sectionSelect.innerHTML = '<option value="">-- Select Section --</option>';
    
    if (!classId) { return; }
    
    try {
      const res = await API.classes.sections(classId);
      if (res && res.success) {
        (res.data || []).forEach(section => {
          sectionSelect.innerHTML += `<option value="${section.id}">${SECURITY.escapeHtml(section.name)}</option>`;
        });
      }
    } catch (error) {
      Logger.error('Failed to load sections:', error);
    }
  }
  
  /**
   * Initialize overlay scrollbars
   */
  function initScrollbars() {
    const sidebarWrapper = document.querySelector('.sidebar-wrapper');
    if (sidebarWrapper && typeof OverlayScrollbarsGlobal !== 'undefined' && OverlayScrollbarsGlobal.OverlayScrollbars) {
      OverlayScrollbarsGlobal.OverlayScrollbars(sidebarWrapper, {
        scrollbars: {
          theme: 'os-theme-light',
          autoHide: 'leave',
          clickScroll: true,
        },
      });
    }
  }
  
  // Expose public API
  window.ManageStudents = {
    init: init,
    viewStudent: viewStudent,
    editStudent: editStudent,
    saveEdit: saveEdit,
    deleteStudent: deleteStudent,
    clearFilters: clearFilters,
    changePage: changePage,
    updateSectionFilter: updateSectionFilter,
    updateEditSectionOptions: updateEditSectionOptions,
    renderTable: renderTable,
  };
  
  // Auto-initialize when DOM is ready
  document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    AUTH.requireAuth('ADMIN');
    
    // Initialize layout
    Layout.init({
      title: 'Manage Students',
      activeMenu: 'students-list',
      showNotifications: true,
    });
    
    // Initialize page
    init();
  });
  
})();

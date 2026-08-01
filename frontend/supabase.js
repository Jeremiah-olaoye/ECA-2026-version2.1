/* ================================================================
   EduTrack Pro — supabase.js
   LOCAL AUTH MODE — No Supabase needed.
   All credentials stored directly in this file.
   
   TO ADD OR CHANGE USERS: edit the USERS array below.
   ================================================================ */

/* ================================================================
   👇 ADD YOUR ADMIN USERS HERE
   ================================================================ */
   const USERS = [
    {
      email:    'admin@ghs.edu.ng',
      password: 'Admin@1234',
      name:     'Mr. Adebayo K.',
      role:     'Super Admin',
      school:   'Government High School',
    },
    {
      email:    'principal@ghs.edu.ng',
      password: 'Principal@2025',
      name:     'Mrs. Adaeze O.',
      role:     'Principal',
      school:   'Government High School',
    },
    {
      email:    'teacher@ghs.edu.ng',
      password: 'Teacher@1234',
      name:     'Mr. Chukwu E.',
      role:     'Class Teacher',
      school:   'Government High School',
    },
    {
      email:    'giftjeremiaholaoye@gmail.com',
      password: 'Teacher@12345',
      name:     'Mr. jermeiah',
      role:     'Class Teacher',
      school:   'Government High School',
    },
    /* Add more users below this line:
    {
      email:    'newuser@ghs.edu.ng',
      password: 'Password@123',
      name:     'Full Name Here',
      role:     'Admin',
      school:   'Government High School',
    },
    */
  ];
  /* ================================================================ */
  
  /* Session key used in localStorage */
  const SESSION_KEY = 'edutrack_session';
  
  /* ================================================================
     AUTH MODULE — drop-in replacement for Supabase Auth
     ================================================================ */
  const EduAuth = {
  
    /* Sign in — checks email + password against USERS array */
    async signIn(email, password) {
      /* Simulate a small network delay so the spinner shows */
      await _delay(600);
  
      const user = USERS.find(
        u => u.email.toLowerCase()    === email.toLowerCase().trim() &&
             u.password               === password
      );
  
      if (!user) {
        return { error: 'Invalid email or password. Please try again.' };
      }
  
      /* Save session to localStorage */
      const session = {
        email:     user.email,
        name:      user.name,
        role:      user.role,
        school:    user.school,
        loggedIn:  true,
        loginTime: Date.now(),
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  
      return { user: session, session };
    },
  
    /* Sign out — clear session and redirect to login */
    async signOut() {
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'login.html';
    },
  
    /* Get current session object (null if not logged in) */
    async getSession() {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      try {
        const session = JSON.parse(raw);
        if (!session.loggedIn) return null;
        return session;
      } catch {
        return null;
      }
    },
  
    /* Get current user profile */
    async getCurrentUser() {
      const session = await this.getSession();
      if (!session) return null;
      return {
        email:   session.email,
        profile: {
          name:        session.name,
          role:        session.role,
          school_name: session.school,
        },
      };
    },
  
    /* Guard — redirects to login if no session */
    async requireAuth() {
      const session = await this.getSession();
      if (!session) {
        window.location.href = 'login.html';
        return null;
      }
      return session;
    },
  
    /* Password reset — local mode just shows a message */
    async resetPassword(email) {
      await _delay(800);
      const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        return { error: 'No account found with that email address.' };
      }
      /* In local mode we can't send a real email — show instructions */
      return {
        success: true,
        message: 'Contact your system administrator to reset your password.',
      };
    },
  };
  
  /* ================================================================
     DATA STORE — localStorage-based database
     (Replaces Supabase tables — data persists in the browser)
     ================================================================ */
  
  /* Helper: load a collection from localStorage */
  function _load(key) {
    try { return JSON.parse(localStorage.getItem('edutrack_' + key) || '[]'); }
    catch { return []; }
  }
  
  /* Helper: save a collection to localStorage */
  function _save(key, data) {
    localStorage.setItem('edutrack_' + key, JSON.stringify(data));
  }
  
  /* Helper: generate a simple unique ID */
  function _uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }
  
  /* Helper: simulate async delay */
  function _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /* ── Seed demo data if nothing exists yet ── */
  (function seedDemoData() {
    if (_load('students').length > 0) return; /* already seeded */
  
    const students = [
      { id: _uid(), name: 'Amaka Okafor',    admission_no: 'GHS/2025/001', class: 'SS 2A',  gender: 'Female', date_of_birth: '2007-03-15' },
      { id: _uid(), name: 'Ibrahim Musa',    admission_no: 'GHS/2025/002', class: 'SS 3A',  gender: 'Male',   date_of_birth: '2006-07-22' },
      { id: _uid(), name: 'Chioma Eze',      admission_no: 'GHS/2025/003', class: 'JSS 2B', gender: 'Female', date_of_birth: '2010-01-10' },
      { id: _uid(), name: 'Emeka Nwosu',     admission_no: 'GHS/2025/004', class: 'SS 1A',  gender: 'Male',   date_of_birth: '2008-09-05' },
      { id: _uid(), name: 'Fatima Aliyu',    admission_no: 'GHS/2025/005', class: 'SS 2B',  gender: 'Female', date_of_birth: '2007-11-30' },
      { id: _uid(), name: 'Tunde Adeyemi',   admission_no: 'GHS/2025/006', class: 'JSS 3A', gender: 'Male',   date_of_birth: '2009-06-18' },
      { id: _uid(), name: 'Grace Okoro',     admission_no: 'GHS/2025/007', class: 'SS 3B',  gender: 'Female', date_of_birth: '2006-04-25' },
      { id: _uid(), name: 'Yusuf Bello',     admission_no: 'GHS/2025/008', class: 'SS 1B',  gender: 'Male',   date_of_birth: '2008-12-08' },
      { id: _uid(), name: 'Ngozi Adamu',     admission_no: 'GHS/2025/009', class: 'SS 2A',  gender: 'Female', date_of_birth: '2007-08-14' },
      { id: _uid(), name: 'Chidi Okonkwo',   admission_no: 'GHS/2025/010', class: 'SS 3A',  gender: 'Male',   date_of_birth: '2006-02-27' },
    ];
    _save('students', students);
  
    /* Seed results for each student */
    const subjects = ['Mathematics','English Language','Physics','Chemistry','Biology','Economics'];
    const results  = [];
    students.forEach(s => {
      subjects.forEach(subj => {
        const ca   = Math.floor(Math.random() * 11) + 20;   /* 20–30 */
        const exam = Math.floor(Math.random() * 31) + 40;   /* 40–70 */
        results.push({
          id: _uid(), student_id: s.id,
          session: '2024/2025', term: '3rd Term',
          subject: subj, ca_score: ca, exam_score: exam,
          total_score: ca + exam,
          grade: _calcGrade(ca + exam),
        });
      });
    });
    _save('results', results);
  
    /* Seed settings */
    _save('settings', {
      school_name: 'Government High School',
      address:     '12 Education Crescent, Ikeja, Lagos',
      phone:       '+234 801 234 5678',
      email:       'admin@ghs.edu.ng',
      session:     '2024/2025',
      term:        '3rd Term',
      max_ca:      30,
      max_exam:    70,
    });
  })();
  
  function _calcGrade(total) {
    if (total >= 80) return 'A';
    if (total >= 65) return 'B';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    return 'F';
  }
  
  /* ================================================================
     STUDENTS MODULE
     ================================================================ */
  const EduStudents = {
  
    async getAll({ search = '', classFilter = '' } = {}) {
      await _delay(300);
      let data = _load('students');
      if (search)      data = data.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
      if (classFilter) data = data.filter(s => s.class === classFilter);
      data.sort((a, b) => a.name.localeCompare(b.name));
      return { data, error: null };
    },
  
    async getById(id) {
      const data = _load('students').find(s => s.id === id) || null;
      return { data, error: data ? null : 'Not found' };
    },
  
    async getByAdmission(admissionNo) {
      const data = _load('students').find(
        s => s.admission_no.toLowerCase() === admissionNo.toLowerCase()
      ) || null;
      return { data, error: data ? null : 'Student not found' };
    },
  
    async add({ name, admissionNo, studentClass, gender, dob }) {
      const students = _load('students');
      /* Check duplicate admission number */
      if (students.find(s => s.admission_no === admissionNo)) {
        return { data: null, error: 'Admission number already exists.' };
      }
      const newStudent = {
        id: _uid(), name, admission_no: admissionNo,
        class: studentClass, gender, date_of_birth: dob || null,
      };
      students.push(newStudent);
      _save('students', students);
      return { data: newStudent, error: null };
    },
  
    async update(id, fields) {
      const students = _load('students');
      const idx      = students.findIndex(s => s.id === id);
      if (idx === -1) return { data: null, error: 'Student not found' };
      students[idx]  = { ...students[idx], ...fields };
      _save('students', students);
      return { data: students[idx], error: null };
    },
  
    async delete(id) {
      /* Remove student */
      _save('students', _load('students').filter(s => s.id !== id));
      /* Cascade: remove results + report cards */
      _save('results',      _load('results').filter(r => r.student_id !== id));
      _save('report_cards', _load('report_cards').filter(r => r.student_id !== id));
      return { error: null };
    },
  
    async count() {
      return _load('students').length;
    },
  };
  
  /* ================================================================
     RESULTS MODULE
     ================================================================ */
  const EduResults = {
  
    async getForStudent(studentId, session, term) {
      const data = _load('results').filter(
        r => r.student_id === studentId && r.session === session && r.term === term
      );
      return { data, error: null };
    },
  
    async getAll({ session = '', term = '', search = '' } = {}) {
      let data = _load('results');
      if (session) data = data.filter(r => r.session === session);
      if (term)    data = data.filter(r => r.term    === term);
      return { data, error: null };
    },
  
    async saveForStudent(studentId, session, term, subjectScores) {
      /* Remove old results for this student/term */
      let results = _load('results').filter(
        r => !(r.student_id === studentId && r.session === session && r.term === term)
      );
      /* Add new scores */
      const newRows = subjectScores.map(s => ({
        id: _uid(), student_id: studentId,
        session, term,
        subject:     s.subject,
        ca_score:    s.ca,
        exam_score:  s.exam,
        total_score: s.ca + s.exam,
        grade:       _calcGrade(s.ca + s.exam),
      }));
      results = results.concat(newRows);
      _save('results', results);
      return { data: newRows, error: null };
    },
  
    async update(id, fields) {
      const results = _load('results');
      const idx     = results.findIndex(r => r.id === id);
      if (idx === -1) return { data: null, error: 'Not found' };
      if (fields.ca_score !== undefined || fields.exam_score !== undefined) {
        const ca   = fields.ca_score   ?? results[idx].ca_score;
        const exam = fields.exam_score ?? results[idx].exam_score;
        fields.total_score = ca + exam;
        fields.grade       = _calcGrade(ca + exam);
      }
      results[idx] = { ...results[idx], ...fields };
      _save('results', results);
      return { data: results[idx], error: null };
    },
  
    async delete(id) {
      _save('results', _load('results').filter(r => r.id !== id));
      return { error: null };
    },
  
    async count() {
      return _load('results').length;
    },
  
    async averageScore() {
      const data = _load('results');
      if (!data.length) return 0;
      const sum = data.reduce((acc, r) => acc + (r.total_score || 0), 0);
      return (sum / data.length).toFixed(1);
    },
  };
  
  /* ================================================================
     REPORT CARDS MODULE
     ================================================================ */
  const EduReportCards = {
  
    async get(studentId, session, term) {
      const data = _load('report_cards').find(
        r => r.student_id === studentId && r.session === session && r.term === term
      ) || null;
      return { data, error: null };
    },
  
    async save({ studentId, session, term, totalScore, average,
                 overallGrade, position, teacherComment, principalComment }) {
      let cards = _load('report_cards');
      const idx = cards.findIndex(
        r => r.student_id === studentId && r.session === session && r.term === term
      );
      const card = {
        id: idx >= 0 ? cards[idx].id : _uid(),
        student_id: studentId, session, term,
        total_score: totalScore, average, overall_grade: overallGrade,
        position: position || null,
        teacher_comment:   teacherComment,
        principal_comment: principalComment,
        updated_at: new Date().toISOString(),
      };
      if (idx >= 0) cards[idx] = card;
      else          cards.push(card);
      _save('report_cards', cards);
      return { data: card, error: null };
    },
  
    async getAllForStudent(studentId) {
      const data = _load('report_cards').filter(r => r.student_id === studentId);
      return { data, error: null };
    },
  };
  
  /* ================================================================
     DASHBOARD STATS MODULE
     ================================================================ */
  const EduStats = {
    async loadAll(session, term) {
      const studentCount = await EduStudents.count();
      const resultCount  = await EduResults.count();
      const avgScore     = await EduResults.averageScore();
  
      const allResults = _load('results').filter(
        r => r.session === session && r.term === term
      );
      const passed  = allResults.filter(r => r.total_score >= 50).length;
      const failed  = allResults.filter(r => r.total_score < 50).length;
      const attRate = 91; /* You can make this dynamic later */
  
      return { studentCount, resultCount, avgScore, passed, failed, attRate };
    },
  };
  
  /* ================================================================
     SETTINGS MODULE
     ================================================================ */
  const EduSettings = {
    async save(settings) {
      _save('settings', { ..._load('settings')[0] || {}, ...settings });
      return { data: settings, error: null };
    },
    async load() {
      const raw  = localStorage.getItem('edutrack_settings');
      const data = raw ? JSON.parse(raw) : null;
      return { data, error: null };
    },
  };
  
  /* ================================================================
     UTILITIES
     ================================================================ */
  const EduUtils = {
  
    calcGrade: _calcGrade,
  
    mapStudentRow(student, results = []) {
      const termResults = results.filter(r => r.student_id === student.id);
      const total = termResults.reduce((s, r) => s + (r.total_score || 0), 0);
      const avg   = termResults.length ? total / termResults.length : 0;
      return {
        id:       student.id,
        name:     student.name,
        admNo:    student.admission_no,
        class:    student.class,
        subjects: termResults.length,
        total:    Math.round(total),
        avg:      parseFloat(avg.toFixed(1)),
        grade:    _calcGrade(avg),
        remark:   avg >= 80 ? 'Outstanding' : avg >= 65 ? 'Good' : avg >= 50 ? 'Average' : 'Needs Improvement',
        status:   avg >= 50 ? 'pass' : 'fail',
      };
    },
  
    showTableSkeleton(tbodyId, cols = 8) {
      const tbody = document.getElementById(tbodyId);
      if (!tbody) return;
      tbody.innerHTML = Array.from({ length: 5 }, () => `
        <tr>${Array.from({ length: cols }, () =>
          `<td><div class="skeleton" style="height:14px;border-radius:4px;"></div></td>`
        ).join('')}</tr>`).join('');
    },
  
    showTableError(tbodyId, msg, cols = 8) {
      const tbody = document.getElementById(tbodyId);
      if (tbody) tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:40px;color:#EF4444;">⚠ ${msg}</td></tr>`;
    },
  
    showTableEmpty(tbodyId, msg = 'No records found.', cols = 8) {
      const tbody = document.getElementById(tbodyId);
      if (tbody) tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center;padding:40px;color:#64748B;">📭 ${msg}</td></tr>`;
    },
  };
/* EduTrack Pro - My Class (loaded by myclass.html) */
/* ================================================================
   MY CLASS — Complete class management system
   Uses Supabase for permanent storage
   ================================================================ */

   var PAGE = {
    teacher:  null,
    students: [],
    allResults: {},   /* { studentId: [result, ...] } */
    session:  '2026/2027',
    term:     '1st Term',
    currentScoreStudentId: null,
    cardsVisible: true,
    subjects: []
  };
  
  var NIGERIAN_SUBJECTS = {
    SS: ['English Language','Mathematics','Biology','Chemistry','Physics',
      'Agricultural Science','Economics','Government','Literature in English',
      'Civic Education','Geography','Further Mathematics','Commerce',
      'Financial Accounting','Computer Studies','Christian Religious Studies',
      'Islamic Religious Studies','Physical & Health Education'],
    JSS: ['English Language','Mathematics','Basic Science','Basic Technology',
      'Social Studies','Civic Education','Christian Religious Studies',
      'Islamic Religious Studies','Physical & Health Education','Computer Studies',
      'Agricultural Science','Home Economics','Business Studies','French Language',
      'Fine Arts & Craft','Music','Cultural & Creative Arts'],
    PRIMARY: ['English Comprehension','English Vocabulary','Social Studies',
      'Agricultural Science','Quantitative Reasoning','Verbal Reasoning',
      'Computer Studies','Home Economics','Physical & Health Education',
      'Civic Education','English Composition','English Grammar',
      'English Dictation / Spelling','Mathematics','Basic Science',
      'Literature in English','Creative & Cultural Art','Religious Studies',
      'Hand Writing','Crafts']
  };
  
  function getLevel(cls){
    if(!cls) return 'SS';
    var c = cls.toUpperCase();
    if(c.indexOf('BASIC')>-1||c.indexOf('PRIMARY')>-1) return 'PRIMARY';
    if(c.indexOf('JSS')>-1) return 'JSS';
    return 'SS';
  }
  
  /* ── Toast ───────────────────────────────────────────────────────── */
  function toast(msg, isErr){
    var el = document.getElementById('toast');
    if(!el) return;
    el.textContent = msg;
    el.style.background = isErr ? '#991B1B' : '#1E293B';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('show'); }, 3500);
  }
  
  /* ── State management ────────────────────────────────────────────── */
  function showState(state){
    document.getElementById('loadingState').style.display = state==='loading' ? 'block' : 'none';
    document.getElementById('setupState').style.display   = state==='setup'   ? 'block' : 'none';
    document.getElementById('mainState').style.display    = state==='main'    ? 'block' : 'none';
  }
  
  /* ================================================================
     FRIENDLY ERRORS  (a failed save must never look like a success)
     ================================================================ */
  function friendlyDbError(e){
    var m = String((e && (e.message || e.error_description)) || e || '');
    if(/row-level security|permission denied|jwt|not authenticated|invalid token|expired|401|403/i.test(m))
      return 'Your sign-in has expired, or this account is not allowed to do that. Please sign in again.';
    if(/failed to fetch|network|load failed|timeout|cannot reach/i.test(m))
      return 'No internet connection. Please check it and try again.';
    if(/duplicate key|unique/i.test(m)) return 'That entry already exists.';
    return m || 'Unknown error';
  }
  function escapeHtml(t){
    return String(t).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
  }
  function showLoadError(e){
    showState('loading');
    document.getElementById('loadingState').innerHTML =
      '<i class="fas fa-exclamation-triangle" style="color:#dc2626"></i>'
      + '<p style="color:#dc2626;font-weight:700;margin-bottom:6px">Could not load your class</p>'
      + '<p style="margin-bottom:14px;font-size:.85rem">' + escapeHtml(friendlyDbError(e)) + '</p>'
      + '<button class="btn btn-primary" onclick="location.reload()"><i class="fas fa-redo"></i> Try again</button> '
      + '<a class="btn btn-outline" href="login.html">Sign in again</a>';
  }
  
  /* ================================================================
     BOOT
     ================================================================ */
  window.addEventListener('DOMContentLoaded', async function(){
    showState('loading');
  
    /* On-screen details (name, term) saved by the login page */
    var sess = null;
    try{
      var raw = localStorage.getItem('edutrack_session');
      if(raw) sess = JSON.parse(raw);
    }catch(e){}
    if(!sess || !sess.loggedIn){ window.location.replace('login.html'); return; }
  
    /* WHO is signed in is decided by Supabase, never by this browser's saved note */
    var authEmail = '';
    try{
      var sr = await getDB().auth.getSession();
      if(!sr.data || !sr.data.session){ window.location.replace('login.html'); return; }
      authEmail = String(sr.data.session.user.email || '').toLowerCase();
    }catch(e){ showLoadError(e); return; }
  
    PAGE.session = sess.session || '2026/2027';
    PAGE.term    = sess.term    || '1st Term';
    document.getElementById('topbarTitle').textContent = 'My Class — ' + (sess.firstName || sess.name || 'Teacher');
  
    try{
      var teacher = await TeacherDB.get(authEmail);
      if(!teacher){
        teacher = await TeacherDB.upsert({
          email: authEmail, name: sess.name || 'Teacher',
          role: sess.role || 'Teacher', session: PAGE.session, term: PAGE.term
        });
      }
      PAGE.teacher = teacher;
      PAGE.term = teacher.term || PAGE.term;
  
      if(!teacher.class_assigned){ showState('setup'); return; }
  
      PAGE.subjects = NIGERIAN_SUBJECTS[getLevel(teacher.class_assigned)] || NIGERIAN_SUBJECTS.SS;
      await loadAll();
      showState('main');
    }catch(e){ console.error(e); showLoadError(e); }
  });
  
  /* ── Register class ───────────────────────────────────────────────── */
  async function registerClass(){
    var cls  = document.getElementById('setupClass').value;
    var term = document.getElementById('setupTerm').value;
    if(!cls){ toast('Please select a class.', true); return; }
    try{
      await TeacherDB.upsert({
        email: PAGE.teacher.email, name: PAGE.teacher.name,
        role: PAGE.teacher.role, class_assigned: cls,
        session: PAGE.session, term: term
      });
      PAGE.teacher.class_assigned = cls;
      PAGE.teacher.term = term;
      PAGE.term = term;
      PAGE.subjects = NIGERIAN_SUBJECTS[getLevel(cls)] || NIGERIAN_SUBJECTS.SS;
      await loadAll();
      showState('main');
      toast('Class registered: ' + cls);
    }catch(e){ console.error(e); toast('Could not register your class: ' + friendlyDbError(e), true); }
  }
  
  /* ── Load all students + their results ───────────────────────────── */
  async function loadAll(){
    var t = PAGE.teacher;
    PAGE.students = await StudentDB.getAll(t.email, PAGE.session, PAGE.term);
  
    /* Load results for ALL students at once */
    var allRes = await ResultDB.getByTeacher(t.email, PAGE.session, PAGE.term);
    PAGE.allResults = {};
    allRes.forEach(function(r){
      if(!PAGE.allResults[r.student_id]) PAGE.allResults[r.student_id] = [];
      PAGE.allResults[r.student_id].push(r);
    });
  
    renderStudentTable();
    renderStats();
    renderAllReportCards();
    updateTopbarButtons(true);
    document.getElementById('topbarTitle').textContent =
      'My Class — ' + (PAGE.teacher.class_assigned||'') + ' (' + PAGE.term + ')';
  }
  
  function updateTopbarButtons(show){
    var _tr = document.querySelector('.topbar-right');
    if(_tr) _tr.classList.toggle('has-actions', !!show);
    ['btnPrintAll','btnCalcPos','btnAddStudent'].forEach(function(id){
      document.getElementById(id).style.display = show ? '' : 'none';
    });
  }
  
  /* ── Stats bar ───────────────────────────────────────────────────── */
  function renderStats(){
    var students = PAGE.students;
    var withRes  = students.filter(function(s){ return PAGE.allResults[s.id]&&PAGE.allResults[s.id].length; }).length;
    var top      = students.find(function(s){ return s.position===1; });
    var passed   = students.filter(function(s){
      var res = PAGE.allResults[s.id]||[];
      var avg = res.length ? res.reduce(function(a,r){ return a+(parseFloat(r.total)||0); },0)/res.length : 0;
      return avg >= 40;
    }).length;
  
    var el = document.getElementById('statsBar');
    el.innerHTML = [
      stat('#3B82F6','fa-users',students.length,'Total Students'),
      stat('#22C55E','fa-clipboard-check',withRes,'Results Entered'),
      stat('#F59E0B','fa-trophy',passed,'Passed'),
      stat('#7C3AED','fa-star',top?top.full_name.split(' ')[0]:'--','Top Student'),
    ].join('');
  
    function stat(clr,icon,val,lbl){
      return '<div class="stat-box">'
        +'<div class="stat-icon" style="background:'+clr+'18;color:'+clr+'"><i class="fas '+icon+'"></i></div>'
        +'<div><div class="stat-val">'+val+'</div><div class="stat-lbl">'+lbl+'</div></div>'
        +'</div>';
    }
  
    var t = PAGE.teacher;
    document.getElementById('classListTitle').textContent =
      (t.class_assigned||'') + ' — ' + PAGE.term + ' Students';
    document.getElementById('studentCountLabel').textContent =
      students.length + ' student' + (students.length!==1?'s':'');
  }
  
  /* ── Student table ───────────────────────────────────────────────── */
  function renderStudentTable(){
    var tbody   = document.getElementById('studentTableBody');
    var students = PAGE.students.slice().sort(function(a,b){
      if(a.position&&b.position) return a.position-b.position;
      return (a.full_name||'').localeCompare(b.full_name||'');
    });
  
    if(!students.length){
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:30px;color:var(--muted);">'
        +'<i class="fas fa-user-graduate" style="font-size:2rem;display:block;margin-bottom:10px;opacity:.2"></i>'
        +'No students yet. Click "Add Student" to begin.</td></tr>';
      return;
    }
  
    tbody.innerHTML = students.map(function(s){
      var res  = PAGE.allResults[s.id] || [];
      var grand= res.reduce(function(a,r){ return a+(parseFloat(r.total)||0); },0);
      var avg  = res.length ? (grand/res.length).toFixed(1) : '--';
      var grd  = res.length ? gradeFrom(parseFloat(avg)) : '--';
      var posC = s.position===1?'#F59E0B':s.position===2?'#94A3B8':s.position===3?'#CD7C2F':'#3B82F6';
      var hasRes = res.length > 0;
  
      return '<tr>'
        +'<td><div class="pos-badge" style="background:'+posC+'">'+(s.position||'--')+'</div></td>'
        +'<td style="font-weight:600;">'+s.full_name+'</td>'
        +'<td style="color:var(--muted);font-size:.78rem">'+(s.adm_no||'--')+'</td>'
        +'<td>'+(s.gender||'--')+'</td>'
        +'<td data-label="Avg" style="font-weight:700;color:'+(hasRes?'#1E3A5F':'var(--muted)')+'">'+avg+(hasRes?'%':'')+'</td>'
        +'<td data-label="Grade"><span style="color:'+(hasRes?gradeColor(grd):'var(--muted)')+';font-weight:700">'+grd+'</span></td>'
        +'<td>'
          +(hasRes
            ?'<span style="background:rgba(34,197,94,.1);color:#16a34a;padding:2px 8px;border-radius:99px;font-size:.7rem;font-weight:600;"><i class="fas fa-check"></i> Done</span>'
            :'<span style="background:rgba(239,68,68,.1);color:#dc2626;padding:2px 8px;border-radius:99px;font-size:.7rem;font-weight:600;"><i class="fas fa-times"></i> Pending</span>'
          )
        +'</td>'
        +'<td>'
          +'<div style="display:flex;gap:5px;flex-wrap:wrap">'
          +'<button class="action-btn" onclick="openScoresModal(\''+s.id+'\')" title="Enter Scores" style="color:#3B82F6;border-color:rgba(59,130,246,.3)"><i class="fas fa-edit"></i></button>'
          +'<button class="action-btn" onclick="editStudent(\''+s.id+'\')" title="Edit Info" style="color:#7C3AED;border-color:rgba(124,58,237,.3)"><i class="fas fa-user-edit"></i></button>'
          +'<button class="action-btn" onclick="deleteStudent(\''+s.id+'\')" title="Delete" style="color:#EF4444;border-color:rgba(239,68,68,.3)"><i class="fas fa-trash-alt"></i></button>'
          +'</div>'
        +'</td>'
        +'</tr>';
    }).join('');
  
    /* Search wire */
    var srch = document.getElementById('studentSearch');
    srch.oninput = function(){
      var q = srch.value.toLowerCase();
      document.querySelectorAll('#studentTableBody tr').forEach(function(row){
        var txt = row.textContent.toLowerCase();
        row.style.display = !q || txt.indexOf(q)>-1 ? '' : 'none';
      });
    };
  }
  
  /* ================================================================
     ADD / EDIT STUDENT
     ================================================================ */
  function showAddStudentModal(){
    document.getElementById('editStudentId').value = '';
    document.getElementById('studentModalTitle').innerHTML =
      '<i class="fas fa-user-plus" style="color:var(--primary)"></i> Add Student';
    document.getElementById('saveStudentBtn').innerHTML =
      '<i class="fas fa-save"></i> Add Student';
    ['sName','sAdmNo','sDob','sDaysPresent','sDaysOpened','sNextTerm'].forEach(function(id){
      document.getElementById(id).value='';
    });
    document.getElementById('sGender').value = 'Male';
    /* Auto-generate next admission number */
    var next = PAGE.students.length + 1;
    document.getElementById('sAdmNo').value = 'ECA/2026/' + String(next).padStart(3,'0');
    document.getElementById('studentModal').classList.add('open');
    setTimeout(function(){ document.getElementById('sName').focus(); },100);
  }
  
  function editStudent(id){
    var s = PAGE.students.find(function(x){ return x.id===id; });
    if(!s) return;
    document.getElementById('editStudentId').value = id;
    document.getElementById('studentModalTitle').innerHTML =
      '<i class="fas fa-user-edit" style="color:#7C3AED"></i> Edit Student';
    document.getElementById('saveStudentBtn').innerHTML =
      '<i class="fas fa-save"></i> Save Changes';
    document.getElementById('sName').value          = s.full_name||'';
    document.getElementById('sAdmNo').value         = s.adm_no||'';
    document.getElementById('sGender').value        = s.gender||'Male';
    document.getElementById('sDob').value           = s.dob||'';
    document.getElementById('sDaysPresent').value   = s.days_present||'';
    document.getElementById('sDaysOpened').value    = s.days_opened||'';
    document.getElementById('sNextTerm').value      = s.next_term_date||'';
    document.getElementById('studentModal').classList.add('open');
  }
  
  function closeStudentModal(){
    document.getElementById('studentModal').classList.remove('open');
  }
  
  async function saveStudent(){
    var editId = document.getElementById('editStudentId').value;
    var name   = document.getElementById('sName').value.trim();
    if(!name){ toast('Please enter the student name.',true); return; }
  
    var btn = document.getElementById('saveStudentBtn');
    btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  
    var fields = {
      full_name:     name,
      adm_no:        document.getElementById('sAdmNo').value.trim(),
      gender:        document.getElementById('sGender').value,
      dob:           document.getElementById('sDob').value,
      days_present:  parseInt(document.getElementById('sDaysPresent').value)||0,
      days_opened:   parseInt(document.getElementById('sDaysOpened').value)||0,
      next_term_date:document.getElementById('sNextTerm').value,
      days_absent:   Math.max(0,(parseInt(document.getElementById('sDaysOpened').value)||0)-(parseInt(document.getElementById('sDaysPresent').value)||0))
    };
  
    try{
      if(editId){
        await StudentDB.update(editId, fields);
        var idx = PAGE.students.findIndex(function(x){ return x.id===editId; });
        if(idx>=0) Object.assign(PAGE.students[idx], fields);
        toast(name + ' updated!');
      } else {
        var newS = await StudentDB.add(Object.assign(fields,{
          teacher_email: PAGE.teacher.email,
          class: PAGE.teacher.class_assigned,
          session: PAGE.session, term: PAGE.term
        }));
        PAGE.students.push(newS);
        toast(name + ' added to ' + PAGE.teacher.class_assigned + '!');
      }
    }catch(e){
      /* NOT saved: say so, and keep the form open so nothing typed is lost */
      console.error(e);
      toast('NOT saved - ' + friendlyDbError(e), true);
      btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save Student';
      return;
    }
  
    closeStudentModal();
    btn.disabled = false; btn.innerHTML = '<i class="fas fa-save"></i> Save';
    renderStudentTable();
    renderStats();
    renderAllReportCards();
  }
  
  async function deleteStudent(id){
    var s = PAGE.students.find(function(x){ return x.id===id; });
    if(!s) return;
    if(!confirm('Delete ' + s.full_name + '? This also deletes their scores. Cannot be undone.')) return;
    try{ await StudentDB.delete(id); }
    catch(e){ console.error(e); toast('NOT deleted - ' + friendlyDbError(e), true); return; }
    PAGE.students = PAGE.students.filter(function(x){ return x.id!==id; });
    delete PAGE.allResults[id];
    renderStudentTable();
    renderStats();
    renderAllReportCards();
    toast(s.full_name + ' deleted.');
  }
  
  /* ================================================================
     SCORES MODAL
     ================================================================ */
  function openScoresModal(studentId){
    var s = PAGE.students.find(function(x){ return x.id===studentId; });
    if(!s) return;
    PAGE.currentScoreStudentId = studentId;
  
    document.getElementById('scoresModalTitle').innerHTML =
      '<i class="fas fa-edit" style="color:var(--primary)"></i> Scores — ' + s.full_name;
  
    var existing = PAGE.allResults[studentId] || [];
    var level    = getLevel(PAGE.teacher.class_assigned);
    var subjects = NIGERIAN_SUBJECTS[level] || NIGERIAN_SUBJECTS.SS;
    PAGE.subjects = subjects;
  
    var tbody = document.getElementById('scoresTableBody');
    tbody.innerHTML = subjects.map(function(subj,i){
      var r    = existing.find(function(x){ return x.subject===subj; }) || {};
      var vals = [r.cw||'',r.asst||'',r.mid_term||'',r.exam||''];
      return '<tr id="srow_'+i+'">'
        +'<td style="padding:6px 8px;font-size:.78rem;font-weight:500;border-bottom:1px solid var(--border);">'+subj+'</td>'
        +['cw','asst','mid','exam'].map(function(cls,ci){
          var max=[10,10,20,60][ci];
          return '<td data-label="'+['CW /10','Asst /10','Mid /20','Exam /60'][ci]+'" style="padding:3px;border-bottom:1px solid var(--border);">'
            +'<input type="number" min="0" max="'+max+'" value="'+(vals[ci])+'" placeholder="0"'
            +' class="sc-inp sc-'+cls+'" data-subj="'+subj+'" data-max="'+max+'"'
            +' style="width:'+(ci>=2?52:46)+'px;padding:4px 3px;text-align:center;border:1.5px solid var(--border);'
            +'border-radius:5px;font-size:.78rem;background:var(--bg);color:var(--text);outline:none;">'
            +'</td>';
        }).join('')
        +'<td id="stot_'+i+'" data-label="Total" style="padding:6px;text-align:center;font-weight:700;font-size:.78rem;border-bottom:1px solid var(--border);">--</td>'
        +'<td id="sgrd_'+i+'" data-label="Grade" style="padding:6px;text-align:center;font-size:.78rem;border-bottom:1px solid var(--border);">--</td>'
        +'</tr>';
    }).join('');
  
    /* Wire input events */
    tbody.addEventListener('input', function(e){
      if(!e.target.classList.contains('sc-inp')) return;
      var max = parseInt(e.target.dataset.max)||100;
      var v   = parseFloat(e.target.value)||0;
      if(v>max) e.target.value=max;
      if(v<0)   e.target.value=0;
      recalcScoresModal();
    });
  
    recalcScoresModal();
    document.getElementById('scoresModal').classList.add('open');
  }
  
  function recalcScoresModal(){
    var subjects = PAGE.subjects;
    var grand=0, count=0;
    subjects.forEach(function(subj,i){
      var cw   = parseFloat((document.querySelector('.sc-cw[data-subj="'+subj+'"]')||{}).value)||0;
      var asst = parseFloat((document.querySelector('.sc-asst[data-subj="'+subj+'"]')||{}).value)||0;
      var mid  = parseFloat((document.querySelector('.sc-mid[data-subj="'+subj+'"]')||{}).value)||0;
      var exam = parseFloat((document.querySelector('.sc-exam[data-subj="'+subj+'"]')||{}).value)||0;
      var tot  = cw+asst+mid+exam;
      var has  = cw||asst||mid||exam;
      var grd  = has ? gradeFrom(tot) : '--';
      var clr  = has ? gradeColor(grd) : 'var(--muted)';
      var tc   = document.getElementById('stot_'+i);
      var gc   = document.getElementById('sgrd_'+i);
      if(tc) tc.textContent = has ? tot : '--';
      if(gc){ gc.textContent=grd; gc.style.color=clr; gc.style.fontWeight=has?'700':'400'; }
      if(has){ grand+=tot; count++; }
    });
    var avg = count ? (grand/count).toFixed(1) : '--';
    var grd = count ? gradeFrom(parseFloat(avg)) : '--';
    document.getElementById('scoresSummaryTotal').textContent = count ? grand+'/'+count*100 : '--';
    document.getElementById('scoresSummaryAvg').textContent   = count ? avg+'%' : '--';
    document.getElementById('scoresSummaryGrade').textContent  = grd;
  }
  
  function closeScoresModal(){
    document.getElementById('scoresModal').classList.remove('open');
    PAGE.currentScoreStudentId = null;
  }
  
  async function saveScores(){
    var studentId = PAGE.currentScoreStudentId;
    if(!studentId){ toast('No student selected.',true); return; }
  
    var btn = document.getElementById('saveScoresBtn');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...';
  
    var scores = [];
    PAGE.subjects.forEach(function(subj){
      var cw   = parseFloat((document.querySelector('.sc-cw[data-subj="'+subj+'"]')||{}).value)||0;
      var asst = parseFloat((document.querySelector('.sc-asst[data-subj="'+subj+'"]')||{}).value)||0;
      var mid  = parseFloat((document.querySelector('.sc-mid[data-subj="'+subj+'"]')||{}).value)||0;
      var exam = parseFloat((document.querySelector('.sc-exam[data-subj="'+subj+'"]')||{}).value)||0;
      if(cw||asst||mid||exam) scores.push({subject:subj,cw:cw,asst:asst,mid:mid,exam:exam});
    });
  
    if(!scores.length){ toast('Enter at least one score.',true); btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Save Scores'; return; }
  
    try{
      await ResultDB.save(studentId, PAGE.teacher.email, PAGE.session, PAGE.term, scores);
  
      /* Update local cache */
      var allRes = await ResultDB.getByTeacher(PAGE.teacher.email, PAGE.session, PAGE.term);
      PAGE.allResults = {};
      allRes.forEach(function(r){ if(!PAGE.allResults[r.student_id]) PAGE.allResults[r.student_id]=[]; PAGE.allResults[r.student_id].push(r); });
    }catch(e){
      /* NOT saved: keep the scores on screen so nothing typed is lost */
      console.error(e);
      toast('Scores NOT saved - ' + friendlyDbError(e), true);
      btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Save Scores';
      return;
    }
  
    var s = PAGE.students.find(function(x){ return x.id===studentId; });
    toast('Scores saved for ' + (s?s.full_name:'student') + '!');
    closeScoresModal();
    btn.disabled=false; btn.innerHTML='<i class="fas fa-save"></i> Save Scores';
    renderStudentTable();
    renderStats();
    renderAllReportCards();
  }
  
  /* ================================================================
     CALCULATE POSITIONS
     ================================================================ */
  async function calcPositions(){
    var btn = document.getElementById('btnCalcPos');
    btn.disabled=true; btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Calculating...';
    try{
      await StudentDB.calcPositions(PAGE.teacher.email, PAGE.session, PAGE.term);
      /* Reload students with new positions */
      PAGE.students = await StudentDB.getAll(PAGE.teacher.email, PAGE.session, PAGE.term);
    }catch(e){
      console.error(e);
      toast('Positions NOT calculated - ' + friendlyDbError(e), true);
      btn.disabled=false; btn.innerHTML='<i class="fas fa-trophy"></i> Calculate Positions';
      return;
    }
    renderStudentTable();
    renderStats();
    renderAllReportCards();
    btn.disabled=false; btn.innerHTML='<i class="fas fa-trophy"></i> Calculate Positions';
    var ranked = PAGE.students.filter(function(x){ return x.position; }).length;
    toast(ranked ? 'Positions calculated for ' + ranked + ' student' + (ranked===1?'':'s') + '.' : 'Enter some scores first, then calculate positions.');
  }
  
  /* ================================================================
     RENDER ALL REPORT CARDS
     ================================================================ */
  function renderAllReportCards(){
    var section = document.getElementById('reportCardsSection');
    var area    = document.getElementById('reportCardsArea');
  
    var students = PAGE.students.slice().sort(function(a,b){
      if(a.position&&b.position) return a.position-b.position;
      return (a.full_name||'').localeCompare(b.full_name||'');
    });
  
    /* Only show section if at least one student has scores */
    var anyHasScores = students.some(function(s){ return PAGE.allResults[s.id]&&PAGE.allResults[s.id].length; });
    section.style.display = anyHasScores ? 'block' : 'none';
    if(!anyHasScores){ area.innerHTML=''; return; }
  
    area.innerHTML = students.map(function(s){
      var results = (PAGE.allResults[s.id]||[]).sort(function(a,b){ return (a.subject||'').localeCompare(b.subject||''); });
      if(!results.length) return ''; /* Skip students with no scores */
      return buildReportCard(s, results);
    }).join('');
  }
  
  function buildReportCard(s, results){
    var grand     = results.reduce(function(a,r){ return a+(parseFloat(r.total)||0); },0);
    var obtainable= results.length * 100;
    var avg       = results.length ? (grand/results.length).toFixed(2) : '0.00';
    var grade     = gradeFrom(parseFloat(avg));
    var pos       = s.position ? ordinal(s.position) : '--';
  
    /* Teacher comment based on avg */
    var avgNum = parseFloat(avg);
    var firstName = s.full_name.split(' ')[0];
    var teacherComment = avgNum>=75 ? firstName+' has demonstrated outstanding academic excellence this term. Keep up the brilliant work!'
      : avgNum>=65 ? firstName+' has shown very commendable performance. Continue to work hard!'
      : avgNum>=55 ? firstName+' performed well this term. More dedication will yield better results.'
      : avgNum>=45 ? firstName+' showed average performance. Greater focus and study habits needed.'
      : firstName+' needs to improve significantly. Parental support is strongly advised.';
    var principalComment = avgNum>=75 ? 'An impressive performance. '+firstName+' is a pride of Emirate Classic Academy. Maintain this standard!'
      : avgNum>=65 ? 'A very good result. '+firstName+' should continue working hard.'
      : avgNum>=55 ? 'A satisfactory performance. More effort is expected next term.'
      : 'Performance is below standard. Immediate academic intervention required.';
  
    /* Format date */
    function fmtDate(d){
      if(!d) return '--';
      try{ return new Date(d).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'}); }catch(e){ return d; }
    }
  
    return [
      '<div class="rc-wrapper" id="rc_'+s.id+'">',
  
        /* Header bar */
        '<div class="rc-header-bar no-print">',
          '<h3><i class="fas fa-id-card"></i> '+s.full_name+' — Report Card</h3>',
          '<button class="rc-print-btn" onclick="printOneCard(\''+s.id+'\')">',
            '<i class="fas fa-print"></i> Print',
          '</button>',
        '</div>',
  
        /* Card body */
        '<div class="rc-body">',
  
          /* School header */
          '<div class="rc-school-header">',
            '<div style="display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;">',
              '<div style="width:60px;height:60px;border-radius:50%;background:#1E3A5F;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Poppins,sans-serif;font-size:.9rem;font-weight:800;flex-shrink:0;">ECA</div>',
              '<div>',
                '<h2 class="rc-school-header" style="border:none;padding:0;margin:0;">EMIRATE CLASSIC ACADEMY LTD</h2>',
                '<p>Gbaganu off Bida Road</p>',
                '<p style="font-style:italic;color:#64748B">Motto: Knowledge is power action and light</p>',
              '</div>',
              '<div style="width:52px;height:60px;border:1px solid #E2E8F0;border-radius:4px;display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:.6rem;color:#94A3B8;flex-shrink:0;">',
                '<i class="fas fa-user" style="font-size:1.2rem;margin-bottom:3px;"></i>Photo',
              '</div>',
            '</div>',
            '<div class="rc-badge">TERMLY EXAMINATION REPORT SHEET</div>',
          '</div>',
  
          /* Student info grid */
          '<div class="rc-info-grid">',
            cell('Admission No', s.adm_no||'--'),
            cell('Gender', s.gender||'--'),
            cell('No. in Class', (PAGE.students.length||'--')),
            cell('Student Name', s.full_name, true),
            cell('Class', PAGE.teacher.class_assigned||'--'),
            cell('Term', PAGE.term),
            cell('Session', PAGE.session),
            cell('Position', pos, false, '#c8a415'),
            cell('Days Opened',  s.days_opened||'--'),
            cell('Days Present', s.days_present||'--'),
            cell('Days Absent',  s.days_absent||Math.max(0,(s.days_opened||0)-(s.days_present||0))),
            cell('Next Term Begins', fmtDate(s.next_term_date)),
          '</div>',
  
          /* Academic performance */
          '<div class="rc-section-title">ACADEMIC PERFORMANCE</div>',
          '<div class="rc-swipe-hint"><i class="fas fa-arrows-left-right"></i> Swipe sideways to see all columns</div>',
          '<div class="rc-table-scroll"><table class="rc-scores-table">',
            '<thead>',
              '<tr>',
                '<th style="text-align:left;min-width:90px">SUBJECT</th>',
                '<th>CLASS<br>WORK</th>',
                '<th>ASSIGN-<br>MENT</th>',
                '<th>MID-TERM<br>TEST</th>',
                '<th>EXAMS</th>',
                '<th>TOTAL</th>',
                '<th>GRADE</th>',
                '<th>REMARK</th>',
              '</tr>',
            '</thead>',
            '<tbody>',
              results.map(function(r,i){
                var tot  = parseFloat(r.total)||0;
                var grd  = r.grade||gradeFrom(tot);
                var rmk  = r.remark||remarkFrom(tot);
                var clr  = gradeColor(grd);
                return '<tr style="background:'+(i%2===0?'#fff':'#F8FAFC')+'">'
                  +'<td style="text-align:left;font-weight:500">'+r.subject+'</td>'
                  +'<td>'+(parseFloat(r.cw)||0)+'</td>'
                  +'<td>'+(parseFloat(r.asst)||0)+'</td>'
                  +'<td>'+(parseFloat(r.mid_term)||0)+'</td>'
                  +'<td>'+(parseFloat(r.exam)||0)+'</td>'
                  +'<td style="font-weight:800">'+tot+'</td>'
                  +'<td style="color:'+clr+';font-weight:800">'+grd+'</td>'
                  +'<td style="color:'+clr+';font-weight:600">'+rmk+'</td>'
                  +'</tr>';
              }).join(''),
            '</tbody>',
          '</table></div>',
  
          /* Performance summary */
          '<div class="rc-section-title">PERFORMANCE SUMMARY</div>',
          '<div class="rc-summary-grid">',
            sumCell('MARK OBTAINED',   grand),
            sumCell('MARK OBTAINABLE', obtainable),
            sumCell('AVERAGE SCORE',   avg, '#1E3A5F'),
            sumCell('TERM GRADE',      grade, '#1E3A5F'),
          '</div>',
  
          /* Annual summary */
          '<div class="rc-annual-grid">',
            annCell('ANNUAL MARKS',    grand),
            annCell('ANNUAL TOTAL',    obtainable),
            annCell('ANNUAL POSITION', pos, '#1E3A5F'),
          '</div>',
  
          /* Comments */
          '<div class="rc-section-title">TEACHER\'S COMMENTS</div>',
          '<div class="rc-comment-box">',
            '<div class="rc-comment-label">Class Teacher:</div>',
            '<div style="font-style:italic;font-size:.75rem;line-height:1.6;color:#374151;">'+teacherComment+'</div>',
            '<div style="margin-top:8px;border-top:1px solid #E2E8F0;padding-top:6px;display:flex;justify-content:space-between;font-size:.65rem;color:#64748B;">',
              '<span>Signature: <span style="border-bottom:1px solid #374151;display:inline-block;min-width:80px;">&nbsp;</span></span>',
            '</div>',
          '</div>',
  
          '<div class="rc-section-title">PRINCIPAL\'S COMMENTS</div>',
          '<div class="rc-comment-box">',
            '<div class="rc-comment-label">Principal:</div>',
            '<div style="font-style:italic;font-size:.75rem;line-height:1.6;color:#374151;">'+principalComment+'</div>',
            '<div style="margin-top:8px;border-top:1px solid #E2E8F0;padding-top:6px;display:flex;justify-content:space-between;font-size:.65rem;color:#64748B;">',
              '<span>Signature: <span style="border-bottom:1px solid #374151;display:inline-block;min-width:80px;">&nbsp;</span></span>',
              '<span>Stamp: <span style="border-bottom:1px solid #374151;display:inline-block;min-width:60px;">&nbsp;</span></span>',
            '</div>',
          '</div>',
  
          /* Promoted section */
          '<div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:6px;padding:8px 12px;font-size:.72rem;margin-bottom:10px;">',
            '<strong>PROMOTED TO:</strong> <span style="color:#1E3A5F;font-weight:700;">__________________</span>',
          '</div>',
  
          /* Signature row */
          '<div class="rc-sig-row">',
            '<div class="rc-sig"><div class="rc-sig-line"></div>Class Teacher</div>',
            '<div class="rc-sig"><div class="rc-sig-line"></div>Principal</div>',
            '<div class="rc-sig"><div class="rc-sig-line"></div>Date</div>',
          '</div>',
  
          /* Footer */
          '<div style="text-align:center;font-size:.6rem;color:#94A3B8;border-top:1px solid #E2E8F0;padding-top:7px;margin-top:10px;">',
            'Emirate Classic Academy Ltd &nbsp;·&nbsp; EduTrack Pro 2026',
          '</div>',
  
        '</div>',/* /rc-body */
      '</div>'  /* /rc-wrapper */
    ].join('');
  }
  
  function cell(lbl,val,bold,color){
    return '<div class="rc-info-cell">'
      +'<div class="lbl">'+lbl+'</div>'
      +'<div class="val"'+(color?' style="color:'+color+';font-size:.85rem"':'')+'>'+(bold?'<strong>':'')+val+(bold?'</strong>':'')+'</div>'
      +'</div>';
  }
  function sumCell(lbl,val,color){
    return '<div class="rc-summary-cell">'
      +'<span class="s-lbl">'+lbl+'</span>'
      +'<span class="s-val"'+(color?' style="color:'+color+'"':'')+'>'+(val||'--')+'</span>'
      +'</div>';
  }
  function annCell(lbl,val,color){
    return '<div class="rc-summary-cell" style="border-right:1px solid #E2E8F0;">'
      +'<span class="s-lbl">'+lbl+'</span>'
      +'<span class="s-val" style="font-size:.82rem;'+(color?'color:'+color:'color:var(--gold)')+';">'+(val||'--')+'</span>'
      +'</div>';
  }
  
  /* ================================================================
     PRINT
     ================================================================ */
  function printOneCard(studentId){
    var el = document.getElementById('rc_'+studentId);
    if(!el){ toast('Card not found.',true); return; }
    var win = window.open('','_blank','width=900,height=800');
    if(!win){ toast('Allow pop-ups and try again.',true); return; }
    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      +'<title>Report Card</title>'
      +'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>'
      +'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>'
      +'<style>'
      +printCSS()
      +'</style></head><body>'
      +el.querySelector('.rc-body').outerHTML
      +'</body></html>'
    );
    win.document.close();
    win.focus();
    setTimeout(function(){ win.print(); }, 800);
  }
  
  function printAllCards(){
    var cards = document.querySelectorAll('.rc-body');
    if(!cards.length){ toast('No report cards to print. Enter scores first.',true); return; }
    var win = window.open('','_blank','width=900,height=800');
    if(!win){ toast('Allow pop-ups and try again.',true); return; }
    var html = Array.from(cards).map(function(c){ return '<div style="page-break-after:always;">'+c.outerHTML+'</div>'; }).join('');
    win.document.write(
      '<!DOCTYPE html><html><head><meta charset="UTF-8">'
      +'<title>All Report Cards — '+PAGE.teacher.class_assigned+'</title>'
      +'<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>'
      +'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>'
      +'<style>'+printCSS()+'</style></head><body>'+html
      +'</body></html>'
    );
    win.document.close();
    win.focus();
    setTimeout(function(){ win.print(); }, 800);
  }
  
  function printCSS(){
    return '*{box-sizing:border-box;margin:0;padding:0;}'
      +'body{font-family:Inter,sans-serif;background:#fff;padding:16px;color:#1E293B;}'
      +'.rc-school-header{text-align:center;border-bottom:3px double #c8a415;padding-bottom:12px;margin-bottom:12px;}'
      +'.rc-school-header h2{font-family:Poppins,sans-serif;font-size:.95rem;font-weight:800;color:#1E3A5F;}'
      +'.rc-school-header p{font-size:.68rem;color:#374151;margin-top:2px;}'
      +'.rc-badge{display:inline-block;border:1px solid #c8a415;padding:3px 16px;border-radius:2px;font-size:.65rem;font-weight:700;color:#92400e;letter-spacing:1px;margin-top:6px;}'
      +'.rc-info-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #E2E8F0;margin-bottom:12px;font-size:.68rem;}'
      +'.rc-info-cell{padding:5px 8px;border-right:1px solid #E2E8F0;border-bottom:1px solid #E2E8F0;}'
      +'.rc-info-cell .lbl{font-size:.58rem;text-transform:uppercase;letter-spacing:.3px;color:#64748B;margin-bottom:2px;}'
      +'.rc-info-cell .val{font-weight:700;color:#1E293B;}'
      +'.rc-section-title{font-family:Poppins,sans-serif;font-size:.68rem;font-weight:700;color:#1E3A5F;border-left:3px solid #c8a415;padding-left:7px;margin-bottom:7px;margin-top:10px;}'
      +'.rc-scores-table{width:100%;border-collapse:collapse;font-size:.62rem;margin-bottom:12px;}'
      +'.rc-scores-table th{background:#1E3A5F;color:#fff;padding:5px 4px;text-align:center;font-size:.58rem;}'
      +'.rc-scores-table th:first-child{text-align:left;}'
      +'.rc-scores-table td{padding:4px;border:1px solid #E2E8F0;text-align:center;}'
      +'.rc-scores-table td:first-child{text-align:left;font-weight:500;}'
      +'.rc-scores-table tbody tr:nth-child(even){background:#F8FAFC;}'
      +'.rc-summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0;border:1px solid #E2E8F0;margin-bottom:10px;}'
      +'.rc-summary-cell{padding:8px;border-right:1px solid #E2E8F0;text-align:center;}'
      +'.rc-summary-cell .s-lbl{font-size:.58rem;color:#64748B;text-transform:uppercase;display:block;margin-bottom:2px;}'
      +'.rc-summary-cell .s-val{font-family:Poppins,sans-serif;font-size:.95rem;font-weight:800;color:#c8a415;}'
      +'.rc-annual-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:0;border:1px solid #E2E8F0;margin-bottom:10px;}'
      +'.rc-comment-box{border:1px solid #E2E8F0;border-radius:6px;padding:8px 12px;margin-bottom:8px;font-size:.73rem;}'
      +'.rc-comment-label{font-weight:700;color:#1E3A5F;margin-bottom:3px;font-size:.68rem;text-transform:uppercase;}'
      +'.rc-sig-row{display:flex;justify-content:space-between;margin-top:14px;gap:20px;}'
      +'.rc-sig{text-align:center;flex:1;font-size:.65rem;color:#64748B;}'
      +'.rc-sig-line{height:1px;background:#CBD5E1;margin-bottom:5px;}'
      +'.rc-swipe-hint{display:none !important;}'
      +'@media print{@page{size:A4;margin:10mm;}body{padding:0;}}'
      +'.no-print{display:none !important;}';
  }
  
  function toggleReportCards(){
    PAGE.cardsVisible = !PAGE.cardsVisible;
    var area = document.getElementById('reportCardsArea');
    var btn  = document.getElementById('btnToggleCards');
    area.style.display = PAGE.cardsVisible ? '' : 'none';
    btn.innerHTML = PAGE.cardsVisible
      ? '<i class="fas fa-eye-slash"></i> Hide Cards'
      : '<i class="fas fa-eye"></i> Show Cards';
  }
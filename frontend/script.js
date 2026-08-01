/* ================================================================
   EduTrack Pro — script.js
   Complete dashboard logic. No Supabase. 100% localStorage.
   
   LOAD ORDER in index.html (end of body):
     1. lucide.min.js   (icons CDN)
     2. chart.umd.min.js (charts CDN)
     3. auth.js          (session guard)
     4. script.js        (this file)
   ================================================================ */

/* ================================================================
   APP STATE
   ================================================================ */
   var App = {
    user:           null,
    students:       [],
    session:        '2024/2025',
    term:           '3rd Term',
    chartsDrawn:    false,
    analyticsDrawn: false
  };
  
  /* ── localStorage keys ─────────────────────────────────────────── */
  var KEY = {
    STUDENTS : 'et_students',
    RESULTS  : 'et_results',
    SETTINGS : 'et_settings'
  };
  
  /* ── Default demo students ─────────────────────────────────────── */
  var SEED = [
    {id:'s1',name:'Amaka Okafor',   admNo:'GHS/001',class:'SS 2A', gender:'Female',subjects:6,total:468,avg:78.0,grade:'B',remark:'Excellent',       status:'pass'},
    {id:'s2',name:'Ibrahim Musa',   admNo:'GHS/002',class:'SS 3A', gender:'Male',  subjects:6,total:510,avg:85.0,grade:'A',remark:'Outstanding',      status:'pass'},
    {id:'s3',name:'Chioma Eze',     admNo:'GHS/003',class:'JSS 2B',gender:'Female',subjects:8,total:392,avg:49.0,grade:'F',remark:'Needs Improvement',status:'fail'},
    {id:'s4',name:'Emeka Nwosu',    admNo:'GHS/004',class:'SS 1A', gender:'Male',  subjects:7,total:427,avg:61.0,grade:'C',remark:'Average',          status:'pass'},
    {id:'s5',name:'Fatima Aliyu',   admNo:'GHS/005',class:'SS 2B', gender:'Female',subjects:6,total:495,avg:82.5,grade:'A',remark:'Outstanding',      status:'pass'},
    {id:'s6',name:'Tunde Adeyemi',  admNo:'GHS/006',class:'JSS 3A',gender:'Male',  subjects:8,total:356,avg:44.5,grade:'F',remark:'Needs Improvement',status:'fail'},
    {id:'s7',name:'Grace Okoro',    admNo:'GHS/007',class:'SS 3B', gender:'Female',subjects:6,total:451,avg:75.2,grade:'B',remark:'Good',             status:'pass'},
    {id:'s8',name:'Yusuf Bello',    admNo:'GHS/008',class:'SS 1B', gender:'Male',  subjects:7,total:480,avg:68.6,grade:'B',remark:'Good',             status:'pass'}
  ];
  
  /* ── Report card subjects ──────────────────────────────────────── */
  var SUBJECTS = [
    'Mathematics','English Language','Physics','Chemistry',
    'Biology','Economics','Civic Education','Agricultural Science'
  ];
  
  /* ── Avatar colour palette ─────────────────────────────────────── */
  var COLORS = [
    '#3B82F6','#7C3AED','#22C55E','#F59E0B',
    '#EF4444','#60A5FA','#EC4899','#14B8A6'
  ];
  
  /* ================================================================
     UTILITY FUNCTIONS  (declared first so everything below can use them)
     ================================================================ */
  
  /* localStorage read/write */
  var Store = {
    get: function(k, def){
      try{ var r=localStorage.getItem(k); return r?JSON.parse(r):def; }
      catch(e){ return def; }
    },
    set: function(k,v){
      try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){}
    }
  };
  
  /* Grade from numeric score */
  function calcGrade(n){
    if(n>=80) return 'A';
    if(n>=65) return 'B';
    if(n>=50) return 'C';
    if(n>=45) return 'D';
    return 'F';
  }
  
  /* CSS class for a grade letter */
  function gradeClass(g){
    return ({A:'grade-a',B:'grade-b',C:'grade-c',D:'grade-c',F:'grade-f'})[g]||'grade-c';
  }
  
  /* Remark text for a grade letter */
  function gradeRemark(g){
    return ({A:'Excellent',B:'Very Good',C:'Good',D:'Pass',F:'Fail'})[g]||'—';
  }
  
  /* Unique ID for new records */
  function uid(){
    return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  }
  
  /* Set textContent safely via selector or element */
  function q(sel){ return document.querySelector(sel); }
  function qAll(sel){ return document.querySelectorAll(sel); }
  function setText(elOrSel, val){
    var el = (typeof elOrSel==='string') ? q(elOrSel) : elOrSel;
    if(el) el.textContent = (val===null||val===undefined) ? '' : String(val);
  }
  
  /* Get value from a form element by id */
  function val(id){
    var el=document.getElementById(id);
    return el ? el.value.trim() : '';
  }
  
  /* Render Lucide icons — safe, won't crash if CDN hasn't loaded */
  function icons(){
    if(typeof lucide!=='undefined'){
      try{ lucide.createIcons(); }catch(e){}
    }
  }
  
  /* Show toast notification */
  function toast(msg, isErr){
    var el  = document.getElementById('toast');
    var txt = document.getElementById('toastMsg');
    if(!el||!txt) return;
    txt.textContent     = msg;
    el.style.background = isErr ? '#991B1B' : '#1E293B';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(function(){ el.classList.remove('show'); }, 3500);
  }
  
  /* ================================================================
     BOOT
     Everything starts here. CDN libraries are already loaded
     because they are <script> tags that appear BEFORE this file
     in index.html (at the end of <body>).
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function(){
  
    /* 1. Get logged-in user from auth.js */
    App.user = (window.EduAuth) ? window.EduAuth.getUser() : null;
  
    /* 2. Fill UI with user data (name, role, welcome msg) */
    fillUserUI();
  
    /* 3. Wire all interactions */
    wireNav();
    wireSidebar();
    wireTopbar();
    wireTheme();
    wireModal();
    wireSettings();
    wireSearch();
    wireReportCard();
  
    /* 4. Load student data into the table */
    loadStudents();
  
    /* 5. Render Lucide SVG icons */
    icons();
  
    /* 6. Draw charts.
          Use a short delay so the browser has painted the page first,
          which ensures chart canvases have non-zero dimensions.       */
    setTimeout(function(){
      drawCharts();
      animateStats();
    }, 150);
  
  });
  
  /* ================================================================
     FILL USER UI — name, role, welcome message
     ================================================================ */
  function fillUserUI(){
  
    /* Read user from 3 fallback sources */
    var u    = App.user;
    var sess = null;
    if(!u){
      try{
        var raw = localStorage.getItem('edutrack_session');
        if(raw) sess = JSON.parse(raw);
      }catch(e){}
    }
  
    var name   = (u&&u.name)   || (sess&&sess.name)   || localStorage.getItem('edutrack_user_name') || 'Administrator';
    var role   = (u&&u.role)   || (sess&&sess.role)    || localStorage.getItem('edutrack_user_role') || 'Admin';
    var school = (u&&u.school) || (sess&&sess.school)  || 'Government High School';
    var email  = (u&&u.email)  || (sess&&sess.email)   || '';
  
    /* Sidebar */
    setText('.user-name-sm', name);
    setText('.user-role-sm', role);
    setText('.school-name',  school);
  
    /* Topbar */
    setText('.admin-name', name.split(' ')[0]);
    setText('.admin-role', role);
  
    /* Dropdown header */
    setText('.dh-name',  name);
    setText('.dh-email', email);
  
    /* Welcome message — skip title words like Mr. Dr. Mrs. */
    var wEl = q('#page-dashboard .page-title');
    if(wEl){
      var h        = new Date().getHours();
      var greeting = h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening';
      var skip     = /^(mr|mrs|ms|dr|prof|miss|sir|chief|alhaji|alhaja)\.?$/i;
      var parts    = name.split(' ');
      var first    = '';
      for(var i=0;i<parts.length;i++){
        if(!skip.test(parts[i]) && parts[i].length>1){ first=parts[i]; break; }
      }
      if(!first) first = parts[parts.length-1]||'Admin';
      wEl.textContent = greeting+', '+first+' 👋';
    }
  }
  
  /* ================================================================
     NAVIGATION
     ================================================================ */
  function wireNav(){
  
    /* Sidebar links */
    qAll('.nav-item[data-page]').forEach(function(item){
      item.addEventListener('click', function(e){
        e.preventDefault();
        goTo(item.getAttribute('data-page'), item);
      });
    });
  
    /* "View All" style buttons */
    qAll('[data-page-link]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var pid = btn.getAttribute('data-page-link');
        goTo(pid, q('.nav-item[data-page="'+pid+'"]'));
      });
    });
  
    /* Logout triggers (mousedown beats the dropdown-close click) */
    qAll('[data-action="logout"]').forEach(function(el){
      el.addEventListener('mousedown', function(e){
        e.preventDefault(); e.stopPropagation(); doLogout();
      });
      el.addEventListener('touchend', function(e){
        e.preventDefault(); e.stopPropagation(); doLogout();
      });
    });
  
    /* Sidebar footer arrow */
    var arrow = q('.user-arrow');
    if(arrow){
      arrow.style.cursor = 'pointer';
      arrow.title        = 'Logout';
      arrow.addEventListener('mousedown', function(e){ e.stopPropagation(); doLogout(); });
      arrow.addEventListener('touchend',  function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
    }
  }
  
  function goTo(pageId, navEl){
    /* Hide every page */
    qAll('.page').forEach(function(p){ p.classList.remove('active'); });
  
    /* Show the right one */
    var target = document.getElementById('page-'+pageId);
    if(target){
      target.classList.add('active');
    } else {
      var db = document.getElementById('page-dashboard');
      if(db){ db.classList.add('active'); pageId='dashboard'; }
    }
  
    /* Active nav highlight */
    qAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
    if(navEl) navEl.classList.add('active');
  
    /* Breadcrumb text */
    var LABELS = {
      dashboard:'Dashboard', students:'Students', results:'Results',
      subjects:'Subjects',   teachers:'Teachers', attendance:'Attendance',
      analytics:'Analytics', report:'Report Card',messages:'Messages', settings:'Settings'
    };
    setText('#bcCurrent', LABELS[pageId]||pageId);
  
    closeSidebar();
  
    /* Analytics charts drawn lazily */
    if(pageId==='analytics'){
      setTimeout(drawAnalyticsCharts, 150);
    }
  
    /* Scroll page content to top */
    var pw = q('.page-wrapper');
    if(pw) pw.scrollTop = 0;
  
    /* Re-render icons for any new elements */
    icons();
  }
  
  /* ================================================================
     SIDEBAR (mobile)
     ================================================================ */
  function wireSidebar(){
    var btn     = document.getElementById('hamburgerBtn');
    var sidebar = document.getElementById('sidebar');
    var overlay = document.getElementById('sidebarOverlay');
  
    if(btn) btn.addEventListener('click', function(){
      var open = sidebar.classList.toggle('mobile-open');
      if(overlay) overlay.classList.toggle('active', open);
    });
    if(overlay) overlay.addEventListener('click', closeSidebar);
  }
  
  function closeSidebar(){
    var s=document.getElementById('sidebar');
    var o=document.getElementById('sidebarOverlay');
    if(s) s.classList.remove('mobile-open');
    if(o) o.classList.remove('active');
  }
  
  /* ================================================================
     TOPBAR ADMIN DROPDOWN
     ================================================================ */
  function wireTopbar(){
    var btn = document.getElementById('adminProfileBtn');
    if(!btn) return;
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      btn.classList.toggle('open');
    });
    document.addEventListener('click', function(){ btn.classList.remove('open'); });
  }
  
  /* ================================================================
     THEME
     ================================================================ */
  function wireTheme(){
    applyTheme(localStorage.getItem('edutrack-theme')||'light');
    var toggle = document.getElementById('themeToggle');
    if(toggle) toggle.addEventListener('click', function(){
      applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
    });
  }
  
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('edutrack-theme', t);
    var moon = q('.icon-moon');
    var sun  = q('.icon-sun');
    if(moon) moon.style.display = t==='dark'  ? 'none' : '';
    if(sun)  sun.style.display  = t==='light' ? 'none' : '';
    /* Update chart colours */
    setTimeout(refreshChartTheme, 60);
  }
  
  /* Called from settings inline onclick */
  function setTheme(t, el){
    qAll('.theme-option').forEach(function(b){ b.classList.remove('active'); });
    if(el) el.classList.add('active');
    applyTheme(t);
  }
  
  /* ================================================================
     LOGOUT
     ================================================================ */
  function doLogout(){ showLogoutModal(); }
  
  function showLogoutModal(){
    if(document.getElementById('logoutModal')){
      document.getElementById('logoutModal').style.display='flex';
      return;
    }
    var m = document.createElement('div');
    m.id  = 'logoutModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);'
                    + 'backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    m.innerHTML = '<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);'
      + 'border-radius:16px;padding:30px 32px;max-width:340px;width:90%;text-align:center;'
      + 'box-shadow:0 20px 60px rgba(0,0,0,.2);">'
      + '<div style="font-size:2.6rem;margin-bottom:10px;">👋</div>'
      + '<h3 style="font-family:Poppins,sans-serif;font-size:1.1rem;font-weight:700;'
      +   'color:var(--text,#1E293B);margin-bottom:8px;">Logging Out?</h3>'
      + '<p style="font-size:.84rem;color:var(--muted,#64748B);margin-bottom:22px;line-height:1.6;">'
      +   'Are you sure you want to log out of EduTrack Pro?</p>'
      + '<div style="display:flex;gap:10px;">'
      +   '<button onclick="closeLogoutModal()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);'
      +     'border-radius:9px;background:var(--surface,#fff);color:var(--text,#1E293B);'
      +     'font-weight:600;font-size:.88rem;cursor:pointer;">Cancel</button>'
      +   '<button onclick="confirmLogout()" style="flex:1;padding:10px;border:none;border-radius:9px;'
      +     'background:#EF4444;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;">'
      +     '🚪 Log Out</button>'
      + '</div></div>';
    document.body.appendChild(m);
  }
  
  function closeLogoutModal(){
    var m=document.getElementById('logoutModal');
    if(m) m.style.display='none';
  }
  
  function confirmLogout(){
    localStorage.removeItem('edutrack_session');
    localStorage.removeItem('edutrack_user_name');
    localStorage.removeItem('edutrack_user_role');
    window.location.href = 'login.html';
  }
  
  /* ================================================================
     STAT CARDS — animate numbers
     ================================================================ */
  function animateStats(){
    qAll('.stat-value[data-count]').forEach(function(el){
      var target = parseInt(el.dataset.count)||0;
      var suffix = el.textContent.replace(/[\d,]/g,'');
      var cur    = 0;
      var step   = Math.ceil(target/50)||1;
      var t = setInterval(function(){
        cur = Math.min(cur+step, target);
        el.textContent = cur.toLocaleString()+suffix;
        if(cur>=target) clearInterval(t);
      }, 28);
    });
  }
  
  function refreshStats(){
    var s      = App.students;
    var passed = s.filter(function(x){ return x.status==='pass'; }).length;
    var failed = s.filter(function(x){ return x.status==='fail'; }).length;
    var avgAll = s.length
      ? (s.reduce(function(a,x){ return a+x.avg; },0)/s.length).toFixed(1)
      : 0;
  
    setStat('stat-students',   s.length,  '');
    setStat('stat-results',    s.length*6,'');
    setStat('stat-avg',        avgAll,    '%');
    setStat('stat-passed',     passed,    '');
    setStat('stat-failed',     failed,    '');
    setStat('stat-attendance', 91,        '%');
  
    animateStats();
  }
  
  function setStat(key, val, suf){
    var el = q('[data-stat="'+key+'"]');
    if(el){ el.dataset.count=val; el.textContent=val+suf; }
  }
  
  /* ================================================================
     STUDENTS — load, render, delete, update
     ================================================================ */
  function loadStudents(){
    var saved = Store.get(KEY.STUDENTS, null);
    if(!saved||!saved.length){
      saved = SEED.map(function(s){ return Object.assign({},s); });
      Store.set(KEY.STUDENTS, saved);
    }
    App.students = saved;
    renderTable(App.students);
    refreshStats();
    refreshNavCounts();
  }
  
  function refreshNavCounts(){
    var c = App.students.length;
    var sn = q('.nav-item[data-page="students"] .nav-count');
    var rn = q('.nav-item[data-page="results"]  .nav-count');
    if(sn) sn.textContent = c;
    if(rn) rn.textContent = c;
  }
  
  /* ── Build one table row ─────────────────────────────────────── */
  function buildRow(s, i){
    var init  = s.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase();
    var color = COLORS[i % COLORS.length];
    return '<tr data-sid="'+s.id+'">'
      + '<td>'
      +   '<div class="student-cell">'
      +     '<div style="background:'+color+';width:34px;height:34px;border-radius:50%;'
      +       'display:flex;align-items:center;justify-content:center;'
      +       'font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;">'+init+'</div>'
      +     '<div>'
      +       '<div class="student-name">'+s.name+'</div>'
      +       '<div class="student-id">'+(s.admNo||'')+'</div>'
      +     '</div>'
      +   '</div>'
      + '</td>'
      + '<td>'+s.class+'</td>'
      + '<td>'+s.subjects+'</td>'
      + '<td>'+s.total+'</td>'
      + '<td>'+Number(s.avg).toFixed(1)+'%</td>'
      + '<td><span class="grade-badge '+gradeClass(s.grade)+'">'+s.grade+'</span></td>'
      + '<td>'
      +   '<span class="status-badge status-'+s.status+'">'
      +     '<span class="status-dot"></span>'+(s.status==='pass'?'Passed':'Failed')
      +   '</span>'
      + '</td>'
      + '<td>'
      +   '<div class="action-btns">'
      +     '<button class="action-btn view" data-i="'+i+'" title="View"><i data-lucide="eye"></i></button>'
      +     '<button class="action-btn edit" data-i="'+i+'" title="Edit"><i data-lucide="edit-3"></i></button>'
      +     '<button class="action-btn del"  data-i="'+i+'" title="Delete"><i data-lucide="trash-2"></i></button>'
      +   '</div>'
      + '</td>'
      + '</tr>';
  }
  
  function renderTable(list){
    var html = list.length
      ? list.map(buildRow).join('')
      : '<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748B;">'
      +   'No students yet. Add students to get started.'
      + '</td></tr>';
  
    ['resultsTableBody','fullResultsBody'].forEach(function(id){
      var el = document.getElementById(id);
      if(el) el.innerHTML = html;
    });
  
    /* Wire action buttons */
    qAll('.action-btn.view').forEach(function(b){
      b.addEventListener('click', function(){ openModal(parseInt(b.dataset.i),'view'); });
    });
    qAll('.action-btn.edit').forEach(function(b){
      b.addEventListener('click', function(){ openModal(parseInt(b.dataset.i),'edit'); });
    });
    qAll('.action-btn.del').forEach(function(b){
      b.addEventListener('click', function(){ deleteStudent(parseInt(b.dataset.i)); });
    });
  
    icons(); /* render the lucide icons inside the new rows */
  }
  
  function deleteStudent(idx){
    var s = App.students[idx];
    if(!s) return;
    showDeleteConfirm(s.name, function(){
      App.students.splice(idx,1);
      Store.set(KEY.STUDENTS, App.students);
      renderTable(App.students);
      refreshStats();
      refreshNavCounts();
      toast(s.name+' deleted.');
    });
  }
  
  function showDeleteConfirm(name, onConfirm){
    var m = document.createElement('div');
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);'
                    + 'backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    m.innerHTML = '<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);'
      + 'border-radius:16px;padding:28px 30px;max-width:340px;width:90%;text-align:center;">'
      + '<div style="font-size:2.2rem;margin-bottom:10px;">⚠️</div>'
      + '<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;margin-bottom:8px;">Delete Student?</h3>'
      + '<p style="font-size:.83rem;color:#64748B;margin-bottom:20px;">Delete <strong>'+name+'</strong>?<br>This cannot be undone.</p>'
      + '<div style="display:flex;gap:10px;">'
      +   '<button id="dcCancel" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);'
      +     'border-radius:9px;background:var(--surface,#fff);font-weight:600;cursor:pointer;">Cancel</button>'
      +   '<button id="dcConfirm" style="flex:1;padding:10px;border:none;border-radius:9px;'
      +     'background:#EF4444;color:#fff;font-weight:700;cursor:pointer;">Delete</button>'
      + '</div></div>';
    document.body.appendChild(m);
    document.getElementById('dcCancel').onclick  = function(){ document.body.removeChild(m); };
    document.getElementById('dcConfirm').onclick = function(){ document.body.removeChild(m); onConfirm(); };
  }
  
  /* ================================================================
     SEARCH & FILTER
     ================================================================ */
  function wireSearch(){
    var srch = document.getElementById('tableSearch');
    if(srch) srch.addEventListener('input', function(){
      var q2=srch.value.toLowerCase();
      qAll('#resultsTableBody tr').forEach(function(row){
        var n=(row.querySelector('.student-name')||{}).textContent||'';
        row.style.display=n.toLowerCase().indexOf(q2)>-1?'':'none';
      });
    });
  
    var cf = document.getElementById('classFilter');
    if(cf) cf.addEventListener('change', function(){
      var cls=cf.value;
      qAll('#resultsTableBody tr, #fullResultsBody tr').forEach(function(row){
        var c=(row.cells[1]||{}).textContent||'';
        row.style.display=(!cls||c.trim()===cls)?'':'none';
      });
    });
  }
  
  /* ================================================================
     MODAL — view / edit result
     ================================================================ */
  function wireModal(){
    var bd=document.getElementById('modalBackdrop');
    var mc=document.getElementById('modalClose');
    var mx=document.getElementById('modalCancel');
    var ms=document.getElementById('modalSave');
    if(mc) mc.addEventListener('click', closeModal);
    if(mx) mx.addEventListener('click', closeModal);
    if(ms) ms.addEventListener('click', saveModal);
    if(bd) bd.addEventListener('click', function(e){ if(e.target===bd) closeModal(); });
  }
  
  function openModal(idx, mode){
    var s = App.students[idx];
    if(!s) return;
    var setv = function(id,v){ var e=document.getElementById(id); if(e) e.value=v; };
    setv('modalStudentName', s.name);
    setv('modalClass',       s.class);
    setv('modalTotal',       s.total);
    setv('modalAvg',         s.avg);
    setv('modalGrade',       s.grade);
    setv('modalRemark',      s.remark||'');
    document.getElementById('resultModal').dataset.idx = idx;
    setText('.modal-title', mode==='view'?'View Result':'Edit Result');
    var sb=document.getElementById('modalSave');
    if(sb) sb.style.display = mode==='view'?'none':'';
    document.getElementById('modalBackdrop').classList.add('open');
    icons();
  }
  
  function saveModal(){
    var idx = parseInt(document.getElementById('resultModal').dataset.idx);
    var s   = App.students[idx];
    if(!s) return;
    var gv = function(id){ var e=document.getElementById(id); return e?e.value:''; };
    s.name   = gv('modalStudentName')||s.name;
    s.class  = gv('modalClass');
    s.total  = parseFloat(gv('modalTotal'))||s.total;
    s.avg    = parseFloat(gv('modalAvg'))  ||s.avg;
    s.grade  = gv('modalGrade');
    s.remark = gv('modalRemark');
    s.status = s.avg>=50?'pass':'fail';
    Store.set(KEY.STUDENTS, App.students);
    renderTable(App.students);
    refreshStats();
    closeModal();
    toast('Result updated successfully!');
  }
  
  function closeModal(){
    var bd=document.getElementById('modalBackdrop');
    if(bd) bd.classList.remove('open');
  }
  
  /* ================================================================
     REPORT CARD — live preview
     ================================================================ */
  function wireReportCard(){
    buildScoreTable();
  
    /* Term tabs */
    qAll('.term-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        qAll('.term-tab').forEach(function(t){ t.classList.remove('active'); });
        tab.classList.add('active');
        App.term = tab.textContent.trim();
        updatePreview();
      });
    });
  
    /* Logo upload */
    var area  = document.getElementById('logoUploadArea');
    var input = document.getElementById('logoUpload');
    if(area)  area.addEventListener('click', function(){ if(input) input.click(); });
    if(input) input.addEventListener('change', function(){
      if(!input.files[0]) return;
      var reader = new FileReader();
      reader.onload = function(e){
        var logo = document.getElementById('prev_logo');
        if(logo) logo.innerHTML = '<img src="'+e.target.result+'" '
          + 'style="width:52px;height:52px;object-fit:contain;border-radius:8px;" />';
        var txt = document.getElementById('logoUploadText');
        if(txt) txt.textContent = 'Logo uploaded ✓';
        toast('School logo uploaded!');
      };
      reader.readAsDataURL(input.files[0]);
    });
  
    /* Admission number lookup */
    var admEl = document.getElementById('rc_admNo');
    if(admEl){
      admEl.addEventListener('blur', function(){
        var v = admEl.value.trim().toUpperCase();
        if(!v) return;
        var found = App.students.find(function(s){
          return (s.admNo||'').toUpperCase()===v;
        });
        if(found){
          var fn=document.getElementById('rc_firstName');
          var ln=document.getElementById('rc_lastName');
          var pts=found.name.split(' ');
          if(fn) fn.value=pts[0]||'';
          if(ln) ln.value=pts.slice(1).join(' ')||'';
          var cls=document.getElementById('rc_class');
          if(cls) cls.value=found.class;
          var gen=document.getElementById('rc_gender');
          if(gen&&found.gender) gen.value=found.gender;
          loadSavedScores(found.id);
          updatePreview();
          toast('Student loaded: '+found.name);
        } else {
          toast('No student found with that admission number.',true);
        }
      });
    }
  
    /* Wire every form field → updatePreview on any change */
    [
      'rc_schoolName','rc_schoolAddr','rc_session','rc_term',
      'rc_firstName','rc_lastName','rc_admNo','rc_class',
      'rc_gender','rc_dob','rc_position','rc_classSize',
      'rc_teacherComment','rc_principalComment','rc_nextTerm'
    ].forEach(function(id){
      var el=document.getElementById(id);
      if(el){
        el.addEventListener('input',  updatePreview);
        el.addEventListener('change', updatePreview);
      }
    });
  
    /* Buttons */
    var pb=document.getElementById('btnPrintReport');
    if(pb) pb.addEventListener('click', printReport);
    var sb=document.getElementById('btnSaveReport');
    if(sb) sb.addEventListener('click', function(){
      saveReportCard();
      setTimeout(printReport, 400);
    });
  
    /* Draw initial empty preview */
    updatePreview();
  }
  
  function buildScoreTable(){
    var tb = document.getElementById('scoresBody');
    if(!tb) return;
    tb.innerHTML = SUBJECTS.map(function(subj,i){
      return '<tr>'
        +'<td>'+subj+'</td>'
        +'<td><input type="number" min="0" max="30" placeholder="0" class="ca-input" data-row="'+i+'"/></td>'
        +'<td><input type="number" min="0" max="70" placeholder="0" class="ex-input" data-row="'+i+'"/></td>'
        +'<td id="rt-'+i+'">—</td>'
        +'<td id="rg-'+i+'">—</td>'
        +'</tr>';
    }).join('');
  
    /* One listener on the table body covers all input events */
    tb.addEventListener('input', function(){
      recalcScores();
      updatePreview();
    });
  }
  
  function recalcScores(){
    var rows=qAll('#scoresBody tr'), grand=0, count=0;
    rows.forEach(function(row,i){
      var ca=parseFloat((row.querySelector('.ca-input')||{}).value)||0;
      var ex=parseFloat((row.querySelector('.ex-input')||{}).value)||0;
      var tot=ca+ex, grd=calcGrade(tot);
      var tc=document.getElementById('rt-'+i);
      var gc=document.getElementById('rg-'+i);
      if(tc) tc.textContent=(ca||ex)?tot:'—';
      if(gc) gc.innerHTML=(ca||ex)
        ?'<span class="grade-badge '+gradeClass(grd)+'">'+grd+'</span>':'—';
      if(ca||ex){ grand+=tot; count++; }
    });
    var avg=count?(grand/count).toFixed(1):'0.0';
    var grd=count?calcGrade(parseFloat(avg)):'—';
    setText('#totalScore',   grand||'—');
    setText('#avgScore',     count?avg+'%':'—');
    setText('#overallGrade', grd);
    setText('#overallRemark',gradeRemark(grd));
  }
  
  /* ── LIVE PREVIEW — updates on every keystroke ────────────────── */
  function updatePreview(){
  
    function get(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
    function set(id,v){ var e=document.getElementById(id); if(e) e.textContent=v||'—'; }
    function setHTML(id,h){ var e=document.getElementById(id); if(e) e.innerHTML=h; }
  
    /* School info */
    set('prev_schoolName', get('rc_schoolName')||'School Name');
    set('prev_schoolAddr', get('rc_schoolAddr')||'School Address');
    var sess = get('rc_session')||'2024/2025';
    var term = get('rc_term')   ||'3rd Term';
    set('prev_termBadge', term+' Report Card — '+sess);
    set('prev_session',   sess);
    set('prev_term',      term);
  
    /* Student info */
    var fn  = get('rc_firstName'), ln = get('rc_lastName');
    var fullName = (fn+' '+ln).trim()||'—';
    set('prev_name',   fullName);
    set('prev_admNo',  get('rc_admNo') ||'—');
    set('prev_class',  get('rc_class') ||'—');
    set('prev_gender', get('rc_gender')||'—');
  
    var dob = get('rc_dob');
    if(dob){
      try{ set('prev_dob', new Date(dob).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})); }
      catch(e){ set('prev_dob',dob); }
    } else { set('prev_dob','—'); }
  
    var pos=get('rc_position'), cs=get('rc_classSize');
    set('prev_position', pos&&cs ? pos+' / '+cs : pos||'—');
  
    /* Scores */
    var rows=qAll('#scoresBody tr');
    var grand=0, count=0, html='';
    var GC={'A':'#22C55E','B':'#3B82F6','C':'#F59E0B','D':'#F59E0B','F':'#EF4444'};
    rows.forEach(function(row,i){
      var ca=parseFloat((row.querySelector('.ca-input')||{}).value)||0;
      var ex=parseFloat((row.querySelector('.ex-input')||{}).value)||0;
      if(ca>0||ex>0){
        var tot=ca+ex, grd=calcGrade(tot), clr=GC[grd]||'#94A3B8';
        grand+=tot; count++;
        html+='<tr>'
          +'<td>'+SUBJECTS[i]+'</td>'
          +'<td style="text-align:center">'+ca+'</td>'
          +'<td style="text-align:center">'+ex+'</td>'
          +'<td style="text-align:center;font-weight:700">'+tot+'</td>'
          +'<td style="text-align:center"><span style="background:'+clr+'22;color:'+clr+';'
            +'padding:2px 8px;border-radius:5px;font-weight:700;font-size:.72rem;">'+grd+'</span></td>'
          +'<td style="font-size:.72rem;color:#64748B">'+gradeRemark(grd)+'</td>'
          +'</tr>';
      }
    });
    setHTML('prev_scoresBody', html||
      '<tr><td colspan="6" style="text-align:center;color:#94A3B8;padding:14px;font-size:.8rem;">'
      +'Enter subject scores on the left</td></tr>');
  
    /* Summary */
    var avg=count?(grand/count).toFixed(1):'—';
    var grd=count?calcGrade(parseFloat(avg)):'—';
    set('prev_total',    count?grand:'—');
    set('prev_avg',      count?avg+'%':'—');
    set('prev_grade',    grd);
  
    /* Comments */
    set('prev_teacherComment',   get('rc_teacherComment')  ||'No comment entered');
    set('prev_principalComment', get('rc_principalComment')||'No comment entered');
  
    var nt=get('rc_nextTerm');
    if(nt){
      try{ set('prev_nextTerm', new Date(nt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})); }
      catch(e){ set('prev_nextTerm',nt); }
    } else { set('prev_nextTerm','—'); }
  }
  
  function loadSavedScores(studentId){
    var saved=Store.get(KEY.RESULTS,[]).filter(function(r){
      return r.sid===studentId&&r.session===App.session&&r.term===App.term;
    });
    if(!saved.length) return;
    saved.forEach(function(r){
      var idx=SUBJECTS.indexOf(r.subject);
      if(idx<0) return;
      var ca=q('.ca-input[data-row="'+idx+'"]');
      var ex=q('.ex-input[data-row="'+idx+'"]');
      if(ca) ca.value=r.ca||0;
      if(ex) ex.value=r.exam||0;
    });
    recalcScores();
  }
  
  function saveReportCard(){
    var admNo=(document.getElementById('rc_admNo')||{}).value;
    admNo=admNo?admNo.trim().toUpperCase():'';
    var fn=(document.getElementById('rc_firstName')||{}).value||'';
    var ln=(document.getElementById('rc_lastName') ||{}).value||'';
    var fullName=(fn+' '+ln).trim();
    if(!fullName){ toast('Enter the student name first.',true); return; }
  
    var student=admNo
      ?App.students.find(function(s){ return (s.admNo||'').toUpperCase()===admNo; })
      :null;
  
    var rows=qAll('#scoresBody tr'), results=[];
    rows.forEach(function(row,i){
      var ca=parseFloat((row.querySelector('.ca-input')||{}).value)||0;
      var ex=parseFloat((row.querySelector('.ex-input')||{}).value)||0;
      if(ca>0||ex>0){
        results.push({sid:student?student.id:admNo,
          session:App.session,term:App.term,subject:SUBJECTS[i],
          ca:ca,exam:ex,total:ca+ex,grade:calcGrade(ca+ex)});
      }
    });
    if(!results.length){ toast('Enter at least one subject score.',true); return; }
  
    var sid=student?student.id:admNo;
    var other=Store.get(KEY.RESULTS,[]).filter(function(r){
      return !(r.sid===sid&&r.session===App.session&&r.term===App.term);
    });
    Store.set(KEY.RESULTS, other.concat(results));
  
    if(student){
      var avg=parseFloat((document.getElementById('avgScore')||{}).textContent)||0;
      var grade=(document.getElementById('overallGrade')||{}).textContent||'—';
      var total=parseInt((document.getElementById('totalScore')||{}).textContent)||0;
      var idx2=App.students.findIndex(function(s){ return s.id===student.id; });
      if(idx2>=0){
        App.students[idx2].avg=avg;
        App.students[idx2].grade=grade;
        App.students[idx2].total=total;
        App.students[idx2].status=avg>=50?'pass':'fail';
        Store.set(KEY.STUDENTS,App.students);
        renderTable(App.students);
        refreshStats();
      }
    }
    toast('Report card saved for '+fullName+'!');
  }
  
  function printReport(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var win=window.open('','_blank','width=850,height=800');
    if(!win){ toast('Please allow pop-ups for this site, then try again.',true); return; }
    var css=[
      '*{box-sizing:border-box;margin:0;padding:0;}',
      'body{font-family:Inter,sans-serif;background:#fff;padding:20px;color:#1E293B;}',
      '.report-card-preview{max-width:720px;margin:0 auto;border:1px solid #E2E8F0;border-radius:12px;padding:24px;}',
      '.rp-header{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:2px solid #3B82F6;margin-bottom:14px;}',
      '.rp-logo-placeholder{width:56px;height:56px;border-radius:10px;background:rgba(59,130,246,.1);display:flex;align-items:center;justify-content:center;color:#3B82F6;font-size:1.4rem;flex-shrink:0;}',
      '.rp-logo-placeholder img{width:52px;height:52px;object-fit:contain;border-radius:8px;}',
      '.rp-school-info h2{font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;}',
      '.rp-school-info p{font-size:.75rem;color:#6B7280;}',
      '.rp-term-badge{display:inline-block;margin-top:4px;background:rgba(59,130,246,.1);color:#2563EB;padding:2px 10px;border-radius:99px;font-size:.64rem;font-weight:700;}',
      '.rp-student-info{display:grid;grid-template-columns:1fr 1fr;gap:3px 20px;margin-bottom:14px;padding:10px 12px;background:#F8FAFC;border-radius:8px;}',
      '.rp-si-row{display:flex;justify-content:space-between;font-size:.72rem;padding:2px 0;}',
      '.rp-si-row span{color:#6B7280;}.rp-si-row strong{color:#1E293B;}',
      '.rp-scores{width:100%;border-collapse:collapse;font-size:.74rem;margin-bottom:12px;}',
      '.rp-scores th{background:#3B82F6;color:#fff;padding:7px 8px;text-align:left;font-size:.64rem;text-transform:uppercase;}',
      '.rp-scores td{padding:6px 8px;border-bottom:1px solid #F1F5F9;}',
      '.rp-scores tbody tr:nth-child(even){background:#F8FAFC;}',
      '.rp-summary{display:flex;border:1px solid #E2E8F0;border-radius:8px;overflow:hidden;margin-bottom:12px;}',
      '.rps-item{flex:1;text-align:center;padding:8px;border-right:1px solid #E2E8F0;}',
      '.rps-item:last-child{border-right:none;}',
      '.rps-item span{font-size:.62rem;color:#6B7280;text-transform:uppercase;letter-spacing:.3px;display:block;}',
      '.rps-item strong{font-size:.9rem;font-weight:700;color:#3B82F6;}',
      '.rp-comments{margin-bottom:14px;}',
      '.rp-comment{font-size:.75rem;color:#374151;padding:5px 0;border-bottom:1px dashed #E5E7EB;}',
      '.rp-comment:last-child{border-bottom:none;}.rp-comment strong{color:#1E293B;}',
      '.rp-footer{display:flex;justify-content:space-between;margin-top:18px;gap:16px;}',
      '.rp-sig{text-align:center;flex:1;font-size:.68rem;color:#6B7280;}',
      '.sig-line{height:1px;background:#D1D5DB;margin-bottom:6px;}',
      '@media print{body{padding:0;}.report-card-preview{border:none;box-shadow:none;max-width:100%;}}'
    ].join('');
    win.document.write(
      '<!DOCTYPE html><html><head>'
      +'<meta charset="UTF-8"><title>Report Card</title>'
      +'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet"/>'
      +'<style>'+css+'</style>'
      +'</head><body>'
      +preview.outerHTML
      +'<script>window.onload=function(){window.print();};<\/script>'
      +'</body></html>'
    );
    win.document.close();
  }
  
  /* ================================================================
     SETTINGS
     ================================================================ */
  function wireSettings(){
    /* Tabs */
    qAll('.set-tab').forEach(function(tab){
      tab.addEventListener('click', function(){
        var t=tab.dataset.set;
        qAll('.set-tab').forEach(function(x){ x.classList.remove('active'); });
        tab.classList.add('active');
        qAll('.settings-panel').forEach(function(p){ p.classList.remove('active'); });
        var panel=document.getElementById('set-'+t);
        if(panel) panel.classList.add('active');
      });
    });
  
    /* Colour swatches */
    qAll('.swatch').forEach(function(sw){
      sw.addEventListener('click', function(){
        qAll('.swatch').forEach(function(s){ s.classList.remove('active'); });
        sw.classList.add('active');
        document.documentElement.style.setProperty('--primary', sw.dataset.color);
        toast('Accent colour updated!');
      });
    });
  
    /* Load saved settings into form */
    var s=Store.get(KEY.SETTINGS,{});
    if(s.schoolName){
      var ins=qAll('#set-school .form-input');
      if(ins[0]) ins[0].value=s.schoolName||'';
      if(ins[2]) ins[2].value=s.address   ||'';
      if(ins[3]) ins[3].value=s.phone     ||'';
      if(ins[4]) ins[4].value=s.email     ||'';
    }
  }
  
  function saveSettings(){
    var ins=qAll('#set-school .form-input');
    var s={
      schoolName:ins[0]?ins[0].value:'',
      address:   ins[2]?ins[2].value:'',
      phone:     ins[3]?ins[3].value:'',
      email:     ins[4]?ins[4].value:'',
      session:   ins[5]?ins[5].value:App.session,
      term:      ins[6]?ins[6].value:App.term
    };
    Store.set(KEY.SETTINGS, s);
    setText('.school-name', s.schoolName||'Government High School');
    toast('Settings saved!');
  }
  
  /* ================================================================
     CHARTS
     ================================================================ */
  function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
  function textClr(){ return isDark()?'#8B949E':'#94A3B8'; }
  function gridClr(){ return isDark()?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)'; }
  
  var CR={};
  function reg(id,inst){
    if(CR[id]){ try{ CR[id].destroy(); }catch(e){} }
    CR[id]=inst;
  }
  function refreshChartTheme(){
    Object.keys(CR).forEach(function(k){ try{ CR[k].update(); }catch(e){} });
  }
  
  /* ── Main dashboard charts ─────────────────────────────────────── */
  function drawCharts(){
    if(App.chartsDrawn) return;
    if(typeof Chart==='undefined'){
      /* Chart.js hasn't loaded yet — retry in 200ms */
      setTimeout(drawCharts, 200);
      return;
    }
    App.chartsDrawn = true;
    drawSparklines();
    drawPerfChart();
    drawGradeDonut();
  }
  
  /* Sparklines — IIFE fixes the classic for-loop closure bug */
  function drawSparklines(){
    var DATA=[
      [30,35,32,40,38,42,48,45,50,55,52,58],
      [80,95,110,100,120,115,130,125,135,140,138,145],
      [65,68,70,67,71,72,74,70,73,75,72,78],
      [300,320,310,340,335,350,365,360,375,385,380,398],
      [95,90,88,85,92,89,86,90,87,85,84,84],
      [88,90,87,91,89,92,91,93,90,91,92,91]
    ];
    var CLR=['#3B82F6','#7C3AED','#22C55E','#22C55E','#EF4444','#F59E0B'];
    for(var i=1;i<=6;i++){
      (function(n){
        var cv=document.getElementById('sparkline'+n);
        if(!cv) return;
        var ctx=cv.getContext('2d');
        var clr=CLR[n-1], pts=DATA[n-1];
        var g=ctx.createLinearGradient(0,0,0,40);
        g.addColorStop(0,clr+'44'); g.addColorStop(1,clr+'00');
        reg('sp'+n, new Chart(ctx,{
          type:'line',
          data:{
            labels:pts.map(function(){return '';}),
            datasets:[{data:pts,borderColor:clr,borderWidth:2,
              pointRadius:0,fill:true,backgroundColor:g,tension:0.4}]
          },
          options:{
            responsive:false,
            maintainAspectRatio:false,
            animation:{duration:700},
            plugins:{legend:{display:false},tooltip:{enabled:false}},
            scales:{x:{display:false},y:{display:false}}
          }
        }));
      })(i);
    }
  }
  
  function drawPerfChart(){
    var cv=document.getElementById('performanceChart');
    if(!cv) return;
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    reg('perf', new Chart(cv.getContext('2d'),{
      type:'bar',
      data:{
        labels:['Maths','English','Physics','Chemistry','Biology','Economics','Agric','Civic'],
        datasets:[
          {label:'This Term',data:[68,74,62,59,71,78,65,73],
           backgroundColor:'#3B82F6CC',borderRadius:6,borderSkipped:false},
          {label:'Last Term',data:[62,70,58,55,68,74,61,70],
           backgroundColor:'#7C3AED66',borderRadius:6,borderSkipped:false}
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:true,
        plugins:{
          legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:14,boxWidth:10}},
          tooltip:TT
        },
        scales:{
          x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{color:gridClr()}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:10},
             callback:function(v){return v+'%';}},border:{display:false},max:100,min:0}
        }
      }
    }));
  }
  
  function drawGradeDonut(){
    var cv=document.getElementById('gradeChart');
    if(!cv) return;
    reg('donut', new Chart(cv.getContext('2d'),{
      type:'doughnut',
      data:{
        labels:['A (80–100)','B (65–79)','C (50–64)','F (0–49)'],
        datasets:[{data:[22,31,29,18],
          backgroundColor:['#3B82F6','#22C55E','#F59E0B','#EF4444'],
          borderWidth:0,hoverOffset:8}]
      },
      options:{
        cutout:'70%',responsive:true,maintainAspectRatio:true,
        plugins:{
          legend:{display:false},
          tooltip:{backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}
        }
      }
    }));
  }
  
  /* ── Analytics charts (lazy) ───────────────────────────────────── */
  function drawAnalyticsCharts(){
    if(App.analyticsDrawn) return;
    if(typeof Chart==='undefined'){ setTimeout(drawAnalyticsCharts,200); return; }
    App.analyticsDrawn=true;
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
  
    function mk(id,cfg){
      var cv=document.getElementById(id);
      if(cv) reg(id, new Chart(cv.getContext('2d'),cfg));
    }
  
    mk('trendChart',{type:'line',
      data:{labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10'],
        datasets:[
          {label:'1st Term',data:[62,64,63,65,67,66,68,70,69,72],borderColor:'#3B82F6',
           backgroundColor:'#3B82F618',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#3B82F6'},
          {label:'2nd Term',data:[68,70,72,71,74,73,76,75,78,80],borderColor:'#7C3AED',
           backgroundColor:'#7C3AED18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#7C3AED'},
          {label:'3rd Term',data:[72,74,75,77,76,78,79,81,80,83],borderColor:'#22C55E',
           backgroundColor:'#22C55E18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#22C55E'}
        ]},
      options:{responsive:true,maintainAspectRatio:true,
        plugins:{legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:14,boxWidth:10}},
                 tooltip:{mode:'index',intersect:false,...TT}},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}},
                y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},
                   callback:function(v){return v+'%';}},border:{display:false},min:55,max:90}}}
    });
  
    mk('subjectChart',{type:'bar',
      data:{labels:['Math','English','Physics','Chemistry','Biology','Econ'],
        datasets:[{label:'Avg %',data:[68,74,62,59,71,78],
          backgroundColor:['#3B82F6','#22C55E','#F59E0B','#7C3AED','#EF4444','#60A5FA'].map(function(c){return c+'CC';}),
          borderRadius:6,borderSkipped:false}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},
                 callback:function(v){return v+'%';}},border:{display:false},max:100},
                y:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
  
    mk('attendanceChart',{type:'bar',
      data:{labels:['SS 1A','SS 1B','SS 2A','SS 2B','SS 3A','SS 3B','JSS 1','JSS 2','JSS 3'],
        datasets:[{label:'Attendance %',data:[93,88,95,82,91,79,94,87,85],
          backgroundColor:function(ctx){var v=ctx.raw||0;
            return v>=90?'#22C55ECC':v>=80?'#F59E0BCC':'#EF4444CC';},
          borderRadius:6,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{display:false}},
                y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},
                   callback:function(v){return v+'%';}},border:{display:false},min:70,max:100}}}
    });
  
    mk('gradeBarChart',{type:'bar',
      data:{labels:['A (80–100)','B (65–79)','C (50–64)','D (45–49)','F (0–44)'],
        datasets:[{label:'Students',data:[108,153,143,40,38],
          backgroundColor:['#22C55E','#3B82F6','#F59E0B','#7C3AED','#EF4444'].map(function(c){return c+'CC';}),
          borderRadius:8,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:true,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}},
                y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
  
    icons();
  }
  
  /* ================================================================
     KEYBOARD SHORTCUTS
     ================================================================ */
  document.addEventListener('keydown', function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){
      e.preventDefault();
      var s=document.getElementById('globalSearch');
      if(s) s.focus();
    }
    if(e.key==='Escape'){
      closeModal();
      closeLogoutModal();
      var ap=document.getElementById('adminProfileBtn');
      if(ap) ap.classList.remove('open');
    }
  });
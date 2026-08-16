/* ================================================================
   EduTrack Pro - script.js  (Complete, all bugs fixed)
   No Supabase. 100% localStorage. Works offline.
   Load order in index.html (end of body):
     1. lucide.min.js
     2. chart.umd.min.js
     3. auth.js
     4. script.js  <-- this file
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
  
  var KEY = { STUDENTS:'et_students', RESULTS:'et_results', SETTINGS:'et_settings' };
  
  var SEED = [
    {id:'s1',name:'Amaka Okafor',  admNo:'GHS/001',class:'SS 2A', gender:'Female',subjects:6,total:468,avg:78.0,grade:'B',remark:'Excellent',       status:'pass'},
    {id:'s2',name:'Ibrahim Musa',  admNo:'GHS/002',class:'SS 3A', gender:'Male',  subjects:6,total:510,avg:85.0,grade:'A',remark:'Outstanding',      status:'pass'},
    {id:'s3',name:'Chioma Eze',    admNo:'GHS/003',class:'JSS 2B',gender:'Female',subjects:8,total:392,avg:49.0,grade:'F',remark:'Needs Improvement',status:'fail'},
    {id:'s4',name:'Emeka Nwosu',   admNo:'GHS/004',class:'SS 1A', gender:'Male',  subjects:7,total:427,avg:61.0,grade:'C',remark:'Average',          status:'pass'},
    {id:'s5',name:'Fatima Aliyu',  admNo:'GHS/005',class:'SS 2B', gender:'Female',subjects:6,total:495,avg:82.5,grade:'A',remark:'Outstanding',      status:'pass'},
    {id:'s6',name:'Tunde Adeyemi', admNo:'GHS/006',class:'JSS 3A',gender:'Male',  subjects:8,total:356,avg:44.5,grade:'F',remark:'Needs Improvement',status:'fail'},
    {id:'s7',name:'Grace Okoro',   admNo:'GHS/007',class:'SS 3B', gender:'Female',subjects:6,total:451,avg:75.2,grade:'B',remark:'Good',             status:'pass'},
    {id:'s8',name:'Yusuf Bello',   admNo:'GHS/008',class:'SS 1B', gender:'Male',  subjects:7,total:480,avg:68.6,grade:'B',remark:'Good',             status:'pass'}
  ];
  
  var COLORS = ['#3B82F6','#7C3AED','#22C55E','#F59E0B','#EF4444','#60A5FA','#EC4899','#14B8A6'];
  
  /* ================================================================
     UTILITIES
     ================================================================ */
  var Store = {
    get: function(k,def){ try{ var r=localStorage.getItem(k); return r?JSON.parse(r):def; }catch(e){ return def; } },
    set: function(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  };
  
  function calcGrade(n){ if(n>=80)return 'A'; if(n>=65)return 'B'; if(n>=50)return 'C'; if(n>=45)return 'D'; return 'F'; }
  function gradeClass(g){ return ({A:'grade-a',B:'grade-b',C:'grade-c',D:'grade-c',F:'grade-f'})[g]||'grade-c'; }
  function gradeRemark(g){ return ({A:'Excellent',B:'Very Good',C:'Good',D:'Pass',F:'Fail'})[g]||'--'; }
  function uid(){ return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
  
  function q(sel){ return document.querySelector(sel); }
  function qAll(sel){ return document.querySelectorAll(sel); }
  function setText(sel,val){
    var el=(typeof sel==='string')?q(sel):sel;
    if(el) el.textContent=(val===null||val===undefined)?'':String(val);
  }
  function icons(){ if(typeof lucide!=='undefined'){ try{ lucide.createIcons(); }catch(e){} } }
  function toast(msg,isErr){
    var el=document.getElementById('toast'), txt=document.getElementById('toastMsg');
    if(!el||!txt) return;
    txt.textContent=msg; el.style.background=isErr?'#991B1B':'#1E293B';
    el.classList.add('show'); clearTimeout(el._t);
    el._t=setTimeout(function(){ el.classList.remove('show'); },3500);
  }
  
  /* ================================================================
     BOOT
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function(){
  
    /* 1. Read user from session */
    App.user = null;
    if(window.EduAuth) App.user = window.EduAuth.getUser();
    if(!App.user){
      /* Fallback: read raw session */
      try{ var raw=localStorage.getItem('edutrack_session'); if(raw) App.user=JSON.parse(raw); }catch(e){}
    }
  
    /* 2. Guard - send to login if no valid session */
    if(!App.user || App.user.loggedIn !== true){
      window.location.replace('login.html');
      return;
    }
  
    /* 3. Fill name/role/school into UI right away */
    fillUserUI();
  
    /* 4. Wire everything */
    wireNav();
    wireSidebar();
    wireTopbar();
    wireTheme();
    wireModal();
    wireSettings();
    wireSearch();
    wireReportCard();
  
    /* 5. Load student data (also calls refreshStats) */
    loadStudents();
  
    /* 6. Render icons */
    icons();
  
    /* 7. Draw charts after 600ms so canvases are painted + CDNs loaded */
    setTimeout(drawCharts, 600);
  });
  
  /* Safety: retry charts on full page load */
  window.addEventListener('load', function(){
    setTimeout(function(){ if(!App.chartsDrawn) drawCharts(); }, 400);
  });
  
  /* ================================================================
     FILL USER UI
     ================================================================ */
  function fillUserUI(){
    var u = App.user;
    if(!u) return;
  
    function g(k,fb){ return (u[k]&&String(u[k]).trim()) ? String(u[k]).trim() : fb; }
  
    var name   = g('name',   'Administrator');
    var role   = g('role',   'Admin');
    var school = g('school', 'Government High School');
    var email  = g('email',  '');
    var sess   = g('session','2024/2025');
    var term   = g('term',   '3rd Term');
  
    /* Store in App for other functions */
    App.session = sess;
    App.term    = term;
  
    /* Sidebar */
    setText('.user-name-sm', name);
    setText('.user-role-sm', role);
    setText('.school-name',  school);
    var ssEl = q('.school-session');
    if(ssEl) ssEl.textContent = sess+' Session';
  
    /* Topbar */
    var firstPart = name.split(' ')[0] || name;
    setText('.admin-name', firstPart);
    setText('.admin-role', role);
  
    /* Dropdown */
    setText('.dh-name',  name);
    setText('.dh-email', email);
  
    /* Welcome heading - strip titles (Mr. Mrs. Dr. etc) */
    var wEl = q('#page-dashboard .page-title');
    if(wEl){
      var h    = new Date().getHours();
      var gr   = h<12?'Good morning':h<17?'Good afternoon':'Good evening';
      var skip = /^(mr|mrs|ms|miss|dr|prof|sir|chief|alhaji|alhaja)\.?$/i;
      var parts= name.split(/\s+/);
      var first= '';
      for(var i=0;i<parts.length;i++){
        if(parts[i].length>1 && !skip.test(parts[i])){ first=parts[i]; break; }
      }
      if(!first) first = parts[parts.length-1]||'Admin';
      wEl.textContent = gr+', '+first+' \u{1F44B}';
    }
  
    /* Page subtitle */
    var subEl = q('#page-dashboard .page-subtitle');
    if(subEl) subEl.textContent = "Here's what's happening in your school today — "+term+', '+sess+' Session.';
  }
  
  /* ================================================================
     NAVIGATION
     ================================================================ */
  function wireNav(){
    qAll('.nav-item[data-page]').forEach(function(item){
      item.addEventListener('click', function(e){
        e.preventDefault();
        goTo(item.getAttribute('data-page'), item);
      });
    });
    qAll('[data-page-link]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        var pid=btn.getAttribute('data-page-link');
        goTo(pid, q('.nav-item[data-page="'+pid+'"]'));
      });
    });
    /* Logout — mousedown fires before dropdown-close click */
    qAll('[data-action="logout"]').forEach(function(el){
      el.addEventListener('mousedown', function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
      el.addEventListener('touchend',  function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
    });
    var arrow=q('.user-arrow');
    if(arrow){
      arrow.style.cursor='pointer'; arrow.title='Logout';
      arrow.addEventListener('mousedown', function(e){ e.stopPropagation(); doLogout(); });
      arrow.addEventListener('touchend',  function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
    }
  }
  
  function goTo(pageId, navEl){
    qAll('.page').forEach(function(p){ p.classList.remove('active'); });
    var target=document.getElementById('page-'+pageId);
    if(target){ target.classList.add('active'); }
    else { var db=document.getElementById('page-dashboard'); if(db){ db.classList.add('active'); pageId='dashboard'; } }
  
    qAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
    if(navEl) navEl.classList.add('active');
  
    var LABELS={dashboard:'Dashboard',students:'Students',results:'Results',subjects:'Subjects',
      teachers:'Teachers',attendance:'Attendance',analytics:'Analytics',report:'Report Card',
      messages:'Messages',settings:'Settings'};
    setText('#bcCurrent', LABELS[pageId]||pageId);
  
    closeSidebar();
    if(pageId==='analytics') setTimeout(drawAnalyticsCharts, 200);
    var pw=q('.page-wrapper'); if(pw) pw.scrollTop=0;
    icons();
  }
  
  /* ================================================================
     SIDEBAR
     ================================================================ */
  function wireSidebar(){
    var btn=document.getElementById('hamburgerBtn'),
        sidebar=document.getElementById('sidebar'),
        overlay=document.getElementById('sidebarOverlay');
    if(btn) btn.addEventListener('click', function(){
      var open=sidebar.classList.toggle('mobile-open');
      if(overlay) overlay.classList.toggle('active',open);
    });
    if(overlay) overlay.addEventListener('click', closeSidebar);
  }
  function closeSidebar(){
    var s=document.getElementById('sidebar'), o=document.getElementById('sidebarOverlay');
    if(s) s.classList.remove('mobile-open');
    if(o) o.classList.remove('active');
  }
  
  /* ================================================================
     TOPBAR
     ================================================================ */
  function wireTopbar(){
    var btn=document.getElementById('adminProfileBtn');
    if(!btn) return;
    btn.addEventListener('click', function(e){ e.stopPropagation(); btn.classList.toggle('open'); });
    document.addEventListener('click', function(){ btn.classList.remove('open'); });
  }
  
  /* ================================================================
     THEME
     ================================================================ */
  function wireTheme(){
    applyTheme(localStorage.getItem('edutrack-theme')||'light');
    var t=document.getElementById('themeToggle');
    if(t) t.addEventListener('click', function(){
      applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
    });
  }
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('edutrack-theme',t);
    var moon=q('.icon-moon'), sun=q('.icon-sun');
    if(moon) moon.style.display=t==='dark' ?'none':'';
    if(sun)  sun.style.display =t==='light'?'none':'';
    setTimeout(refreshChartTheme,60);
  }
  function setTheme(t,el){
    qAll('.theme-option').forEach(function(b){ b.classList.remove('active'); });
    if(el) el.classList.add('active');
    applyTheme(t);
  }
  
  /* ================================================================
     LOGOUT
     ================================================================ */
  function doLogout(){ showLogoutModal(); }
  
  function showLogoutModal(){
    var existing=document.getElementById('logoutModal');
    if(existing){ existing.style.display='flex'; return; }
    var m=document.createElement('div');
    m.id='logoutModal';
    m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.75);'
      +'backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    m.innerHTML='<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);'
      +'border-radius:16px;padding:30px 32px;max-width:340px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);">'
      +'<div style="font-size:2.6rem;margin-bottom:10px;">&#x1F44B;</div>'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1.1rem;font-weight:700;color:var(--text,#1E293B);margin-bottom:8px;">Logging Out?</h3>'
      +'<p style="font-size:.84rem;color:var(--muted,#64748B);margin-bottom:22px;line-height:1.6;">Are you sure you want to log out of EduTrack Pro?</p>'
      +'<div style="display:flex;gap:10px;">'
      +'<button onclick="closeLogoutModal()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);color:var(--text,#1E293B);font-weight:600;font-size:.88rem;cursor:pointer;">Cancel</button>'
      +'<button onclick="confirmLogout()" style="flex:1;padding:10px;border:none;border-radius:9px;background:#EF4444;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;">&#x1F6AA; Log Out</button>'
      +'</div></div>';
    document.body.appendChild(m);
  }
  function closeLogoutModal(){ var m=document.getElementById('logoutModal'); if(m) m.style.display='none'; }
  function confirmLogout(){
    try{ localStorage.removeItem('edutrack_session'); localStorage.removeItem('edutrack_user_name'); localStorage.removeItem('edutrack_user_role'); }catch(e){}
    window.location.href='login.html';
  }
  
  /* ================================================================
     STAT CARDS
     ================================================================ */
  function setStat(key,value,suf){
    var el=q('[data-stat="'+key+'"]');
    if(!el) return;
    el.dataset.count  = value;
    el.dataset.suffix = suf||'';
    el.textContent    = value+(suf||'');
  }
  
  function animateStats(){
    qAll('.stat-value[data-count]').forEach(function(el){
      if(el._animTimer) clearInterval(el._animTimer);
      var target = parseFloat(el.dataset.count)||0;
      var suf    = el.dataset.suffix||'';
      var cur    = 0;
      var step   = Math.ceil(target/60)||1;
      el._animTimer=setInterval(function(){
        cur=Math.min(cur+step,target);
        var disp = target>100 ? Math.round(cur).toLocaleString() : (Number.isInteger(target)?Math.round(cur):cur.toFixed(1));
        el.textContent=disp+suf;
        if(cur>=target){
          clearInterval(el._animTimer);
          el.textContent=(target>100?target.toLocaleString():target)+suf;
        }
      },25);
    });
  }
  
  function refreshStats(){
    var s      = App.students;
    var passed = s.filter(function(x){ return x.status==='pass'; }).length;
    var failed = s.filter(function(x){ return x.status==='fail'; }).length;
    var avgAll = s.length ? (s.reduce(function(a,x){ return a+x.avg; },0)/s.length).toFixed(1) : 0;
  
    setStat('stat-students',   s.length,   '');
    setStat('stat-results',    s.length*6, '');
    setStat('stat-avg',        avgAll,     '%');
    setStat('stat-passed',     passed,     '');
    setStat('stat-failed',     failed,     '');
    setStat('stat-attendance', 91,         '%');
  
    animateStats();
  }
  
  /* ================================================================
     STUDENTS
     ================================================================ */
  function loadStudents(){
    var saved=Store.get(KEY.STUDENTS,null);
    if(!saved||!saved.length){ saved=SEED.map(function(s){ return Object.assign({},s); }); Store.set(KEY.STUDENTS,saved); }
    App.students=saved;
    renderTable(App.students);
    refreshStats();
    refreshNavCounts();
  }
  
  function refreshNavCounts(){
    var c=App.students.length;
    var sn=q('.nav-item[data-page="students"] .nav-count');
    var rn=q('.nav-item[data-page="results"]  .nav-count');
    if(sn) sn.textContent=c;
    if(rn) rn.textContent=c;
  }
  
  function buildRow(s,i){
    var init=s.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase();
    var color=COLORS[i%COLORS.length];
    return '<tr data-sid="'+s.id+'">'
      +'<td><div class="student-cell">'
      +'<div style="background:'+color+';width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;">'+init+'</div>'
      +'<div><div class="student-name">'+s.name+'</div><div class="student-id">'+(s.admNo||'')+'</div></div>'
      +'</div></td>'
      +'<td>'+s.class+'</td>'
      +'<td>'+s.subjects+'</td>'
      +'<td>'+s.total+'</td>'
      +'<td>'+Number(s.avg).toFixed(1)+'%</td>'
      +'<td><span class="grade-badge '+gradeClass(s.grade)+'">'+s.grade+'</span></td>'
      +'<td><span class="status-badge status-'+s.status+'"><span class="status-dot"></span>'+(s.status==='pass'?'Passed':'Failed')+'</span></td>'
      +'<td><div class="action-btns">'
      +'<button class="action-btn view" data-i="'+i+'" title="View"><i data-lucide="eye"></i></button>'
      +'<button class="action-btn edit" data-i="'+i+'" title="Edit"><i data-lucide="edit-3"></i></button>'
      +'<button class="action-btn del"  data-i="'+i+'" title="Delete"><i data-lucide="trash-2"></i></button>'
      +'</div></td></tr>';
  }
  
  function renderTable(list){
    var html=list.length
      ?list.map(buildRow).join('')
      :'<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748B;">No students yet. Add students to get started.</td></tr>';
    ['resultsTableBody','fullResultsBody'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.innerHTML=html;
    });
    qAll('.action-btn.view').forEach(function(b){ b.addEventListener('click',function(){ openModal(parseInt(b.dataset.i),'view'); }); });
    qAll('.action-btn.edit').forEach(function(b){ b.addEventListener('click',function(){ openModal(parseInt(b.dataset.i),'edit'); }); });
    qAll('.action-btn.del' ).forEach(function(b){ b.addEventListener('click',function(){ deleteStudent(parseInt(b.dataset.i)); }); });
    icons();
  }
  
  function deleteStudent(idx){
    var s=App.students[idx]; if(!s) return;
    showDeleteConfirm(s.name, function(){
      App.students.splice(idx,1);
      Store.set(KEY.STUDENTS,App.students);
      renderTable(App.students); refreshStats(); refreshNavCounts();
      toast(s.name+' deleted.');
    });
  }
  
  function showDeleteConfirm(name,cb){
    var m=document.createElement('div');
    m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    m.innerHTML='<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);border-radius:16px;padding:28px 30px;max-width:340px;width:90%;text-align:center;">'
      +'<div style="font-size:2.2rem;margin-bottom:10px;">&#x26A0;&#xFE0F;</div>'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;margin-bottom:8px;">Delete Student?</h3>'
      +'<p style="font-size:.83rem;color:#64748B;margin-bottom:20px;">Delete <strong>'+name+'</strong>? This cannot be undone.</p>'
      +'<div style="display:flex;gap:10px;">'
      +'<button id="dcCancel" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);font-weight:600;cursor:pointer;">Cancel</button>'
      +'<button id="dcConfirm" style="flex:1;padding:10px;border:none;border-radius:9px;background:#EF4444;color:#fff;font-weight:700;cursor:pointer;">Delete</button>'
      +'</div></div>';
    document.body.appendChild(m);
    document.getElementById('dcCancel').onclick =function(){ document.body.removeChild(m); };
    document.getElementById('dcConfirm').onclick=function(){ document.body.removeChild(m); cb(); };
  }
  
  /* ================================================================
     SEARCH & FILTER
     ================================================================ */
  function wireSearch(){
    var srch=document.getElementById('tableSearch');
    if(srch) srch.addEventListener('input',function(){
      var q2=srch.value.toLowerCase();
      qAll('#resultsTableBody tr').forEach(function(row){
        var n=(row.querySelector('.student-name')||{}).textContent||'';
        row.style.display=n.toLowerCase().indexOf(q2)>-1?'':'none';
      });
    });
    var cf=document.getElementById('classFilter');
    if(cf) cf.addEventListener('change',function(){
      var cls=cf.value;
      qAll('#resultsTableBody tr, #fullResultsBody tr').forEach(function(row){
        var c=(row.cells[1]||{}).textContent||'';
        row.style.display=(!cls||c.trim()===cls)?'':'none';
      });
    });
  }
  
  /* ================================================================
     MODAL
     ================================================================ */
  function wireModal(){
    var bd=document.getElementById('modalBackdrop');
    var mc=document.getElementById('modalClose');
    var mx=document.getElementById('modalCancel');
    var ms=document.getElementById('modalSave');
    if(mc) mc.addEventListener('click',closeModal);
    if(mx) mx.addEventListener('click',closeModal);
    if(ms) ms.addEventListener('click',saveModal);
    if(bd) bd.addEventListener('click',function(e){ if(e.target===bd) closeModal(); });
  }
  function openModal(idx,mode){
    var s=App.students[idx]; if(!s) return;
    function sv(id,v){ var e=document.getElementById(id); if(e) e.value=v; }
    sv('modalStudentName',s.name); sv('modalClass',s.class); sv('modalTotal',s.total);
    sv('modalAvg',s.avg); sv('modalGrade',s.grade); sv('modalRemark',s.remark||'');
    document.getElementById('resultModal').dataset.idx=idx;
    setText('.modal-title',mode==='view'?'View Result':'Edit Result');
    var sb=document.getElementById('modalSave'); if(sb) sb.style.display=mode==='view'?'none':'';
    document.getElementById('modalBackdrop').classList.add('open');
    icons();
  }
  function saveModal(){
    var idx=parseInt(document.getElementById('resultModal').dataset.idx);
    var s=App.students[idx]; if(!s) return;
    function gv(id){ var e=document.getElementById(id); return e?e.value:''; }
    s.name=gv('modalStudentName')||s.name; s.class=gv('modalClass');
    s.total=parseFloat(gv('modalTotal'))||s.total; s.avg=parseFloat(gv('modalAvg'))||s.avg;
    s.grade=gv('modalGrade'); s.remark=gv('modalRemark'); s.status=s.avg>=50?'pass':'fail';
    Store.set(KEY.STUDENTS,App.students);
    renderTable(App.students); refreshStats(); closeModal();
    toast('Result updated successfully!');
  }
  function closeModal(){ var bd=document.getElementById('modalBackdrop'); if(bd) bd.classList.remove('open'); }
  
  /* ================================================================
     REPORT CARD - Nigerian Subjects
     ================================================================ */
  var RC_SUBJECTS = {
    SS: [
      'English Language','Mathematics','Biology','Chemistry','Physics',
      'Agricultural Science','Economics','Government','Literature in English',
      'Civic Education','Geography','Further Mathematics','Commerce',
      'Accounts','Computer Studies','Christian Religious Studies',
      'Islamic Religious Studies','French Language','Yoruba Language',
      'Igbo Language','Hausa Language','Physical & Health Education','Fine Arts'
    ],
    JSS: [
      'English Language','Mathematics','Basic Science','Basic Technology',
      'Social Studies','Civic Education','Christian Religious Studies',
      'Islamic Religious Studies','Physical & Health Education','Computer Studies',
      'Agricultural Science','Home Economics','Business Studies',
      'French Language','Yoruba Language','Igbo Language','Hausa Language',
      'Fine Arts & Craft','Music','Cultural & Creative Arts'
    ],
    PRIMARY: [
      'English Language','Mathematics','Basic Science & Technology',
      'Social Studies','National Values Education','Agricultural Science',
      'Christian Religious Studies','Islamic Religious Studies',
      'Physical & Health Education','Computer Studies',
      'Yoruba Language','Igbo Language','Hausa Language',
      'Verbal Reasoning','Quantitative Reasoning','Cultural & Creative Arts',
      'Music','Home Economics'
    ]
  };
  var RC_DEFAULTS = { SS:12, JSS:10, PRIMARY:10 };
  var activeSubjects = [];
  
  function getLevel(cls){
    if(!cls) return 'SS';
    var c=cls.toUpperCase();
    if(c.indexOf('PRIMARY')>-1) return 'PRIMARY';
    if(c.indexOf('JSS')>-1)     return 'JSS';
    return 'SS';
  }
  function calcGrade100(n){ if(n>=75)return 'A'; if(n>=65)return 'B'; if(n>=55)return 'C'; if(n>=45)return 'D'; if(n>=40)return 'E'; return 'F'; }
  function subjectComment(g){ return ({A:'Excellent',B:'Very Good',C:'Good',D:'Average',E:'Fair',F:'Poor'})[g]||'--'; }
  function gradeClr(g){ return ({A:'#22C55E',B:'#3B82F6',C:'#60A5FA',D:'#F59E0B',E:'#F97316',F:'#EF4444'})[g]||'#94A3B8'; }
  
  function autoTeacherComment(avg,name){
    var first=(name||'This student').split(' ')[0];
    if(avg>=75) return first+' has demonstrated an outstanding level of academic excellence this term. Keep up the brilliant work!';
    if(avg>=65) return first+' has shown very commendable performance this term. With continued effort, even greater heights can be reached.';
    if(avg>=55) return first+' performed well this term. There is room for improvement, and I encourage more dedication to studies.';
    if(avg>=45) return first+' showed fair performance this term. Greater focus and consistent study habits will yield better results.';
    if(avg>=40) return first+' needs to improve significantly. I urge more seriousness with academic work next term.';
    return first+' performed below expectation this term. Urgent improvement is needed. Parents should closely monitor academic progress.';
  }
  function autoPrincipalComment(avg,name){
    var first=(name||'This student').split(' ')[0];
    if(avg>=75) return 'A truly impressive performance. '+first+' is a pride of this school. We encourage this standard to be maintained.';
    if(avg>=65) return 'A very good result. '+first+' should continue to work hard and aim for excellence in all subjects.';
    if(avg>=55) return 'A satisfactory performance. '+first+' is encouraged to put in more effort next term.';
    if(avg>=45) return 'An average performance. '+first+' must be more dedicated. Parental support is strongly advised.';
    return 'Performance is below acceptable standard. '+first+' requires immediate academic intervention and parental involvement.';
  }
  
  function wireReportCard(){
    resetSubjectsForLevel('SS');
  
    var clsEl=document.getElementById('rc_class');
    if(clsEl) clsEl.addEventListener('change',function(){ resetSubjectsForLevel(getLevel(clsEl.value)); updatePreview(); });
  
    var addBtn=document.getElementById('btnAddSubject');
    if(addBtn) addBtn.addEventListener('click',showAddSubjectModal);
  
    var area=document.getElementById('logoUploadArea'), input=document.getElementById('logoUpload');
    if(area) area.addEventListener('click',function(){ if(input) input.click(); });
    if(input) input.addEventListener('change',function(){
      if(!input.files[0]) return;
      var reader=new FileReader();
      reader.onload=function(e){
        var logo=document.getElementById('prev_logo');
        if(logo) logo.innerHTML='<img src="'+e.target.result+'" style="width:52px;height:52px;object-fit:contain;border-radius:8px;" />';
        var txt=document.getElementById('logoUploadText'); if(txt) txt.textContent='Logo uploaded';
        toast('School logo uploaded!');
      };
      reader.readAsDataURL(input.files[0]);
    });
  
    var admEl=document.getElementById('rc_admNo');
    if(admEl) admEl.addEventListener('blur',function(){
      var v=admEl.value.trim().toUpperCase(); if(!v) return;
      var found=App.students.find(function(s){ return (s.admNo||'').toUpperCase()===v; });
      if(found){
        var fn=document.getElementById('rc_firstName'), ln=document.getElementById('rc_lastName');
        var pts=found.name.split(' ');
        if(fn) fn.value=pts[0]||''; if(ln) ln.value=pts.slice(1).join(' ')||'';
        var cls=document.getElementById('rc_class');
        if(cls){ cls.value=found.class; resetSubjectsForLevel(getLevel(found.class)); }
        var gen=document.getElementById('rc_gender'); if(gen&&found.gender) gen.value=found.gender;
        loadSavedScores(found.id); updatePreview();
        toast('Student loaded: '+found.name);
      } else { toast('No student found with that admission number.',true); }
    });
  
    ['rc_schoolName','rc_schoolAddr','rc_session','rc_term','rc_firstName','rc_lastName',
     'rc_admNo','rc_gender','rc_dob','rc_position','rc_classSize',
     'rc_teacherComment','rc_principalComment','rc_nextTerm'].forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.addEventListener('input',updatePreview); el.addEventListener('change',updatePreview); }
    });
  
    wireCommentManual();
  
    var pb=document.getElementById('btnPrintReport'); if(pb) pb.addEventListener('click',printReport);
    var sb=document.getElementById('btnSaveReport');  if(sb) sb.addEventListener('click',function(){ saveReportCard(); setTimeout(printReport,400); });
  
    updatePreview();
  }
  
  function wireCommentManual(){
    var tc=document.getElementById('rc_teacherComment');
    var pc=document.getElementById('rc_principalComment');
    if(tc) tc.addEventListener('input',function(){ tc.dataset.manual='1'; updatePreview(); });
    if(pc) pc.addEventListener('input',function(){ pc.dataset.manual='1'; updatePreview(); });
  }
  
  function resetSubjectsForLevel(level){
    var pool=RC_SUBJECTS[level]||RC_SUBJECTS.SS;
    var count=RC_DEFAULTS[level]||10;
    activeSubjects=pool.slice(0,count).slice();
    buildScoreTable(); updatePreview();
  }
  
  function buildScoreTable(){
    var tb=document.getElementById('scoresBody'); if(!tb) return;
    tb.innerHTML=activeSubjects.map(function(subj,i){
      return '<tr id="srow_'+i+'">'
        +'<td style="min-width:130px;font-weight:500;font-size:.78rem;">'+subj+'</td>'
        +'<td><input type="number" min="0" max="10" placeholder="0" class="score-inp ca1-inp" data-row="'+i+'" data-max="10" style="width:46px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:6px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td><input type="number" min="0" max="10" placeholder="0" class="score-inp ca2-inp" data-row="'+i+'" data-max="10" style="width:46px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:6px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td><input type="number" min="0" max="20" placeholder="0" class="score-inp mid-inp" data-row="'+i+'" data-max="20" style="width:52px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:6px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td><input type="number" min="0" max="60" placeholder="0" class="score-inp exam-inp" data-row="'+i+'" data-max="60" style="width:52px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:6px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td id="rt_'+i+'" style="font-weight:700;text-align:center;font-size:.8rem;">--</td>'
        +'<td id="rg_'+i+'" style="text-align:center;">--</td>'
        +'<td id="rc_'+i+'" style="font-size:.72rem;color:#64748B;">--</td>'
        +'<td><button class="rm-subj-btn" data-row="'+i+'" title="Remove" style="background:rgba(239,68,68,.1);color:#EF4444;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;">x</button></td>'
        +'</tr>';
    }).join('');
  
    tb.addEventListener('input',function(e){
      var inp=e.target; if(!inp.classList.contains('score-inp')) return;
      var max=parseInt(inp.dataset.max)||100, v=parseFloat(inp.value)||0;
      if(v>max) inp.value=max; if(v<0) inp.value=0;
      inp.style.borderColor=(parseFloat(inp.value)===max&&max!==0)?'#22C55E':'';
      recalcScores(); updatePreview();
    });
  
    tb.querySelectorAll('.rm-subj-btn').forEach(function(btn){
      btn.addEventListener('click',function(){
        var idx=parseInt(btn.dataset.row);
        if(activeSubjects.length<=1){ toast('Must have at least 1 subject.',true); return; }
        activeSubjects.splice(idx,1); buildScoreTable(); recalcScores(); updatePreview();
      });
    });
  }
  
  function showAddSubjectModal(){
    var level=getLevel((document.getElementById('rc_class')||{}).value||'SS 1A');
    var pool=RC_SUBJECTS[level]||RC_SUBJECTS.SS;
    var available=pool.filter(function(s){ return activeSubjects.indexOf(s)<0; });
    if(document.getElementById('addSubjModal')) document.getElementById('addSubjModal').remove();
    var m=document.createElement('div');
    m.id='addSubjModal';
    m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
    var listHTML=available.length
      ?available.map(function(s){ return '<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;font-size:.83rem;"><input type="checkbox" value="'+s+'" style="accent-color:#3B82F6;width:15px;height:15px;cursor:pointer;" /><span>'+s+'</span></label>'; }).join('')
      :'<p style="color:#64748B;font-size:.83rem;padding:10px;">All subjects already added.</p>';
    listHTML+='<div style="border-top:1px solid var(--border,#E2E8F0);margin-top:12px;padding-top:12px;"><p style="font-size:.74rem;color:#64748B;margin-bottom:6px;font-weight:600;">OR TYPE A CUSTOM SUBJECT</p><input type="text" id="customSubjInput" placeholder="e.g. Technical Drawing" style="width:100%;padding:8px 10px;border:1.5px solid var(--border,#E2E8F0);border-radius:8px;font-family:Inter,sans-serif;font-size:.83rem;color:var(--text,#1E293B);background:var(--bg,#F8FAFC);outline:none;" /></div>';
    m.innerHTML='<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);border-radius:16px;padding:24px;max-width:420px;width:100%;max-height:80vh;overflow-y:auto;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;">Add Subjects</h3>'
      +'<button onclick="document.getElementById(\'addSubjModal\').remove()" style="background:none;border:none;font-size:1.3rem;cursor:pointer;color:#64748B;">x</button></div>'
      +'<div style="display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto;margin-bottom:10px;">'+listHTML+'</div>'
      +'<div style="display:flex;gap:10px;margin-top:14px;">'
      +'<button onclick="document.getElementById(\'addSubjModal\').remove()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);font-weight:600;font-size:.85rem;cursor:pointer;">Cancel</button>'
      +'<button id="doAddSubj" style="flex:1;padding:10px;border:none;border-radius:9px;background:#3B82F6;color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;">Add Selected</button>'
      +'</div></div>';
    document.body.appendChild(m);
    document.getElementById('doAddSubj').addEventListener('click',function(){
      var checked=[];
      m.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb){ checked.push(cb.value); });
      var custom=(document.getElementById('customSubjInput')||{}).value;
      if(custom&&custom.trim()) checked.push(custom.trim());
      if(!checked.length){ toast('Select or type at least one subject.',true); return; }
      checked.forEach(function(s){ if(activeSubjects.indexOf(s)<0) activeSubjects.push(s); });
      m.remove(); buildScoreTable(); recalcScores(); updatePreview();
      toast('Subject(s) added!');
    });
  }
  
  function recalcScores(){
    var rows=document.querySelectorAll('#scoresBody tr'), grand=0, count=0;
    rows.forEach(function(row,i){
      var ca1=parseFloat((row.querySelector('.ca1-inp')||{}).value)||0;
      var ca2=parseFloat((row.querySelector('.ca2-inp')||{}).value)||0;
      var mid=parseFloat((row.querySelector('.mid-inp')||{}).value)||0;
      var exam=parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      var tot=ca1+ca2+mid+exam, grd=calcGrade100(tot), cmt=subjectComment(grd), clr=gradeClr(grd);
      var tc=document.getElementById('rt_'+i), gc=document.getElementById('rg_'+i), cc=document.getElementById('rc_'+i);
      var has=ca1||ca2||mid||exam;
      if(tc) tc.textContent=has?tot:'--';
      if(gc) gc.innerHTML=has?'<span style="background:'+clr+'22;color:'+clr+';padding:2px 7px;border-radius:5px;font-weight:700;font-size:.72rem;">'+grd+'</span>':'--';
      if(cc) cc.textContent=has?cmt:'--';
      if(has){ grand+=tot; count++; }
    });
    var avg=count?(grand/count).toFixed(1):'0.0';
    var grade=count?calcGrade100(parseFloat(avg)):'--';
    setText('#totalScore',count?grand:'--');
    setText('#avgScore',count?avg+'%':'--');
    setText('#overallGrade',grade);
    setText('#overallRemark',count?subjectComment(grade):'--');
  
    if(count){
      var fn=(document.getElementById('rc_firstName')||{}).value||'';
      var ln=(document.getElementById('rc_lastName') ||{}).value||'';
      var name=(fn+' '+ln).trim();
      var avgNum=parseFloat(avg);
      var tc2=document.getElementById('rc_teacherComment');
      var pc2=document.getElementById('rc_principalComment');
      if(tc2&&(!tc2.dataset.manual||tc2.dataset.manual==='0')) tc2.value=autoTeacherComment(avgNum,name);
      if(pc2&&(!pc2.dataset.manual||pc2.dataset.manual==='0')) pc2.value=autoPrincipalComment(avgNum,name);
    }
  }
  
  function updatePreview(){
    function gv(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
    function st(id,v){ var e=document.getElementById(id); if(e) e.textContent=v||'--'; }
  
    st('prev_schoolName',gv('rc_schoolName')||'School Name');
    st('prev_schoolAddr',gv('rc_schoolAddr')||'School Address');
    var sess=gv('rc_session')||'2024/2025', term=gv('rc_term')||'3rd Term';
    st('prev_termBadge',term+' Report Card -- '+sess);
    st('prev_session',sess); st('prev_term',term);
  
    var fn=gv('rc_firstName'), ln=gv('rc_lastName');
    st('prev_name',(fn+' '+ln).trim()||'--');
    st('prev_admNo', gv('rc_admNo') ||'--');
    st('prev_class', gv('rc_class') ||'--');
    st('prev_gender',gv('rc_gender')||'--');
  
    var dob=gv('rc_dob');
    if(dob){ try{ st('prev_dob',new Date(dob).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})); }catch(e){ st('prev_dob',dob); } }
    else st('prev_dob','--');
  
    var pos=gv('rc_position'), cs=gv('rc_classSize');
    st('prev_position',pos&&cs?pos+' of '+cs:pos||'--');
    st('prev_position2',pos&&cs?pos+' of '+cs:pos||'--');
  
    var rows=document.querySelectorAll('#scoresBody tr'), grand=0, count=0, html='';
    rows.forEach(function(row,i){
      var ca1=parseFloat((row.querySelector('.ca1-inp')||{}).value)||0;
      var ca2=parseFloat((row.querySelector('.ca2-inp')||{}).value)||0;
      var mid=parseFloat((row.querySelector('.mid-inp')||{}).value)||0;
      var exam=parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      if(ca1||ca2||mid||exam){
        var tot=ca1+ca2+mid+exam, grd=calcGrade100(tot), clr=gradeClr(grd);
        grand+=tot; count++;
        html+='<tr><td style="font-size:.72rem;font-weight:500">'+activeSubjects[i]+'</td>'
          +'<td style="text-align:center;font-size:.72rem">'+ca1+'</td>'
          +'<td style="text-align:center;font-size:.72rem">'+ca2+'</td>'
          +'<td style="text-align:center;font-size:.72rem">'+mid+'</td>'
          +'<td style="text-align:center;font-size:.72rem">'+exam+'</td>'
          +'<td style="text-align:center;font-weight:700;font-size:.78rem">'+tot+'</td>'
          +'<td style="text-align:center"><span style="background:'+clr+'22;color:'+clr+';padding:1px 6px;border-radius:4px;font-weight:700;font-size:.7rem;">'+grd+'</span></td>'
          +'<td style="font-size:.68rem;color:#64748B">'+subjectComment(grd)+'</td></tr>';
      }
    });
    var prevTb=document.getElementById('prev_scoresBody');
    if(prevTb) prevTb.innerHTML=html||'<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:14px;font-size:.78rem;">Enter subject scores on the left to see them here</td></tr>';
  
    var avg=count?(grand/count).toFixed(1):'--';
    var grd2=count?calcGrade100(parseFloat(avg)):'--';
    st('prev_total',count?grand:'--'); st('prev_avg',count?avg+'%':'--'); st('prev_grade',grd2);
  
    st('prev_teacherComment',  gv('rc_teacherComment')  ||'--');
    st('prev_principalComment',gv('rc_principalComment')||'--');
  
    var nt=gv('rc_nextTerm');
    if(nt){ try{ st('prev_nextTerm',new Date(nt).toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'})); }catch(e){ st('prev_nextTerm',nt); } }
    else st('prev_nextTerm','--');
  }
  
  function loadSavedScores(studentId){
    var saved=Store.get(KEY.RESULTS,[]).filter(function(r){
      return r.sid===studentId&&r.session===App.session&&r.term===App.term;
    });
    if(!saved.length) return;
    activeSubjects=saved.map(function(r){ return r.subject; });
    buildScoreTable();
    saved.forEach(function(r,i){
      function si(cls,v){ var el=q('#scoresBody tr:nth-child('+(i+1)+') .'+cls); if(el) el.value=v||0; }
      si('ca1-inp',r.ca1||0); si('ca2-inp',r.ca2||0); si('mid-inp',r.mid||0); si('exam-inp',r.exam||0);
    });
    recalcScores(); updatePreview();
  }
  
  function saveReportCard(){
    var fn=(document.getElementById('rc_firstName')||{}).value||'';
    var ln=(document.getElementById('rc_lastName') ||{}).value||'';
    var fullName=(fn+' '+ln).trim();
    if(!fullName){ toast('Enter the student name first.',true); return; }
    var admNo=((document.getElementById('rc_admNo')||{}).value||'').trim().toUpperCase();
    var student=admNo?App.students.find(function(s){ return (s.admNo||'').toUpperCase()===admNo; }):null;
    var rows=document.querySelectorAll('#scoresBody tr'), results=[];
    rows.forEach(function(row,i){
      var ca1=parseFloat((row.querySelector('.ca1-inp')||{}).value)||0;
      var ca2=parseFloat((row.querySelector('.ca2-inp')||{}).value)||0;
      var mid=parseFloat((row.querySelector('.mid-inp')||{}).value)||0;
      var exam=parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      if(ca1||ca2||mid||exam){
        var tot=ca1+ca2+mid+exam;
        results.push({sid:student?student.id:admNo||uid(),session:App.session,term:App.term,
          subject:activeSubjects[i],ca1:ca1,ca2:ca2,mid:mid,exam:exam,total:tot,grade:calcGrade100(tot)});
      }
    });
    if(!results.length){ toast('Enter at least one subject score.',true); return; }
    var sid=student?student.id:results[0].sid;
    var other=Store.get(KEY.RESULTS,[]).filter(function(r){ return !(r.sid===sid&&r.session===App.session&&r.term===App.term); });
    Store.set(KEY.RESULTS,other.concat(results));
    if(student){
      var avg=parseFloat((document.getElementById('avgScore')||{}).textContent)||0;
      var grade=(document.getElementById('overallGrade')||{}).textContent||'--';
      var total=parseInt((document.getElementById('totalScore')||{}).textContent)||0;
      var idx=App.students.findIndex(function(s){ return s.id===student.id; });
      if(idx>=0){ App.students[idx].avg=avg; App.students[idx].grade=grade; App.students[idx].total=total; App.students[idx].status=avg>=40?'pass':'fail'; Store.set(KEY.STUDENTS,App.students); renderTable(App.students); refreshStats(); }
    }
    toast('Report card saved for '+fullName+'!');
  }
  
  function printReport(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var win=window.open('','_blank','width=900,height=800');
    if(!win){ toast('Allow pop-ups for this page, then try again.',true); return; }
    var css='*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter,sans-serif;background:#fff;padding:24px;color:#1E293B;}'
      +'.report-card-preview{max-width:740px;margin:0 auto;border:1px solid #E2E8F0;border-radius:12px;padding:26px;}'
      +'.rp-header{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:3px solid #3B82F6;margin-bottom:16px;}'
      +'.rp-logo-placeholder{width:58px;height:58px;border-radius:10px;background:rgba(59,130,246,.1);display:flex;align-items:center;justify-content:center;color:#3B82F6;font-size:1.6rem;flex-shrink:0;}'
      +'.rp-logo-placeholder img{width:54px;height:54px;object-fit:contain;border-radius:8px;}'
      +'.rp-school-info h2{font-family:Poppins,sans-serif;font-size:1.05rem;font-weight:700;color:#0F172A;}'
      +'.rp-school-info p{font-size:.76rem;color:#6B7280;margin-top:2px;}'
      +'.rp-term-badge{display:inline-block;margin-top:5px;background:rgba(59,130,246,.1);color:#2563EB;padding:3px 10px;border-radius:99px;font-size:.66rem;font-weight:700;}'
      +'.rp-student-info{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:16px;padding:12px 14px;background:#F8FAFC;border-radius:9px;border:1px solid #E2E8F0;}'
      +'.rp-si-row{display:flex;justify-content:space-between;font-size:.73rem;padding:3px 0;border-bottom:1px solid #F1F5F9;}'
      +'.rp-si-row:last-child{border:none;} .rp-si-row span{color:#6B7280;} .rp-si-row strong{color:#1E293B;font-weight:600;}'
      +'.rp-scores{width:100%;border-collapse:collapse;font-size:.73rem;margin-bottom:14px;}'
      +'.rp-scores th{background:#0F172A;color:#fff;padding:8px 7px;text-align:left;font-size:.63rem;text-transform:uppercase;letter-spacing:.4px;}'
      +'.rp-scores th:not(:first-child){text-align:center;} .rp-scores td{padding:7px;border-bottom:1px solid #F1F5F9;vertical-align:middle;}'
      +'.rp-scores tbody tr:nth-child(even){background:#F8FAFC;}'
      +'.rp-summary{display:flex;border:1.5px solid #E2E8F0;border-radius:9px;overflow:hidden;margin-bottom:14px;}'
      +'.rps-item{flex:1;text-align:center;padding:10px 6px;border-right:1px solid #E2E8F0;}'
      +'.rps-item:last-child{border:none;} .rps-item span{font-size:.62rem;color:#6B7280;text-transform:uppercase;letter-spacing:.3px;display:block;margin-bottom:3px;}'
      +'.rps-item strong{font-size:.95rem;font-weight:800;color:#3B82F6;}'
      +'.rp-comments{margin-bottom:16px;border:1px solid #E2E8F0;border-radius:9px;overflow:hidden;}'
      +'.rp-comment{font-size:.76rem;color:#374151;padding:9px 12px;border-bottom:1px solid #F1F5F9;line-height:1.6;}'
      +'.rp-comment:last-child{border:none;} .rp-comment strong{color:#0F172A;font-weight:600;display:inline-block;min-width:130px;}'
      +'.rp-footer{display:flex;justify-content:space-between;margin-top:22px;gap:20px;}'
      +'.rp-sig{text-align:center;flex:1;font-size:.7rem;color:#6B7280;} .sig-line{height:1.5px;background:#CBD5E1;margin-bottom:7px;}'
      +'@media print{@page{size:A4;margin:15mm;}body{padding:0;}.report-card-preview{border:none;border-radius:0;box-shadow:none;max-width:100%;padding:0;}}';
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Card</title>'
      +'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet"/>'
      +'<style>'+css+'</style></head><body>'+preview.outerHTML
      +'<script>window.onload=function(){window.print();};<\/script></body></html>');
    win.document.close();
  }
  
  /* ================================================================
     SETTINGS
     ================================================================ */
  function wireSettings(){
    qAll('.set-tab').forEach(function(tab){
      tab.addEventListener('click',function(){
        var t=tab.dataset.set;
        qAll('.set-tab').forEach(function(x){ x.classList.remove('active'); });
        tab.classList.add('active');
        qAll('.settings-panel').forEach(function(p){ p.classList.remove('active'); });
        var panel=document.getElementById('set-'+t); if(panel) panel.classList.add('active');
      });
    });
    qAll('.swatch').forEach(function(sw){
      sw.addEventListener('click',function(){
        qAll('.swatch').forEach(function(s){ s.classList.remove('active'); });
        sw.classList.add('active');
        document.documentElement.style.setProperty('--primary',sw.dataset.color);
        toast('Accent colour updated!');
      });
    });
    var s=Store.get(KEY.SETTINGS,{});
    if(s.schoolName){
      var ins=qAll('#set-school .form-input');
      if(ins[0]) ins[0].value=s.schoolName||'';
      if(ins[2]) ins[2].value=s.address||'';
      if(ins[3]) ins[3].value=s.phone||'';
      if(ins[4]) ins[4].value=s.email||'';
    }
  }
  function saveSettings(){
    var ins=qAll('#set-school .form-input');
    var s={schoolName:ins[0]?ins[0].value:'',address:ins[2]?ins[2].value:'',phone:ins[3]?ins[3].value:'',email:ins[4]?ins[4].value:'',session:ins[5]?ins[5].value:App.session,term:ins[6]?ins[6].value:App.term};
    Store.set(KEY.SETTINGS,s);
    setText('.school-name',s.schoolName||'Government High School');
    toast('Settings saved!');
  }
  
  /* ================================================================
     CHARTS
     ================================================================ */
  function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
  function textClr(){ return isDark()?'#8B949E':'#94A3B8'; }
  function gridClr(){ return isDark()?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)'; }
  
  var CR={};
  function reg(id,inst){ if(CR[id]){ try{ CR[id].destroy(); }catch(e){} } CR[id]=inst; }
  function refreshChartTheme(){ Object.keys(CR).forEach(function(k){ try{ CR[k].update(); }catch(e){} }); }
  
  function drawCharts(){
    if(App.chartsDrawn) return;
    if(typeof Chart==='undefined'){ setTimeout(drawCharts,200); return; }
    App.chartsDrawn=true;
    drawSparklines();
    drawPerfChart();
    drawGradeDonut();
  }
  
  function drawSparklines(){
    var DATA=[[30,35,32,40,38,42,48,45,50,55,52,58],[80,95,110,100,120,115,130,125,135,140,138,145],[65,68,70,67,71,72,74,70,73,75,72,78],[300,320,310,340,335,350,365,360,375,385,380,398],[95,90,88,85,92,89,86,90,87,85,84,84],[88,90,87,91,89,92,91,93,90,91,92,91]];
    var CLR=['#3B82F6','#7C3AED','#22C55E','#22C55E','#EF4444','#F59E0B'];
    for(var i=1;i<=6;i++){
      (function(n){
        var cv=document.getElementById('sparkline'+n); if(!cv) return;
        var ctx=cv.getContext('2d'), clr=CLR[n-1], pts=DATA[n-1];
        var g=ctx.createLinearGradient(0,0,0,40);
        g.addColorStop(0,clr+'44'); g.addColorStop(1,clr+'00');
        reg('sp'+n,new Chart(ctx,{
          type:'line',
          data:{labels:pts.map(function(){ return ''; }),datasets:[{data:pts,borderColor:clr,borderWidth:2,pointRadius:0,fill:true,backgroundColor:g,tension:0.4}]},
          options:{responsive:false,maintainAspectRatio:false,animation:{duration:700},plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}
        }));
      })(i);
    }
  }
  
  function drawPerfChart(){
    var cv=document.getElementById('performanceChart'); if(!cv) return;
    cv.style.height='240px'; cv.style.maxHeight='240px';
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    reg('perf',new Chart(cv.getContext('2d'),{
      type:'bar',
      data:{labels:['Maths','English','Physics','Chemistry','Biology','Economics','Agric','Civic'],
        datasets:[
          {label:'This Term',data:[68,74,62,59,71,78,65,73],backgroundColor:'#3B82F6CC',borderRadius:6,borderSkipped:false},
          {label:'Last Term',data:[62,70,58,55,68,74,61,70],backgroundColor:'#7C3AED66',borderRadius:6,borderSkipped:false}
        ]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:14,boxWidth:10}},tooltip:TT},
        scales:{
          x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{color:gridClr()}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:10},callback:function(v){ return v+'%'; }},border:{display:false},max:100,min:0}
        }}
    }));
  }
  
  function drawGradeDonut(){
    var cv=document.getElementById('gradeChart'); if(!cv) return;
    cv.style.height='200px'; cv.style.maxHeight='200px';
    reg('donut',new Chart(cv.getContext('2d'),{
      type:'doughnut',
      data:{labels:['A (80-100)','B (65-79)','C (50-64)','F (0-49)'],datasets:[{data:[22,31,29,18],backgroundColor:['#3B82F6','#22C55E','#F59E0B','#EF4444'],borderWidth:0,hoverOffset:8}]},
      options:{cutout:'70%',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}}}
    }));
  }
  
  function drawAnalyticsCharts(){
    if(App.analyticsDrawn) return;
    if(typeof Chart==='undefined'){ setTimeout(drawAnalyticsCharts,200); return; }
    App.analyticsDrawn=true;
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    function mk(id,cfg){
      var cv=document.getElementById(id); if(!cv) return;
      cv.style.display='block'; cv.style.width='100%'; cv.style.height='100%';
      reg(id,new Chart(cv.getContext('2d'),cfg));
    }
    mk('trendChart',{type:'line',
      data:{labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10'],datasets:[
        {label:'1st Term',data:[62,64,63,65,67,66,68,70,69,72],borderColor:'#3B82F6',backgroundColor:'#3B82F618',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#3B82F6'},
        {label:'2nd Term',data:[68,70,72,71,74,73,76,75,78,80],borderColor:'#7C3AED',backgroundColor:'#7C3AED18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#7C3AED'},
        {label:'3rd Term',data:[72,74,75,77,76,78,79,81,80,83],borderColor:'#22C55E',backgroundColor:'#22C55E18',fill:true,tension:0.4,pointRadius:4,pointBackgroundColor:'#22C55E'}
      ]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:14,boxWidth:10}},tooltip:{mode:'index',intersect:false,...TT}},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},min:55,max:90}}}
    });
    mk('subjectChart',{type:'bar',
      data:{labels:['Math','English','Physics','Chemistry','Biology','Econ'],datasets:[{label:'Avg %',data:[68,74,62,59,71,78],backgroundColor:['#3B82F6','#22C55E','#F59E0B','#7C3AED','#EF4444','#60A5FA'].map(function(c){ return c+'CC'; }),borderRadius:6,borderSkipped:false}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},max:100},y:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
    mk('attendanceChart',{type:'bar',
      data:{labels:['SS 1A','SS 1B','SS 2A','SS 2B','SS 3A','SS 3B','JSS 1','JSS 2','JSS 3'],datasets:[{label:'Attendance %',data:[93,88,95,82,91,79,94,87,85],
        backgroundColor:function(ctx){ var v=ctx.raw||0; return v>=90?'#22C55ECC':v>=80?'#F59E0BCC':'#EF4444CC'; },borderRadius:6,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{display:false}},y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},min:70,max:100}}}
    });
    mk('gradeBarChart',{type:'bar',
      data:{labels:['A (80-100)','B (65-79)','C (50-64)','D (45-49)','F (0-44)'],datasets:[{label:'Students',data:[108,153,143,40,38],backgroundColor:['#22C55E','#3B82F6','#F59E0B','#7C3AED','#EF4444'].map(function(c){ return c+'CC'; }),borderRadius:8,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}},y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
    icons();
  }
  
  /* ================================================================
     KEYBOARD SHORTCUTS
     ================================================================ */
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); var s=document.getElementById('globalSearch'); if(s) s.focus(); }
    if(e.key==='Escape'){ closeModal(); closeLogoutModal(); var ap=document.getElementById('adminProfileBtn'); if(ap) ap.classList.remove('open'); }
  });
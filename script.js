/* ================================================================
   EduTrack Pro — script.js
   Emirate Classic Academy | 2026/2027 Session
   Font Awesome icons | Full localStorage | No server needed
   ================================================================ */

   var App = {
    user:           null,
    students:       [],
    session:        '2026/2027',
    term:           '1st Term',
    chartsDrawn:    false,
    analyticsDrawn: false
  };
  
  var KEY = { STUDENTS:'et_students', RESULTS:'et_results', SETTINGS:'et_settings' };
  
  /* ── Seed students with 2026/2027 admission numbers ─────────────── */
  var SEED = [
    {id:'s1',name:'Amaka Okafor',  admNo:'ECA/2026/001',class:'SS 2A', gender:'Female',subjects:6,total:468,avg:78.0,grade:'B',remark:'Very Good',   status:'pass'},
    {id:'s2',name:'Ibrahim Musa',  admNo:'ECA/2026/002',class:'SS 3A', gender:'Male',  subjects:6,total:510,avg:85.0,grade:'A',remark:'Excellent',    status:'pass'},
    {id:'s3',name:'Chioma Eze',    admNo:'ECA/2026/003',class:'JSS 2B',gender:'Female',subjects:8,total:392,avg:49.0,grade:'F',remark:'Poor',         status:'fail'},
    {id:'s4',name:'Emeka Nwosu',   admNo:'ECA/2026/004',class:'SS 1A', gender:'Male',  subjects:7,total:427,avg:61.0,grade:'C',remark:'Good',         status:'pass'},
    {id:'s5',name:'Fatima Aliyu',  admNo:'ECA/2026/005',class:'SS 2B', gender:'Female',subjects:6,total:495,avg:82.5,grade:'A',remark:'Excellent',    status:'pass'},
    {id:'s6',name:'Tunde Adeyemi', admNo:'ECA/2026/006',class:'JSS 3A',gender:'Male',  subjects:8,total:356,avg:44.5,grade:'F',remark:'Poor',         status:'fail'},
    {id:'s7',name:'Grace Okoro',   admNo:'ECA/2026/007',class:'SS 3B', gender:'Female',subjects:6,total:451,avg:75.2,grade:'B',remark:'Very Good',    status:'pass'},
    {id:'s8',name:'Yusuf Bello',   admNo:'ECA/2026/008',class:'SS 1B', gender:'Male',  subjects:7,total:480,avg:68.6,grade:'B',remark:'Good',         status:'pass'}
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
  function uid(){ return 's'+Date.now().toString(36)+Math.random().toString(36).slice(2,5); }
  function q(sel){ return document.querySelector(sel); }
  function qAll(sel){ return document.querySelectorAll(sel); }
  function setText(sel,val){ var el=(typeof sel==='string')?q(sel):sel; if(el) el.textContent=(val===null||val===undefined)?'':String(val); }
  
  /* icons() — uses Font Awesome, not Lucide */
  function icons(){ /* Font Awesome loads via CDN, no init needed */ }
  
  function toast(msg,isErr){
    var el=document.getElementById('toast'), txt=document.getElementById('toastMsg');
    if(!el||!txt){ return; }
    txt.textContent=msg;
    el.style.background=isErr?'#991B1B':'#1E293B';
    el.classList.add('show');
    clearTimeout(el._t);
    el._t=setTimeout(function(){ el.classList.remove('show'); },3500);
  }
  
  /* ================================================================
     BOOT
     ================================================================ */
  document.addEventListener('DOMContentLoaded', function(){
  
    /* Get user from auth.js session */
    App.user = null;
    if(window.EduAuth) App.user = window.EduAuth.getUser();
    if(!App.user){
      try{
        var raw=localStorage.getItem('edutrack_session');
        if(raw) App.user=JSON.parse(raw);
      }catch(e){}
    }
  
    /* Guard - must be logged in */
    if(!App.user || App.user.loggedIn !== true){
      window.location.replace('login.html');
      return;
    }
  
    /* Set session/term from user data */
    if(App.user.session) App.session = App.user.session;
    if(App.user.term)    App.term    = App.user.term;
  
    fillUserUI();
    wireNav();
    wireSidebar();
    wireTopbar();
    wireTheme();
    wireModal();
    wireSettings();
    wireSearch();
    wireReportCard();
    loadStudents();
    loadTeachers();
  
    /* Draw charts after 600ms — gives CDN time to load */
    setTimeout(drawCharts, 600);
  });
  
  /* Safety net — retry charts if not drawn */
  window.addEventListener('load', function(){
    setTimeout(function(){ if(!App.chartsDrawn) drawCharts(); }, 500);
  });
  
  /* ================================================================
     FILL USER UI — name, school, greeting
     ================================================================ */
  function fillUserUI(){
    var u = App.user;
    if(!u) return;
  
    function g(k,fb){ var v=u[k]; return (v&&String(v).trim()&&String(v)!=='undefined')?String(v).trim():fb; }
  
    var name      = g('name',      'Administrator');
    var firstName = g('firstName', '');
    var role      = g('role',      'Staff');
    var school    = g('school',    'Emirate Classic Academy');
    var email     = g('email',     '');
    var sess      = g('session',   '2026/2027');
    var term      = g('term',      '1st Term');
  
    /* If firstName not saved, extract it now */
    if(!firstName){
      var skip=/^(mr|mrs|ms|miss|dr|prof|sir|chief|alhaji|alhaja)\.?$/i;
      var parts=name.split(/\s+/);
      for(var i=0;i<parts.length;i++){
        if(parts[i].length>1&&!skip.test(parts[i])){ firstName=parts[i]; break; }
      }
      if(!firstName) firstName=parts[parts.length-1]||'Admin';
    }
  
    App.session = sess;
    App.term    = term;
  
    /* Sidebar school name */
    qAll('.school-name').forEach(function(el){ el.textContent=school; });
    qAll('.school-session').forEach(function(el){ el.textContent=sess+' Session'; });
  
    /* School avatar initials */
    var av=q('.school-avatar');
    if(av){
      var init=school.split(' ').filter(function(w){ return w.length>2; }).slice(0,3).map(function(w){ return w[0].toUpperCase(); }).join('');
      av.textContent=init||'ECA';
    }
  
    /* Sidebar footer */
    setText('.user-name-sm', name);
    setText('.user-role-sm', role);
  
    /* Topbar */
    setText('.admin-name', firstName);
    setText('.admin-role', role);
  
    /* Dropdown */
    setText('.dh-name',  name);
    setText('.dh-email', email);
  
    /* Welcome heading — uses firstName */
    var wEl=q('#page-dashboard .page-title');
    if(wEl){
      var h=new Date().getHours();
      var gr=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
      wEl.innerHTML=gr+', '+firstName+' <i class="fas fa-hand-wave" style="color:#F59E0B"></i>';
    }
  
    /* Subtitle */
    var subEl=q('#page-dashboard .page-subtitle');
    if(subEl) subEl.textContent="Here's what's happening in your school today — "+term+', '+sess+' Session.';
  
    /* Page title */
    document.title='EduTrack Pro — '+school;
  }
  
  /* ================================================================
     NAVIGATION
     ================================================================ */
  function wireNav(){
    qAll('.nav-item[data-page]').forEach(function(item){
      item.addEventListener('click',function(e){
        e.preventDefault();
        goTo(item.getAttribute('data-page'),item);
      });
    });
    qAll('[data-page-link]').forEach(function(btn){
      btn.addEventListener('click',function(e){
        e.preventDefault();
        var pid=btn.getAttribute('data-page-link');
        goTo(pid,q('.nav-item[data-page="'+pid+'"]'));
      });
    });
    /* Logout — mousedown fires before dropdown close */
    qAll('[data-action="logout"]').forEach(function(el){
      el.addEventListener('mousedown',function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
      el.addEventListener('touchend', function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
    });
    var arrow=q('.user-arrow');
    if(arrow){
      arrow.style.cursor='pointer';
      arrow.addEventListener('mousedown',function(e){ e.stopPropagation(); doLogout(); });
      arrow.addEventListener('touchend', function(e){ e.preventDefault(); e.stopPropagation(); doLogout(); });
    }
  }
  
  function goTo(pageId,navEl){
    qAll('.page').forEach(function(p){ p.classList.remove('active'); });
    var target=document.getElementById('page-'+pageId);
    if(target){ target.classList.add('active'); }
    else{ var db=document.getElementById('page-dashboard'); if(db){ db.classList.add('active'); pageId='dashboard'; } }
    qAll('.nav-item').forEach(function(n){ n.classList.remove('active'); });
    if(navEl) navEl.classList.add('active');
    var LABELS={dashboard:'Dashboard',students:'Students',results:'Results',subjects:'Subjects',
      teachers:'Teachers',attendance:'Attendance',analytics:'Analytics',report:'Report Card',
      messages:'Messages',settings:'Settings',gallery:'Gallery'};
    setText('#bcCurrent',LABELS[pageId]||pageId);
    closeSidebar();
    if(pageId==='analytics') setTimeout(drawAnalyticsCharts,300);
    if(pageId==='teachers') { var t=Store.get(TEACHER_KEY,[]); renderTeachers(t); }
    if(pageId==='gallery')   { loadGallery(); }
    var pw=q('.page-wrapper'); if(pw) pw.scrollTop=0;
  }
  
  /* ================================================================
     SIDEBAR
     ================================================================ */
  function wireSidebar(){
    var btn=document.getElementById('hamburgerBtn');
    var sidebar=document.getElementById('sidebar');
    var overlay=document.getElementById('sidebarOverlay');
    if(btn) btn.addEventListener('click',function(){
      var open=sidebar.classList.toggle('mobile-open');
      if(overlay) overlay.classList.toggle('active',open);
    });
    if(overlay) overlay.addEventListener('click',closeSidebar);
  }
  function closeSidebar(){
    var s=document.getElementById('sidebar'),o=document.getElementById('sidebarOverlay');
    if(s) s.classList.remove('mobile-open');
    if(o) o.classList.remove('active');
  }
  
  /* ================================================================
     TOPBAR
     ================================================================ */
  function wireTopbar(){
    var btn=document.getElementById('adminProfileBtn');
    if(!btn) return;
    btn.addEventListener('click',function(e){ e.stopPropagation(); btn.classList.toggle('open'); });
    document.addEventListener('click',function(){ btn.classList.remove('open'); });
  }
  
  /* ================================================================
     THEME
     ================================================================ */
  function wireTheme(){
    applyTheme(localStorage.getItem('edutrack-theme')||'light');
    var t=document.getElementById('themeToggle');
    if(t) t.addEventListener('click',function(){
      applyTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark');
    });
  }
  function applyTheme(t){
    document.documentElement.setAttribute('data-theme',t);
    localStorage.setItem('edutrack-theme',t);
    /* Update theme toggle button icon */
    var icon=q('#themeToggle i');
    if(icon) icon.className=t==='dark'?'fas fa-sun':'fas fa-moon';
    /* Update dashboard topbar moon/sun icons */
    var moon=document.getElementById('themeIconDash');
    var sun =document.getElementById('themeIconDashSun');
    if(moon) moon.style.display=t==='dark' ?'none':'';
    if(sun)  sun.style.display =t==='light'?'none':'';
    setTimeout(refreshChartTheme,80);
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
    var ex=document.getElementById('logoutModal');
    if(ex){ ex.style.display='flex'; return; }
    var m=document.createElement('div');
    m.id='logoutModal';
    m.style.cssText='position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;';
    m.innerHTML='<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);border-radius:16px;padding:30px 32px;max-width:340px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.2);">'
      +'<div style="font-size:2.4rem;margin-bottom:10px;"><i class="fas fa-door-open" style="color:#EF4444"></i></div>'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1.1rem;font-weight:700;color:var(--text,#1E293B);margin-bottom:8px;">Logging Out?</h3>'
      +'<p style="font-size:.84rem;color:var(--muted,#64748B);margin-bottom:22px;line-height:1.6;">Are you sure you want to log out of EduTrack Pro?</p>'
      +'<div style="display:flex;gap:10px;">'
      +'<button onclick="closeLogoutModal()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);color:var(--text,#1E293B);font-weight:600;font-size:.88rem;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>'
      +'<button onclick="confirmLogout()" style="flex:1;padding:10px;border:none;border-radius:9px;background:#EF4444;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;"><i class="fas fa-sign-out-alt"></i> Log Out</button>'
      +'</div></div>';
    document.body.appendChild(m);
  }
  function closeLogoutModal(){ var m=document.getElementById('logoutModal'); if(m) m.style.display='none'; }
  function confirmLogout(){
    try{
      localStorage.removeItem('edutrack_session');
      localStorage.removeItem('edutrack_user_name');
      localStorage.removeItem('edutrack_user_role');
    }catch(e){}
    window.location.href='login.html';
  }
  
  /* ================================================================
     STAT CARDS
     ================================================================ */
  function setStat(key,value,suf){
    var el=q('[data-stat="'+key+'"]');
    if(!el) return;
    el.dataset.count=value;
    el.dataset.suffix=suf||'';
    el.textContent=value+(suf||'');
  }
  function animateStats(){
    qAll('.stat-value[data-count]').forEach(function(el){
      if(el._animTimer) clearInterval(el._animTimer);
      var target=parseFloat(el.dataset.count)||0;
      var suf=el.dataset.suffix||'';
      var cur=0, step=Math.ceil(target/60)||1;
      el._animTimer=setInterval(function(){
        cur=Math.min(cur+step,target);
        var disp=target>100?Math.round(cur).toLocaleString():(Number.isInteger(target)?Math.round(cur):cur.toFixed(1));
        el.textContent=disp+suf;
        if(cur>=target){
          clearInterval(el._animTimer);
          el.textContent=(target>100?target.toLocaleString():target)+suf;
        }
      },25);
    });
  }
  function refreshStats(){
    var s=App.students;
    var passed=s.filter(function(x){ return x.status==='pass'; }).length;
    var failed=s.filter(function(x){ return x.status==='fail'; }).length;
    var avgAll=s.length?(s.reduce(function(a,x){ return a+(parseFloat(x.avg)||0); },0)/s.length).toFixed(1):0;
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
    if(!saved||!saved.length){
      saved=SEED.map(function(s){ return Object.assign({},s); });
      Store.set(KEY.STUDENTS,saved);
    }
    App.students=saved;
    renderTable(App.students);
    refreshStats();
    refreshNavCounts();
  }
  function refreshNavCounts(){
    var c=App.students.length;
    var sn=q('.nav-item[data-page="students"] .nav-count');
    var rn=q('.nav-item[data-page="results"] .nav-count');
    if(sn) sn.textContent=c;
    if(rn) rn.textContent=c;
  }
  function buildRow(s,i){
    var init=s.name.split(' ').map(function(n){ return n[0]; }).join('').slice(0,2).toUpperCase();
    var color=COLORS[i%COLORS.length];
    return '<tr data-sid="'+s.id+'">'
      +'<td><div class="student-cell">'
      +'<div style="background:'+color+';width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:700;color:#fff;flex-shrink:0;">'+init+'</div>'
      +'<div><div class="student-name">'+s.name+'</div>'
      +'<div class="student-id">'+(s.admNo||'ECA/2026/—')+'</div>'
      +'</div></div></td>'
      +'<td>'+s.class+'</td>'
      +'<td>'+s.subjects+'</td>'
      +'<td>'+s.total+'</td>'
      +'<td>'+Number(s.avg).toFixed(1)+'%</td>'
      +'<td><span class="grade-badge '+gradeClass(s.grade)+'">'+s.grade+'</span></td>'
      +'<td><span class="status-badge status-'+s.status+'">'
      +'<span class="status-dot"></span>'+(s.status==='pass'?'Passed':'Failed')
      +'</span></td>'
      +'<td><div class="action-btns">'
      +'<button class="action-btn view" data-i="'+i+'" title="View"><i class="fas fa-eye"></i></button>'
      +'<button class="action-btn edit" data-i="'+i+'" title="Edit"><i class="fas fa-edit"></i></button>'
      +'<button class="action-btn del"  data-i="'+i+'" title="Delete"><i class="fas fa-trash-alt"></i></button>'
      +'</div></td></tr>';
  }
  function renderTable(list){
    var html=list.length
      ?list.map(buildRow).join('')
      :'<tr><td colspan="8" style="text-align:center;padding:40px;color:#64748B;"><i class="fas fa-user-slash" style="font-size:2rem;margin-bottom:10px;display:block;opacity:.3"></i>No students yet. Add students to get started.</td></tr>';
    ['resultsTableBody','fullResultsBody'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.innerHTML=html;
    });
    qAll('.action-btn.view').forEach(function(b){ b.addEventListener('click',function(){ openModal(parseInt(b.dataset.i),'view'); }); });
    qAll('.action-btn.edit').forEach(function(b){ b.addEventListener('click',function(){ openModal(parseInt(b.dataset.i),'edit'); }); });
    qAll('.action-btn.del' ).forEach(function(b){ b.addEventListener('click',function(){ deleteStudent(parseInt(b.dataset.i)); }); });
  }
  function deleteStudent(idx){
    var s=App.students[idx]; if(!s) return;
    showDeleteConfirm(s.name,function(){
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
      +'<div style="font-size:2.2rem;margin-bottom:10px;"><i class="fas fa-exclamation-triangle" style="color:#F59E0B"></i></div>'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;margin-bottom:8px;">Delete Student?</h3>'
      +'<p style="font-size:.83rem;color:#64748B;margin-bottom:20px;">Delete <strong>'+name+'</strong>? This cannot be undone.</p>'
      +'<div style="display:flex;gap:10px;">'
      +'<button id="dcCancel" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);font-weight:600;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>'
      +'<button id="dcConfirm" style="flex:1;padding:10px;border:none;border-radius:9px;background:#EF4444;color:#fff;font-weight:700;cursor:pointer;"><i class="fas fa-trash-alt"></i> Delete</button>'
      +'</div></div>';
    document.body.appendChild(m);
    document.getElementById('dcCancel').onclick=function(){ document.body.removeChild(m); };
    document.getElementById('dcConfirm').onclick=function(){ document.body.removeChild(m); cb(); };
  }
  
  /* ================================================================
     SEARCH & FILTER
     ================================================================ */
  function wireSearch(){
    var srch=document.getElementById('tableSearch');
    if(srch) srch.addEventListener('input',function(){
      var qv=srch.value.toLowerCase();
      qAll('#resultsTableBody tr').forEach(function(row){
        var n=(row.querySelector('.student-name')||{}).textContent||'';
        row.style.display=n.toLowerCase().indexOf(qv)>-1?'':'none';
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
    sv('modalStudentName',s.name); sv('modalClass',s.class);
    sv('modalTotal',s.total); sv('modalAvg',s.avg);
    sv('modalGrade',s.grade); sv('modalRemark',s.remark||'');
    document.getElementById('resultModal').dataset.idx=idx;
    setText('.modal-title',mode==='view'?'View Result':'Edit Result');
    var sb=document.getElementById('modalSave'); if(sb) sb.style.display=mode==='view'?'none':'';
    document.getElementById('modalBackdrop').classList.add('open');
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
     REPORT CARD — Nigerian Subjects by Level
     ================================================================ */
  var RC_SUBJECTS = {
    SS: [
      'English Language','Mathematics','Biology','Chemistry','Physics',
      'Agricultural Science','Economics','Government','Literature in English',
      'Civic Education','Geography','Further Mathematics','Commerce',
      'Financial Accounting','Computer Studies','Christian Religious Studies',
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
      'Verbal Reasoning','Quantitative Reasoning',
      'Cultural & Creative Arts','Music','Home Economics'
    ]
  };
  var RC_DEFAULTS = { SS:10, JSS:10, PRIMARY:10 };
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
    if(avg>=75) return first+' has demonstrated outstanding academic excellence this term. Keep up the brilliant work!';
    if(avg>=65) return first+' has shown very commendable performance. With continued effort, greater heights can be reached.';
    if(avg>=55) return first+' performed well this term. More dedication will yield even better results.';
    if(avg>=45) return first+' showed fair performance. Greater focus and consistent study will yield better results.';
    if(avg>=40) return first+' needs to improve. More seriousness with academic work is required next term.';
    return first+' performed below expectation. Urgent improvement is needed. Parents should monitor academic progress.';
  }
  function autoPrincipalComment(avg,name){
    var first=(name||'This student').split(' ')[0];
    if(avg>=75) return 'An impressive performance. '+first+' is a pride of Emirate Classic Academy. Maintain this standard!';
    if(avg>=65) return 'A very good result. '+first+' should continue working hard and aim for excellence.';
    if(avg>=55) return 'A satisfactory performance. '+first+' is encouraged to put in more effort next term.';
    if(avg>=45) return 'An average performance. '+first+' must be more dedicated. Parental support is advised.';
    return 'Performance is below standard. Immediate academic intervention and parental involvement required.';
  }
  
  function wireReportCard(){
    resetSubjectsForLevel('SS');
  
    var clsEl=document.getElementById('rc_class');
    if(clsEl) clsEl.addEventListener('change',function(){
      resetSubjectsForLevel(getLevel(clsEl.value));
      updatePreview();
    });
  
    var addBtn=document.getElementById('btnAddSubject');
    if(addBtn) addBtn.addEventListener('click',showAddSubjectModal);
  
    /* Logo upload */
    var area=document.getElementById('logoUploadArea');
    var input=document.getElementById('logoUpload');
    if(area) area.addEventListener('click',function(){ if(input) input.click(); });
    if(input) input.addEventListener('change',function(){
      if(!input.files[0]) return;
      var reader=new FileReader();
      reader.onload=function(e){
        var logo=document.getElementById('prev_logo');
        if(logo) logo.innerHTML='<img src="'+e.target.result+'" style="width:52px;height:52px;object-fit:contain;border-radius:8px;"/>';
        var txt=document.getElementById('logoUploadText'); if(txt) txt.textContent='Logo uploaded';
        toast('School logo uploaded!');
      };
      reader.readAsDataURL(input.files[0]);
    });
  
    /* Admission number lookup */
    var admEl=document.getElementById('rc_admNo');
    if(admEl) admEl.addEventListener('blur',function(){
      var v=admEl.value.trim().toUpperCase(); if(!v) return;
      var found=App.students.find(function(s){ return (s.admNo||'').toUpperCase()===v; });
      if(found){
        var fn=document.getElementById('rc_firstName');
        var ln=document.getElementById('rc_lastName');
        var pts=found.name.split(' ');
        if(fn) fn.value=pts[0]||'';
        if(ln) ln.value=pts.slice(1).join(' ')||'';
        var cls=document.getElementById('rc_class');
        if(cls){ cls.value=found.class; resetSubjectsForLevel(getLevel(found.class)); }
        var gen=document.getElementById('rc_gender'); if(gen&&found.gender) gen.value=found.gender;
        loadSavedScores(found.id); updatePreview();
        toast('Student loaded: '+found.name);
      } else { toast('No student found with that admission number.',true); }
    });
  
    wireCommentManual();
  
    /* Wire all form fields to live preview */
    ['rc_schoolName','rc_schoolAddr','rc_session','rc_term',
     'rc_firstName','rc_lastName','rc_admNo','rc_gender',
     'rc_dob','rc_position','rc_classSize',
     'rc_teacherComment','rc_principalComment','rc_nextTerm'
    ].forEach(function(id){
      var el=document.getElementById(id);
      if(el){ el.addEventListener('input',updatePreview); el.addEventListener('change',updatePreview); }
    });
  
    /* Buttons */
    var pb=document.getElementById('btnPrintReport');
    if(pb) pb.addEventListener('click',printReport);
    var sb=document.getElementById('btnSaveReport');
    if(sb) sb.addEventListener('click',function(){ saveReportCard(); setTimeout(downloadPDF,400); });
    var ib=document.getElementById('btnImageReport');
    if(ib) ib.addEventListener('click',downloadImage);
    var shb=document.getElementById('btnShareReport');
    if(shb) shb.addEventListener('click',shareReport);
  
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
    activeSubjects=pool.slice(0,RC_DEFAULTS[level]||10).slice();
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
        +'<td><button class="rm-subj-btn" data-row="'+i+'" title="Remove subject" style="background:rgba(239,68,68,.1);color:#EF4444;border:none;border-radius:6px;width:26px;height:26px;cursor:pointer;font-size:.78rem;display:flex;align-items:center;justify-content:center;"><i class="fas fa-times"></i></button></td>'
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
      ?available.map(function(s){
          return '<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;font-size:.83rem;">'
            +'<input type="checkbox" value="'+s+'" style="accent-color:#3B82F6;width:15px;height:15px;cursor:pointer;"/>'
            +'<span>'+s+'</span></label>';
        }).join('')
      :'<p style="color:#64748B;font-size:.83rem;padding:10px;">All subjects already added.</p>';
    listHTML+='<div style="border-top:1px solid var(--border,#E2E8F0);margin-top:12px;padding-top:12px;">'
      +'<p style="font-size:.74rem;color:#64748B;margin-bottom:6px;font-weight:600;"><i class="fas fa-plus-circle"></i> TYPE A CUSTOM SUBJECT</p>'
      +'<input type="text" id="customSubjInput" placeholder="e.g. Technical Drawing" style="width:100%;padding:8px 10px;border:1.5px solid var(--border,#E2E8F0);border-radius:8px;font-size:.83rem;color:var(--text,#1E293B);background:var(--bg,#F8FAFC);outline:none;"/></div>';
    m.innerHTML='<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);border-radius:16px;padding:24px;max-width:420px;width:100%;max-height:80vh;overflow-y:auto;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;"><i class="fas fa-book-open" style="color:#3B82F6"></i> Add Subjects</h3>'
      +'<button onclick="document.getElementById(\'addSubjModal\').remove()" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748B;"><i class="fas fa-times"></i></button></div>'
      +'<div style="display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto;margin-bottom:10px;">'+listHTML+'</div>'
      +'<div style="display:flex;gap:10px;margin-top:14px;">'
      +'<button onclick="document.getElementById(\'addSubjModal\').remove()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);font-weight:600;font-size:.85rem;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>'
      +'<button id="doAddSubj" style="flex:1;padding:10px;border:none;border-radius:9px;background:#3B82F6;color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;"><i class="fas fa-plus"></i> Add Selected</button>'
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
      var has=ca1||ca2||mid||exam;
      var tc=document.getElementById('rt_'+i), gc=document.getElementById('rg_'+i), cc=document.getElementById('rc_'+i);
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
      var ln=(document.getElementById('rc_lastName')||{}).value||'';
      var name=(fn+' '+ln).trim();
      var tc2=document.getElementById('rc_teacherComment');
      var pc2=document.getElementById('rc_principalComment');
      if(tc2&&(!tc2.dataset.manual||tc2.dataset.manual==='0')) tc2.value=autoTeacherComment(parseFloat(avg),name);
      if(pc2&&(!pc2.dataset.manual||pc2.dataset.manual==='0')) pc2.value=autoPrincipalComment(parseFloat(avg),name);
    }
  }
  
  function updatePreview(){
    function gv(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
    function st(id,v){ var e=document.getElementById(id); if(e) e.textContent=v||'--'; }
  
    st('prev_schoolName',gv('rc_schoolName')||'Emirate Classic Academy');
    st('prev_schoolAddr',gv('rc_schoolAddr')||'School Address');
    var sess=gv('rc_session')||'2026/2027', term=gv('rc_term')||'1st Term';
    st('prev_termBadge',term+' Report Card -- '+sess);
    st('prev_session',sess); st('prev_term',term);
  
    var fn=gv('rc_firstName'), ln=gv('rc_lastName');
    st('prev_name',(fn+' '+ln).trim()||'--');
    st('prev_admNo',gv('rc_admNo')||'--');
    st('prev_class',gv('rc_class')||'--');
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
        html+='<tr>'
          +'<td style="font-size:.72rem;font-weight:500">'+activeSubjects[i]+'</td>'
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
    if(prevTb) prevTb.innerHTML=html||'<tr><td colspan="8" style="text-align:center;color:#94A3B8;padding:14px;font-size:.78rem;">Enter scores on the left to see preview</td></tr>';
  
    var avg=count?(grand/count).toFixed(1):'--';
    st('prev_total',count?grand:'--');
    st('prev_avg',count?avg+'%':'--');
    st('prev_grade',count?calcGrade100(parseFloat(avg)):'--');
    st('prev_teacherComment',gv('rc_teacherComment')||'--');
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
    var ln=(document.getElementById('rc_lastName')||{}).value||'';
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
    var other=Store.get(KEY.RESULTS,[]).filter(function(r){
      return !(r.sid===sid&&r.session===App.session&&r.term===App.term);
    });
    Store.set(KEY.RESULTS,other.concat(results));
    if(student){
      var avg=parseFloat((document.getElementById('avgScore')||{}).textContent)||0;
      var grade=(document.getElementById('overallGrade')||{}).textContent||'--';
      var total=parseInt((document.getElementById('totalScore')||{}).textContent)||0;
      var idx=App.students.findIndex(function(s){ return s.id===student.id; });
      if(idx>=0){
        App.students[idx].avg=avg; App.students[idx].grade=grade;
        App.students[idx].total=total; App.students[idx].status=avg>=40?'pass':'fail';
        Store.set(KEY.STUDENTS,App.students); renderTable(App.students); refreshStats();
      }
    }
    toast('Report card saved for '+fullName+'!');
  }
  
  /* ================================================================
     PRINT
     ================================================================ */
  function printReport(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var win=window.open('','_blank','width=900,height=800');
    if(!win){ toast('Allow pop-ups for this page, then try again.',true); return; }
    var css='*{box-sizing:border-box;margin:0;padding:0;}body{font-family:Inter,sans-serif;background:#fff;padding:24px;color:#1E293B;}'
      +'.report-card-preview{max-width:740px;margin:0 auto;border:1px solid #E2E8F0;border-radius:12px;padding:26px;}'
      +'.rp-header{display:flex;align-items:center;gap:14px;padding-bottom:14px;border-bottom:3px solid #1E3A5F;margin-bottom:16px;}'
      +'.rp-logo-placeholder{width:60px;height:60px;border-radius:10px;background:#1E3A5F;display:flex;align-items:center;justify-content:center;color:#fff;font-family:Poppins,sans-serif;font-size:1.1rem;font-weight:800;flex-shrink:0;}'
      +'.rp-logo-placeholder img{width:54px;height:54px;object-fit:contain;border-radius:8px;}'
      +'.rp-school-info h2{font-family:Poppins,sans-serif;font-size:1.05rem;font-weight:700;color:#0F172A;}'
      +'.rp-school-info p{font-size:.76rem;color:#6B7280;margin-top:2px;}'
      +'.rp-term-badge{display:inline-block;margin-top:5px;background:rgba(30,58,95,.1);color:#1E3A5F;padding:3px 10px;border-radius:99px;font-size:.66rem;font-weight:700;}'
      +'.rp-student-info{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:16px;padding:12px 14px;background:#F8FAFC;border-radius:9px;border:1px solid #E2E8F0;}'
      +'.rp-si-row{display:flex;justify-content:space-between;font-size:.73rem;padding:3px 0;border-bottom:1px solid #F1F5F9;}'
      +'.rp-si-row:last-child{border:none;} .rp-si-row span{color:#6B7280;} .rp-si-row strong{color:#1E293B;font-weight:600;}'
      +'.rp-scores{width:100%;border-collapse:collapse;font-size:.73rem;margin-bottom:14px;}'
      +'.rp-scores th{background:#1E3A5F;color:#fff;padding:8px 7px;text-align:left;font-size:.63rem;text-transform:uppercase;letter-spacing:.4px;}'
      +'.rp-scores th:not(:first-child){text-align:center;} .rp-scores td{padding:7px;border-bottom:1px solid #F1F5F9;vertical-align:middle;}'
      +'.rp-scores tbody tr:nth-child(even){background:#F8FAFC;}'
      +'.rp-summary{display:flex;border:1.5px solid #E2E8F0;border-radius:9px;overflow:hidden;margin-bottom:14px;}'
      +'.rps-item{flex:1;text-align:center;padding:10px 6px;border-right:1px solid #E2E8F0;}'
      +'.rps-item:last-child{border:none;} .rps-item span{font-size:.62rem;color:#6B7280;text-transform:uppercase;letter-spacing:.3px;display:block;margin-bottom:3px;}'
      +'.rps-item strong{font-size:.95rem;font-weight:800;color:#1E3A5F;}'
      +'.rp-comments{margin-bottom:16px;border:1px solid #E2E8F0;border-radius:9px;overflow:hidden;}'
      +'.rp-comment{font-size:.76rem;color:#374151;padding:9px 12px;border-bottom:1px solid #F1F5F9;line-height:1.6;}'
      +'.rp-comment:last-child{border:none;} .rp-comment strong{color:#0F172A;font-weight:600;display:inline-block;min-width:130px;}'
      +'.rp-footer{display:flex;justify-content:space-between;margin-top:22px;gap:20px;}'
      +'.rp-sig{text-align:center;flex:1;font-size:.7rem;color:#6B7280;} .sig-line{height:1.5px;background:#CBD5E1;margin-bottom:7px;}'
      +'@media print{@page{size:A4;margin:15mm;}body{padding:0;}.report-card-preview{border:none;box-shadow:none;max-width:100%;padding:0;}}';
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Card - Emirate Classic Academy</title>'
      +'<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet"/>'
      +'<style>'+css+'</style></head><body>'+preview.outerHTML
      +'<script>window.onload=function(){window.print();};<\/script></body></html>');
    win.document.close();
  }
  
  /* ================================================================
     DOWNLOAD PDF
     ================================================================ */
  function downloadPDF(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var fn=(document.getElementById('rc_firstName')||{}).value||'Student';
    var ln=(document.getElementById('rc_lastName')||{}).value||'';
    var name=(fn+' '+ln).trim().replace(/\s+/g,'_');
    var filename='ReportCard_'+name+'_ECA_2026.pdf';
    var btn=document.getElementById('btnSaveReport');
    var orig=btn?btn.innerHTML:'';
    if(btn){ btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Generating...'; btn.disabled=true; }
    if(typeof html2canvas==='undefined'||typeof window.jspdf==='undefined'){
      toast('PDF library not loaded. Check internet connection.',true);
      if(btn){ btn.innerHTML=orig; btn.disabled=false; } return;
    }
    html2canvas(preview,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false}).then(function(canvas){
      var imgData=canvas.toDataURL('image/png');
      var pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4'});
      var pw=pdf.internal.pageSize.getWidth(), ph=pdf.internal.pageSize.getHeight(), mg=10;
      var iw=pw-(mg*2), ih=(canvas.height*iw)/canvas.width;
      if(ih>ph-(mg*2)) ih=ph-(mg*2);
      pdf.addImage(imgData,'PNG',mg,mg,iw,ih);
      pdf.save(filename);
      toast('PDF saved to Downloads folder!');
      if(btn){ btn.innerHTML=orig; btn.disabled=false; }
    }).catch(function(err){
      toast('PDF failed: '+err.message,true);
      if(btn){ btn.innerHTML=orig; btn.disabled=false; }
    });
  }
  
  /* ================================================================
     DOWNLOAD AS IMAGE (PNG) — user can save to gallery from Downloads
     ================================================================ */
  function downloadImage(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var fn=(document.getElementById('rc_firstName')||{}).value||'Student';
    var ln=(document.getElementById('rc_lastName')||{}).value||'';
    var filename='ReportCard_'+(fn+' '+ln).trim().replace(/\s+/g,'_')+'_ECA.png';
    var btn=document.getElementById('btnImageReport');
    var orig=btn?btn.innerHTML:'';
    if(btn){ btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Saving...'; btn.disabled=true; }
    if(typeof html2canvas==='undefined'){
      toast('Image library not loaded.',true);
      if(btn){ btn.innerHTML=orig; btn.disabled=false; } return;
    }
    html2canvas(preview,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false}).then(function(canvas){
      var link=document.createElement('a');
      link.href=canvas.toDataURL('image/png');
      link.download=filename;
      link.style.display='none';
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      toast('Image saved! Open Files > Downloads to move to gallery.');
      if(btn){ btn.innerHTML=orig; btn.disabled=false; }
    }).catch(function(err){
      toast('Image failed: '+err.message,true);
      if(btn){ btn.innerHTML=orig; btn.disabled=false; }
    });
  }
  
  /* ================================================================
     SHARE — native share sheet on phone
     ================================================================ */
  function shareReport(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var fn=(document.getElementById('rc_firstName')||{}).value||'Student';
    var ln=(document.getElementById('rc_lastName')||{}).value||'';
    var name=(fn+' '+ln).trim();
    var term=(document.getElementById('rc_term')||{}).value||'1st Term';
    var sess=(document.getElementById('rc_session')||{}).value||'2026/2027';
    var btn=document.getElementById('btnShareReport');
    var orig=btn?btn.innerHTML:'';
    if(btn){ btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Preparing...'; btn.disabled=true; }
    if(typeof html2canvas==='undefined'){ shareText(name,term,sess); if(btn){ btn.innerHTML=orig; btn.disabled=false; } return; }
    html2canvas(preview,{scale:2,useCORS:true,backgroundColor:'#ffffff',logging:false}).then(function(canvas){
      canvas.toBlob(function(blob){
        var file=new File([blob],'ReportCard_'+name.replace(/\s+/g,'_')+'.png',{type:'image/png'});
        if(navigator.canShare&&navigator.canShare({files:[file]})){
          navigator.share({files:[file],title:name+' - Report Card',text:name+' Report Card ('+term+', '+sess+') — Emirate Classic Academy'})
            .then(function(){ toast('Shared successfully!'); })
            .catch(function(err){ if(err.name!=='AbortError') shareText(name,term,sess); });
        } else { shareText(name,term,sess); }
        if(btn){ btn.innerHTML=orig; btn.disabled=false; }
      },'image/png');
    }).catch(function(){ shareText(name,term,sess); if(btn){ btn.innerHTML=orig; btn.disabled=false; } });
  }
  function shareText(name,term,sess){
    var text=name+' Report Card\n'+term+', '+sess+'\nEmirate Classic Academy\nGenerated by EduTrack Pro';
    if(navigator.share){
      navigator.share({title:name+' Report Card',text:text}).then(function(){ toast('Shared!'); }).catch(function(){ copyClip(text); });
    } else { copyClip(text); }
  }
  function copyClip(text){
    navigator.clipboard.writeText(text).then(function(){ toast('Copied to clipboard!'); }).catch(function(){ toast('Use Download PDF to share.',true); });
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
  }
  function saveSettings(){
    var ins=qAll('#set-school .form-input');
    var s={schoolName:ins[0]?ins[0].value:'',address:ins[2]?ins[2].value:'',phone:ins[3]?ins[3].value:'',email:ins[4]?ins[4].value:''};
    Store.set(KEY.SETTINGS,s);
    qAll('.school-name').forEach(function(el){ el.textContent=s.schoolName||'Emirate Classic Academy'; });
    toast('Settings saved!');
  }
  
  /* ================================================================
     CHARTS — ALL use maintainAspectRatio:false + explicit heights
     ================================================================ */
  function isDark(){ return document.documentElement.getAttribute('data-theme')==='dark'; }
  function textClr(){ return isDark()?'#8B949E':'#94A3B8'; }
  function gridClr(){ return isDark()?'rgba(255,255,255,.06)':'rgba(0,0,0,.05)'; }
  var CR={};
  function reg(id,inst){ if(CR[id]){ try{ CR[id].destroy(); }catch(e){} } CR[id]=inst; }
  function refreshChartTheme(){ Object.keys(CR).forEach(function(k){ try{ CR[k].update(); }catch(e){}  }); }
  
  function drawCharts(){
    if(App.chartsDrawn) return;
    if(typeof Chart==='undefined'){ setTimeout(drawCharts,300); return; }
    App.chartsDrawn=true;
    drawSparklines();
    drawPerfChart();
    drawGradeDonut();
  }
  
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
        var cv=document.getElementById('sparkline'+n); if(!cv) return;
        var ctx=cv.getContext('2d'), clr=CLR[n-1], pts=DATA[n-1];
        var g=ctx.createLinearGradient(0,0,0,40);
        g.addColorStop(0,clr+'44'); g.addColorStop(1,clr+'00');
        reg('sp'+n,new Chart(ctx,{
          type:'line',
          data:{labels:pts.map(function(){ return ''; }),datasets:[{data:pts,borderColor:clr,borderWidth:2,pointRadius:0,fill:true,backgroundColor:g,tension:0.4}]},
          options:{responsive:false,maintainAspectRatio:false,animation:{duration:800},plugins:{legend:{display:false},tooltip:{enabled:false}},scales:{x:{display:false},y:{display:false}}}
        }));
      })(i);
    }
  }
  
  function drawPerfChart(){
    var cv=document.getElementById('performanceChart'); if(!cv) return;
    var wrap=cv.parentElement;
    if(wrap){ wrap.style.position='relative'; wrap.style.height='260px'; }
    cv.style.height='100%';
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    reg('perf',new Chart(cv.getContext('2d'),{
      type:'bar',
      data:{
        labels:['Maths','English','Physics','Chemistry','Biology','Economics','Agric','Civic'],
        datasets:[
          {label:'This Term',data:[68,74,62,59,71,78,65,73],backgroundColor:'#3B82F6CC',borderRadius:6,borderSkipped:false},
          {label:'Last Term',data:[62,70,58,55,68,74,61,70],backgroundColor:'#7C3AED66',borderRadius:6,borderSkipped:false}
        ]
      },
      options:{
        responsive:true,maintainAspectRatio:false,
        plugins:{
          legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:14,boxWidth:10}},
          tooltip:TT
        },
        scales:{
          x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{color:gridClr()}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:10},callback:function(v){ return v+'%'; }},border:{display:false},max:100,min:0}
        }
      }
    }));
  }
  
  function drawGradeDonut(){
    var cv=document.getElementById('gradeChart'); if(!cv) return;
    var wrap=cv.parentElement;
    if(wrap){ wrap.style.position='relative'; wrap.style.height='220px'; }
    cv.style.height='100%';
    reg('donut',new Chart(cv.getContext('2d'),{
      type:'doughnut',
      data:{
        labels:['A (75-100)','B (65-74)','C (55-64)','D/E (40-54)','F (0-39)'],
        datasets:[{data:[20,28,30,12,10],backgroundColor:['#22C55E','#3B82F6','#F59E0B','#F97316','#EF4444'],borderWidth:0,hoverOffset:8}]
      },
      options:{
        cutout:'68%',responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:{backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8}}
      }
    }));
  }
  
  function drawAnalyticsCharts(){
    if(App.analyticsDrawn) return;
    if(typeof Chart==='undefined'){ setTimeout(drawAnalyticsCharts,300); return; }
    App.analyticsDrawn=true;
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    function mk(id,cfg){
      var cv=document.getElementById(id); if(!cv) return;
      var wrap=cv.parentElement;
      if(wrap&&wrap.tagName==='DIV'){ wrap.style.position='relative'; wrap.style.height='220px'; }
      cv.style.display='block'; cv.style.width='100%'; cv.style.height='100%';
      reg(id,new Chart(cv.getContext('2d'),cfg));
    }
    mk('trendChart',{type:'line',
      data:{labels:['Wk1','Wk2','Wk3','Wk4','Wk5','Wk6','Wk7','Wk8','Wk9','Wk10'],
        datasets:[
          {label:'1st Term',data:[62,64,63,65,67,66,68,70,69,72],borderColor:'#3B82F6',backgroundColor:'#3B82F618',fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#3B82F6'},
          {label:'2nd Term',data:[68,70,72,71,74,73,76,75,78,80],borderColor:'#7C3AED',backgroundColor:'#7C3AED18',fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#7C3AED'},
          {label:'3rd Term',data:[72,74,75,77,76,78,79,81,80,83],borderColor:'#22C55E',backgroundColor:'#22C55E18',fill:true,tension:0.4,pointRadius:3,pointBackgroundColor:'#22C55E'}
        ]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{position:'top',labels:{color:textClr(),font:{family:'Inter',size:11},padding:12,boxWidth:10}},tooltip:{mode:'index',intersect:false,...TT}},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},min:55,max:90}}}
    });
    mk('subjectChart',{type:'bar',
      data:{labels:['Maths','English','Physics','Chemistry','Biology','Econ'],
        datasets:[{label:'Class Avg %',data:[68,74,62,59,71,78],
          backgroundColor:['#3B82F6','#22C55E','#F59E0B','#7C3AED','#EF4444','#60A5FA'].map(function(c){ return c+'CC'; }),
          borderRadius:6,borderSkipped:false}]},
      options:{indexAxis:'y',responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},max:100},
          y:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
    mk('attendanceChart',{type:'bar',
      data:{labels:['SS 1A','SS 1B','SS 2A','SS 2B','SS 3A','SS 3B','JSS 1','JSS 2','JSS 3'],
        datasets:[{label:'Attendance %',data:[93,88,95,82,91,79,94,87,85],
          backgroundColor:function(ctx){ var v=ctx.raw||0; return v>=90?'#22C55ECC':v>=80?'#F59E0BCC':'#EF4444CC'; },
          borderRadius:6,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{display:false}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11},callback:function(v){ return v+'%'; }},border:{display:false},min:70,max:100}}}
    });
    mk('gradeBarChart',{type:'bar',
      data:{labels:['A (75-100)','B (65-74)','C (55-64)','D/E','F (below 40)'],
        datasets:[{label:'Students',data:[85,120,140,45,42],
          backgroundColor:['#22C55E','#3B82F6','#F59E0B','#F97316','#EF4444'].map(function(c){ return c+'CC'; }),
          borderRadius:8,borderSkipped:false}]},
      options:{responsive:true,maintainAspectRatio:false,
        plugins:{legend:{display:false},tooltip:TT},
        scales:{x:{grid:{display:false},ticks:{color:textClr(),font:{family:'Inter',size:10}},border:{display:false}},
          y:{grid:{color:gridClr()},ticks:{color:textClr(),font:{family:'Inter',size:11}},border:{display:false}}}}
    });
  }
  
  /* ================================================================
     KEYBOARD SHORTCUTS
     ================================================================ */
  document.addEventListener('keydown',function(e){
    if((e.metaKey||e.ctrlKey)&&e.key==='k'){ e.preventDefault(); var s=document.getElementById('globalSearch'); if(s) s.focus(); }
    if(e.key==='Escape'){ closeModal(); closeLogoutModal(); var ap=document.getElementById('adminProfileBtn'); if(ap) ap.classList.remove('open'); }
  });
  
  /* ================================================================
     TEACHERS MODULE
     ================================================================ */
  
  var TEACHER_COLORS = [
    '#3B82F6','#7C3AED','#22C55E','#F59E0B',
    '#EF4444','#60A5FA','#EC4899','#14B8A6',
    '#F97316','#8B5CF6'
  ];
  
  var TEACHER_KEY = 'et_teachers';
  
  /* Default teachers seeded from the USERS in login.html */
  var DEFAULT_TEACHERS = [
    {
      id: 't1',
      name:     'Mr. E Adeyemi Omotosho',
      role:     'Super Admin',
      email:    'admi*******ng',
      phone:    '',
      classes:  ['SS 2A','SS 3A'],
      status:   'active',
      joined:   '2023'
    },
    {
      id: 't2',
      name:     'Miss Maryam ',
      role:     'Teacher',
      email:    'marya********gail.com',
      phone:    '',
      classes:  ['SS 1A','SS 1B'],
      status:   'active',
      joined:   '2024'
    },
    {
      id: 't3',
      name:     'Miss Hauwa',
      role:     'Teacher',
      email:    'hau********gmail.com',
      phone:    '',
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2024'
    },
    {
      id: 't4',
      name:     'Manager Leakan',
      role:     'Teacher',
      email:    'veri********gmail.com',
      phone:    '',
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2024'
    },
    {
      id: 't5',
      name:     'Manager Yisa',
      role:     'Teacher',
      email:    'yis********gmail.com',
      phone:    '',
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2024'
    },
    {
      id: 't6',
      name:     'Manager Divine',
      role:     'Teacher',
      email:    'aka********gmail.com',
      phone:    '',
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2024'
    },
    {
      id: 't7',
      name:     'Manager Emmanuel',
      role:     'Teacher',
      email:    'emm********gmail.com',
      phone:    '',
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2024'
    },
  ];
  
  /* Load teachers — use saved or seed defaults */
  function loadTeachers(){
    var saved = Store.get(TEACHER_KEY, []);
  
    /* ── ALWAYS merge DEFAULT_TEACHERS into saved list ────────────────
       This means: any name you add to DEFAULT_TEACHERS in the code
       will appear on screen even if localStorage already has data.
       Manually added teachers (from the + Add button) are kept too.
    ──────────────────────────────────────────────────────────────── */
    DEFAULT_TEACHERS.forEach(function(def){
      var exists = saved.find(function(s){ return s.id === def.id; });
      if(!exists){
        /* New teacher in DEFAULT_TEACHERS — add them */
        saved.push(Object.assign({}, def));
      } else {
        /* Already exists — update name/email/role from code
           but keep any manual edits the user made on phone/subjects/classes */
        exists.name  = def.name;
        exists.email = def.email;
        exists.role  = def.role;
      }
    });
  
    /* Remove teachers whose ID is in a removal list (optional future feature) */
    /* Save the merged list back */
    Store.set(TEACHER_KEY, saved);
  
    renderTeachers(saved);
  
    /* Update nav badge count */
    var tn = q('.nav-item[data-page="teachers"] .nav-count');
    if(tn) tn.textContent = saved.length;
  }
  
  /* ── Reset teachers back to DEFAULT_TEACHERS list ──────────────── */
  function resetTeachers(){
    showDeleteConfirm('all manually added teachers (DEFAULT list will reload)', function(){
      /* Clear saved, then reload from DEFAULT_TEACHERS */
      Store.set(TEACHER_KEY, []);
      loadTeachers();
      toast('Teachers reset to default list from code.');
    });
  }
  
  /* Render teacher cards */
  function renderTeachers(list){
    var grid  = document.getElementById('teachersGrid');
    var empty = document.getElementById('teachersEmpty');
    if(!grid) return;
  
    if(!list || !list.length){
      grid.innerHTML  = '';
      if(empty) empty.style.display = 'block';
      return;
    }
    if(empty) empty.style.display = 'none';
  
    grid.innerHTML = list.map(function(t, i){
      var initials = t.name.split(' ')
        .filter(function(w){ return w.length > 1; })
        .slice(0,2).map(function(w){ return w[0].toUpperCase(); }).join('');
      var color    = TEACHER_COLORS[i % TEACHER_COLORS.length];
      var subjects = (t.subjects||[]).slice(0,2).join(', ') + (t.subjects&&t.subjects.length>2?' +'+( t.subjects.length-2):'');
      var classes  = (t.classes||[]).join(', ') || 'Not assigned';
      var roleClr  = t.role==='Principal'?'#7C3AED':t.role==='Super Admin'?'#EF4444':'#3B82F6';
  
      return [
        '<div class="teacher-card" id="tc_'+t.id+'" style="',
          'background:var(--surface);',
          'border:1.5px solid var(--border);',
          'border-radius:14px;',
          'padding:22px;',
          'transition:all .2s;',
          'cursor:default;',
        '">',
  
          /* Avatar + status dot */
          '<div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;">',
            '<div style="position:relative;">',
              '<div style="',
                'width:58px;height:58px;border-radius:50%;',
                'background:'+color+';',
                'display:flex;align-items:center;justify-content:center;',
                'font-family:Poppins,sans-serif;font-size:1.2rem;font-weight:700;color:#fff;',
              '">'+initials+'</div>',
              '<span style="',
                'position:absolute;bottom:2px;right:2px;',
                'width:13px;height:13px;border-radius:50%;',
                'background:'+(t.status==='active'?'#22C55E':'#94A3B8')+';',
                'border:2px solid var(--surface);',
              '"></span>',
            '</div>',
  
            /* Action buttons */
            '<div style="display:flex;gap:6px;">',
              '<button onclick="editTeacher(\''+t.id+'\')" title="Edit" ',
                'style="width:32px;height:32px;border:1.5px solid var(--border);border-radius:8px;',
                'background:none;color:var(--muted);cursor:pointer;font-size:.82rem;">',
                '<i class="fas fa-edit"></i>',
              '</button>',
              '<button onclick="deleteTeacher(\''+t.id+'\')" title="Delete" ',
                'style="width:32px;height:32px;border:1.5px solid rgba(239,68,68,.3);border-radius:8px;',
                'background:none;color:#EF4444;cursor:pointer;font-size:.82rem;">',
                '<i class="fas fa-trash-alt"></i>',
              '</button>',
            '</div>',
          '</div>',
  
          /* Name & role */
          '<div style="margin-bottom:12px;">',
            '<h3 style="font-family:Poppins,sans-serif;font-size:.98rem;font-weight:700;color:var(--text);margin-bottom:4px;">'+t.name+'</h3>',
            '<span style="',
              'display:inline-block;',
              'background:'+roleClr+'18;color:'+roleClr+';',
              'padding:2px 10px;border-radius:99px;',
              'font-size:.7rem;font-weight:700;',
            '">'+t.role+'</span>',
          '</div>',
  
          /* Info rows */
          '<div style="display:flex;flex-direction:column;gap:7px;font-size:.78rem;color:var(--muted);">',
  
            '<div style="display:flex;align-items:center;gap:8px;">',
              '<i class="fas fa-envelope" style="width:14px;color:'+color+';"></i>',
              '<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+t.email+'</span>',
            '</div>',
  
            (t.phone ? [
              '<div style="display:flex;align-items:center;gap:8px;">',
                '<i class="fas fa-phone" style="width:14px;color:'+color+';"></i>',
                '<span>'+t.phone+'</span>',
              '</div>',
            ].join('') : ''),
  
            '<div style="display:flex;align-items:flex-start;gap:8px;">',
              '<i class="fas fa-book-open" style="width:14px;margin-top:2px;color:'+color+';"></i>',
              '<span>'+(subjects||'No subjects assigned')+'</span>',
            '</div>',
  
            '<div style="display:flex;align-items:center;gap:8px;">',
              '<i class="fas fa-door-open" style="width:14px;color:'+color+';"></i>',
              '<span>'+classes+'</span>',
            '</div>',
  
          '</div>',
  
          /* Footer */
          '<div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);',
               'display:flex;align-items:center;justify-content:space-between;font-size:.72rem;color:var(--muted);">',
            '<span><i class="fas fa-calendar-alt"></i> Joined '+t.joined+'</span>',
            '<span style="background:'+(t.status==='active'?'rgba(34,197,94,.1)':'rgba(148,163,184,.1)')+';',
                 'color:'+(t.status==='active'?'#16a34a':'#94A3B8')+';',
                 'padding:2px 9px;border-radius:99px;font-weight:600;">',
              (t.status==='active'?'Active':'Inactive'),
            '</span>',
          '</div>',
  
        '</div>'
      ].join('');
    }).join('');
  
    /* Search wire */
    var srch = document.getElementById('teacherSearch');
    if(srch){
      srch.oninput = function(){
        var qv = srch.value.toLowerCase();
        var teachers = Store.get(TEACHER_KEY, []);
        if(!qv){ renderTeachers(teachers); return; }
        renderTeachers(teachers.filter(function(t){
          return t.name.toLowerCase().indexOf(qv)>-1
            || t.email.toLowerCase().indexOf(qv)>-1
            || (t.subjects||[]).join(' ').toLowerCase().indexOf(qv)>-1
            || (t.classes||[]).join(' ').toLowerCase().indexOf(qv)>-1;
        }));
      };
    }
  }
  
  /* Add teacher modal */
  function showAddTeacherModal(editId){
    var existing = editId ? Store.get(TEACHER_KEY,[]).find(function(t){ return t.id===editId; }) : null;
    var modal = document.createElement('div');
    modal.id  = 'addTeacherModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
  
    modal.innerHTML = [
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;',
           'padding:28px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;">',
  
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">',
          '<h3 style="font-family:Poppins,sans-serif;font-size:1.05rem;font-weight:700;">',
            '<i class="fas fa-user-plus" style="color:#3B82F6"></i> ',
            (editId ? 'Edit Teacher' : 'Add New Teacher'),
          '</h3>',
          '<button onclick="document.getElementById(\'addTeacherModal\').remove()" ',
            'style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748B;">',
            '<i class="fas fa-times"></i>',
          '</button>',
        '</div>',
  
        /* Name */
        '<div style="margin-bottom:14px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Full Name</label>',
          '<div style="position:relative;">',
            '<i class="fas fa-user" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<input type="text" id="t_name" value="'+(existing?existing.name:'')+'" placeholder="e.g. Mrs. Ngozi Eze"',
              'style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;"/>',
          '</div>',
        '</div>',
  
        /* Email */
        '<div style="margin-bottom:14px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Email Address</label>',
          '<div style="position:relative;">',
            '<i class="fas fa-envelope" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<input type="email" id="t_email" value="'+(existing?existing.email:'')+'" placeholder="teacher@ecacademy.edu.ng"',
              'style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;"/>',
          '</div>',
        '</div>',
  
        /* Phone */
        '<div style="margin-bottom:14px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Phone Number <span style="font-weight:400;text-transform:none">(optional)</span></label>',
          '<div style="position:relative;">',
            '<i class="fas fa-phone" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<input type="tel" id="t_phone" value="'+(existing?existing.phone||'':'')+'" placeholder="+234 800 000 0000"',
              'style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;"/>',
          '</div>',
        '</div>',
  
        /* Role */
        '<div style="margin-bottom:14px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Role</label>',
          '<div style="position:relative;">',
            '<i class="fas fa-id-badge" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<select id="t_role" style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;">',
              '<option '+(existing&&existing.role==='Teacher'?'selected':'')+'>Teacher</option>',
              '<option '+(existing&&existing.role==='Admin'?'selected':'')+'>Admin</option>',
              '<option '+(existing&&existing.role==='Principal'?'selected':'')+'>Principal</option>',
              '<option '+(existing&&existing.role==='Super Admin'?'selected':'')+'>Super Admin</option>',
            '</select>',
          '</div>',
        '</div>',
  
        /* Subjects */
        '<div style="margin-bottom:14px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Subjects Taught <span style="font-weight:400;text-transform:none">(comma separated)</span></label>',
          '<div style="position:relative;">',
            '<i class="fas fa-book-open" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<input type="text" id="t_subjects" value="'+(existing?(existing.subjects||[]).join(', '):'')+'" placeholder="Mathematics, Physics, Chemistry"',
              'style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;"/>',
          '</div>',
        '</div>',
  
        /* Classes */
        '<div style="margin-bottom:20px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#64748B;margin-bottom:5px;">Classes Assigned <span style="font-weight:400;text-transform:none">(comma separated)</span></label>',
          '<div style="position:relative;">',
            '<i class="fas fa-door-open" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.85rem;"></i>',
            '<input type="text" id="t_classes" value="'+(existing?(existing.classes||[]).join(', '):'')+'" placeholder="SS 2A, SS 3B, JSS 1A"',
              'style="width:100%;padding:10px 12px 10px 36px;border:1.5px solid var(--border);border-radius:9px;',
              'font-family:Inter,sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;"/>',
          '</div>',
        '</div>',
  
        /* Buttons */
        '<div style="display:flex;gap:10px;">',
          '<button onclick="document.getElementById(\'addTeacherModal\').remove()" ',
            'style="flex:1;padding:11px;border:1.5px solid var(--border);border-radius:9px;',
            'background:var(--surface);color:var(--text);font-weight:600;font-size:.88rem;cursor:pointer;">',
            '<i class="fas fa-times"></i> Cancel',
          '</button>',
          '<button onclick="saveTeacher(\''+(editId||'')+'\''+')" ',
            'style="flex:1;padding:11px;border:none;border-radius:9px;',
            'background:#3B82F6;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;">',
            '<i class="fas fa-save"></i> '+(editId?'Save Changes':'Add Teacher'),
          '</button>',
        '</div>',
  
      '</div>'
    ].join('');
  
    document.body.appendChild(modal);
    /* Focus first field */
    setTimeout(function(){ var n=document.getElementById('t_name'); if(n) n.focus(); }, 100);
  }
  
  function editTeacher(id){
    showAddTeacherModal(id);
  }
  
  function saveTeacher(editId){
    var name     = (document.getElementById('t_name')    ||{}).value||'';
    var email    = (document.getElementById('t_email')   ||{}).value||'';
    var phone    = (document.getElementById('t_phone')   ||{}).value||'';
    var role     = (document.getElementById('t_role')    ||{}).value||'Teacher';
    var subjects = (document.getElementById('t_subjects')||{}).value||'';
    var classes  = (document.getElementById('t_classes') ||{}).value||'';
  
    if(!name.trim()){ toast('Please enter the teacher\'s name.',true); return; }
    if(!email.trim()){ toast('Please enter the teacher\'s email.',true); return; }
  
    var teachers = Store.get(TEACHER_KEY, []);
  
    if(editId){
      /* Edit existing */
      var idx = teachers.findIndex(function(t){ return t.id===editId; });
      if(idx>=0){
        teachers[idx].name     = name.trim();
        teachers[idx].email    = email.trim();
        teachers[idx].phone    = phone.trim();
        teachers[idx].role     = role;
        teachers[idx].subjects = subjects.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        teachers[idx].classes  = classes.split(',').map(function(s){ return s.trim(); }).filter(Boolean);
      }
      toast('Teacher updated successfully!');
    } else {
      /* Add new */
      teachers.push({
        id:       't'+Date.now(),
        name:     name.trim(),
        email:    email.trim(),
        phone:    phone.trim(),
        role:     role,
        subjects: subjects.split(',').map(function(s){ return s.trim(); }).filter(Boolean),
        classes:  classes.split(',').map(function(s){ return s.trim(); }).filter(Boolean),
        status:   'active',
        joined:   new Date().getFullYear().toString()
      });
      toast('Teacher added successfully!');
    }
  
    Store.set(TEACHER_KEY, teachers);
    document.getElementById('addTeacherModal').remove();
    renderTeachers(teachers);
  
    /* Update nav count */
    var tn = q('.nav-item[data-page="teachers"] .nav-count');
    if(tn) tn.textContent = teachers.length;
  }
  
  function deleteTeacher(id){
    var teachers = Store.get(TEACHER_KEY, []);
    var teacher  = teachers.find(function(t){ return t.id===id; });
    if(!teacher) return;
    showDeleteConfirm(teacher.name, function(){
      var updated = teachers.filter(function(t){ return t.id!==id; });
      Store.set(TEACHER_KEY, updated);
      renderTeachers(updated);
      var tn = q('.nav-item[data-page="teachers"] .nav-count');
      if(tn) tn.textContent = updated.length;
      toast(teacher.name+' removed.');
    });
  }
  
  /* ================================================================
     GALLERY MODULE
     Photos stored as Base64 in localStorage.
     Each photo: { id, name, class, caption, date, dataUrl }
     ================================================================ */
  
  var GALLERY_KEY  = 'et_gallery';
  var galleryView  = 'grid';   /* 'grid' or 'list' */
  var lightboxIdx  = 0;
  var lightboxList = [];
  var galleryAll   = [];
  
  /* ── Called when navigating to gallery page ─────────────────────── */
  function loadGallery(){
    galleryAll = Store.get(GALLERY_KEY, []);
    renderGallery(galleryAll);
    updateGalleryStats(galleryAll);
    wireGalleryEvents();
  }
  
  /* ── Wire upload input + search + filter ────────────────────────── */
  function wireGalleryEvents(){
    /* Upload */
    var inp = document.getElementById('galleryUploadInput');
    if(inp && !inp._wired){
      inp._wired = true;
      inp.addEventListener('change', handleGalleryUpload);
    }
    /* Search */
    var srch = document.getElementById('gallerySearch');
    if(srch && !srch._wired){
      srch._wired = true;
      srch.addEventListener('input', filterGallery);
    }
    /* Class filter */
    var flt = document.getElementById('galleryFilter');
    if(flt && !flt._wired){
      flt._wired = true;
      flt.addEventListener('change', filterGallery);
    }
    /* Lightbox keyboard */
    document.onkeydown = function(e){
      var lb = document.getElementById('galleryLightbox');
      if(!lb || lb.style.display==='none') return;
      if(e.key==='Escape')       closeLightbox();
      if(e.key==='ArrowLeft')    lightboxNav(-1);
      if(e.key==='ArrowRight')   lightboxNav(1);
    };
  }
  
  /* ── Handle file upload ─────────────────────────────────────────── */
  function handleGalleryUpload(e){
    var files = Array.from(e.target.files||[]);
    if(!files.length) return;
  
    /* Show progress */
    var prog    = document.getElementById('uploadProgress');
    var progBar = document.getElementById('uploadProgressBar');
    var progTxt = document.getElementById('uploadProgressText');
    if(prog) prog.style.display = 'block';
  
    var photos  = Store.get(GALLERY_KEY, []);
    var total   = files.length;
    var done    = 0;
  
    function readFile(file){
      return new Promise(function(resolve){
        /* Show name input modal for this photo */
        var reader = new FileReader();
        reader.onload = function(ev){
          resolve({ dataUrl: ev.target.result, fileName: file.name });
        };
        reader.readAsDataURL(file);
      });
    }
  
    /* Process one at a time to avoid memory issues */
    function processNext(idx){
      if(idx >= files.length){
        /* All done */
        Store.set(GALLERY_KEY, photos);
        galleryAll = photos;
        renderGallery(photos);
        updateGalleryStats(photos);
        if(prog) prog.style.display = 'none';
        /* Reset input */
        e.target.value = '';
        toast(total+' photo'+(total>1?'s':'')+' uploaded successfully!');
        return;
      }
  
      readFile(files[idx]).then(function(result){
        done++;
        var pct = Math.round((done/total)*100);
        if(progBar) progBar.style.width = pct+'%';
        if(progTxt) progTxt.textContent = pct+'%';
  
        /* Show naming modal for each photo */
        showPhotoNameModal(result.dataUrl, result.fileName, function(photoData){
          photos.push({
            id:      'g'+Date.now()+Math.random().toString(36).slice(2,5),
            name:    photoData.name,
            class:   photoData.cls,
            caption: photoData.caption,
            date:    new Date().toLocaleDateString('en-GB'),
            dataUrl: result.dataUrl
          });
          processNext(idx+1);
        });
      });
    }
  
    processNext(0);
  }
  
  /* ── Modal to name/tag each photo ───────────────────────────────── */
  function showPhotoNameModal(dataUrl, fileName, onSave){
    var old = document.getElementById('photoNameModal');
    if(old) old.remove();
  
    var m = document.createElement('div');
    m.id  = 'photoNameModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.8);'
      +'display:flex;align-items:center;justify-content:center;padding:16px;';
  
    m.innerHTML = [
      '<div style="background:var(--surface);border-radius:16px;padding:24px;max-width:440px;width:100%;">',
        '<h3 style="font-family:Poppins,sans-serif;font-size:.98rem;font-weight:700;margin-bottom:14px;">',
          '<i class="fas fa-tag" style="color:#7C3AED"></i> Tag This Photo',
        '</h3>',
  
        /* Preview */
        '<img src="'+dataUrl+'" alt="preview" style="width:100%;height:160px;object-fit:cover;border-radius:10px;margin-bottom:14px;"/>',
  
        /* Student name */
        '<div style="margin-bottom:12px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;margin-bottom:4px;">Student Name</label>',
          '<input type="text" id="pn_name" placeholder="e.g. Amaka Okafor"',
            'style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;',
            'font-family:Inter,sans-serif;font-size:.85rem;color:var(--text);background:var(--bg);outline:none;"/>',
        '</div>',
  
        /* Class */
        '<div style="margin-bottom:12px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;margin-bottom:4px;">Class</label>',
          '<select id="pn_class" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;',
            'font-family:Inter,sans-serif;font-size:.85rem;color:var(--text);background:var(--bg);outline:none;">',
            '<option value="">-- Select Class --</option>',
            '<option>SS 1A</option><option>SS 1B</option>',
            '<option>SS 2A</option><option>SS 2B</option>',
            '<option>SS 3A</option><option>SS 3B</option>',
            '<option>JSS 1A</option><option>JSS 1B</option>',
            '<option>JSS 2A</option><option>JSS 2B</option>',
            '<option>JSS 3A</option><option>JSS 3B</option>',
            '<option>Primary 1</option><option>Primary 2</option>',
            '<option>Primary 3</option><option>Primary 4</option>',
            '<option>Primary 5</option><option>Primary 6</option>',
            '<option>Staff</option><option>Event</option>',
          '</select>',
        '</div>',
  
        /* Caption */
        '<div style="margin-bottom:18px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;margin-bottom:4px;">Caption <span style="font-weight:400;text-transform:none">(optional)</span></label>',
          '<input type="text" id="pn_caption" placeholder="e.g. Sports Day 2026"',
            'style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;',
            'font-family:Inter,sans-serif;font-size:.85rem;color:var(--text);background:var(--bg);outline:none;"/>',
        '</div>',
  
        /* Buttons */
        '<div style="display:flex;gap:10px;">',
          '<button onclick="skipPhotoName()" ',
            'style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:9px;',
            'background:var(--surface);color:var(--text);font-weight:600;font-size:.85rem;cursor:pointer;">',
            'Skip Tagging',
          '</button>',
          '<button onclick="savePhotoName()" ',
            'style="flex:1;padding:10px;border:none;border-radius:9px;',
            'background:#7C3AED;color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;">',
            '<i class="fas fa-save"></i> Save Photo',
          '</button>',
        '</div>',
      '</div>'
    ].join('');
  
    document.body.appendChild(m);
  
    /* Store callback */
    m._onSave = onSave;
  
    setTimeout(function(){
      var n=document.getElementById('pn_name'); if(n) n.focus();
    }, 100);
  }
  
  function savePhotoName(){
    var name    = (document.getElementById('pn_name')   ||{}).value||'Unknown Student';
    var cls     = (document.getElementById('pn_class')  ||{}).value||'';
    var caption = (document.getElementById('pn_caption')||{}).value||'';
    var m = document.getElementById('photoNameModal');
    if(m){
      m._onSave({ name:name, cls:cls, caption:caption });
      m.remove();
    }
  }
  
  function skipPhotoName(){
    var m = document.getElementById('photoNameModal');
    if(m){
      m._onSave({ name:'Unknown Student', cls:'', caption:'' });
      m.remove();
    }
  }
  
  /* ── Render gallery grid ────────────────────────────────────────── */
  function renderGallery(photos){
    var grid  = document.getElementById('galleryGrid');
    var empty = document.getElementById('galleryEmpty');
    if(!grid) return;
  
    lightboxList = photos;
  
    if(!photos || !photos.length){
      grid.innerHTML = '';
      if(empty) empty.style.display = 'block';
      return;
    }
    if(empty) empty.style.display = 'none';
  
    if(galleryView === 'grid'){
      grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(200px,1fr))';
      grid.innerHTML = photos.map(function(p, i){
        return [
          '<div class="gallery-card" data-idx="'+i+'" onclick="openLightbox('+i+')"',
            'style="position:relative;border-radius:12px;overflow:hidden;cursor:pointer;',
            'border:1.5px solid var(--border);background:var(--surface);',
            'transition:transform .2s,box-shadow .2s;"',
            'onmouseover="this.style.transform=\'scale(1.02)\';this.style.boxShadow=\'0 8px 24px rgba(0,0,0,.15)\'"',
            'onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'"',
          '>',
            '<img src="'+p.dataUrl+'" alt="'+p.name+'"',
              'style="width:100%;height:180px;object-fit:cover;display:block;"/>',
            '<div style="padding:10px 12px;">',
              '<div style="font-weight:700;font-size:.83rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.name+'</div>',
              '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">',
                (p.class ? '<span style="font-size:.7rem;background:rgba(124,58,237,.1);color:#7C3AED;padding:2px 8px;border-radius:99px;font-weight:600;">'+p.class+'</span>' : '<span></span>'),
                '<span style="font-size:.68rem;color:#94A3B8;">'+p.date+'</span>',
              '</div>',
              (p.caption ? '<div style="font-size:.72rem;color:#64748B;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+p.caption+'</div>' : ''),
            '</div>',
            /* Delete button on card */
            '<button onclick="event.stopPropagation();deleteGalleryById(\''+p.id+'\')"',
              'style="position:absolute;top:8px;right:8px;background:rgba(239,68,68,.85);',
              'color:#fff;border:none;border-radius:7px;width:28px;height:28px;',
              'cursor:pointer;font-size:.75rem;display:flex;align-items:center;justify-content:center;',
              'opacity:0;transition:opacity .2s;"',
              'class="gallery-del-btn" title="Delete">',
              '<i class="fas fa-trash-alt"></i>',
            '</button>',
          '</div>'
        ].join('');
      }).join('');
  
      /* Show delete btn on hover */
      grid.querySelectorAll('.gallery-card').forEach(function(card){
        var btn = card.querySelector('.gallery-del-btn');
        card.addEventListener('mouseenter', function(){ if(btn) btn.style.opacity='1'; });
        card.addEventListener('mouseleave', function(){ if(btn) btn.style.opacity='0'; });
      });
  
    } else {
      /* List view */
      grid.style.gridTemplateColumns = '1fr';
      grid.innerHTML = photos.map(function(p, i){
        return [
          '<div onclick="openLightbox('+i+')"',
            'style="display:flex;align-items:center;gap:14px;padding:12px 16px;',
            'border:1.5px solid var(--border);border-radius:12px;cursor:pointer;',
            'background:var(--surface);transition:background .15s;"',
            'onmouseover="this.style.background=\'rgba(124,58,237,.05)\'"',
            'onmouseout="this.style.background=\'var(--surface)\'"',
          '>',
            '<img src="'+p.dataUrl+'" alt="'+p.name+'"',
              'style="width:56px;height:56px;border-radius:9px;object-fit:cover;flex-shrink:0;"/>',
            '<div style="flex:1;min-width:0;">',
              '<div style="font-weight:700;font-size:.88rem;color:var(--text);">'+p.name+'</div>',
              '<div style="font-size:.75rem;color:#64748B;margin-top:2px;">',
                (p.class?p.class+' · ':'')+(p.caption||'')+'<span style="color:#94A3B8;"> '+p.date+'</span>',
              '</div>',
            '</div>',
            '<button onclick="event.stopPropagation();deleteGalleryById(\''+p.id+'\')"',
              'style="background:rgba(239,68,68,.1);color:#EF4444;border:none;',
              'border-radius:8px;width:34px;height:34px;cursor:pointer;font-size:.82rem;">',
              '<i class="fas fa-trash-alt"></i>',
            '</button>',
          '</div>'
        ].join('');
      }).join('');
    }
  }
  
  /* ── Filter gallery ─────────────────────────────────────────────── */
  function filterGallery(){
    var srch = (document.getElementById('gallerySearch')||{}).value||'';
    var flt  = (document.getElementById('galleryFilter')||{}).value||'';
    var q2   = srch.toLowerCase();
  
    var filtered = galleryAll.filter(function(p){
      var matchName = !q2 || p.name.toLowerCase().indexOf(q2)>-1 || (p.caption||'').toLowerCase().indexOf(q2)>-1;
      var matchCls  = !flt || p.class === flt;
      return matchName && matchCls;
    });
    renderGallery(filtered);
  }
  
  function clearGalleryFilter(){
    var srch = document.getElementById('gallerySearch');
    var flt  = document.getElementById('galleryFilter');
    if(srch) srch.value='';
    if(flt)  flt.value='';
    renderGallery(galleryAll);
  }
  
  /* ── View toggle ────────────────────────────────────────────────── */
  function setGalleryView(view){
    galleryView = view;
    var gb = document.getElementById('btnGridView');
    var lb = document.getElementById('btnListView');
    if(gb){ gb.style.background=view==='grid'?'#3B82F6':'none'; gb.style.color=view==='grid'?'#fff':'#64748B'; }
    if(lb){ lb.style.background=view==='list'?'#3B82F6':'none'; lb.style.color=view==='list'?'#fff':'#64748B'; }
    filterGallery();
  }
  
  /* ── Update stats bar ───────────────────────────────────────────── */
  function updateGalleryStats(photos){
    var total = photos.length;
    var cats  = {};
    photos.forEach(function(p){ if(p.class) cats[p.class]=true; });
    var catCount = Object.keys(cats).length;
  
    var tc = document.getElementById('galleryTotalCount');
    var cc = document.getElementById('galleryCategoryCount');
    var nc = document.getElementById('galleryCount');
    if(tc) tc.textContent = total;
    if(cc) cc.textContent = catCount;
    if(nc) nc.textContent = total;
  }
  
  /* ── Lightbox ───────────────────────────────────────────────────── */
  function openLightbox(idx){
    lightboxIdx = idx;
    showLightboxPhoto();
    var lb = document.getElementById('galleryLightbox');
    if(lb){ lb.style.display='flex'; document.body.style.overflow='hidden'; }
  }
  
  function showLightboxPhoto(){
    var p = lightboxList[lightboxIdx];
    if(!p) return;
    var img   = document.getElementById('lightboxImg');
    var name  = document.getElementById('lightboxName');
    var meta  = document.getElementById('lightboxMeta');
    var ctr   = document.getElementById('lightboxCounter');
    if(img)  img.src = p.dataUrl;
    if(name) name.textContent = p.name;
    if(meta) meta.textContent = (p.class?p.class+' · ':'')+(p.caption?p.caption+' · ':'')+p.date;
    if(ctr)  ctr.textContent  = (lightboxIdx+1)+' / '+lightboxList.length;
  }
  
  function lightboxNav(dir){
    lightboxIdx = (lightboxIdx + dir + lightboxList.length) % lightboxList.length;
    showLightboxPhoto();
  }
  
  function closeLightbox(){
    var lb = document.getElementById('galleryLightbox');
    if(lb){ lb.style.display='none'; document.body.style.overflow=''; }
  }
  
  /* ── Download photo from lightbox ───────────────────────────────── */
  function downloadGalleryPhoto(){
    var p = lightboxList[lightboxIdx]; if(!p) return;
    var a = document.createElement('a');
    a.href = p.dataUrl;
    a.download = p.name.replace(/\s+/g,'_')+'_ECA.jpg';
    a.click();
  }
  
  /* ── Delete from lightbox ───────────────────────────────────────── */
  function deleteGalleryPhoto(){
    var p = lightboxList[lightboxIdx]; if(!p) return;
    deleteGalleryById(p.id);
    closeLightbox();
  }
  
  /* ── Delete by ID ───────────────────────────────────────────────── */
  function deleteGalleryById(id){
    showDeleteConfirm('this photo', function(){
      galleryAll = galleryAll.filter(function(p){ return p.id!==id; });
      Store.set(GALLERY_KEY, galleryAll);
      renderGallery(galleryAll);
      updateGalleryStats(galleryAll);
      toast('Photo deleted.');
    });
  }
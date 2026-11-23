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
    if(!App.user || !App.user.loggedIn){
      window.location.replace('login.html');
      return;
    }
  
    /* Fix any wrong session year in cached session */
    if(App.user.session && App.user.session.indexOf('2026') === -1){
      App.user.session = '2026/2027';
      try{
        localStorage.setItem('edutrack_session', JSON.stringify(App.user));
      }catch(e){}
    }
  
    /* Set session/term from user */
    App.session = App.user.session || '2026/2027';
    App.term    = App.user.term    || '1st Term';
  
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
  
    /* Draw charts after 800ms — gives CDN time to load and page to paint */
    setTimeout(drawCharts, 800);
  
    /* Re-run fillUserUI after 100ms to catch any DOM elements that */
    /* weren't ready on first call (e.g. topbar avatar)             */
    setTimeout(fillUserUI, 100);
  });
  
  /* Safety net — retry charts after full page load */
  window.addEventListener('load', function(){
    setTimeout(function(){
      if(typeof Chart === 'undefined') return;
      /* Force redraw if charts are blank */
      var cv = document.getElementById('performanceChart');
      var h  = cv && cv.parentElement ? cv.parentElement.offsetHeight : 0;
      if(!App.chartsDrawn || h < 10){
        App.chartsDrawn = false;
        drawCharts();
      }
    }, 800);
  });
  
  /* ================================================================
     FILL USER UI — name, school, greeting
     ================================================================ */
  function fillUserUI(){
  
    /* ── Read session from 3 sources ─────────────────────────────── */
    var sess = null;
  
    /* Source 1: App.user (set by auth.js) */
    if(App.user && App.user.loggedIn) sess = App.user;
  
    /* Source 2: raw localStorage */
    if(!sess){
      try{
        var raw = localStorage.getItem('edutrack_session');
        if(raw){
          var parsed = JSON.parse(raw);
          if(parsed && parsed.loggedIn) sess = parsed;
        }
      }catch(e){}
    }
  
    /* Source 3: individual keys saved by login.html */
    if(!sess){
      var n = localStorage.getItem('edutrack_user_name');
      var r = localStorage.getItem('edutrack_user_role');
      if(n) sess = { name:n, role:r||'Staff', school:'Emirate Classic Academy', session:'2026/2027', term:'1st Term' };
    }
  
    if(!sess){ return; }
  
    /* ── Extract values with fallbacks ──────────────────────────── */
    function g(k, fb){
      var v = sess[k];
      return (v && String(v).trim() && String(v).trim() !== 'undefined') ? String(v).trim() : fb;
    }
  
    var name   = g('name',   'Administrator');
    var role   = g('role',   'Staff');
    var school = g('school', 'Emirate Classic Academy');
    var email  = g('email',  '');
    var term   = g('term',   '1st Term');
    var sessionStr = g('session', '2026/2027');
    /* Force correct year — fix any typos like 2028/2027 */
    if(!sessionStr || sessionStr.indexOf('2026') === -1){
      sessionStr = '2026/2027';
    }
  
    /* Store in App for other functions to use */
    App.session = sessionStr;
    App.term    = term;
  
    /* ── Extract first name (skip titles like Mr. Mrs. Dr.) ─────── */
    var firstName = g('firstName', '');
    if(!firstName){
      var skipTitles = /^(mr|mrs|ms|miss|dr|prof|sir|chief|alhaji|alhaja)\.?$/i;
      var nameParts  = name.split(/\s+/);
      firstName = '';
      for(var i = 0; i < nameParts.length; i++){
        if(nameParts[i].length > 1 && !skipTitles.test(nameParts[i])){
          firstName = nameParts[i];
          break;
        }
      }
      if(!firstName) firstName = nameParts[nameParts.length - 1] || 'Admin';
    }
  
    /* ── Update EVERY element that shows user info ──────────────── */
  
    /* Sidebar: school name + session */
    document.querySelectorAll('.school-name').forEach(function(el){
      el.textContent = school;
    });
    document.querySelectorAll('.school-session').forEach(function(el){
      el.textContent = sessionStr + ' Session';
    });
  
    /* Sidebar: school avatar initials */
    var av = document.querySelector('.school-avatar');
    if(av){
      var words    = school.split(' ').filter(function(w){ return w.length > 2; });
      var initials = words.slice(0, 3).map(function(w){ return w[0].toUpperCase(); }).join('');
      av.textContent = initials || 'ECA';
    }
  
    /* Sidebar: user name + role at bottom */
    document.querySelectorAll('.user-name-sm').forEach(function(el){ el.textContent = name; });
    document.querySelectorAll('.user-role-sm').forEach(function(el){ el.textContent = role; });
  
    /* Topbar: first name + role */
    document.querySelectorAll('.admin-name').forEach(function(el){ el.textContent = firstName; });
    document.querySelectorAll('.admin-role').forEach(function(el){ el.textContent = role; });
  
    /* Topbar dropdown */
    document.querySelectorAll('.dh-name').forEach(function(el){ el.textContent = name; });
    document.querySelectorAll('.dh-email').forEach(function(el){ el.textContent = email; });
  
    /* ── Welcome heading — uses ID now for reliability ──────────── */
    var h    = new Date().getHours();
    var gr   = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
    var wave = ' <i class="fas fa-hand-wave" style="color:#F59E0B"></i>';
  
    /* Try by ID first (most reliable) */
    var wById = document.getElementById('welcomeTitle');
    if(wById){
      wById.innerHTML = gr + ', ' + firstName + '! ' + wave;
    }
    /* Also try old selector as backup */
    var wBySel = document.querySelector('#page-dashboard .page-title');
    if(wBySel && wBySel !== wById){
      wBySel.innerHTML = gr + ', ' + firstName + '! ' + wave;
    }
  
    /* ── Page subtitle ──────────────────────────────────────────── */
    var subById  = document.getElementById('welcomeSubtitle');
    var subBySel = document.querySelector('#page-dashboard .page-subtitle');
    var subText  = "Here's what's happening in your school today — " + term + ', ' + sessionStr + ' Session.';
    if(subById)  subById.textContent  = subText;
    if(subBySel && subBySel !== subById) subBySel.textContent = subText;
  
    /* ── Document title ─────────────────────────────────────────── */
    document.title = 'EduTrack Pro — ' + school;
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
      messages:'Messages',settings:'Settings',gallery:'Gallery',class:'My Class'};
    setText('#bcCurrent',LABELS[pageId]||pageId);
    closeSidebar();
    if(pageId==='analytics') setTimeout(drawAnalyticsCharts,300);
    if(pageId==='teachers') { var t=Store.get(TEACHER_KEY,[]); renderTeachers(t); }
    if(pageId==='gallery')   { loadGallery(); }
    if(pageId==='class')     { loadClassPage(); }
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
    if(window.EduAuth && window.EduAuth.signOut){ window.EduAuth.signOut(); return; }
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
  function setStat(key, value, suf){
    /* Find by data-stat attribute */
    var el = document.querySelector('[data-stat="'+key+'"]');
    if(!el) return;
    var suffix = suf || '';
    el.dataset.count  = value;
    el.dataset.suffix = suffix;
    /* Set text immediately so it shows even if animation fails */
    el.textContent    = (value > 999 ? Number(value).toLocaleString() : value) + suffix;
  }
  function animateStats(){
    document.querySelectorAll('.stat-value[data-count]').forEach(function(el){
      if(el._animTimer) clearInterval(el._animTimer);
  
      var target = parseFloat(el.dataset.count) || 0;
      var suf    = el.dataset.suffix || '';
  
      /* Skip animation for 0 */
      if(target === 0){
        el.textContent = '0' + suf;
        return;
      }
  
      var cur  = 0;
      var step = Math.max(1, Math.ceil(target / 50));
  
      el._animTimer = setInterval(function(){
        cur = Math.min(cur + step, target);
        var disp = target > 999
          ? Math.round(cur).toLocaleString()
          : (target % 1 !== 0 ? cur.toFixed(1) : Math.round(cur));
        el.textContent = disp + suf;
        if(cur >= target){
          clearInterval(el._animTimer);
          /* Set exact final value */
          el.textContent = (target > 999 ? target.toLocaleString() : target) + suf;
        }
      }, 20);
    });
  }
  function refreshStats(){
    var s      = App.students || [];
    var passed = s.filter(function(x){ return x.status === 'pass'; }).length;
    var failed = s.filter(function(x){ return x.status === 'fail'; }).length;
    var total  = s.length;
    var avgAll = total
      ? (s.reduce(function(a, x){ return a + (parseFloat(x.avg) || 0); }, 0) / total).toFixed(1)
      : 0;
  
    /* Set all stats immediately (shows real numbers right away) */
    setStat('stat-students',   total,    '');
    setStat('stat-results',    total * 6,'');
    setStat('stat-avg',        avgAll,   '%');
    setStat('stat-passed',     passed,   '');
    setStat('stat-failed',     failed,   '');
    setStat('stat-attendance', 91,       '%');
  
    /* Then animate the count-up effect */
    setTimeout(animateStats, 50);
  }
  
  /* ================================================================
     STUDENTS
     ================================================================ */
  function loadStudents(){
    var saved = Store.get(KEY.STUDENTS, null);
  
    /* Always load seed data if nothing saved or less than expected */
    if(!saved || !Array.isArray(saved) || saved.length === 0){
      saved = SEED.map(function(s){ return Object.assign({}, s); });
      Store.set(KEY.STUDENTS, saved);
      console.log('EduTrack: Loaded', saved.length, 'demo students');
    }
  
    /* Migrate old cached admission numbers GHS/00x -> ECA/2026/00x */
    var _changed = false;
    saved.forEach(function(st){
      if(st.admNo && /^GHS\//i.test(st.admNo)){
        st.admNo = 'ECA/2026/' + st.admNo.split('/').pop();
        _changed = true;
      }
    });
    if(_changed) Store.set(KEY.STUDENTS, saved);
  
    App.students = saved;
    renderTable(App.students);
    refreshStats();
    refreshNavCounts();
  }
  
  /* Force reload seed data (call from console if needed) */
  function resetStudentData(){
    Store.set(KEY.STUDENTS, SEED.map(function(s){ return Object.assign({},s); }));
    loadStudents();
    toast('Demo data reloaded!');
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
    ['resultsTableBody','fullResultsBody','studentsTableBody'].forEach(function(id){
      var el=document.getElementById(id); if(el) el.innerHTML=html;
    });
      var _n = list.length;
    setText('#dashTableCount', 'Showing '+_n+' of '+_n);
    setText('#resultsTableCount', _n+' total record'+(_n===1?'':'s'));
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
  function wireStudentsPageSearch(){
    var srch = document.getElementById('studentsSearch');
    var cf   = document.getElementById('studentsClassFilter');
    function apply(){
      var qv  = srch ? srch.value.toLowerCase() : '';
      var cls = cf ? cf.value : '';
      qAll('#studentsTableBody tr').forEach(function(row){
        var n = (row.querySelector('.student-name')||{}).textContent||'';
        var c = ((row.cells[1]||{}).textContent||'').trim();
        row.style.display = (n.toLowerCase().indexOf(qv)>-1 && (!cls || c===cls)) ? '' : 'none';
      });
    }
    if(srch) srch.addEventListener('input', apply);
    if(cf)   cf.addEventListener('change', apply);
  }
  
  function wireSearch(){
    wireStudentsPageSearch();
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
     Matches Emirate Classic Academy demo screenshot exactly
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
      'English Comprehension','English Vocabulary','Social Studies',
      'Agricultural Science','Quantitative Reasoning','Verbal Reasoning',
      'Computer Studies','Home Economics','Physical & Health Education',
      'Civic Education','English Composition','English Grammar',
      'English Dictation / Spelling','Mathematics','Basic Science',
      'Literature in English','Creative & Cultural Art','Religious Studies',
      'Hand Writing','Crafts'
    ]
  };
  
  var RC_DEFAULTS = { SS:10, JSS:10, PRIMARY:15 };
  var activeSubjects = [];
  
  function getLevel(cls){
    if(!cls) return 'SS';
    var c = cls.toUpperCase();
    if(c.indexOf('BASIC')>-1 || c.indexOf('PRIMARY')>-1) return 'PRIMARY';
    if(c.indexOf('JSS')>-1) return 'JSS';
    return 'SS';
  }
  
  function calcGrade100(n){
    if(n>=75) return 'A'; if(n>=65) return 'B'; if(n>=55) return 'C';
    if(n>=45) return 'D'; if(n>=40) return 'E'; return 'F';
  }
  function subjectRemark(g){
    return ({A:'EXCELLENT',B:'VERY GOOD',C:'GOOD',D:'AVERAGE',E:'FAIR',F:'POOR'})[g]||'--';
  }
  function gradeClr(g){
    return ({A:'#16a34a',B:'#2563EB',C:'#0891b2',D:'#d97706',E:'#ea580c',F:'#dc2626'})[g]||'#64748B';
  }
  
  function autoTeacherComment(avg, name){
    var first = (name||'This student').split(' ')[0];
    if(avg>=75) return first+' has demonstrated outstanding academic excellence this term. Keep up the brilliant work!';
    if(avg>=65) return first+' has shown very commendable performance. With continued effort, even greater heights can be reached.';
    if(avg>=55) return first+' performed well this term. More dedication will yield even better results next term.';
    if(avg>=45) return first+' showed fair performance. Greater focus and consistent study habits will yield better results.';
    if(avg>=40) return first+' needs to improve significantly. More seriousness with academic work is required.';
    return first+' performed below expectation. Urgent improvement is needed. Parental support is strongly advised.';
  }
  function autoPrincipalComment(avg, name){
    var first = (name||'This student').split(' ')[0];
    if(avg>=75) return 'An impressive performance. '+first+' is a pride of Emirate Classic Academy. Maintain this standard!';
    if(avg>=65) return 'A very good result. '+first+' should continue working hard and aim for excellence in all subjects.';
    if(avg>=55) return 'A satisfactory performance. '+first+' is encouraged to put in more effort next term.';
    if(avg>=45) return 'An average performance. '+first+' must be more dedicated. Parental support is strongly advised.';
    return 'Performance is below standard. Immediate academic intervention and parental involvement is required.';
  }
  
  function wireReportCard(){
    resetSubjectsForLevel('SS');
  
    /* Class change — update subjects */
    var clsEl = document.getElementById('rc_class');
    if(clsEl) clsEl.addEventListener('change', function(){
      resetSubjectsForLevel(getLevel(clsEl.value));
      updatePreview();
    });
  
    /* Add subject button */
    var addBtn = document.getElementById('btnAddSubject');
    if(addBtn) addBtn.addEventListener('click', showAddSubjectModal);
  
    /* Logo upload */
    var area  = document.getElementById('logoUploadArea');
    var input = document.getElementById('logoUpload');
    if(area)  area.addEventListener('click', function(){ if(input) input.click(); });
    if(input) input.addEventListener('change', function(){
      if(!input.files[0]) return;
      var reader = new FileReader();
      reader.onload = function(e){
        var logo = document.getElementById('prev_logo');
        if(logo) logo.innerHTML = '<img src="'+e.target.result+'" style="width:64px;height:64px;object-fit:contain;border-radius:50%;"/>';
        var txt = document.getElementById('logoUploadText');
        if(txt) txt.textContent = 'Logo uploaded ✓';
        toast('School logo uploaded!');
      };
      reader.readAsDataURL(input.files[0]);
    });
  
    /* Admission number lookup */
    var admEl = document.getElementById('rc_admNo');
    if(admEl) admEl.addEventListener('blur', function(){
      var v = admEl.value.trim().toUpperCase(); if(!v) return;
      var found = App.students.find(function(s){ return (s.admNo||'').toUpperCase()===v; });
      if(found){
        var sn = document.getElementById('rc_studentName');
        if(sn) sn.value = found.name;
        var cls = document.getElementById('rc_class');
        if(cls){ cls.value = found.class; resetSubjectsForLevel(getLevel(found.class)); }
        var gen = document.getElementById('rc_gender'); if(gen && found.gender) gen.value = found.gender;
        loadSavedScores(found.id); updatePreview();
        toast('Student loaded: '+found.name);
      } else { toast('No student found with that admission number.',true); }
    });
  
    wireCommentManual();
  
    /* Wire ALL form fields to live preview */
    ['rc_schoolName','rc_schoolAddr','rc_motto','rc_phone',
     'rc_session','rc_term','rc_studentName','rc_admNo',
     'rc_gender','rc_class','rc_classSize','rc_position',
     'rc_dob','rc_daysOpened','rc_daysPresent','rc_daysAbsent',
     'rc_nextTerm','rc_term1Total','rc_term2Total',
     'rc_annualTotal','rc_annualPosition',
     'rc_teacherComment','rc_principalComment'
    ].forEach(function(id){
      var el = document.getElementById(id);
      if(el){ el.addEventListener('input', updatePreview); el.addEventListener('change', updatePreview); }
    });
  
    /* Action buttons */
    var pb = document.getElementById('btnPrintReport');
    if(pb) pb.addEventListener('click', printReport);
    var sb = document.getElementById('btnSaveReport');
    if(sb) sb.addEventListener('click', function(){ saveReportCard(); setTimeout(downloadPDF,400); });
    var ib = document.getElementById('btnImageReport');
    if(ib) ib.addEventListener('click', downloadImage);
    var shb = document.getElementById('btnShareReport');
    if(shb) shb.addEventListener('click', shareReport);
  
    updatePreview();
  }
  
  function wireCommentManual(){
    var tc = document.getElementById('rc_teacherComment');
    var pc = document.getElementById('rc_principalComment');
    if(tc) tc.addEventListener('input', function(){ tc.dataset.manual='1'; updatePreview(); });
    if(pc) pc.addEventListener('input', function(){ pc.dataset.manual='1'; updatePreview(); });
  }
  
  function resetSubjectsForLevel(level){
    var pool  = RC_SUBJECTS[level] || RC_SUBJECTS.SS;
    activeSubjects = pool.slice(0, RC_DEFAULTS[level]||10).slice();
    buildScoreTable();
    updatePreview();
  }
  
  function buildScoreTable(){
    var tb = document.getElementById('scoresBody'); if(!tb) return;
    tb.innerHTML = activeSubjects.map(function(subj, i){
      return '<tr id="srow_'+i+'">'
        +'<td style="min-width:120px;font-size:.78rem;font-weight:500;">'+subj+'</td>'
        /* Class Work /10 */
        +'<td><input type="number" min="0" max="10" placeholder="0" class="score-inp cw-inp" data-row="'+i+'" data-max="10"'
          +' style="width:44px;padding:4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.78rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        /* Assignment /10 */
        +'<td><input type="number" min="0" max="10" placeholder="0" class="score-inp as-inp" data-row="'+i+'" data-max="10"'
          +' style="width:44px;padding:4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.78rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        /* Mid-Term /20 */
        +'<td><input type="number" min="0" max="20" placeholder="0" class="score-inp mid-inp" data-row="'+i+'" data-max="20"'
          +' style="width:48px;padding:4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.78rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        /* Exam /60 */
        +'<td><input type="number" min="0" max="60" placeholder="0" class="score-inp exam-inp" data-row="'+i+'" data-max="60"'
          +' style="width:48px;padding:4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.78rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        /* Auto cells */
        +'<td id="rt_'+i+'" style="font-weight:700;text-align:center;font-size:.78rem;">--</td>'
        +'<td id="rg_'+i+'" style="text-align:center;">--</td>'
        +'<td id="rrm_'+i+'" style="font-size:.7rem;color:#64748B;">--</td>'
        /* Remove */
        +'<td><button class="rm-subj-btn" data-row="'+i+'" style="background:rgba(239,68,68,.1);color:#EF4444;border:none;border-radius:5px;width:24px;height:24px;cursor:pointer;font-size:.75rem;">'
          +'<i class="fas fa-times"></i></button></td>'
        +'</tr>';
    }).join('');
  
    /* Score input event */
    tb.addEventListener('input', function(e){
      var inp = e.target; if(!inp.classList.contains('score-inp')) return;
      var max = parseInt(inp.dataset.max)||100;
      var v   = parseFloat(inp.value)||0;
      if(v > max) inp.value = max;
      if(v < 0)   inp.value = 0;
      inp.style.borderColor = (parseFloat(inp.value)===max && max!==0) ? '#22C55E' : '';
      recalcScores(); updatePreview();
    });
  
    /* Remove button */
    tb.querySelectorAll('.rm-subj-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var idx = parseInt(btn.dataset.row);
        if(activeSubjects.length<=1){ toast('Must have at least 1 subject.',true); return; }
        activeSubjects.splice(idx,1); buildScoreTable(); recalcScores(); updatePreview();
      });
    });
  }
  
  function showAddSubjectModal(){
    var level = getLevel((document.getElementById('rc_class')||{}).value||'SS 1A');
    var pool  = RC_SUBJECTS[level]||RC_SUBJECTS.SS;
    var available = pool.filter(function(s){ return activeSubjects.indexOf(s)<0; });
    if(document.getElementById('addSubjModal')) document.getElementById('addSubjModal').remove();
    var m = document.createElement('div');
    m.id  = 'addSubjModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;';
    var listHTML = available.length
      ? available.map(function(s){
          return '<label style="display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:7px;cursor:pointer;font-size:.83rem;">'
            +'<input type="checkbox" value="'+s+'" style="accent-color:#3B82F6;width:15px;height:15px;cursor:pointer;"/>'
            +'<span>'+s+'</span></label>';
        }).join('')
      : '<p style="color:#64748B;font-size:.83rem;padding:10px;">All subjects already added.</p>';
    listHTML += '<div style="border-top:1px solid var(--border,#E2E8F0);margin-top:12px;padding-top:12px;">'
      +'<p style="font-size:.74rem;color:#64748B;margin-bottom:6px;font-weight:600;">OR TYPE A CUSTOM SUBJECT</p>'
      +'<input type="text" id="customSubjInput" placeholder="e.g. Technical Drawing"'
      +' style="width:100%;padding:8px 10px;border:1.5px solid var(--border,#E2E8F0);border-radius:8px;font-size:.83rem;color:var(--text,#1E293B);background:var(--bg,#F8FAFC);outline:none;"/></div>';
    m.innerHTML = '<div style="background:var(--surface,#fff);border:1px solid var(--border,#E2E8F0);border-radius:16px;padding:24px;max-width:420px;width:100%;max-height:80vh;overflow-y:auto;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">'
      +'<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;"><i class="fas fa-book-open" style="color:#3B82F6"></i> Add Subjects</h3>'
      '<button onclick="document.getElementById(\'addSubjModal\').remove()" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748B;"><i class="fas fa-times"></i></button></div>'
      +'<div style="display:flex;flex-direction:column;gap:2px;max-height:300px;overflow-y:auto;margin-bottom:10px;">'+listHTML+'</div>'
      +'<div style="display:flex;gap:10px;margin-top:14px;">'
      +'<button onclick="document.getElementById(\'addSubjModal\').remove()" style="flex:1;padding:10px;border:1.5px solid var(--border,#E2E8F0);border-radius:9px;background:var(--surface,#fff);font-weight:600;font-size:.85rem;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>'
      +'<button id="doAddSubj" style="flex:1;padding:10px;border:none;border-radius:9px;background:#3B82F6;color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;"><i class="fas fa-plus"></i> Add Selected</button>'
      +'</div></div>';
    document.body.appendChild(m);
    document.getElementById('doAddSubj').addEventListener('click', function(){
      var checked = [];
      m.querySelectorAll('input[type=checkbox]:checked').forEach(function(cb){ checked.push(cb.value); });
      var custom = (document.getElementById('customSubjInput')||{}).value;
      if(custom && custom.trim()) checked.push(custom.trim());
      if(!checked.length){ toast('Select or type at least one subject.',true); return; }
      checked.forEach(function(s){ if(activeSubjects.indexOf(s)<0) activeSubjects.push(s); });
      m.remove(); buildScoreTable(); recalcScores(); updatePreview();
      toast('Subject(s) added!');
    });
  }
  
  function recalcScores(){
    var rows = document.querySelectorAll('#scoresBody tr');
    var grand = 0, count = 0;
    rows.forEach(function(row, i){
      var cw   = parseFloat((row.querySelector('.cw-inp')  ||{}).value)||0;
      var as2  = parseFloat((row.querySelector('.as-inp')  ||{}).value)||0;
      var mid  = parseFloat((row.querySelector('.mid-inp') ||{}).value)||0;
      var exam = parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      var tot  = cw+as2+mid+exam;
      var grd  = calcGrade100(tot);
      var rmk  = subjectRemark(grd);
      var clr  = gradeClr(grd);
      var has  = cw||as2||mid||exam;
      var tc = document.getElementById('rt_'+i);
      var gc = document.getElementById('rg_'+i);
      var rc = document.getElementById('rrm_'+i);
      if(tc) tc.textContent = has ? tot : '--';
      if(gc) gc.innerHTML  = has ? '<span style="color:'+clr+';font-weight:700;font-size:.78rem;">'+grd+'</span>' : '--';
      if(rc) rc.textContent = has ? rmk : '--';
      if(has){ grand += tot; count++; }
    });
    var obtainable = count * 100;
    var avg        = count ? (grand/count).toFixed(2) : '0.00';
    var grade      = count ? calcGrade100(parseFloat(avg)) : '--';
    setText('#totalScore',    count ? grand       : '--');
    setText('#totalObtainable', count ? obtainable : '--');
    setText('#avgScore',      count ? avg+'%'     : '--');
    setText('#overallGrade',  grade);
  
    /* Auto-generate annual total */
    var t1 = parseFloat((document.getElementById('rc_term1Total')||{}).value)||0;
    var t2 = parseFloat((document.getElementById('rc_term2Total')||{}).value)||0;
    var annualEl = document.getElementById('rc_annualTotal');
    if(annualEl && count) annualEl.value = t1 + t2 + grand;
  
    /* Auto-generate comments */
    if(count){
      var name = (document.getElementById('rc_studentName')||{}).value||'';
      var avgNum = parseFloat(avg);
      var tc2 = document.getElementById('rc_teacherComment');
      var pc2 = document.getElementById('rc_principalComment');
      if(tc2 && (!tc2.dataset.manual || tc2.dataset.manual==='0')) tc2.value = autoTeacherComment(avgNum, name);
      if(pc2 && (!pc2.dataset.manual || pc2.dataset.manual==='0')) pc2.value = autoPrincipalComment(avgNum, name);
    }
  }
  
  function updatePreview(){
    function gv(id){ var e=document.getElementById(id); return e?e.value.trim():''; }
    function st(id,v){ var e=document.getElementById(id); if(e) e.textContent=v||'--'; }
  
    /* School details */
    st('prev_schoolName', gv('rc_schoolName') || 'EMIRATE CLASSIC ACADEMY LTD');
    st('prev_schoolAddr', gv('rc_schoolAddr') || 'Gbaganu off Bida Road');
    st('prev_motto',      'Motto: '+(gv('rc_motto')||'Knowledge is power action and light'));
    st('prev_phone',      'Phone: '+(gv('rc_phone')||'--'));
  
    /* Student info */
    st('prev_name',      gv('rc_studentName') || '--');
    st('prev_admNo',     gv('rc_admNo')       || '--');
    st('prev_gender',    gv('rc_gender')      || '--');
    st('prev_class',     gv('rc_class')       || '--');
    st('prev_classSize', gv('rc_classSize')   || '--');
    st('prev_term',      gv('rc_term')        || '--');
    st('prev_session',   gv('rc_session')     || '--');
    st('prev_daysOpened',  gv('rc_daysOpened')  || '--');
    st('prev_daysPresent', gv('rc_daysPresent') || '--');
    st('prev_daysAbsent',  gv('rc_daysAbsent')  || '--');
  
    /* Position — with ordinal suffix */
    var pos = gv('rc_position');
    st('prev_position', pos ? pos : '--');
  
    /* Next term */
    var nt = gv('rc_nextTerm');
    if(nt){
      try{ st('prev_nextTerm', new Date(nt).toLocaleDateString('en-GB',{weekday:'long',year:'numeric',month:'long',day:'numeric'})); }
      catch(e){ st('prev_nextTerm', nt); }
    } else { st('prev_nextTerm','--'); }
  
    /* Scores table in preview */
    var rows  = document.querySelectorAll('#scoresBody tr');
    var grand = 0, count = 0, html = '';
    var t1Val = parseFloat(gv('rc_term1Total'))||0;
    var t2Val = parseFloat(gv('rc_term2Total'))||0;
  
    rows.forEach(function(row, i){
      var cw   = parseFloat((row.querySelector('.cw-inp')  ||{}).value)||0;
      var as2  = parseFloat((row.querySelector('.as-inp')  ||{}).value)||0;
      var mid  = parseFloat((row.querySelector('.mid-inp') ||{}).value)||0;
      var exam = parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      if(cw||as2||mid||exam){
        var tot  = cw+as2+mid+exam;
        var grd  = calcGrade100(tot);
        var rmk  = subjectRemark(grd);
        var clr  = gradeClr(grd);
        var ann  = tot; /* We don't have per-subject prev terms, show current only */
        grand += tot; count++;
        html += '<tr style="background:'+(count%2===0?'#F8FAFC':'#fff')+'">'
          +'<td style="padding:4px;border:1px solid #E2E8F0;font-size:.63rem;font-weight:500;">'+activeSubjects[i]+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;">'+cw+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;">'+as2+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;">'+mid+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;">'+exam+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;font-weight:700;">'+tot+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;color:#64748B;">--</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;color:#64748B;">--</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;font-weight:700;">'+tot+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-weight:700;color:'+clr+';font-size:.63rem;">'+grd+'</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;text-align:center;font-size:.63rem;">--</td>'
          +'<td style="padding:4px;border:1px solid #E2E8F0;font-size:.62rem;color:'+clr+';font-weight:600;">'+rmk+'</td>'
          +'</tr>';
      }
    });
  
    var prevTb = document.getElementById('prev_scoresBody');
    if(prevTb) prevTb.innerHTML = html ||
      '<tr><td colspan="12" style="text-align:center;color:#94A3B8;padding:14px;font-size:.75rem;border:1px solid #E2E8F0;">Enter scores on the left to see them here</td></tr>';
  
    /* Performance Summary */
    var obtainable = count * 100;
    var avg  = count ? (grand/count).toFixed(2) : '--';
    var grd2 = count ? calcGrade100(parseFloat(avg)) : '--';
    st('prev_total',      count ? grand       : '--');
    st('prev_obtainable', count ? obtainable  : '--');
    st('prev_avg',        count ? avg         : '--');
    st('prev_grade',      grd2);
  
    /* Annual */
    var annTotal  = t1Val + t2Val + grand;
    var annObtain = obtainable * 3;
    st('prev_annualMarks',    count ? annTotal  : '--');
    st('prev_annualTotal',    count ? annObtain : '--');
    st('prev_annualPosition', gv('rc_annualPosition') || '--');
  
    /* Comments */
    st('prev_teacherComment',   gv('rc_teacherComment')   || '--');
    st('prev_principalComment', gv('rc_principalComment') || '--');
  }
  
  function loadSavedScores(studentId){
    var saved = Store.get(KEY.RESULTS,[]).filter(function(r){
      return r.sid===studentId && r.session===App.session && r.term===App.term;
    });
    if(!saved.length) return;
    activeSubjects = saved.map(function(r){ return r.subject; });
    buildScoreTable();
    saved.forEach(function(r, i){
      function si(cls, v){ var el = q('#scoresBody tr:nth-child('+(i+1)+') .'+cls); if(el) el.value = v||0; }
      si('cw-inp',   r.cw   || r.ca1  || 0);
      si('as-inp',   r.asst || r.ca2  || 0);
      si('mid-inp',  r.mid  || 0);
      si('exam-inp', r.exam || 0);
    });
    recalcScores(); updatePreview();
  }
  
  function saveReportCard(){
    var name = (document.getElementById('rc_studentName')||{}).value||'';
    if(!name.trim()){ toast('Enter the student name first.',true); return; }
    var admNo = ((document.getElementById('rc_admNo')||{}).value||'').trim().toUpperCase();
    var student = admNo ? App.students.find(function(s){ return (s.admNo||'').toUpperCase()===admNo; }) : null;
    var rows = document.querySelectorAll('#scoresBody tr'), results = [];
    rows.forEach(function(row, i){
      var cw   = parseFloat((row.querySelector('.cw-inp')  ||{}).value)||0;
      var as2  = parseFloat((row.querySelector('.as-inp')  ||{}).value)||0;
      var mid  = parseFloat((row.querySelector('.mid-inp') ||{}).value)||0;
      var exam = parseFloat((row.querySelector('.exam-inp')||{}).value)||0;
      if(cw||as2||mid||exam){
        var tot = cw+as2+mid+exam;
        results.push({ sid:student?student.id:admNo||uid(), session:App.session, term:App.term,
          subject:activeSubjects[i], cw:cw, asst:as2, mid:mid, exam:exam, total:tot, grade:calcGrade100(tot) });
      }
    });
    if(!results.length){ toast('Enter at least one subject score.',true); return; }
    var sid = student ? student.id : results[0].sid;
    var other = Store.get(KEY.RESULTS,[]).filter(function(r){
      return !(r.sid===sid && r.session===App.session && r.term===App.term);
    });
    Store.set(KEY.RESULTS, other.concat(results));
    toast('Report card saved for '+name+'!');
  }
  
  function printReport(){
    var preview = document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var win = window.open('','_blank','width=1000,height=900');
    if(!win){ toast('Allow pop-ups for this page, then try again.',true); return; }
    var css = [
      '*{box-sizing:border-box;margin:0;padding:0;}',
      'body{font-family:Arial,sans-serif;background:#fff;padding:20px;color:#1E293B;}',
      '.report-card-preview{max-width:800px;margin:0 auto;background:#fff;padding:20px;}',
      '@media print{@page{size:A4;margin:12mm;}body{padding:0;}.report-card-preview{max-width:100%;padding:0;box-shadow:none;}}',
      'table{border-collapse:collapse;width:100%;}',
      'th,td{padding:4px 5px;border:1px solid #E2E8F0;}',
      '.fas{font-family:"Font Awesome 6 Free";font-weight:900;}',
    ].join('');
    win.document.write('<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Report Card — '+
      ((document.getElementById('rc_studentName')||{}).value||'Student')+'</title>'+
      '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>'+
      '<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap" rel="stylesheet"/>'+
      '<style>'+css+'</style></head><body>'+preview.outerHTML+
      '<script>window.onload=function(){window.print();};<\/script></body></html>');
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
    /* Wait for Chart.js CDN */
    if(typeof Chart === 'undefined'){
      setTimeout(drawCharts, 300);
      return;
    }
  
    App.chartsDrawn = true;
  
    /* Draw sparklines immediately */
    drawSparklines();
  
    /* Use requestAnimationFrame so browser fully paints layout first */
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        setChartContainerSize('performanceChart', 260);
        setChartContainerSize('gradeChart', 220);
        drawPerfChart();
        setTimeout(drawGradeDonut, 100);
      });
    });
  }
  
  /* Helper: force a chart canvas parent to have correct pixel size */
  function setChartContainerSize(canvasId, height){
    var cv = document.getElementById(canvasId);
    if(!cv) return;
    var parent = cv.parentElement;
    if(parent){
      parent.style.position = 'relative';
      parent.style.display  = 'block';
      parent.style.width    = '100%';
      parent.style.height   = height + 'px';
      parent.style.minHeight = height + 'px';
    }
    cv.style.position = 'absolute';
    cv.style.top      = '0';
    cv.style.left     = '0';
    cv.style.width    = '100%';
    cv.style.height   = '100%';
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
    /* Destroy existing chart first */
    if(CR['perf']){ try{ CR['perf'].destroy(); }catch(e){} delete CR['perf']; }
    /* Set height on the canvas parent wrapper */
    var wrap=cv.parentElement;
    if(wrap){
      wrap.style.position='relative';
      wrap.style.height='260px';
      wrap.style.display='block';
      wrap.style.width='100%';
    }
    cv.style.height='100%';
    cv.style.width='100%';
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
    if(CR['donut']){ try{ CR['donut'].destroy(); }catch(e){} delete CR['donut']; }
    var wrap=cv.parentElement;
    if(wrap){
      wrap.style.position='relative';
      wrap.style.height='220px';
      wrap.style.display='block';
      wrap.style.width='100%';
    }
    cv.style.height='100%';
    cv.style.width='100%';
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
    if(typeof Chart==='undefined'){ setTimeout(drawAnalyticsCharts,300); return; }
    /* Always redraw analytics charts when navigating to analytics page */
    App.analyticsDrawn=true;
    var TT={backgroundColor:'#0F172A',titleColor:'#F1F5F9',bodyColor:'#94A3B8',padding:10,cornerRadius:8};
    function mk(id,cfg){
      var cv=document.getElementById(id); if(!cv) return;
      if(CR[id]){ try{ CR[id].destroy(); }catch(e){} delete CR[id]; }
      /* Force parent size */
      setChartContainerSize(id, 220);
      reg(id, new Chart(cv.getContext('2d'), cfg));
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
      name:     'Mr. Jeremiah Olaoye',
      role:     'Super Admin',
      email:    'admin@ecacademy.edu.ng',
      phone:    '',
      subjects: ['Mathematics','Further Mathematics'],
      classes:  ['SS 2A','SS 3A'],
      status:   'active',
      joined:   '2026'
    },
    {
      id: 't2',
      name:     'Dr. Amaka Obi',
      role:     'Principal',
      email:    'principal@ecacademy.edu.ng',
      phone:    '',
      subjects: ['English Language','Literature in English'],
      classes:  ['SS 1A','SS 1B'],
      status:   'active',
      joined:   '2026'
    },
    {
      id: 't3',
      name:     'Mrs. Ngozi Eze',
      role:     'Teacher',
      email:    'teacher1@ecacademy.edu.ng',
      phone:    '',
      subjects: ['Biology','Chemistry'],
      classes:  ['SS 2B','JSS 3A'],
      status:   'active',
      joined:   '2026'
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
  
  /* ================================================================
     DOWNLOAD PDF
     ================================================================ */
  function downloadPDF(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var name=((document.getElementById('rc_studentName')||{}).value||'Student').replace(/\s+/g,'_');
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
      var pw=pdf.internal.pageSize.getWidth(),ph=pdf.internal.pageSize.getHeight(),mg=8;
      var iw=pw-(mg*2),ih=(canvas.height*iw)/canvas.width;
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
     DOWNLOAD AS IMAGE
     ================================================================ */
  function downloadImage(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var name=((document.getElementById('rc_studentName')||{}).value||'Student').replace(/\s+/g,'_');
    var filename='ReportCard_'+name+'_ECA.png';
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
     SHARE REPORT
     ================================================================ */
  function shareReport(){
    var preview=document.getElementById('reportPreview');
    if(!preview){ toast('Preview not found.',true); return; }
    var name=((document.getElementById('rc_studentName')||{}).value||'Student');
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
          navigator.share({files:[file],title:name+' - Report Card',
            text:name+' Report Card ('+term+', '+sess+') — Emirate Classic Academy'})
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
      navigator.share({title:name+' Report Card',text:text})
        .then(function(){ toast('Shared!'); })
        .catch(function(){ copyClip(text); });
    } else { copyClip(text); }
  }
  
  function copyClip(text){
    navigator.clipboard.writeText(text)
      .then(function(){ toast('Copied to clipboard!'); })
      .catch(function(){ toast('Use Download PDF to share.',true); });
  }
  
  /* ================================================================
     CLASS MANAGEMENT MODULE
     Each teacher manages their own class of up to 16 students.
     Uses Supabase if configured, falls back to localStorage.
     ================================================================ */
  
  var ClassApp = {
    teacher:    null,   /* current teacher profile from DB */
    students:   [],     /* students in this class */
    session:    '2026/2027',
    term:       '1st Term',
    maxStudents: 999
  };
  
  /* ── Load class page ─────────────────────────────────────────────── */
  async function loadClassPage(){
    showClassState('loading');
  
    /* Get logged-in user */
    var user = App.user;
    if(!user){ showClassState('setup'); return; }
  
    ClassApp.session = user.session || '2026/2027';
    ClassApp.term    = user.term    || '1st Term';
  
    /* Check if Supabase is configured */
    if(!isConfigured()){
      toast('⚠ Supabase not configured yet. Using local storage. See SETUP_SUPABASE.md',true);
      loadClassLocal();
      return;
    }
  
    try{
      /* Get or create teacher profile in DB */
      var teacher = await TeacherDB.get(user.email);
      if(!teacher){
        teacher = await TeacherDB.save({
          email: user.email, name: user.name,
          role: user.role, term: ClassApp.term
        });
      }
      ClassApp.teacher = teacher;
  
      if(!teacher || !teacher.class_assigned){
        showClassState('setup');
        return;
      }
  
      /* Load students */
      await refreshClassStudents();
      showClassState('main');
  
    } catch(e){
      console.error('loadClassPage:', e);
      toast('Database error. Using local storage.',true);
      loadClassLocal();
    }
  }
  
  /* ── Fallback: localStorage when Supabase not set up ────────────── */
  function loadClassLocal(){
    var user = App.user; if(!user) return;
    var key  = 'eca_class_'+user.email.replace(/\W/g,'_');
    var saved = Store.get(key, { class_assigned:'', students:[] });
    ClassApp.teacher = { email:user.email, name:user.name,
      class_assigned: saved.class_assigned, session: ClassApp.session, term: ClassApp.term };
    ClassApp.students = saved.students || [];
  
    if(!saved.class_assigned){ showClassState('setup'); return; }
    renderClassStudents();
    showClassState('main');
  }
  
  function saveClassLocal(){
    var user = App.user; if(!user) return;
    var key  = 'eca_class_'+user.email.replace(/\W/g,'_');
    Store.set(key, {
      class_assigned: ClassApp.teacher ? ClassApp.teacher.class_assigned : '',
      students: ClassApp.students
    });
  }
  
  /* ── Show correct panel ──────────────────────────────────────────── */
  function showClassState(state){
    var loading = document.getElementById('classLoadingState');
    var setup   = document.getElementById('classSetupPanel');
    var main    = document.getElementById('classMainPanel');
    if(loading) loading.style.display = state==='loading' ? 'block' : 'none';
    if(setup)   setup.style.display   = state==='setup'   ? 'block' : 'none';
    if(main)    main.style.display    = state==='main'    ? 'block' : 'none';
  }
  
  /* ── Teacher registers their class ───────────────────────────────── */
  async function registerTeacherClass(){
    var cls  = (document.getElementById('teacherClassSelect')||{}).value||'';
    var term = (document.getElementById('teacherTermSelect') ||{}).value||'1st Term';
    if(!cls){ toast('Please select your class first.',true); return; }
  
    ClassApp.term = term;
  
    if(isConfigured() && ClassApp.teacher){
      await TeacherDB.save({
        email: ClassApp.teacher.email,
        name:  ClassApp.teacher.name,
        role:  ClassApp.teacher.role,
        class_assigned: cls,
        term:  term
      });
      ClassApp.teacher.class_assigned = cls;
      await refreshClassStudents();
    } else {
      if(!ClassApp.teacher) ClassApp.teacher = { email: App.user.email, name: App.user.name, role: App.user.role };
      ClassApp.teacher.class_assigned = cls;
      saveClassLocal();
    }
  
    showClassState('main');
    updateClassHeader();
    toast('Class registered: '+cls+' — '+term);
  }
  
  /* ── Refresh students from DB ────────────────────────────────────── */
  async function refreshClassStudents(){
    if(!ClassApp.teacher) return;
    ClassApp.students = await StudentDB.getAll(
      ClassApp.teacher.email, ClassApp.session, ClassApp.term
    );
    renderClassStudents();
    updateClassHeader();
  }
  
  /* ── Update header title & subtitle ─────────────────────────────── */
  function updateClassHeader(){
    var t   = ClassApp.teacher;
    var cls = t ? t.class_assigned : '';
    var titleEl = document.getElementById('classPanelTitle');
    var subEl   = document.getElementById('classPanelSub');
    var limitEl = document.getElementById('classLimitNote');
    var addBtn  = document.getElementById('btnAddStudent');
  
    if(titleEl) titleEl.innerHTML = '<i class="fas fa-chalkboard" style="color:#3B82F6"></i> '+cls+' Class';
    if(subEl)   subEl.textContent = ClassApp.session+' — '+ClassApp.term+' | Emirate Classic Academy';
  
    var count = ClassApp.students.length;
    if(limitEl) limitEl.textContent = count+' student'+(count!==1?'s':'');
    if(addBtn)  addBtn.disabled = count >= ClassApp.maxStudents;
    /* No limit on students */
  
    /* Stat cards */
    setText('#classStudentCount', count);
    /* Count how many have results */
    var withResults = ClassApp.students.filter(function(s){ return s._hasResults; }).length;
    setText('#classResultCount', withResults);
    /* Top student */
    var top = ClassApp.students.find(function(s){ return s.position===1; });
    setText('#classTopStudent', top ? top.full_name : '--');
  }
  
  /* ── Render student list ─────────────────────────────────────────── */
  function renderClassStudents(){
    var list  = document.getElementById('classStudentList');
    var empty = document.getElementById('classEmptyState');
    if(!list) return;
  
    var students = ClassApp.students;
  
    if(!students.length){
      list.innerHTML = '';
      if(empty) empty.style.display = 'block';
      updateClassHeader();
      return;
    }
    if(empty) empty.style.display = 'none';
  
    /* Sort by position if available, else by name */
    var sorted = students.slice().sort(function(a,b){
      if(a.position && b.position) return a.position - b.position;
      return (a.full_name||'').localeCompare(b.full_name||'');
    });
  
    list.innerHTML = sorted.map(function(s, i){
      var posColor = s.position===1?'#F59E0B': s.position===2?'#94A3B8': s.position===3?'#CD7C2F':'#3B82F6';
      var posText  = s.position ? ordinal(s.position) : '--';
      var colors   = ['#3B82F6','#7C3AED','#22C55E','#F59E0B','#EF4444','#60A5FA','#EC4899','#14B8A6'];
      var color    = colors[i % colors.length];
      var initials = (s.full_name||'?').split(' ').map(function(w){ return w[0]; }).join('').slice(0,2).toUpperCase();
  
      return [
        '<div style="display:flex;align-items:center;gap:14px;padding:14px 18px;border-bottom:1px solid var(--border);transition:background .15s;"',
          'onmouseover="this.style.background=\'rgba(59,130,246,.04)\'" onmouseout="this.style.background=\'\'">',
  
          /* Position badge */
          '<div style="width:34px;height:34px;border-radius:50%;background:'+posColor+';display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:800;color:#fff;flex-shrink:0;">',
            s.position||'--',
          '</div>',
  
          /* Avatar */
          '<div style="width:40px;height:40px;border-radius:50%;background:'+color+';display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:#fff;flex-shrink:0;">',
            initials,
          '</div>',
  
          /* Info */
          '<div style="flex:1;min-width:0;">',
            '<div style="font-weight:700;font-size:.9rem;color:var(--text);">'+s.full_name+'</div>',
            '<div style="font-size:.75rem;color:#64748B;margin-top:2px;">',
              (s.adm_no||'No Adm. No.')+' · '+(s.gender||'')+' · Pos: <strong style="color:'+posColor+'">'+posText+'</strong>',
            '</div>',
          '</div>',
  
          /* Action buttons */
          '<div style="display:flex;gap:6px;flex-shrink:0;">',
            '<button onclick="openStudentScores(\''+s.id+'\')" title="Enter Scores"',
              'style="padding:7px 12px;background:rgba(59,130,246,.1);color:#3B82F6;border:1px solid rgba(59,130,246,.25);border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;">',
              '<i class="fas fa-edit"></i> Scores',
            '</button>',
            '<button onclick="previewStudentCard(\''+s.id+'\')" title="View Report Card"',
              'style="padding:7px 12px;background:rgba(124,58,237,.1);color:#7C3AED;border:1px solid rgba(124,58,237,.25);border-radius:8px;font-size:.78rem;font-weight:600;cursor:pointer;">',
              '<i class="fas fa-file-alt"></i> Card',
            '</button>',
            '<button onclick="deleteClassStudent(\''+s.id+'\')" title="Remove Student"',
              'style="padding:7px 10px;background:rgba(239,68,68,.08);color:#EF4444;border:1px solid rgba(239,68,68,.2);border-radius:8px;font-size:.78rem;cursor:pointer;">',
              '<i class="fas fa-trash-alt"></i>',
            '</button>',
          '</div>',
  
        '</div>'
      ].join('');
    }).join('');
  
    updateClassHeader();
  }
  
  /* ── Ordinal number (1st, 2nd, 3rd...) ──────────────────────────── */
  function ordinal(n){
    var s = ['th','st','nd','rd'];
    var v = n%100;
    return n+(s[(v-20)%10]||s[v]||s[0]);
  }
  
  /* ── Add Student Modal ───────────────────────────────────────────── */
  function showAddStudentModal(editId){
    var existing = editId ? ClassApp.students.find(function(s){ return s.id===editId; }) : null;
    var m = document.createElement('div');
    m.id  = 'addStudentModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:16px;overflow-y:auto;';
  
    var cls = ClassApp.teacher ? ClassApp.teacher.class_assigned : '';
    var currentCount = ClassApp.students.length;
    var nextNum = currentCount + 1;
    var defaultAdm = 'ECA/2026/'+String(nextNum).padStart(3,'0');
  
    m.innerHTML = [
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:26px;max-width:440px;width:100%;max-height:90vh;overflow-y:auto;">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">',
          '<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;">',
            '<i class="fas fa-user-plus" style="color:#3B82F6"></i> ',
            editId ? 'Edit Student' : 'Add Student to '+cls,
          '</h3>',
          '<button onclick="document.getElementById(\'addStudentModal\').remove()" style="background:none;border:none;font-size:1.1rem;cursor:pointer;color:#64748B;"><i class="fas fa-times"></i></button>',
        '</div>',
  
        /* Full Name */
        field('Full Name','as_name','text',(existing?existing.full_name:''),'e.g. AMAKA OKAFOR','fas fa-user'),
        /* Admission No */
        field('Admission No.','as_adm','text',(existing?existing.adm_no:defaultAdm),'ECA/2026/001','fas fa-id-card'),
        /* Gender */
        '<div style="margin-bottom:12px;">',
          '<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;margin-bottom:4px;">Gender</label>',
          '<select id="as_gender" style="width:100%;padding:9px 12px;border:1.5px solid var(--border);border-radius:8px;font-family:Inter,sans-serif;font-size:.85rem;color:var(--text);background:var(--bg);outline:none;">',
            '<option '+(existing&&existing.gender==='Male'?'selected':'')+'>Male</option>',
            '<option '+(existing&&existing.gender==='Female'?'selected':'')+'>Female</option>',
          '</select>',
        '</div>',
        /* Date of Birth */
        field('Date of Birth','as_dob','date',(existing?existing.dob:''),'','fas fa-calendar'),
  
        /* Buttons */
        '<div style="display:flex;gap:10px;margin-top:18px;">',
          '<button onclick="document.getElementById(\'addStudentModal\').remove()" style="flex:1;padding:10px;border:1.5px solid var(--border);border-radius:9px;background:var(--surface);color:var(--text);font-weight:600;font-size:.85rem;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>',
          '<button onclick="saveClassStudent(\''+(editId||'')+'\''+')" style="flex:1;padding:10px;border:none;border-radius:9px;background:#3B82F6;color:#fff;font-weight:700;font-size:.85rem;cursor:pointer;"><i class="fas fa-save"></i> '+(editId?'Save Changes':'Add Student')+'</button>',
        '</div>',
      '</div>'
    ].join('');
  
    document.body.appendChild(m);
    setTimeout(function(){ var n=document.getElementById('as_name'); if(n) n.focus(); },100);
  }
  
  function field(label, id, type, val, ph, icon){
    return '<div style="margin-bottom:12px;">'
      +'<label style="display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.4px;color:#64748B;margin-bottom:4px;">'+label+'</label>'
      +'<div style="position:relative;">'
      +'<i class="'+icon+'" style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#64748B;font-size:.82rem;"></i>'
      +'<input type="'+type+'" id="'+id+'" value="'+val+'" placeholder="'+ph+'"'
      +' style="width:100%;padding:9px 12px 9px 34px;border:1.5px solid var(--border);border-radius:8px;'
      +'font-family:Inter,sans-serif;font-size:.85rem;color:var(--text);background:var(--bg);outline:none;"/>'
      +'</div></div>';
  }
  
  async function saveClassStudent(editId){
    var name   = (document.getElementById('as_name')  ||{}).value||'';
    var adm    = (document.getElementById('as_adm')   ||{}).value||'';
    var gender = (document.getElementById('as_gender')||{}).value||'Male';
    var dob    = (document.getElementById('as_dob')   ||{}).value||'';
  
    if(!name.trim()){ toast('Please enter the student name.',true); return; }
  
    var teacher = ClassApp.teacher;
    if(!teacher){ toast('No class registered.',true); return; }
  
    if(isConfigured()){
      if(editId){
        await StudentDB.update(editId, { full_name:name.trim(), adm_no:adm, gender:gender, dob:dob });
        toast('Student updated!');
      } else {
        /* No student limit — teachers can add as many students as needed */
        await StudentDB.add({
          teacher_email: teacher.email,
          class: teacher.class_assigned,
          session: ClassApp.session,
          term: ClassApp.term,
          adm_no: adm, full_name: name.trim(),
          gender: gender, dob: dob
        });
        toast(name+' added to '+teacher.class_assigned+'!');
      }
      document.getElementById('addStudentModal').remove();
      await refreshClassStudents();
    } else {
      /* localStorage fallback */
      if(editId){
        var s = ClassApp.students.find(function(x){ return x.id===editId; });
        if(s){ s.full_name=name.trim(); s.adm_no=adm; s.gender=gender; s.dob=dob; }
      } else {
        /* No student limit — teachers can add as many students as needed */
        ClassApp.students.push({
          id: 's'+Date.now(), full_name:name.trim(), adm_no:adm,
          gender:gender, dob:dob, class:teacher.class_assigned,
          session:ClassApp.session, term:ClassApp.term,
          teacher_email:teacher.email, position:null, total_students:null
        });
      }
      saveClassLocal();
      document.getElementById('addStudentModal').remove();
      renderClassStudents();
      toast(editId ? 'Student updated!' : name+' added!');
    }
  }
  
  async function deleteClassStudent(id){
    var s = ClassApp.students.find(function(x){ return x.id===id; });
    if(!s) return;
    showDeleteConfirm(s.full_name, async function(){
      if(isConfigured()){
        await StudentDB.delete(id);
        await refreshClassStudents();
      } else {
        ClassApp.students = ClassApp.students.filter(function(x){ return x.id!==id; });
        saveClassLocal();
        renderClassStudents();
      }
      toast(s.full_name+' removed.');
    });
  }
  
  /* ── Enter Scores for a Student ──────────────────────────────────── */
  async function openStudentScores(studentId){
    var student = ClassApp.students.find(function(s){ return s.id===studentId; });
    if(!student){ toast('Student not found.',true); return; }
  
    /* Load existing results */
    var existing = [];
    if(isConfigured()){
      existing = await ResultDB.getByStudent(studentId, ClassApp.session, ClassApp.term);
    } else {
      existing = Store.get('eca_scores_'+studentId, []);
    }
  
    /* Get subjects for this class level */
    var level    = getLevel(student.class||ClassApp.teacher.class_assigned||'SS 1A');
    var subjects = RC_SUBJECTS[level] || RC_SUBJECTS.SS;
  
    var m = document.createElement('div');
    m.id  = 'scoresModal';
    m.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(15,23,42,.85);backdrop-filter:blur(6px);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;';
  
    var rows = subjects.map(function(subj, i){
      var r   = existing.find(function(x){ return x.subject===subj; }) || {};
      return '<tr>'
        +'<td style="padding:7px 8px;font-size:.8rem;font-weight:500;border-bottom:1px solid var(--border);">'+subj+'</td>'
        +'<td style="padding:4px;border-bottom:1px solid var(--border);"><input type="number" min="0" max="10" value="'+(r.cw||'')+'" placeholder="0" class="ss-cw" data-s="'+subj+'" style="width:46px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td style="padding:4px;border-bottom:1px solid var(--border);"><input type="number" min="0" max="10" value="'+(r.asst||'')+'" placeholder="0" class="ss-asst" data-s="'+subj+'" style="width:46px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td style="padding:4px;border-bottom:1px solid var(--border);"><input type="number" min="0" max="20" value="'+(r.mid||'')+'" placeholder="0" class="ss-mid" data-s="'+subj+'" style="width:48px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td style="padding:4px;border-bottom:1px solid var(--border);"><input type="number" min="0" max="60" value="'+(r.exam||'')+'" placeholder="0" class="ss-exam" data-s="'+subj+'" style="width:52px;padding:5px 4px;text-align:center;border:1.5px solid var(--border);border-radius:5px;font-size:.8rem;background:var(--bg);color:var(--text);outline:none;"></td>'
        +'<td id="stot_'+i+'" style="padding:7px 8px;text-align:center;font-weight:700;font-size:.8rem;border-bottom:1px solid var(--border);">'+(r.total||'--')+'</td>'
        +'<td id="sgrd_'+i+'" style="padding:7px 8px;text-align:center;font-size:.8rem;border-bottom:1px solid var(--border);">'+(r.grade||'--')+'</td>'
        +'</tr>';
    }).join('');
  
    m.innerHTML = [
      '<div style="background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;max-width:700px;width:100%;margin:auto;">',
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">',
          '<div>',
            '<h3 style="font-family:Poppins,sans-serif;font-size:1rem;font-weight:700;"><i class="fas fa-edit" style="color:#3B82F6"></i> Enter Scores — '+student.full_name+'</h3>',
            '<p style="font-size:.75rem;color:#64748B;">'+(student.adm_no||'No Adm. No.')+' · '+(student.class||'')+' · '+ClassApp.term+'</p>',
          '</div>',
          '<button onclick="document.getElementById(\'scoresModal\').remove()" style="background:none;border:none;font-size:1.2rem;cursor:pointer;color:#64748B;"><i class="fas fa-times"></i></button>',
        '</div>',
        '<div style="background:rgba(59,130,246,.06);border:1px solid rgba(59,130,246,.15);border-radius:8px;padding:8px 12px;margin-bottom:12px;font-size:.74rem;color:#3B82F6;">',
          '<i class="fas fa-info-circle"></i> CW /10 + Assignment /10 + Mid-Term /20 + Exam /60 = 100',
        '</div>',
        '<div style="overflow-x:auto;">',
        '<table style="width:100%;border-collapse:collapse;">',
          '<thead><tr style="background:#1E3A5F;color:#fff;">',
            '<th style="padding:8px;text-align:left;font-size:.72rem;min-width:130px;">Subject</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">CW<br>/10</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">Asst<br>/10</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">Mid<br>/20</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">Exam<br>/60</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">Total</th>',
            '<th style="padding:8px;text-align:center;font-size:.72rem;">Grade</th>',
          '</tr></thead>',
          '<tbody id="scoreModalBody">'+rows+'</tbody>',
        '</table>',
        '</div>',
        /* Overall summary */
        '<div style="display:flex;gap:16px;margin-top:14px;padding:12px;background:var(--bg);border-radius:10px;font-size:.82rem;">',
          '<div><span style="color:#64748B;">Total Obtained: </span><strong id="smTotalObt">--</strong></div>',
          '<div><span style="color:#64748B;">Avg: </span><strong id="smAvg">--</strong></div>',
          '<div><span style="color:#64748B;">Grade: </span><strong id="smGrade">--</strong></div>',
        '</div>',
        '<div style="display:flex;gap:10px;margin-top:14px;">',
          '<button onclick="document.getElementById(\'scoresModal\').remove()" style="flex:1;padding:11px;border:1.5px solid var(--border);border-radius:9px;background:var(--surface);color:var(--text);font-weight:600;font-size:.85rem;cursor:pointer;"><i class="fas fa-times"></i> Cancel</button>',
          '<button onclick="saveStudentScores(\''+studentId+'\')" style="flex:2;padding:11px;border:none;border-radius:9px;background:#3B82F6;color:#fff;font-weight:700;font-size:.88rem;cursor:pointer;"><i class="fas fa-save"></i> Save Scores</button>',
        '</div>',
      '</div>'
    ].join('');
  
    document.body.appendChild(m);
  
    /* Wire live recalc in modal */
    var tbody = document.getElementById('scoreModalBody');
    if(tbody) tbody.addEventListener('input', function(e){
      if(!e.target.matches('input')) return;
      var max = parseInt(e.target.max)||100;
      var v   = parseFloat(e.target.value)||0;
      if(v>max) e.target.value=max;
      if(v<0)   e.target.value=0;
      recalcScoreModal(subjects);
    });
    recalcScoreModal(subjects);
  }
  
  function recalcScoreModal(subjects){
    var grand=0, count=0;
    subjects.forEach(function(subj, i){
      var cw   = parseFloat((document.querySelector('.ss-cw[data-s="'+subj+'"]')  ||{}).value)||0;
      var asst = parseFloat((document.querySelector('.ss-asst[data-s="'+subj+'"]')||{}).value)||0;
      var mid  = parseFloat((document.querySelector('.ss-mid[data-s="'+subj+'"]') ||{}).value)||0;
      var exam = parseFloat((document.querySelector('.ss-exam[data-s="'+subj+'"]')||{}).value)||0;
      var tot  = cw+asst+mid+exam;
      var has  = cw||asst||mid||exam;
      var grd  = has ? gradeFrom(tot) : '--';
      var tc   = document.getElementById('stot_'+i);
      var gc   = document.getElementById('sgrd_'+i);
      if(tc) tc.textContent = has ? tot : '--';
      if(gc){ gc.textContent=grd; gc.style.color=has?gradeClr(grd):'#64748B'; gc.style.fontWeight=has?'700':'400'; }
      if(has){ grand+=tot; count++; }
    });
    var avg  = count ? (grand/count).toFixed(1) : '--';
    var grd2 = count ? gradeFrom(parseFloat(avg)) : '--';
    setText('#smTotalObt', count ? grand+'/'+(count*100) : '--');
    setText('#smAvg',      count ? avg+'%'              : '--');
    setText('#smGrade',    grd2);
  }
  
  async function saveStudentScores(studentId){
    var student  = ClassApp.students.find(function(s){ return s.id===studentId; });
    if(!student){ toast('Student not found.',true); return; }
    var level    = getLevel(student.class || (ClassApp.teacher?ClassApp.teacher.class_assigned:'SS'));
    var subjects = RC_SUBJECTS[level] || RC_SUBJECTS.SS;
    var scores   = [];
  
    subjects.forEach(function(subj){
      var cw   = parseFloat((document.querySelector('.ss-cw[data-s="'+subj+'"]')  ||{}).value)||0;
      var asst = parseFloat((document.querySelector('.ss-asst[data-s="'+subj+'"]')||{}).value)||0;
      var mid  = parseFloat((document.querySelector('.ss-mid[data-s="'+subj+'"]') ||{}).value)||0;
      var exam = parseFloat((document.querySelector('.ss-exam[data-s="'+subj+'"]')||{}).value)||0;
      if(cw||asst||mid||exam) scores.push({ subject:subj, cw:cw, asst:asst, mid:mid, exam:exam });
    });
  
    if(!scores.length){ toast('Enter at least one subject score.',true); return; }
  
    if(isConfigured()){
      await ResultDB.save(studentId, ClassApp.teacher.email, ClassApp.session, ClassApp.term, scores);
    } else {
      var saved = scores.map(function(s){
        var tot=s.cw+s.asst+s.mid+s.exam;
        return Object.assign({},s,{student_id:studentId,session:ClassApp.session,term:ClassApp.term,total:tot,grade:gradeFrom(tot),remark:remarkFrom(tot)});
      });
      Store.set('eca_scores_'+studentId, saved);
      student._hasResults = true;
    }
  
    document.getElementById('scoresModal').remove();
    toast('Scores saved for '+student.full_name+'!');
    if(isConfigured()) await refreshClassStudents();
    else renderClassStudents();
  }
  
  /* ── Calculate Positions ─────────────────────────────────────────── */
  async function calcAndShowPositions(){
    var btn = document.getElementById('btnCalcPos');
    if(btn){ btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Calculating...'; btn.disabled=true; }
  
    if(isConfigured()){
      await StudentDB.calcPositions(ClassApp.teacher.email, ClassApp.session, ClassApp.term);
      await refreshClassStudents();
    } else {
      /* Local fallback — load each student's scores and rank */
      var withAvg = ClassApp.students.map(function(s){
        var scores = Store.get('eca_scores_'+s.id, []);
        var total  = scores.reduce(function(sum,r){ return sum+(parseFloat(r.total)||0); },0);
        var avg    = scores.length ? total/scores.length : 0;
        return { id:s.id, avg:avg };
      });
      withAvg.sort(function(a,b){ return b.avg-a.avg; });
      withAvg.forEach(function(x,i){
        var s = ClassApp.students.find(function(st){ return st.id===x.id; });
        if(s){ s.position=i+1; s.total_students=withAvg.length; }
      });
      saveClassLocal();
      renderClassStudents();
    }
  
    if(btn){ btn.innerHTML='<i class="fas fa-trophy"></i> Calculate Positions'; btn.disabled=false; }
    toast('Positions calculated! Students ranked 1st to '+ClassApp.students.length+'th.');
  }
  
  /* ── Preview / Print one student's report card ───────────────────── */
  async function previewStudentCard(studentId){
    var student = ClassApp.students.find(function(s){ return s.id===studentId; });
    if(!student){ toast('Student not found.',true); return; }
  
    var scores = [];
    if(isConfigured()){
      scores = await ResultDB.getByStudent(studentId, ClassApp.session, ClassApp.term);
    } else {
      scores = Store.get('eca_scores_'+studentId, []);
    }
  
    if(!scores.length){ toast('No scores entered for '+student.full_name+' yet.',true); return; }
  
    /* Populate the report card form and navigate to it */
    goTo('report', q('.nav-item[data-page="report"]'));
  
    setTimeout(function(){
      /* Fill student fields */
      function sv(id,v){ var e=document.getElementById(id); if(e) e.value=v; }
      sv('rc_studentName', student.full_name||'');
      sv('rc_admNo',       student.adm_no||'');
      sv('rc_gender',      student.gender||'Male');
      sv('rc_class',       student.class||ClassApp.teacher.class_assigned||'');
      sv('rc_session',     ClassApp.session);
      sv('rc_term',        ClassApp.term);
      sv('rc_classSize',   ClassApp.students.length);
      sv('rc_position',    student.position ? ordinal(student.position) : '');
  
      /* Reset and rebuild score table */
      var level = getLevel(student.class||ClassApp.teacher.class_assigned||'SS');
      activeSubjects = scores.map(function(r){ return r.subject; });
      buildScoreTable();
  
      /* Fill scores */
      scores.forEach(function(r, i){
        function si(cls,v){ var el=q('#scoresBody tr:nth-child('+(i+1)+') .'+cls); if(el) el.value=v||0; }
        si('cw-inp',   r.cw||0);
        si('as-inp',   r.asst||0);
        si('mid-inp',  r.mid||0);
        si('exam-inp', r.exam||0);
      });
  
      recalcScores();
      updatePreview();
      toast('Report card loaded for '+student.full_name+'. Click Print to print!');
    }, 300);
  }
  
  /* ── Print ALL report cards ──────────────────────────────────────── */
  async function printAllReportCards(){
    if(!ClassApp.students.length){ toast('No students to print.',true); return; }
    toast('Opening all report cards for printing...');
    for(var i=0; i<ClassApp.students.length; i++){
      await previewStudentCard(ClassApp.students[i].id);
      await new Promise(function(r){ setTimeout(r, 500); });
    }
  }
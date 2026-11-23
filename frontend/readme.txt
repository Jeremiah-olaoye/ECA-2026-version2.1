<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>EduTrack Pro — Emirate Classic Academy</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet"/>
  <!-- Font Awesome Icons -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"/>
  <style>
    :root{--primary:#3B82F6;--pdark:#2563EB;--accent:#7C3AED;--bg:#F8FAFC;--surface:#FFFFFF;--border:#E2E8F0;--text:#1E293B;--muted:#64748B;--danger:#EF4444;--success:#22C55E;}
    [data-theme="dark"]{--bg:#0D1117;--surface:#161B22;--border:#30363D;--text:#E6EDF3;--muted:#8B949E;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;display:flex;transition:background .25s,color .25s;}
    .left{flex:1;background:linear-gradient(145deg,#0F172A 0%,#1E3A5F 50%,#0F172A 100%);display:flex;align-items:center;justify-content:center;padding:48px;position:relative;overflow:hidden;}
    .left::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 30% 50%,rgba(59,130,246,.22) 0%,transparent 60%),radial-gradient(ellipse at 80% 20%,rgba(124,58,237,.18) 0%,transparent 50%);}
    .blob{position:absolute;border-radius:50%;opacity:.08;}
    .b1{width:340px;height:340px;background:#3B82F6;top:-100px;right:-100px;}
    .b2{width:240px;height:240px;background:#7C3AED;bottom:-80px;left:-80px;}
    .left-inner{position:relative;z-index:1;text-align:center;max-width:420px;}
    .logo-box{width:80px;height:80px;background:linear-gradient(135deg,#3B82F6,#7C3AED);border-radius:20px;display:flex;align-items:center;justify-content:center;margin:0 auto 18px;box-shadow:0 8px 32px rgba(59,130,246,.45);}
    .logo-box span{font-family:'Poppins',sans-serif;font-size:1.6rem;font-weight:800;color:#fff;letter-spacing:1px;}
    .brand{font-family:'Poppins',sans-serif;font-size:1.5rem;font-weight:800;color:#fff;margin-bottom:4px;}
    .brand-sub{font-size:.85rem;color:#60A5FA;font-weight:600;margin-bottom:12px;}
    .tagline{font-size:.88rem;color:#94A3B8;line-height:1.7;margin-bottom:40px;}
    .feats{list-style:none;text-align:left;display:flex;flex-direction:column;gap:14px;}
    .feats li{display:flex;align-items:center;gap:12px;color:#CBD5E1;font-size:.86rem;}
    .ficon{width:36px;height:36px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1rem;}
    .right{width:480px;flex-shrink:0;background:var(--surface);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 40px;position:relative;}
    .form-wrap{width:100%;max-width:370px;}
    .tbtn{position:absolute;top:18px;right:18px;background:var(--bg);border:1.5px solid var(--border);border-radius:9px;width:38px;height:38px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;color:var(--muted);transition:all .2s;}
    .tbtn:hover{border-color:var(--primary);color:var(--primary);}
    .tabs{display:flex;gap:3px;background:var(--bg);border:1.5px solid var(--border);border-radius:10px;padding:4px;margin-bottom:24px;}
    .tab{flex:1;padding:9px;border:none;background:none;border-radius:7px;font-family:'Inter',sans-serif;font-size:.83rem;font-weight:600;color:var(--muted);cursor:pointer;transition:all .18s;}
    .tab.active{background:var(--surface);color:var(--primary);box-shadow:0 1px 5px rgba(0,0,0,.09);}
    .ftitle{font-family:'Poppins',sans-serif;font-size:1.3rem;font-weight:700;color:var(--text);margin-bottom:4px;}
    .fdesc{font-size:.82rem;color:var(--muted);margin-bottom:20px;}
    .field{margin-bottom:14px;}
    .field label{display:block;font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);margin-bottom:5px;}
    .fw{position:relative;}
    .fi{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:.88rem;color:var(--muted);pointer-events:none;}
    .fw input{width:100%;padding:10px 38px;border:1.5px solid var(--border);border-radius:9px;font-family:'Inter',sans-serif;font-size:.88rem;color:var(--text);background:var(--bg);outline:none;transition:all .2s;}
    [data-theme="dark"] .fw input{background:#0D1117;}
    .fw input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(59,130,246,.14);background:var(--surface);}
    .fw input.bad{border-color:var(--danger);animation:shake .35s ease;}
    @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-5px)}40%{transform:translateX(5px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}
    .eyebtn{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;font-size:.88rem;color:var(--muted);padding:2px;}
    .eyebtn:hover{color:var(--primary);}
    .rowflex{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
    .remem{display:flex;align-items:center;gap:7px;font-size:.82rem;color:var(--muted);cursor:pointer;user-select:none;}
    .remem input{accent-color:var(--primary);width:15px;height:15px;cursor:pointer;}
    .lnkbtn{background:none;border:none;color:var(--primary);font-size:.82rem;font-weight:600;cursor:pointer;padding:0;}
    .lnkbtn:hover{opacity:.7;}
    .banner{display:none;align-items:center;gap:9px;padding:11px 14px;border-radius:9px;font-size:.82rem;margin-bottom:14px;}
    .banner.show{display:flex;}
    .berr{background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.25);color:#DC2626;}
    .bok{background:rgba(34,197,94,.1);border:1px solid rgba(34,197,94,.25);color:#16a34a;}
    .btngo{width:100%;padding:12px;background:var(--primary);color:#fff;border:none;border-radius:9px;font-family:'Inter',sans-serif;font-size:.92rem;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:8px;position:relative;}
    .btngo:hover:not(:disabled){background:var(--pdark);box-shadow:0 4px 16px rgba(59,130,246,.38);transform:translateY(-1px);}
    .btngo:disabled{opacity:.6;cursor:not-allowed;transform:none;}
    .spin{width:17px;height:17px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:rot .65s linear infinite;display:none;flex-shrink:0;}
    .btngo.loading .spin{display:block;}
    .btngo.loading .lbl{opacity:0;position:absolute;}
    @keyframes rot{to{transform:rotate(360deg)}}
    .otp-box{background:linear-gradient(135deg,#0F172A,#1E3A5F);border:2px solid rgba(59,130,246,.35);border-radius:14px;padding:20px;text-align:center;margin:4px 0 16px;}
    .otp-label{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#60A5FA;margin-bottom:8px;}
    .otp-code{font-family:'Poppins',sans-serif;font-size:2.6rem;font-weight:800;letter-spacing:10px;color:#fff;text-shadow:0 0 20px rgba(59,130,246,.6);}
    .otp-timer{font-size:.74rem;color:#94A3B8;margin-top:6px;}
    .otp-copy{background:rgba(59,130,246,.2);border:1px solid rgba(59,130,246,.3);color:#93C5FD;border-radius:7px;font-size:.74rem;font-weight:600;cursor:pointer;padding:5px 14px;margin-top:10px;transition:all .2s;}
    .otp-inputs{display:flex;gap:8px;justify-content:center;margin-bottom:16px;}
    .otp-input{width:46px;height:54px;border:2px solid var(--border);border-radius:10px;font-family:'Poppins',sans-serif;font-size:1.4rem;font-weight:700;text-align:center;color:var(--text);background:var(--bg);outline:none;transition:all .2s;}
    .otp-input:focus{border-color:var(--primary);box-shadow:0 0 0 3px rgba(59,130,246,.15);}
    .steps{display:flex;align-items:center;justify-content:center;margin-bottom:20px;}
    .step{display:flex;align-items:center;gap:6px;font-size:.72rem;font-weight:700;color:var(--muted);}
    .step-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:.7rem;font-weight:800;background:var(--border);color:var(--muted);transition:all .3s;}
    .step.active .step-num{background:var(--primary);color:#fff;}
    .step.done .step-num{background:var(--success);color:#fff;}
    .step-line{width:36px;height:2px;background:var(--border);margin:0 4px;transition:background .3s;}
    .step-line.done{background:var(--success);}
    .str-bar{height:4px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:4px;}
    .str-fill{height:100%;border-radius:99px;transition:all .3s;width:0%;background:var(--danger);}
    .allowed-note{background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:9px;padding:10px 13px;font-size:.75rem;color:#15803d;margin-bottom:14px;}
    [data-theme="dark"] .allowed-note{color:#4ade80;}
    .foot{margin-top:20px;text-align:center;font-size:.74rem;color:var(--muted);}
    @media(max-width:900px){.left{display:none;}}
    @media(max-width:520px){.right{width:100%;padding:32px 18px;}}
  </style>
</head>
<body>

<!-- LEFT PANEL -->
<div class="left">
  <div class="blob b1"></div>
  <div class="blob b2"></div>
  <div class="left-inner">
    <div class="logo-box"><span>ECA</span></div>
    <h1 class="brand">Emirate Classic Academy</h1>
    <p class="brand-sub">EduTrack Pro — 2026/2027 Session</p>
    <p class="tagline">Secure, modern school result management. Only authorised staff can access this system.</p>
    <ul class="feats">
      <li><div class="ficon" style="background:rgba(59,130,246,.15)"><i class="fas fa-chart-bar" style="color:#3B82F6"></i></div>Real-time analytics and performance tracking</li>
      <li><div class="ficon" style="background:rgba(34,197,94,.15)"><i class="fas fa-file-alt" style="color:#22C55E"></i></div>Automated report card generation and PDF export</li>
      <li><div class="ficon" style="background:rgba(245,158,11,.15)"><i class="fas fa-user-graduate" style="color:#F59E0B"></i></div>Manage students, teachers and subjects</li>
      <li><div class="ficon" style="background:rgba(124,58,237,.15)"><i class="fas fa-lock" style="color:#7C3AED"></i></div>Restricted to authorised email addresses only</li>
    </ul>
  </div>
</div>

<!-- RIGHT FORM -->
<div class="right">
  <button class="tbtn" id="themeBtn" title="Toggle theme"><i class="fas fa-moon" id="themeIcon"></i></button>
  <div class="form-wrap">

    <div class="tabs">
      <button class="tab active" id="tabLogin" onclick="showTab('login')">Sign In</button>
      <button class="tab" id="tabReset" onclick="showTab('reset')">Reset Password</button>
    </div>

    <!-- LOGIN FORM -->
    <div id="loginForm">
      <h2 class="ftitle">Welcome back <i class="fas fa-hand-wave" style="color:#F59E0B"></i></h2>
      <p class="fdesc">Sign in with your authorised school email.</p>

      <div class="allowed-note">
        <i class="fas fa-shield-alt"></i>
        <strong> Restricted Access</strong> — Only registered staff emails can log in.
      </div>

      <div class="banner berr" id="loginErr"><i class="fas fa-exclamation-triangle"></i><span id="loginErrMsg">Invalid credentials.</span></div>

      <div class="field">
        <label>Email Address</label>
        <div class="fw">
          <span class="fi"><i class="fas fa-envelope"></i></span>
          <input type="email" id="eml" placeholder="yourname@ecacademy.edu.ng" autocomplete="email"/>
        </div>
      </div>

      <div class="field">
        <label>Password</label>
        <div class="fw">
          <span class="fi"><i class="fas fa-lock"></i></span>
          <input type="password" id="pwd" placeholder="••••••••" autocomplete="current-password"/>
          <button class="eyebtn" id="eyeBtn" type="button"><i class="fas fa-eye" id="eyeIcon"></i></button>
        </div>
      </div>

      <div class="rowflex">
        <label class="remem"><input type="checkbox" id="rememberMe"/> Remember me</label>
        <button class="lnkbtn" onclick="showTab('reset')">Forgot password?</button>
      </div>

      <button class="btngo" id="loginBtn" onclick="doLogin()">
        <div class="spin" id="ls"></div>
        <span class="lbl"><i class="fas fa-sign-in-alt"></i> Sign In to Dashboard</span>
      </button>

      <p class="foot">Emirate Classic Academy &nbsp;&middot;&nbsp; EduTrack Pro 2026</p>
    </div>

    <!-- RESET PASSWORD — 3 STEPS -->
    <div id="resetForm" style="display:none">
      <div class="steps">
        <div class="step active" id="st1"><div class="step-num" id="sn1">1</div><span>Email</span></div>
        <div class="step-line" id="sl1"></div>
        <div class="step" id="st2"><div class="step-num" id="sn2">2</div><span>Code</span></div>
        <div class="step-line" id="sl2"></div>
        <div class="step" id="st3"><div class="step-num" id="sn3">3</div><span>New Password</span></div>
      </div>

      <!-- Step 1 -->
      <div id="rStep1">
        <h2 class="ftitle">Reset Password <i class="fas fa-key" style="color:#F59E0B"></i></h2>
        <p class="fdesc">Enter your registered school email address.</p>
        <div class="banner berr" id="rErr1"><i class="fas fa-exclamation-triangle"></i><span id="rErr1Msg">Error.</span></div>
        <div class="field">
          <label>Email Address</label>
          <div class="fw">
            <span class="fi"><i class="fas fa-envelope"></i></span>
            <input type="email" id="rEml" placeholder="yourname@ecacademy.edu.ng"/>
          </div>
        </div>
        <button class="btngo" id="rBtn1" onclick="resetStep1()">
          <div class="spin" id="rs1"></div>
          <span class="lbl"><i class="fas fa-paper-plane"></i> Send Reset Code</span>
        </button>
        <p style="margin-top:12px;text-align:center"><button class="lnkbtn" onclick="showTab('login')">← Back to Sign In</button></p>
      </div>

      <!-- Step 2 -->
      <div id="rStep2" style="display:none">
        <h2 class="ftitle">Enter Code <i class="fas fa-mobile-alt" style="color:#3B82F6"></i></h2>
        <p class="fdesc">Copy the code below and enter it in the boxes.</p>
        <div class="otp-box">
          <div class="otp-label"><i class="fas fa-shield-alt"></i> Your Reset Code</div>
          <div class="otp-code" id="otpDisplay">------</div>
          <div class="otp-timer" id="otpTimer">Expires in 10:00</div>
          <button class="otp-copy" onclick="copyOtp()"><i class="fas fa-copy"></i> Copy Code</button>
        </div>
        <div class="banner berr" id="rErr2"><i class="fas fa-exclamation-triangle"></i><span id="rErr2Msg">Error.</span></div>
        <div class="otp-inputs" id="otpInputs">
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
          <input class="otp-input" maxlength="1" type="text" inputmode="numeric" pattern="[0-9]"/>
        </div>
        <button class="btngo" id="rBtn2" onclick="resetStep2()">
          <div class="spin" id="rs2"></div>
          <span class="lbl"><i class="fas fa-check-circle"></i> Verify Code</span>
        </button>
        <p style="margin-top:10px;text-align:center;font-size:.78rem;color:var(--muted)">
          Code expired? <button class="lnkbtn" onclick="resetStep1(true)">Resend</button>
        </p>
      </div>

      <!-- Step 3 -->
      <div id="rStep3" style="display:none">
        <h2 class="ftitle">New Password <i class="fas fa-lock" style="color:#22C55E"></i></h2>
        <p class="fdesc">Create a strong new password for your account.</p>
        <div class="banner berr" id="rErr3"><i class="fas fa-exclamation-triangle"></i><span id="rErr3Msg">Error.</span></div>
        <div class="banner bok" id="rOk3"><i class="fas fa-check-circle"></i><span>Password changed! Redirecting to login...</span></div>
        <div class="field">
          <label>New Password</label>
          <div class="fw">
            <span class="fi"><i class="fas fa-lock"></i></span>
            <input type="password" id="newPwd" placeholder="Min 8 characters"/>
            <button class="eyebtn" onclick="toggleEye('newPwd',this)" type="button"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <div class="field">
          <label>Confirm Password</label>
          <div class="fw">
            <span class="fi"><i class="fas fa-lock"></i></span>
            <input type="password" id="confPwd" placeholder="Repeat password"/>
            <button class="eyebtn" onclick="toggleEye('confPwd',this)" type="button"><i class="fas fa-eye"></i></button>
          </div>
        </div>
        <div style="margin-bottom:16px">
          <div class="str-bar"><div class="str-fill" id="strengthBar"></div></div>
          <span id="strengthLabel" style="font-size:.7rem;color:var(--muted)">Enter a password</span>
        </div>
        <button class="btngo" id="rBtn3" onclick="resetStep3()">
          <div class="spin" id="rs3"></div>
          <span class="lbl"><i class="fas fa-save"></i> Change Password</span>
        </button>
      </div>
    </div>

  </div>
</div>

<script>
  /* ================================================================
     EMIRATE CLASSIC ACADEMY — EduTrack Pro 2026
     AUTHORISED USERS ONLY
     Add/remove staff emails and passwords here.
     The name field is used as the greeting on the dashboard.
     ================================================================ */
  var USERS = [
    /* FORMAT: { email, password, name, role, school, session, term } */
    {
      email:    'giftjeremiaholaoye@gmail.com',
      password: 'gift2008@123',
      name:     'Mr. Jeremiah Olaoye',
      role:     'Super Admin',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'emirateclassicacademyltd@gmail.com',
      password: 'Emirate@12345',
      name:     'Mr. Adeyemi',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'maryamshehuabubakar993@gmail.com',
      password: 'Maryam@12345',
      name:     'sMaryam',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'hauwayunusa827@gmail.com',
      password: 'Hauwa@12345',
      name:     'Hauwa',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'verifiedballer63@gmail.com',
      password: 'Leakan@12345',
      name:     'Leakan',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'yisamillicent425@gmail.com',
      password: 'Yisa@12345',
      name:     'Yisa',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'akadivine649@gmail.com',
      password: 'Divine@12345',
      name:     'Divine',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
    {
      email:    'emmanuelotitoju141@gmail.com',
      password: 'Emma@12345',
      name:     'Emmanuel',
      role:     'Teacher',
      school:   'Emirate Classic Academy',
      session:  '2026/2027',
      term:     '1st Term'
    },
  /* ADD MORE STAFF BELOW - copy and paste a block above
  {
    email:    'staffemail@ecacademy.edu.ng',
    password: 'Password@123',
    name:     'Staff Full Name',
    role:     'Teacher',
    school:   'Emirate Classic Academy',
    session:  '2026/2027',
    term:     '1st Term'
  },
  */
];

var SESSION_KEY  = 'edutrack_session';
var resetState   = { email:'', otp:'', expiresAt:0, timerInterval:null };

/* ── Check if already logged in ─────────────────────────── */
(function(){
  try{
    var raw=localStorage.getItem(SESSION_KEY);
    if(!raw) return;
    var s=JSON.parse(raw);
    if(s&&s.loggedIn&&s.expiresAt>Date.now()) window.location.replace('index.html');
  }catch(e){ localStorage.removeItem(SESSION_KEY); }
})();

/* ── Load any saved passwords ────────────────────────────── */
(function(){
  try{
    var saved=JSON.parse(localStorage.getItem('et_pwds')||'{}');
    USERS.forEach(function(u){ var k=u.email.toLowerCase(); if(saved[k]) u.password=saved[k]; });
  }catch(e){}
})();

/* ── Tab switcher ────────────────────────────────────────── */
function showTab(t){
  document.getElementById('loginForm').style.display=t==='login'?'':'none';
  document.getElementById('resetForm').style.display=t==='reset'?'':'none';
  document.getElementById('tabLogin').classList.toggle('active',t==='login');
  document.getElementById('tabReset').classList.toggle('active',t==='reset');
  clearBanners();
  if(t==='reset') goResetStep(1);
}
function clearBanners(){
  ['loginErr','rErr1','rErr2','rErr3','rOk3'].forEach(function(id){
    var el=document.getElementById(id); if(el) el.classList.remove('show');
  });
}

/* ── Theme ───────────────────────────────────────────────── */
var themeBtn=document.getElementById('themeBtn');
var themeIcon=document.getElementById('themeIcon');
applyT(localStorage.getItem('edutrack-theme')||'light');
themeBtn.addEventListener('click',function(){ applyT(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark'); });
function applyT(t){
  document.documentElement.setAttribute('data-theme',t);
  localStorage.setItem('edutrack-theme',t);
  themeIcon.className=t==='dark'?'fas fa-sun':'fas fa-moon';
}

/* ── Eye toggle ──────────────────────────────────────────── */
document.getElementById('eyeBtn').addEventListener('click',function(){
  var p=document.getElementById('pwd');
  p.type=p.type==='password'?'text':'password';
  document.getElementById('eyeIcon').className=p.type==='password'?'fas fa-eye':'fas fa-eye-slash';
});
function toggleEye(id,btn){
  var p=document.getElementById(id);
  p.type=p.type==='password'?'text':'password';
  btn.querySelector('i').className=p.type==='password'?'fas fa-eye':'fas fa-eye-slash';
}

/* ── Enter key ───────────────────────────────────────────── */
document.addEventListener('keydown',function(e){
  if(e.key!=='Enter') return;
  var onLogin=document.getElementById('loginForm').style.display!=='none';
  if(onLogin){ doLogin(); return; }
  if(document.getElementById('rStep1').style.display!=='none') resetStep1();
  if(document.getElementById('rStep2').style.display!=='none') resetStep2();
  if(document.getElementById('rStep3').style.display!=='none') resetStep3();
});

/* ── Helpers ─────────────────────────────────────────────── */
function showErr(bid,mid,msg,iid){
  document.getElementById(mid).textContent=msg;
  document.getElementById(bid).classList.add('show');
  if(iid){ var el=document.getElementById(iid); if(el){ el.classList.add('bad'); el.focus(); setTimeout(function(){ el.classList.remove('bad'); },400); } }
}
function setLoading(bid,sid,on){
  var btn=document.getElementById(bid); if(!btn) return;
  btn.disabled=on; btn.classList.toggle('loading',on);
  document.getElementById(sid).style.display=on?'block':'none';
}
function findUser(email){
  var em=email.toLowerCase().trim();
  for(var i=0;i<USERS.length;i++){ if(USERS[i].email.toLowerCase()===em) return USERS[i]; }
  return null;
}
/* Extract first real name (skip titles) */
function getFirstName(fullName){
  var skip=/^(mr|mrs|ms|miss|dr|prof|sir|chief|alhaji|alhaja)\.?$/i;
  var parts=(fullName||'').split(/\s+/);
  for(var i=0;i<parts.length;i++){ if(parts[i].length>1&&!skip.test(parts[i])) return parts[i]; }
  return parts[parts.length-1]||'Admin';
}

/* ================================================================
   LOGIN — checks email against USERS array above
   The name from the user's record becomes the dashboard greeting
   ================================================================ */
function doLogin(){
  clearBanners();
  var email=document.getElementById('eml').value.trim();
  var pass =document.getElementById('pwd').value;
  var rem  =document.getElementById('rememberMe').checked;
  if(!email){ showErr('loginErr','loginErrMsg','Please enter your email address.','eml'); return; }
  if(!pass){  showErr('loginErr','loginErrMsg','Please enter your password.','pwd'); return; }
  setLoading('loginBtn','ls',true);
  setTimeout(function(){
    var user=findUser(email);
    if(!user){
      setLoading('loginBtn','ls',false);
      showErr('loginErr','loginErrMsg','This email is not registered. Only authorised school staff can log in.','eml');
      return;
    }
    if(user.password!==pass){
      setLoading('loginBtn','ls',false);
      showErr('loginErr','loginErrMsg','Incorrect password. Please try again.','pwd');
      return;
    }
    /* SUCCESS — save full session including name, school, session, term */
    var HOUR=3600000;
    var sess={
      loggedIn:  true,
      email:     user.email,
      name:      user.name,        /* full name e.g. "Mrs. Ngozi Eze" */
      firstName: getFirstName(user.name), /* e.g. "Ngozi" — used for greeting */
      role:      user.role,
      school:    user.school,
      session:   user.session||'2026/2027',
      term:      user.term||'1st Term',
      loginTime: Date.now(),
      expiresAt: Date.now()+(rem?7*24*HOUR:8*HOUR),
    };
    localStorage.setItem(SESSION_KEY,JSON.stringify(sess));
    localStorage.setItem('edutrack_user_name',user.name);
    localStorage.setItem('edutrack_user_role',user.role);
    window.location.replace('index.html');
  },700);
}

/* ================================================================
   RESET PASSWORD — STEP 1: verify email exists
   ================================================================ */
function resetStep1(resend){
  clearBanners();
  var email=(document.getElementById('rEml').value||resetState.email).trim().toLowerCase();
  if(!email){ showErr('rErr1','rErr1Msg','Please enter your email address.','rEml'); return; }
  setLoading('rBtn1','rs1',true);
  setTimeout(function(){
    setLoading('rBtn1','rs1',false);
    var user=findUser(email);
    if(!user){ showErr('rErr1','rErr1Msg','This email is not registered in the system.','rEml'); return; }
    var otp=Math.floor(100000+Math.random()*900000).toString();
    resetState.email=email; resetState.otp=otp; resetState.expiresAt=Date.now()+600000;
    document.getElementById('otpDisplay').textContent=otp;
    document.getElementById('otpDisplay').style.opacity='1';
    goResetStep(2); startOtpTimer();
    document.querySelectorAll('.otp-input').forEach(function(inp){ inp.value=''; });
    var first=document.querySelector('.otp-input'); if(first) setTimeout(function(){ first.focus(); },100);
  },800);
}

/* ── STEP 2: verify OTP ──────────────────────────────────── */
function resetStep2(){
  clearBanners();
  var digits='';
  document.querySelectorAll('.otp-input').forEach(function(inp){ digits+=inp.value.trim(); });
  if(digits.length<6){ showErr('rErr2','rErr2Msg','Please enter all 6 digits of the reset code.'); return; }
  setLoading('rBtn2','rs2',true);
  setTimeout(function(){
    setLoading('rBtn2','rs2',false);
    if(Date.now()>resetState.expiresAt){ showErr('rErr2','rErr2Msg','This code has expired. Click Resend to get a new one.'); return; }
    if(digits!==resetState.otp){
      showErr('rErr2','rErr2Msg','Incorrect code. Please check and try again.');
      document.querySelectorAll('.otp-input').forEach(function(inp){ inp.classList.add('bad'); setTimeout(function(){ inp.classList.remove('bad'); },400); });
      return;
    }
    if(resetState.timerInterval) clearInterval(resetState.timerInterval);
    goResetStep(3);
  },600);
}

/* ── STEP 3: set new password ────────────────────────────── */
function resetStep3(){
  clearBanners();
  var np=document.getElementById('newPwd').value;
  var cp=document.getElementById('confPwd').value;
  if(!np){ showErr('rErr3','rErr3Msg','Please enter a new password.','newPwd'); return; }
  if(np.length<8){ showErr('rErr3','rErr3Msg','Password must be at least 8 characters.','newPwd'); return; }
  if(np!==cp){ showErr('rErr3','rErr3Msg','Passwords do not match.','confPwd'); return; }
  setLoading('rBtn3','rs3',true);
  setTimeout(function(){
    setLoading('rBtn3','rs3',false);
    var user=findUser(resetState.email);
    if(user){ user.password=np; }
    var saved={};
    try{ saved=JSON.parse(localStorage.getItem('et_pwds')||'{}'); }catch(e){}
    saved[resetState.email]=np;
    localStorage.setItem('et_pwds',JSON.stringify(saved));
    document.getElementById('rOk3').classList.add('show');
    setTimeout(function(){ resetState={email:'',otp:'',expiresAt:0,timerInterval:null}; showTab('login'); },2500);
  },800);
}

/* ── Step navigation ─────────────────────────────────────── */
function goResetStep(n){
  [1,2,3].forEach(function(i){
    document.getElementById('rStep'+i).style.display=i===n?'':'none';
    var st=document.getElementById('st'+i), sn=document.getElementById('sn'+i);
    st.classList.remove('active','done');
    if(i<n){ st.classList.add('done'); sn.textContent=''; sn.innerHTML='<i class="fas fa-check"></i>'; }
    if(i===n){ st.classList.add('active'); sn.textContent=i; }
    if(i>n){ sn.textContent=i; }
  });
  if(document.getElementById('sl1')) document.getElementById('sl1').classList.toggle('done',n>1);
  if(document.getElementById('sl2')) document.getElementById('sl2').classList.toggle('done',n>2);
}

/* ── OTP Timer ───────────────────────────────────────────── */
function startOtpTimer(){
  if(resetState.timerInterval) clearInterval(resetState.timerInterval);
  resetState.timerInterval=setInterval(function(){
    var rem=Math.max(0,resetState.expiresAt-Date.now());
    var m=Math.floor(rem/60000), s=Math.floor((rem%60000)/1000);
    var el=document.getElementById('otpTimer');
    if(el) el.textContent='Expires in '+m+':'+(s<10?'0':'')+s;
    if(rem<=0){
      clearInterval(resetState.timerInterval);
      if(el){ el.textContent='Code expired — click Resend'; el.style.color='#EF4444'; }
      var od=document.getElementById('otpDisplay');
      if(od){ od.textContent='------'; od.style.opacity='.3'; }
    }
  },1000);
}

/* ── Copy OTP ────────────────────────────────────────────── */
function copyOtp(){
  if(!resetState.otp) return;
  navigator.clipboard.writeText(resetState.otp).then(function(){
    var btn=document.querySelector('.otp-copy'), orig=btn.innerHTML;
    btn.innerHTML='<i class="fas fa-check"></i> Copied!';
    btn.style.background='rgba(34,197,94,.25)';
    setTimeout(function(){ btn.innerHTML=orig; btn.style.background=''; },2000);
  }).catch(function(){
    var ta=document.createElement('textarea');
    ta.value=resetState.otp; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.select(); document.execCommand('copy');
    document.body.removeChild(ta);
  });
}

/* ── OTP input auto-advance ──────────────────────────────── */
document.querySelectorAll('.otp-input').forEach(function(inp,idx,all){
  inp.addEventListener('input',function(){
    var v=inp.value.replace(/[^0-9]/g,''); inp.value=v.slice(-1);
    if(v&&idx<all.length-1) all[idx+1].focus();
  });
  inp.addEventListener('keydown',function(e){ if(e.key==='Backspace'&&!inp.value&&idx>0) all[idx-1].focus(); });
  inp.addEventListener('paste',function(e){
    e.preventDefault();
    var paste=(e.clipboardData||window.clipboardData).getData('text').replace(/[^0-9]/g,'');
    all.forEach(function(box,i){ box.value=paste[i]||''; });
    var last=Math.min(paste.length,all.length)-1; if(last>=0) all[last].focus();
  });
});

/* ── Password strength meter ─────────────────────────────── */
document.getElementById('newPwd').addEventListener('input',function(){
  var p=this.value, score=0;
  if(p.length>=8) score++; if(p.length>=12) score++;
  if(/[A-Z]/.test(p)) score++; if(/[0-9]/.test(p)) score++;
  if(/[^A-Za-z0-9]/.test(p)) score++;
  var pct=(score/5*100)+'%';
  var clr=score<=1?'#EF4444':score<=2?'#F59E0B':score<=3?'#60A5FA':'#22C55E';
  var lbl=['','Weak','Fair','Good','Strong','Very Strong'][score]||'';
  document.getElementById('strengthBar').style.width=pct;
  document.getElementById('strengthBar').style.background=clr;
  document.getElementById('strengthLabel').textContent=lbl;
  document.getElementById('strengthLabel').style.color=clr;
});
</script>
</body>
</html>






// Disable Function Keys (F1-F12) and DevTools Shortcuts (Ctrl+Shift+I, etc.)
document.addEventListener('keydown', function(event) {
  // Check if the key starts with 'F' followed by numbers (F1 to F12)
  if (event.key.startsWith('F') && !isNaN(event.key.substring(1))) {
      event.preventDefault();
  }
  
  // Prevent common inspection shortcuts (Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
  if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'J' || event.key === 'C')) {
      event.preventDefault();
  }
  if (event.ctrlKey && event.key === 'u') {
      event.preventDefault();
  }
});
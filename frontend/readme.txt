<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>EduTrack Pro — Login</title>

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />


<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">

  <style>
    /* ═══════════════════════════════════════════════════════
       DESIGN TOKENS
    ═══════════════════════════════════════════════════════ */
    :root {
      --primary:      #3B82F6;
      --primary-dark: #2563EB;
      --accent:       #7C3AED;
      --bg:           #F8FAFC;
      --surface:      #FFFFFF;
      --border:       #E2E8F0;
      --text:         #1E293B;
      --muted:        #64748B;
      --danger:       #EF4444;
      --success:      #22C55E;
    }
    [data-theme="dark"] {
      --bg:      #0D1117;
      --surface: #161B22;
      --border:  #30363D;
      --text:    #E6EDF3;
      --muted:   #8B949E;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      display: flex;
      transition: background .3s, color .3s;
    }

    /* ═══════════════════════════════════════════════════════
       LEFT BRANDING PANEL
    ═══════════════════════════════════════════════════════ */
    .auth-left {
      flex: 1;
      background: linear-gradient(145deg, #0F172A 0%, #1E3A5F 50%, #0F172A 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      position: relative;
      overflow: hidden;
    }
    .auth-left::before {
      content: '';
      position: absolute; inset: 0;
      background:
        radial-gradient(ellipse at 30% 50%, rgba(59,130,246,.2) 0%, transparent 60%),
        radial-gradient(ellipse at 80% 20%, rgba(124,58,237,.16) 0%, transparent 50%);
    }
    .deco {
      position: absolute;
      border-radius: 50%;
      opacity: .07;
    }
    .deco-1 { width:320px; height:320px; background:#3B82F6; top:-90px; right:-90px; }
    .deco-2 { width:220px; height:220px; background:#7C3AED; bottom:-70px; left:-70px; }

    .left-inner {
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 400px;
    }
    .brand-logo {
      width: 68px; height: 68px;
      background: linear-gradient(135deg, #3B82F6, #7C3AED);
      border-radius: 18px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 22px;
      box-shadow: 0 8px 32px rgba(59,130,246,.45);
    }
    .brand-logo svg { width: 36px; height: 36px; }
    .brand-name    { font-family:'Poppins',sans-serif; font-size:2rem; font-weight:800; color:#fff; margin-bottom:8px; }
    .brand-tagline { font-size:.92rem; color:#94A3B8; line-height:1.65; margin-bottom:44px; }

    .features { list-style:none; text-align:left; display:flex; flex-direction:column; gap:16px; }
    .features li { display:flex; align-items:center; gap:13px; color:#CBD5E1; font-size:.87rem; line-height:1.5; }
    .feat-icon {
      width:36px; height:36px; border-radius:9px;
      display:flex; align-items:center; justify-content:center;
      font-size:1rem; flex-shrink:0;
    }

    /* ═══════════════════════════════════════════════════════
       RIGHT FORM PANEL
    ═══════════════════════════════════════════════════════ */
    .auth-right {
      width: 460px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px 40px;
      background: var(--surface);
      position: relative;
    }
    .form-wrap { width: 100%; max-width: 360px; }

    /* Theme toggle */
    .theme-btn {
      position: absolute; top: 18px; right: 18px;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 8px;
      width: 38px; height: 38px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 1rem;
      color: var(--muted);
      transition: all .2s;
    }
    .theme-btn:hover { border-color: var(--primary); color: var(--primary); }

    /* Tabs */
    .tabs {
      display: flex;
      background: var(--bg);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 4px;
      margin-bottom: 28px;
      gap: 3px;
    }
    .tab-btn {
      flex: 1; padding: 9px;
      border: none; background: none;
      border-radius: 7px;
      font-family: 'Inter', sans-serif;
      font-size: .83rem; font-weight: 600;
      color: var(--muted); cursor: pointer;
      transition: all .2s;
    }
    .tab-btn.active {
      background: var(--surface);
      color: var(--primary);
      box-shadow: 0 1px 4px rgba(0,0,0,.1);
    }

    /* Headings */
    .form-title { font-family:'Poppins',sans-serif; font-size:1.4rem; font-weight:700; color:var(--text); margin-bottom:4px; }
    .form-desc  { font-size:.83rem; color:var(--muted); margin-bottom:26px; }

    /* Fields */
    .field       { margin-bottom: 16px; }
    .field label {
      display: block;
      font-size: .71rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: .5px;
      color: var(--muted); margin-bottom: 6px;
    }
    .field-wrap  { position: relative; }
    .field-ico   {
      position: absolute; left:12px; top:50%;
      transform: translateY(-50%);
      color: var(--muted); font-size: .9rem;
      pointer-events: none;
    }
    .field input {
      width: 100%;
      padding: 10px 40px 10px 38px;
      border: 1.5px solid var(--border);
      border-radius: 9px;
      font-family: 'Inter', sans-serif;
      font-size: .88rem;
      color: var(--text);
      background: var(--bg);
      outline: none;
      transition: all .2s;
    }
    .field input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(59,130,246,.15);
      background: var(--surface);
    }
    .field input.shake {
      animation: shake .35s ease;
      border-color: var(--danger);
    }
    @keyframes shake {
      0%,100% { transform: translateX(0); }
      20%      { transform: translateX(-6px); }
      40%      { transform: translateX(6px); }
      60%      { transform: translateX(-4px); }
      80%      { transform: translateX(4px); }
    }

    /* Eye button */
    .eye-btn {
      position: absolute; right:11px; top:50%;
      transform: translateY(-50%);
      background: none; border: none;
      cursor: pointer; font-size: .95rem;
      color: var(--muted); padding: 3px;
    }
    .eye-btn:hover { color: var(--primary); }

    /* Remember / Forgot row */
    .field-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
    .remember  { display:flex; align-items:center; gap:7px; font-size:.82rem; color:var(--muted); cursor:pointer; user-select:none; }
    .remember input { accent-color: var(--primary); width:15px; height:15px; cursor:pointer; }
    .forgot    { font-size:.82rem; color:var(--primary); font-weight:600; text-decoration:none; cursor:pointer; background:none; border:none; }
    .forgot:hover { opacity:.7; }

    /* Error / Success banners */
    .banner {
      display: none;
      align-items: center;
      gap: 9px;
      padding: 11px 14px;
      border-radius: 9px;
      font-size: .82rem;
      margin-bottom: 16px;
    }
    .banner.show  { display: flex; }
    .banner.error { background:rgba(239,68,68,.1);  border:1px solid rgba(239,68,68,.3);  color:#DC2626; }
    .banner.ok    { background:rgba(34,197,94,.1);  border:1px solid rgba(34,197,94,.3);  color:#16a34a; }

    /* Submit button */
    .btn-submit {
      width: 100%; padding: 12px;
      background: var(--primary);
      color: white; border: none;
      border-radius: 9px;
      font-family: 'Inter', sans-serif;
      font-size: .92rem; font-weight: 700;
      cursor: pointer;
      transition: all .22s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      position: relative;
    }
    .btn-submit:hover:not(:disabled) {
      background: var(--primary-dark);
      box-shadow: 0 4px 16px rgba(59,130,246,.4);
      transform: translateY(-1px);
    }
    .btn-submit:disabled { opacity: .6; cursor: not-allowed; transform: none; }

    /* Spinner inside button */
    .spin {
      width: 17px; height: 17px;
      border: 2.5px solid rgba(255,255,255,.3);
      border-top-color: white;
      border-radius: 50%;
      animation: rot .65s linear infinite;
      display: none;
    }
    .btn-submit.loading .spin    { display: block; }
    .btn-submit.loading .btn-lbl { opacity: 0; position: absolute; }
    @keyframes rot { to { transform: rotate(360deg); } }

    /* Demo credentials box */
    .demo-box {
      background: rgba(59,130,246,.07);
      border: 1px solid rgba(59,130,246,.18);
      border-radius: 9px;
      padding: 13px 15px;
      font-size: .78rem;
      color: var(--muted);
      margin-top: 16px;
    }
    .demo-box strong { color: var(--primary); display:block; margin-bottom:4px; }
    .demo-fill {
      background: none; border: none;
      color: var(--primary); font-size:.78rem;
      font-weight:600; cursor:pointer;
      text-decoration: underline;
      padding: 0; margin-top: 5px; display:block;
    }
    .demo-fill:hover { opacity: .7; }

    /* Users list in demo box */
    .user-list { display:flex; flex-direction:column; gap:5px; margin:6px 0 8px; }
    .user-row  { display:flex; align-items:center; justify-content:space-between; font-size:.75rem; }
    .user-role { font-size:.65rem; padding:1px 7px; border-radius:99px; font-weight:700; }
    .role-admin   { background:rgba(59,130,246,.15); color:#3B82F6; }
    .role-teacher { background:rgba(124,58,237,.15); color:#7C3AED; }

    /* Footer note */
    .auth-note { margin-top:24px; text-align:center; font-size:.75rem; color:var(--muted); }

    /* ── Responsive ─────────────────────────────────────── */
    @media (max-width:900px) { .auth-left { display:none; } }
    @media (max-width:500px) {
      .auth-right { width:100%; padding:36px 20px; }
    }
  </style>
</head>
<body>

  <!-- ══ LEFT BRANDING ══════════════════════════════════════ -->
  <div class="auth-left">
    <div class="deco deco-1"></div>
    <div class="deco deco-2"></div>
    <div class="left-inner">

      <div class="brand-logo">
        <svg viewBox="0 0 32 32" fill="none">
          <path d="M8 22 L16 10 L24 22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="16" cy="10" r="2.5" fill="white"/>
          <rect x="10" y="20" width="12" height="2.5" rx="1.25" fill="white" opacity="0.7"/>
        </svg>
      </div>

      <h1 class="brand-name">EduTrack Pro</h1>
      <p class="brand-tagline">Complete school result management — manage students, publish results and generate report cards.</p>

      <ul class="features">
        <li>
          <div class="feat-icon" style="background:rgba(59,130,246,.15)"><i class="fa-solid fa-chart-area"></div>
          Real-time analytics and performance tracking
        </li>
        <li>
          <div class="feat-icon" style="background:rgba(34,197,94,.15)"><i class="fa-solid fa-book"></div>
          Automated report card generation and PDF export
        </li>
        <li>
          <div class="feat-icon" style="background:rgba(245,158,11,.15)"><i class="fa-solid fa-graduation-cap"></div>
          Manage students, teachers and subjects
        </li>
        <li>
          <div class="feat-icon" style="background:rgba(124,58,237,.15)"><i class="fa-solid fa-lock"></div>
          Role-based access: Admin, Teacher, Viewer
        </li>
      </ul>
    </div>
  </div>

  <!-- ══ RIGHT FORM ═════════════════════════════════════════ -->
  <div class="auth-right">

    <!-- Theme toggle -->
    <button class="theme-btn" id="themeBtn" title="Toggle dark/light"><i class="fa-solid fa-moon"></i></button>

    <div class="form-wrap">

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab-btn active" id="tabLogin" onclick="switchTab('login')">Sign In</button>
        <button class="tab-btn"        id="tabReset" onclick="switchTab('reset')">Reset Password</button>
      </div>

      <!-- ══ LOGIN FORM ══════════════════════════════════════ -->
      <div id="loginForm">
        <h2 class="form-title">Welcome back <i class="fa-solid fa-hand"></h2>
        <p class="form-desc">Sign in to your EduTrack admin dashboard.</p>

        <!-- Error banner -->
        <div class="banner error" id="loginErr">
          <span>⚠</span><span id="loginErrMsg">Invalid email or password.</span>
        </div>

        <div class="field">
          <label>Email Address</label>
          <div class="field-wrap">
            <span class="field-ico"><i class="fa-regular fa-envelope"></i></span>
            <input type="email" id="loginEmail" placeholder="admin@school.edu.ng" autocomplete="email" />
          </div>
        </div>

        <div class="field">
          <label>Password</label>
          <div class="field-wrap">
            <span class="field-ico"><i class="fa-solid fa-lock"></span>
            <input type="password" id="loginPassword" placeholder="••••••••" autocomplete="current-password" />
            <button class="eye-btn" id="eyeBtn" type="button"><i class="fa-solid fa-eye"></i></button>
          </div>
        </div>

        <div class="field-row">
          <label class="remember">
            <input type="checkbox" id="rememberMe" /> Remember me
          </label>
          <button class="forgot" onclick="switchTab('reset')">Forgot password?</button>
        </div>

        <button class="btn-submit" id="loginBtn" onclick="handleLogin()">
          <div class="spin" id="loginSpin"></div>
          <span class="btn-lbl">Sign In to Dashboard</span>
        </button>

        <!-- Demo accounts box -->
        <div class="demo-box">
          <strong><i class="fa-solid fa-key"></i> Demo Accounts (no setup needed)</strong>
          <div class="user-list">
            <div class="user-row">
              <span>admin@ghs.edu.ng · Admin@123</span>
              <span class="user-role role-admin">Admin</span>
            </div>
            <div class="user-row">
              <span>teacher@ghs.edu.ng · Teacher@123</span>
              <span class="user-role role-teacher">Teacher</span>
            </div>
          </div>
          <button class="demo-fill" onclick="fillDemo('admin')">→ Auto-fill Admin account</button>
          <button class="demo-fill" onclick="fillDemo('teacher')">→ Auto-fill Teacher account</button>
        </div>
      </div>

      <!-- ══ RESET PASSWORD FORM ═════════════════════════════ -->
      <div id="resetForm" style="display:none">
        <h2 class="form-title">Reset Password <i class="fa-solid fa-key"></i></h2>
        <p class="form-desc">Enter your email and we'll send reset instructions.</p>

        <div class="banner error" id="resetErr"><span>⚠</span><span id="resetErrMsg">Something went wrong.</span></div>
        <div class="banner ok"    id="resetOk" ><span>✓</span><span>Password reset link sent to your email!</span></div>

        <div class="field">
          <label>Email Address</label>
          <div class="field-wrap">
            <span class="field-ico">✉</span>
            <input type="email" id="resetEmail" placeholder="admin@school.edu.ng" />
          </div>
        </div>

        <button class="btn-submit" id="resetBtn" onclick="handleReset()">
          <div class="spin" id="resetSpin"></div>
          <span class="btn-lbl">Send Reset Link</span>
        </button>

        <p style="margin-top:16px;text-align:center">
          <button class="forgot" onclick="switchTab('login')">← Back to Sign In</button>
        </p>
      </div>

      <p class="auth-note">EduTrack Pro v2.0 &nbsp;·&nbsp; © 2025 Government High School</p>
    </div>
  </div>

  <script>
  /* ═══════════════════════════════════════════════════════════
     AUTH.JS — 100% LOCAL, NO SUPABASE, NO INTERNET NEEDED
     ═══════════════════════════════════════════════════════════
     ADD / EDIT USERS HERE ↓
     Format: { email, password, name, role, school }
  ═══════════════════════════════════════════════════════════ */
  const USERS = [
    {
      email:    'admin@ghs.edu.ng',
      password: 'Admin@123',
      name:     'Mr. Adebayo K.',
      role:     'Super Admin',
      school:   'Government High School'
    },
    {
      email:    'teacher@ghs.edu.ng',
      password: 'Teacher@123',
      name:     'Mrs. Ngozi Eze',
      role:     'Teacher',
      school:   'Government High School'
    },
    {
      email:    'principal@ghs.edu.ng',
      password: 'Principal@123',
      name:     'Dr. Amaka Obi',
      role:     'Principal',
      school:   'Government High School'
    },
    /* ── ADD MORE USERS BELOW ──────────────────────────────
       {
         email:    'newuser@school.edu.ng',
         password: 'Password@123',
         name:     'Staff Name',
         role:     'Admin',
         school:   'Government High School'
       },
    ─────────────────────────────────────────────────────── */
  ];

  /* ── Session key used in localStorage ─────────────────── */
  const SESSION_KEY = 'edutrack_session';

  /* ── Tab switcher ──────────────────────────────────────── */
  function switchTab(tab) {
    document.getElementById('loginForm').style.display = tab === 'login' ? '' : 'none';
    document.getElementById('resetForm').style.display = tab === 'reset' ? '' : 'none';
    document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
    document.getElementById('tabReset').classList.toggle('active', tab === 'reset');
    clearBanners();
  }

  function clearBanners() {
    ['loginErr','resetErr','resetOk'].forEach(id => {
      document.getElementById(id)?.classList.remove('show');
    });
  }

  /* ── Demo auto-fill ────────────────────────────────────── */
  function fillDemo(type) {
    if (type === 'admin') {
      document.getElementById('loginEmail').value    = 'admin@ghs.edu.ng';
      document.getElementById('loginPassword').value = 'Admin@123';
    } else {
      document.getElementById('loginEmail').value    = 'teacher@ghs.edu.ng';
      document.getElementById('loginPassword').value = 'Teacher@123';
    }
  }

 /* ── Eye toggle ──────────────────────────────────────── */
    document.getElementById('eyeBtn').addEventListener('click', () => {
      const pwd = document.getElementById('loginPassword');
      const btn = document.getElementById('eyeBtn');
  
      if (pwd.type === 'password') {
          pwd.type = 'text';
          btn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
      } else {
          pwd.type = 'password';
          btn.innerHTML = '<i class="fa-solid fa-eye"></i>';
      }
  });

 /* ── Theme toggle ────────────────────────────────────── */
    const themeBtn = document.getElementById('themeBtn');
    const saved    = localStorage.getItem('edutrack-theme') || 'light';
    applyLoginTheme(saved);
    themeBtn.addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      applyLoginTheme(cur === 'dark' ? 'light' : 'dark');
    });
    function applyLoginTheme(t) {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('edutrack-theme', t);
  
      themeBtn.innerHTML =
          t === 'dark'
              ? '<i class="fa-regular fa-sun"></i>'
              : '<i class="fa-solid fa-moon"></i>';
  }

  /* ── Enter key submits ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const onLogin = document.getElementById('loginForm').style.display !== 'none';
    if (onLogin) handleLogin(); else handleReset();
  });

  /* ═══════════════════════════════════════════════════════
     LOGIN HANDLER
     Checks email + password against the USERS array above.
     No server, no internet needed.
  ═══════════════════════════════════════════════════════ */
  function handleLogin() {
    clearBanners();

    const email    = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const remember = document.getElementById('rememberMe').checked;
    const btn      = document.getElementById('loginBtn');
    const emailEl  = document.getElementById('loginEmail');
    const passEl   = document.getElementById('loginPassword');

    /* ── Validation ──────────────────────────────────────── */
    if (!email) {
      emailEl.classList.add('shake');
      setTimeout(() => emailEl.classList.remove('shake'), 400);
      showError('loginErr', 'loginErrMsg', 'Please enter your email address.');
      emailEl.focus();
      return;
    }

    if (!password) {
      passEl.classList.add('shake');
      setTimeout(() => passEl.classList.remove('shake'), 400);
      showError('loginErr', 'loginErrMsg', 'Please enter your password.');
      passEl.focus();
      return;
    }

    /* ── Show loading spinner ────────────────────────────── */
    setLoading(btn, 'loginSpin', true);

    /*
     * Simulate a small delay so it feels like a real login
     * (remove the setTimeout and just run the check
     *  directly if you want instant login)
     */
    setTimeout(() => {

      /* ── Find matching user ────────────────────────────── */
      const user = USERS.find(
        u => u.email.toLowerCase() === email && u.password === password
      );

      if (!user) {
        setLoading(btn, 'loginSpin', false);

        /* Wrong email? */
        const emailExists = USERS.find(u => u.email.toLowerCase() === email);
        if (!emailExists) {
          emailEl.classList.add('shake');
          setTimeout(() => emailEl.classList.remove('shake'), 400);
          showError('loginErr', 'loginErrMsg', 'No account found with that email address.');
        } else {
          /* Email exists but wrong password */
          passEl.classList.add('shake');
          setTimeout(() => passEl.classList.remove('shake'), 400);
          showError('loginErr', 'loginErrMsg', 'Incorrect password. Please try again.');
        }
        return;
      }

      /* ── SUCCESS — save session ──────────────────────────
         We store a simple object in localStorage.
         index.html checks this on load.
      ──────────────────────────────────────────────────── */
      const session = {
        email:      user.email,
        name:       user.name,
        role:       user.role,
        school:     user.school,
        loggedIn:   true,
        loginTime:  Date.now(),
        /* If "remember me" is checked, expire in 7 days,
           otherwise expire in 8 hours */
        expiresAt:  Date.now() + (remember ? 7*24*60*60*1000 : 8*60*60*1000),
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(session));

      /* ── Redirect to dashboard ───────────────────────── */
      window.location.href = 'index.html';

    }, 800); /* end setTimeout */
  }

  /* ═══════════════════════════════════════════════════════
     RESET PASSWORD HANDLER
     Since there's no backend, we just show a friendly message.
     To make this real, plug in EmailJS or Nodemailer later.
  ═══════════════════════════════════════════════════════ */
  function handleReset() {
    clearBanners();

    const email  = document.getElementById('resetEmail').value.trim().toLowerCase();
    const btn    = document.getElementById('resetBtn');
    const emailEl = document.getElementById('resetEmail');

    if (!email) {
      emailEl.classList.add('shake');
      setTimeout(() => emailEl.classList.remove('shake'), 400);
      showError('resetErr', 'resetErrMsg', 'Please enter your email address.');
      return;
    }

    setLoading(btn, 'resetSpin', true);

    setTimeout(() => {
      setLoading(btn, 'resetSpin', false);

      const exists = USERS.find(u => u.email.toLowerCase() === email);
      if (!exists) {
        emailEl.classList.add('shake');
        setTimeout(() => emailEl.classList.remove('shake'), 400);
        showError('resetErr', 'resetErrMsg', 'No account found with that email address.');
        return;
      }

      /* Show success — in a real system you'd email the new password here */
      document.getElementById('resetOk').classList.add('show');

    }, 900);
  }

  /* ── Helpers ───────────────────────────────────────────── */
  function showError(bannerId, msgId, msg) {
    document.getElementById(msgId).textContent = msg;
    document.getElementById(bannerId).classList.add('show');
  }

  function setLoading(btn, spinId, on) {
    btn.disabled = on;
    btn.classList.toggle('loading', on);
    document.getElementById(spinId).style.display = on ? 'block' : 'none';
  }

  /* ── If already logged in, skip to dashboard ───────────── */
  (function checkExistingSession() {
    try {
      const raw = localStorage.getItem('edutrack_session');
      if (!raw) return;
      const sess = JSON.parse(raw);
      if (sess.loggedIn && sess.expiresAt > Date.now()) {
        window.location.href = 'index.html';
      }
    } catch(e) {
      localStorage.removeItem('edutrack_session');
    }
  })();
  </script>
</body>
</html>
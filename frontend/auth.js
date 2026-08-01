/* ================================================================
   EduTrack Pro — auth.js
   Session guard for index.html.
   - Runs BEFORE the page renders (blocks with overlay)
   - Redirects to login.html immediately if not logged in
   - Exposes window.EduAuth for script.js to use
   ================================================================ */

   var SESSION_KEY = 'edutrack_session';

   /* ================================================================
      STEP 1 — Hide the entire page instantly with inline CSS
      This prevents any flash of the dashboard before the check runs.
      The overlay is removed only if session is valid.
      ================================================================ */
   document.documentElement.style.visibility = 'hidden';
   
   /* ================================================================
      STEP 2 — Read and validate the session from localStorage
      ================================================================ */
   function getSession() {
     try {
       var raw = localStorage.getItem(SESSION_KEY);
       if (!raw) return null;
   
       var sess = JSON.parse(raw);
   
       /* Must have loggedIn flag */
       if (!sess || sess.loggedIn !== true) return null;
   
       /* Must not be expired */
       if (sess.expiresAt && sess.expiresAt < Date.now()) {
         localStorage.removeItem(SESSION_KEY);
         return null;
       }
   
       return sess;
   
     } catch(e) {
       localStorage.removeItem(SESSION_KEY);
       return null;
     }
   }
   
   /* ================================================================
      STEP 3 — Guard runs immediately (synchronous, blocks render)
      ================================================================ */
   (function guard() {
     var sess = getSession();
   
     if (!sess) {
       /* Not logged in — go to login page right now */
       /* Use replace() so Back button doesn't return here */
       window.location.replace('login.html');
       /* Keep page hidden in case replace() has a tiny delay */
       return;
     }
   
     /* Valid session — show the page */
     document.documentElement.style.visibility = 'visible';
   })();
   
   /* ================================================================
      STEP 4 — Extend session on activity (keeps user logged in
      as long as they are actively using the dashboard)
      ================================================================ */
   document.addEventListener('click', function() {
     var sess = getSession();
     if (!sess) return;
     var HOUR = 60 * 60 * 1000;
     sess.expiresAt = Date.now() + (8 * HOUR);
     localStorage.setItem(SESSION_KEY, JSON.stringify(sess));
   });
   
   /* ================================================================
      STEP 5 — Public API used by script.js
      ================================================================ */
   window.EduAuth = {
   
     /* Get the currently logged-in user object */
     getUser: function() {
       return getSession();
     },
   
     /* Log out — clear ALL session data and go to login */
     signOut: function() {
       localStorage.removeItem(SESSION_KEY);
       localStorage.removeItem('edutrack_user_name');
       localStorage.removeItem('edutrack_user_role');
       window.location.href = 'login.html';
     },
   
     /* Check if the logged-in user is an admin */
     isAdmin: function() {
       var s = getSession();
       if (!s) return false;
       var role = (s.role || '').toLowerCase();
       return role === 'super admin' || role === 'admin' || role === 'principal';
     },
   
     /* Check if session is still valid (call anytime) */
     isLoggedIn: function() {
       return getSession() !== null;
     },
   };
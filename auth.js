/* ================================================================
   EduTrack Pro — auth.js
   Loaded FIRST before script.js. Guards index.html.
   ================================================================ */

   var SESSION_KEY = 'edutrack_session';

   /* ── Read and validate session ─────────────────────────────────── */
   function getSession(){
     try{
       var raw = localStorage.getItem(SESSION_KEY);
       if(!raw) return null;
       var s = JSON.parse(raw);
       if(!s || s.loggedIn !== true) return null;
       if(s.expiresAt && s.expiresAt < Date.now()){
         localStorage.removeItem(SESSION_KEY);
         return null;
       }
       return s;
     }catch(e){
       localStorage.removeItem(SESSION_KEY);
       return null;
     }
   }
   
   /* ── GUARD — runs immediately, synchronously ────────────────────
      Hide the page instantly so there is ZERO flash of dashboard
      content before the session check completes.
   ────────────────────────────────────────────────────────────────── */
   (function guard(){
     var sess = getSession();
     if(!sess){
       /* Not logged in — hide everything and redirect */
       document.documentElement.style.display = 'none';
       window.location.replace('login.html');
     }
     /* Logged in — page stays visible (default display) */
   })();
   
   /* ── Extend session on any user interaction ─────────────────────── */
   document.addEventListener('click', function(){
     var s = getSession();
     if(!s) return;
     s.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
     localStorage.setItem(SESSION_KEY, JSON.stringify(s));
   });
   
   /* ── Public API used by script.js ───────────────────────────────── */
   window.EduAuth = {
     getUser : function(){ return getSession(); },
     signOut : function(){
       localStorage.removeItem(SESSION_KEY);
       localStorage.removeItem('edutrack_user_name');
       localStorage.removeItem('edutrack_user_role');
       window.location.href = 'login.html';
     },
     isAdmin : function(){
       var s = getSession();
       if(!s) return false;
       return ['super admin','admin','principal']
              .indexOf((s.role||'').toLowerCase()) > -1;
     }
   };
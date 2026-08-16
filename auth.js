/* ================================================================
   EduTrack Pro — auth.js
   MUST be the FIRST script loaded in index.html.
   Guards the dashboard — redirects to login if no valid session.
   ================================================================ */

   var SESSION_KEY = 'edutrack_session';

   /* ── Read session from localStorage ────────────────────────────── */
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
   
   /* ── GUARD — runs synchronously before page renders ─────────────
      Uses visibility:hidden (not display:none) so layout is preserved
      but nothing is visible — then shows the page once session confirmed.
   ────────────────────────────────────────────────────────────────── */
   (function guard(){
     var sess = getSession();
     if(!sess){
       /* No valid session — hide page immediately, go to login */
       document.documentElement.style.visibility = 'hidden';
       document.documentElement.style.opacity    = '0';
       window.location.replace('login.html');
       return;
     }
     /* Valid session — page is visible */
     document.documentElement.style.visibility = '';
     document.documentElement.style.opacity    = '';
   })();
   
   /* ── Extend session on any click ────────────────────────────────── */
   document.addEventListener('click', function(){
     var s = getSession();
     if(!s) return;
     s.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
     try{ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }catch(e){}
   });
   
   /* ── Public API used by script.js ───────────────────────────────── */
   window.EduAuth = {
   
     /* Get the current user object from session */
     getUser: function(){
       return getSession();
     },
   
     /* Sign out — clears all session data and redirects */
     signOut: function(){
       try{
         localStorage.removeItem(SESSION_KEY);
         localStorage.removeItem('edutrack_user_name');
         localStorage.removeItem('edutrack_user_role');
       }catch(e){}
       window.location.href = 'login.html';
     },
   
     /* Returns true if user is an admin-level role */
     isAdmin: function(){
       var s = getSession();
       if(!s) return false;
       return ['super admin','admin','principal','superadmin']
              .indexOf((s.role||'').toLowerCase()) > -1;
     }
   };
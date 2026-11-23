/* ================================================================
   EduTrack Pro - auth.js
   Loaded on every page after sign-in. It:
     1. sends visitors who are not signed in to login.html
     2. keeps the 8-hour inactivity timer
     3. signs out properly (ends the Supabase sign-in too)
   ================================================================ */

   var SESSION_KEY = 'edutrack_session';

   /* the saved Supabase sign-in lives in a key like  sb-xxxx-auth-token */
   function hasSupabaseSession(){
     try{
       for(var i = 0; i < localStorage.length; i++){
         if(/^sb-.+-auth-token$/.test(localStorage.key(i))) return true;
       }
     }catch(e){}
     return false;
   }
   
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
       try{ localStorage.removeItem(SESSION_KEY); }catch(x){}
       return null;
     }
   }
   
   /* Guard: needs BOTH the on-screen session and a real Supabase sign-in */
   (function guard(){
     if(!getSession() || !hasSupabaseSession()){
       document.documentElement.style.visibility = 'hidden';
       window.location.replace('login.html');
     }
   })();
   
   /* any click counts as activity: push the 8-hour timer forward */
   document.addEventListener('click', function(){
     var s = getSession();
     if(!s) return;
     s.expiresAt = Date.now() + 8 * 60 * 60 * 1000;
     try{ localStorage.setItem(SESSION_KEY, JSON.stringify(s)); }catch(e){}
   });
   
   function clearLocalSignIn(){
     try{
       localStorage.removeItem(SESSION_KEY);
       localStorage.removeItem('edutrack_user_name');
       localStorage.removeItem('edutrack_user_role');
       var dead = [];
       for(var i = 0; i < localStorage.length; i++){
         var k = localStorage.key(i);
         if(/^sb-.+-auth-token(-code-verifier)?$/.test(k)) dead.push(k);
       }
       dead.forEach(function(k){ localStorage.removeItem(k); });
     }catch(e){}
   }
   
   window.EduAuth = {
     getUser : function(){ return getSession(); },
     isAdmin : function(){
       var s = getSession();
       return !!s && ['admin','super admin','principal'].indexOf((s.role||'').toLowerCase()) > -1;
     },
     signOut : function(){
       var done = false;
       function finish(){
         if(done) return; done = true;
         clearLocalSignIn();
         window.location.replace('login.html');
       }
       try{
         if(typeof getDB === 'function'){
           var db = getDB();
           if(db){ db.auth.signOut().then(finish, finish); setTimeout(finish, 2000); return; }
         }
       }catch(e){}
       finish();
     }
   };
/* ================================================================
   EduTrack Pro - Supabase connection | Emirate Classic Academy
   The "anon" key below is meant to be public. What protects the data is
   the sign-in + the database rules from SETUP_AUTH.sql.
   ================================================================ */

   var SUPABASE_URL = 'https://ydbydulsfdsfazqycmpu.supabase.co';
   var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkYnlkdWxzZmRzZmF6cXljbXB1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDIxMzgsImV4cCI6MjEwNzM3ODEzOH0.YOikRlQ6_enUJdhnFYYngPe-J-e2euFhQoJyguLyLWw';
   
   var _supa = null;
   function getDB(){
     if(_supa) return _supa;
     if(typeof supabase === 'undefined'){ console.error('Supabase library did not load'); return null; }
     _supa = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
       auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
     });
     return _supa;
   }
   function isConfigured(){
     return SUPABASE_URL.indexOf('YOUR_PROJECT') === -1 && SUPABASE_KEY.indexOf('YOUR_ANON') === -1;
   }
   /* every call goes through need(): no connection = a clear error, never a silent failure */
   function need(){
     var db = getDB();
     if(!db) throw new Error('Cannot reach the database. Check your internet connection and refresh the page.');
     return db;
   }
   
   /* ================================================================
      GRADE HELPERS
      ================================================================ */
   function gradeFrom(n){
     if(n>=75) return 'A'; if(n>=65) return 'B'; if(n>=55) return 'C';
     if(n>=45) return 'D'; if(n>=40) return 'E'; return 'F';
   }
   function remarkFrom(n){
     if(n>=75) return 'EXCELLENT'; if(n>=65) return 'VERY GOOD'; if(n>=55) return 'GOOD';
     if(n>=45) return 'AVERAGE';   if(n>=40) return 'FAIR';      return 'POOR';
   }
   function gradeColor(g){
     return {A:'#16a34a',B:'#2563EB',C:'#0891b2',D:'#d97706',E:'#ea580c',F:'#dc2626'}[g]||'#64748B';
   }
   function ordinal(n){
     var s=['th','st','nd','rd'], v=n%100;
     return n+(s[(v-20)%10]||s[v]||s[0]);
   }
   
   /* ================================================================
      TEACHER PROFILE
      ================================================================ */
   var TeacherDB = {
     get: async function(email){
       var r = await need().from('eca_teachers').select('*').eq('email', email.toLowerCase()).maybeSingle();
       if(r.error) throw r.error;
       return r.data || null;
     },
     upsert: async function(t){
       var r = await need().from('eca_teachers').upsert({
         email: t.email.toLowerCase(), name: t.name, role: t.role||'Teacher',
         class_assigned: t.class_assigned||'', session: t.session||'2026/2027',
         term: t.term||'1st Term', phone: t.phone||''
       },{ onConflict:'email' }).select().single();
       if(r.error) throw r.error;
       return r.data;
     }
   };
   
   /* ================================================================
      STUDENTS
      ================================================================ */
   var StudentDB = {
     getAll: async function(teacherEmail, session, term){
       var r = await need().from('eca_students').select('*')
         .eq('teacher_email', teacherEmail.toLowerCase())
         .eq('session', session).eq('term', term)
         .order('full_name');
       if(r.error) throw r.error;
       return r.data || [];
     },
     add: async function(s){
       var r = await need().from('eca_students').insert({
         teacher_email: s.teacher_email.toLowerCase(),
         class: s.class, session: s.session||'2026/2027', term: s.term||'1st Term',
         adm_no: s.adm_no||'', full_name: s.full_name, gender: s.gender||'Male', dob: s.dob||'',
         days_opened: s.days_opened||0, days_present: s.days_present||0,
         days_absent: s.days_absent||0, next_term_date: s.next_term_date||''
       }).select().single();
       if(r.error) throw r.error;
       return r.data;
     },
     update: async function(id, fields){
       var r = await need().from('eca_students').update(fields).eq('id', id);
       if(r.error) throw r.error;
     },
     delete: async function(id){
       var r = await need().from('eca_students').delete().eq('id', id);
       if(r.error) throw r.error;
     },
     /* Rank by average. Equal averages share the same position (1,2,2,4).
        Students with no scores yet are not ranked. */
     calcPositions: async function(teacherEmail, session, term){
       var students = await StudentDB.getAll(teacherEmail, session, term);
       if(!students.length) return [];
       var results = await ResultDB.getByTeacher(teacherEmail, session, term);
       var sums = {};
       results.forEach(function(r){
         var t = sums[r.student_id] || (sums[r.student_id] = {sum:0, n:0});
         t.sum += parseFloat(r.total)||0; t.n++;
       });
       var ranked = students.map(function(s){
         var t = sums[s.id];
         return { id:s.id, has: !!t, avg: t ? Math.round((t.sum/t.n)*100)/100 : 0 };
       });
       var scored = ranked.filter(function(x){ return x.has; }).sort(function(a,b){ return b.avg-a.avg; });
       scored.forEach(function(x,i){
         x.position = (i>0 && scored[i-1].avg === x.avg) ? scored[i-1].position : i+1;
       });
       var total = students.length;
       await Promise.all(ranked.map(function(x){
         return StudentDB.update(x.id, { position: x.has ? x.position : null, total_students: total });
       }));
       return ranked;
     }
   };
   
   /* ================================================================
      RESULTS (scores)
      ================================================================ */
   var ResultDB = {
     getByStudent: async function(studentId, session, term){
       var r = await need().from('eca_results').select('*')
         .eq('student_id', studentId).eq('session', session).eq('term', term).order('subject');
       if(r.error) throw r.error;
       return r.data || [];
     },
     getByTeacher: async function(teacherEmail, session, term){
       var r = await need().from('eca_results').select('*')
         .eq('teacher_email', teacherEmail.toLowerCase()).eq('session', session).eq('term', term);
       if(r.error) throw r.error;
       return r.data || [];
     },
     /* Safe save: write the new scores FIRST, then remove only the subjects that
        were cleared. If anything fails part-way, existing scores are never wiped. */
     save: async function(studentId, teacherEmail, session, term, scores){
       var db = need();
       var rows = scores.map(function(s){
         var tot = (parseFloat(s.cw)||0)+(parseFloat(s.asst)||0)+(parseFloat(s.mid)||0)+(parseFloat(s.exam)||0);
         return {
           student_id: studentId, teacher_email: teacherEmail.toLowerCase(),
           session: session, term: term, subject: s.subject,
           cw: parseFloat(s.cw)||0, asst: parseFloat(s.asst)||0,
           mid_term: parseFloat(s.mid)||0, exam: parseFloat(s.exam)||0,
           grade: gradeFrom(tot), remark: remarkFrom(tot)
         };
       });
       if(rows.length){
         var up = await db.from('eca_results').upsert(rows, { onConflict: 'student_id,session,term,subject' });
         if(up.error) throw up.error;
       }
       var ex = await db.from('eca_results').select('id,subject')
         .eq('student_id', studentId).eq('session', session).eq('term', term);
       if(ex.error) throw ex.error;
       var keep = {}; scores.forEach(function(s){ keep[s.subject] = 1; });
       var stale = (ex.data||[]).filter(function(r){ return !keep[r.subject]; }).map(function(r){ return r.id; });
       if(stale.length){
         var del = await db.from('eca_results').delete().in('id', stale);
         if(del.error) throw del.error;
       }
     }
   };
   
   /* ================================================================
      TERM SETTINGS
      ================================================================ */
   var SettingsDB = {
     get: async function(teacherEmail){
       var r = await need().from('eca_term_settings').select('*').eq('teacher_email', teacherEmail.toLowerCase()).maybeSingle();
       if(r.error) throw r.error;
       return r.data || null;
     },
     save: async function(teacherEmail, s){
       var r = await need().from('eca_term_settings').upsert({
         teacher_email: teacherEmail.toLowerCase(),
         school_name: s.school_name||'EMIRATE CLASSIC ACADEMY LTD',
         school_addr: s.school_addr||'Gbaganu off Bida Road',
         motto: s.motto||'Knowledge is power action and light',
         phone: s.phone||'', session: s.session||'2026/2027', term: s.term||'1st Term',
         next_term_date: s.next_term_date||'', updated_at: new Date().toISOString()
       },{ onConflict:'teacher_email' });
       if(r.error) throw r.error;
     }
   };
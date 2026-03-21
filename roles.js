/* ============================================================

   roles.js — UniSys EduSys Role-Based Dashboard System

   Extends main.js without modifying it.

   Roles: Admin | Head | HOD | Faculty | Account | Admissions | Railway Concession

   Storage: localStorage (demo mode, no backend needed)

   ============================================================ */



/* ── DEMO USERS ──────────────────────────────────────────────

   Pre-seeded accounts for demo login.

   Each has: email, password, role, name, dept (for HOD/Faculty)

   ──────────────────────────────────────────────────────────── */

var DEMO_USERS = [

  { email:'admin@edusys.in',     password:'admin123',     role:'Admin',     name:'Mr. Suresh Kumar',   dept:'All',  title:'System Administrator' },

  { email:'head@edusys.in', password:'head123', role:'Head', name:'Dr. Anita Sharma',   dept:'All',  title:'Head' },

  { email:'hod@edusys.in',       password:'hod123',       role:'HOD',       name:'Dr. Rajiv Rao',      dept:'CSE',  title:'Head of Department — CSE' },

  { email:'faculty@edusys.in',   password:'faculty123',   role:'Faculty',   name:'Prof. Meera Singh',  dept:'CSE',  title:'Assistant Professor — CSE' },

  { email:'accounts@edusys.in',  password:'accounts123',  role:'Account',   name:'Ms. Kavita Shah',    dept:'Finance', title:'Accounts Officer' },

  { email:'admissions@edusys.in',password:'admissions123',role:'Admissions',name:'Mr. Abhishek Rao',   dept:'Admissions', title:'Admissions Officer' },

  { email:'concession@edusys.in',password:'concession123',role:'Railway Concession', name:'Ms. Sana Ali', dept:'Student Services', title:'Railway Concession Desk' }

];



/* ── DEMO DATA ──────────────────────────────────────────────

   Rich seed data shared across all role dashboards.

   Stored in / loaded from localStorage so changes persist.

   ──────────────────────────────────────────────────────────── */

var DEMO_DB_KEY = 'edusys_demo_db';



var SEED_DATA = {

  /* Users list for Admin user-management */

  users: [

    { id:1, name:'Mr. Suresh Kumar',  email:'admin@edusys.in',     role:'Admin',     dept:'All',   status:'Active',  lastLogin:'2026-03-14 09:12' },

    { id:2, name:'Dr. Anita Sharma',  email:'head@edusys.in', role:'Head', dept:'All',   status:'Active',  lastLogin:'2026-03-14 08:45' },

    { id:3, name:'Dr. Rajiv Rao',     email:'hod@edusys.in',       role:'HOD',       dept:'CSE',   status:'Active',  lastLogin:'2026-03-13 17:30' },

    { id:4, name:'Prof. Meera Singh', email:'faculty@edusys.in',   role:'Faculty',   dept:'CSE',   status:'Active',  lastLogin:'2026-03-14 10:00' },

    { id:5, name:'Dr. Vikram Iyer',   email:'hod2@edusys.in',      role:'HOD',       dept:'ECE',   status:'Active',  lastLogin:'2026-03-13 15:20' },

    { id:6, name:'Prof. Nisha Patel', email:'faculty2@edusys.in',  role:'Faculty',   dept:'ECE',   status:'Inactive',lastLogin:'2026-03-10 11:00' },

    { id:7, name:'Ms. Kavita Shah',   email:'accounts@edusys.in',  role:'Account',   dept:'Finance', status:'Active', lastLogin:'2026-03-14 09:40' },

    { id:8, name:'Mr. Abhishek Rao',  email:'admissions@edusys.in',role:'Admissions',dept:'Admissions', status:'Active', lastLogin:'2026-03-14 09:20' },

    { id:9, name:'Ms. Sana Ali',      email:'concession@edusys.in',role:'Railway Concession', dept:'Student Services', status:'Active', lastLogin:'2026-03-14 08:55' },

    { id:10, name:'Prof. Arjun Mehta',  email:'arjun.cse@edusys.in',  role:'Faculty', dept:'CSE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-19', institute:'EduSys Demo College' },
    { id:11, name:'Dr. Kavya Iyer',    email:'kavya.cse@edusys.in',  role:'Faculty', dept:'CSE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-19', institute:'EduSys Demo College' },
    { id:12, name:'Prof. Rahul Nair',  email:'rahul.ece@edusys.in',  role:'Faculty', dept:'ECE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-18', institute:'EduSys Demo College' }

  ],



  /* Departments */

  departments: [

    { id:1, name:'CSE', hod:'Dr. Rajiv Rao',    students:320, faculty:18, courses:24, rating:4.5 },

    { id:2, name:'ECE', hod:'Dr. Vikram Iyer',  students:280, faculty:14, courses:20, rating:4.2 },

    { id:3, name:'ME',  hod:'Prof. Arun Das',   students:240, faculty:12, courses:18, rating:4.0 },

    { id:4, name:'Civil',hod:'Dr. Suman Roy',   students:200, faculty:10, courses:16, rating:3.9 },

    { id:5, name:'MBA', hod:'Dr. Priya Nair',   students:160, faculty: 8, courses:14, rating:4.3 }

  ],



  /* Rich student list (CSE dept for HOD/Faculty) */

  students: [

    { id:1,  name:'Priya Sharma',   roll:'CSE-101', dept:'CSE', year:'3rd Year', status:'Active',   cgpa:8.4, attendance:92, email:'priya@college.edu',   phone:'9876543210' },

    { id:2,  name:'Rohan Mehta',    roll:'CSE-102', dept:'CSE', year:'3rd Year', status:'Active',   cgpa:7.9, attendance:88, email:'rohan@college.edu',   phone:'9876543211' },

    { id:3,  name:'Ananya Das',     roll:'CSE-103', dept:'CSE', year:'3rd Year', status:'Active',   cgpa:9.1, attendance:96, email:'ananya@college.edu',  phone:'9876543212' },

    { id:4,  name:'Rishabh Devadiga',    roll:'CSE-104', dept:'CSE', year:'2nd Year', status:'Active',   cgpa:7.2, attendance:74, email:'rishabh@college.edu',   phone:'9876543213' },

    { id:5,  name:'Sneha Nair',     roll:'CSE-105', dept:'CSE', year:'2nd Year', status:'Active',   cgpa:8.8, attendance:95, email:'sneha@college.edu',   phone:'9876543214' },

    { id:6,  name:'Dev Malhotra',   roll:'ME-204',  dept:'ME',  year:'2nd Year', status:'Active',   cgpa:7.5, attendance:81, email:'dev@college.edu',     phone:'9876543215' },

    { id:7,  name:'Anjali Singh',   roll:'ECE-305', dept:'ECE', year:'3rd Year', status:'Active',   cgpa:8.2, attendance:89, email:'anjali@college.edu',  phone:'9876543216' },

    { id:8,  name:'Vijay Kumar',    roll:'CSE-106', dept:'CSE', year:'1st Year', status:'Active',   cgpa:7.8, attendance:85, email:'vijay@college.edu',   phone:'9876543217' },

    { id:9,  name:'Pooja Reddy',    roll:'MBA-201', dept:'MBA', year:'1st Year', status:'Active',   cgpa:8.6, attendance:91, email:'pooja@college.edu',   phone:'9876543218' },

    { id:10, name:'Amit Joshi',     roll:'CSE-107', dept:'CSE', year:'4th Year', status:'Active',   cgpa:9.3, attendance:97, email:'amit@college.edu',    phone:'9876543219' },

    { id:105, name:'Gaurav Pawar',   roll:'ME-307',  dept:'ME',  year:'2nd Year', status:'Active',   cgpa:5.2, attendance:5,  email:'gaurav.pawar@college.edu',   phone:'9876543220' },

    { id:106, name:'Ajinkya Rokade', roll:'ECE-308', dept:'ECE', year:'2nd Year', status:'Active',   cgpa:5.8, attendance:8,  email:'ajinkya.rokade@college.edu', phone:'9876543221' }

  ],



  /* Courses (CSE focus for HOD/Faculty) */

  courses: [

    { id:1, code:'CSE301', name:'Data Structures & Algorithms', credits:4, faculty:'Prof. Meera Singh', dept:'CSE', sem:'5', enrolled:62, syllabus:85 },

    { id:2, code:'CSE302', name:'Database Management Systems',  credits:3, faculty:'Dr. Rajiv Rao',     dept:'CSE', sem:'5', enrolled:60, syllabus:90 },

    { id:3, code:'CSE401', name:'Computer Networks',            credits:4, faculty:'Prof. Meera Singh', dept:'CSE', sem:'7', enrolled:55, syllabus:75 },

    { id:4, code:'CSE402', name:'Operating Systems',            credits:3, faculty:'Dr. Rajiv Rao',     dept:'CSE', sem:'7', enrolled:58, syllabus:80 },

    { id:5, code:'CSE501', name:'Machine Learning',             credits:4, faculty:'Dr. Arun Pillai',   dept:'CSE', sem:'8', enrolled:48, syllabus:70 },

    { id:6, code:'ECE301', name:'Signals & Systems',            credits:3, faculty:'Dr. Vikram Iyer',   dept:'ECE', sem:'5', enrolled:52, syllabus:88 },

    { id:7, code:'ME301',  name:'Thermodynamics',               credits:4, faculty:'Prof. Arun Das',    dept:'ME',  sem:'5', enrolled:45, syllabus:82 }

  ],



  /* Faculty assignments (for HOD) */

  faculty: [

    { id:1, name:'Prof. Meera Singh', dept:'CSE', desig:'Asst. Professor', load:14, courses:['CSE301','CSE401'], email:'meera@college.edu', status:'Active',  leaveBalance:12 },

    { id:2, name:'Dr. Rajiv Rao',     dept:'CSE', desig:'HOD / Professor', load:18, courses:['CSE302','CSE402'], email:'rao@college.edu',   status:'Active',  leaveBalance:8  },

    { id:3, name:'Dr. Arun Pillai',   dept:'CSE', desig:'Assoc. Professor', load:16, courses:['CSE501'],         email:'arun@college.edu',  status:'Active',  leaveBalance:10 },

    { id:4, name:'Dr. Vikram Iyer',   dept:'ECE', desig:'HOD / Professor', load:18, courses:['ECE301'],         email:'iyer@college.edu',  status:'Active',  leaveBalance:9  },

    { id:5, name:'Prof. Nisha Patel', dept:'ECE', desig:'Asst. Professor', load:12, courses:[],                  email:'nisha@college.edu', status:'Inactive',leaveBalance:15 }

  ],



  /* Attendance records */

  attendance: [

    { id:1, cls:'CSE A', course:'CSE301', date:'2026-03-12', present:56, total:62, pct:90 },

    { id:2, cls:'CSE A', course:'CSE302', date:'2026-03-12', present:54, total:60, pct:90 },

    { id:3, cls:'CSE B', course:'CSE401', date:'2026-03-13', present:48, total:55, pct:87 },

    { id:4, cls:'CSE A', course:'CSE301', date:'2026-03-13', present:59, total:62, pct:95 },

    { id:5, cls:'ECE A', course:'ECE301', date:'2026-03-12', present:46, total:52, pct:88 },

    { id:6, cls:'CSE A', course:'CSE301', date:'2026-03-14', present:50, total:62, pct:81 }

  ],



  /* Assignments */

  assignments: [

    { id:1, course:'CSE301', title:'Linked List Implementation', deadline:'2026-03-20', submitted:45, total:62, status:'Active' },

    { id:2, course:'CSE401', title:'TCP/IP Protocol Analysis',   deadline:'2026-03-22', submitted:38, total:55, status:'Active' },

    { id:3, course:'CSE302', title:'ER Diagram Design',          deadline:'2026-03-18', submitted:55, total:60, status:'Closed' },

    { id:4, course:'CSE501', title:'Linear Regression Model',    deadline:'2026-03-28', submitted:20, total:48, status:'Active' }

  ],



  /* Marks */

  marks: [

    { id:1, course:'CSE301', exam:'Mid Semester', student:'Priya Sharma', roll:'CSE-101', marks:42, maxMarks:50, grade:'A' },

    { id:2, course:'CSE301', exam:'Mid Semester', student:'Rohan Mehta',  roll:'CSE-102', marks:38, maxMarks:50, grade:'B' },

    { id:3, course:'CSE301', exam:'Mid Semester', student:'Ananya Das',   roll:'CSE-103', marks:47, maxMarks:50, grade:'A+' },

    { id:4, course:'CSE301', exam:'Mid Semester', student:'Rishabh Devadiga',  roll:'CSE-104', marks:31, maxMarks:50, grade:'C' },

    { id:5, course:'CSE302', exam:'Unit Test 1',  student:'Priya Sharma', roll:'CSE-101', marks:18, maxMarks:20, grade:'A' }

  ],



  /* Leave requests (Faculty → HOD) */

  leaveRequests: [

    { id:1, faculty:'Prof. Meera Singh', dept:'CSE', from:'2026-03-17', to:'2026-03-19', days:3, reason:'Personal', status:'Pending', appliedOn:'2026-03-10' },

    { id:2, faculty:'Dr. Arun Pillai',   dept:'CSE', from:'2026-03-25', to:'2026-03-26', days:2, reason:'Conference', status:'Approved', appliedOn:'2026-03-08' },

    { id:3, faculty:'Prof. Nisha Patel', dept:'ECE', from:'2026-03-20', to:'2026-03-22', days:3, reason:'Medical',   status:'Pending', appliedOn:'2026-03-12' }

  ],



  /* Announcements */

  announcements: [

    { id:1, title:'Mid-Sem Exam Schedule Released',  author:'COE',       audience:'All',     date:'2026-03-12', priority:'High',   content:'Mid-semester exams will be held from April 2–10, 2026. Hall tickets available on portal.' },

    { id:2, title:'Fee Submission Deadline Extended', author:'Finance',   audience:'Students',date:'2026-03-10', priority:'Medium', content:'Last date for fee submission extended to March 31, 2026. Late fee of ₹500 after deadline.' },

    { id:3, title:'Faculty Workshop: AI in Education', author:'Head',audience:'Faculty', date:'2026-03-08', priority:'Medium', content:'Mandatory workshop on March 20, 2026 in Seminar Hall B. Attendance compulsory.' },

    { id:4, title:'Campus Placement Drive — TCS',     author:'T&P Cell',  audience:'Final Year', date:'2026-03-06', priority:'High', content:'TCS placement drive on April 5. Register on placement portal before March 25.' },

    { id:5, title:'HOD Meeting — Academic Planning',  author:'Head', audience:'HODs',    date:'2026-03-05', priority:'Medium', content:'Monthly HOD meeting on March 16 at 11 AM in Conference Room 1.' }

  ],



  /* Academic calendar events */

  calendar: [

    { id:1, event:'Mid-Semester Exams',        start:'2026-04-02', end:'2026-04-10', type:'Exam',     dept:'All' },

    { id:2, event:'Spring Break',              start:'2026-04-11', end:'2026-04-15', type:'Holiday',  dept:'All' },

    { id:3, event:'End-Semester Exams',        start:'2026-05-10', end:'2026-05-25', type:'Exam',     dept:'All' },

    { id:4, event:'TCS Placement Drive',       start:'2026-04-05', end:'2026-04-05', type:'Placement',dept:'CSE' },

    { id:5, event:'Faculty Development Program', start:'2026-03-20', end:'2026-03-20', type:'Event', dept:'All' },

    { id:6, event:'NAAC Peer Team Visit',      start:'2026-04-20', end:'2026-04-22', type:'Compliance',dept:'All' }

  ],



  /* Audit logs (Admin only) */

  auditLogs: [

    { id:1, user:'Mr. Suresh Kumar', action:'User Created',     target:'Prof. Nisha Patel', timestamp:'2026-03-14 09:30', ip:'192.168.1.10' },

    { id:2, user:'Dr. Rajiv Rao',    action:'Attendance Marked', target:'CSE301 — CSE A',   timestamp:'2026-03-14 09:15', ip:'192.168.1.22' },

    { id:3, user:'Prof. Meera Singh',action:'Marks Uploaded',   target:'CSE301 Mid Sem',    timestamp:'2026-03-13 17:45', ip:'192.168.1.25' },

    { id:4, user:'Dr. Anita Sharma', action:'Announcement Posted',target:'Mid-Sem Schedule', timestamp:'2026-03-12 11:00', ip:'192.168.1.5'  },

    { id:5, user:'Mr. Suresh Kumar', action:'Role Changed',     target:'Dr. Rajiv Rao → HOD', timestamp:'2026-03-10 14:20', ip:'192.168.1.10' }

  ],



  /* HOD proposals waiting for Head approval */

  proposals: [

    { id:1, hod:'Dr. Rajiv Rao',   dept:'CSE', title:'New Elective: Cloud Computing', description:'Add CSE502 Cloud Computing as 8th sem elective', status:'Pending', date:'2026-03-10' },

    { id:2, hod:'Dr. Vikram Iyer', dept:'ECE', title:'Lab Equipment Purchase',        description:'Purchase of 20 DSP kits for ECE lab', status:'Pending', date:'2026-03-08' },

    { id:3, hod:'Dr. Priya Nair',  dept:'MBA', title:'Industry Visit Approval',       description:'Industry visit to Infosys campus for MBA students', status:'Approved', date:'2026-03-05' }

  ],



  /* Study materials uploaded by faculty */

  materials: [

    { id:1, course:'CSE301', title:'Module 3 — Trees & Graphs',   type:'PDF',  faculty:'Prof. Meera Singh', date:'2026-03-13', size:'2.4 MB' },

    { id:2, course:'CSE401', title:'TCP/IP Layer Overview Slides', type:'PPT',  faculty:'Prof. Meera Singh', date:'2026-03-12', size:'5.1 MB' },

    { id:3, course:'CSE302', title:'SQL Query Practice Set',       type:'PDF',  faculty:'Dr. Rajiv Rao',     date:'2026-03-11', size:'1.2 MB' },

    { id:4, course:'CSE501', title:'Regression Analysis Notes',    type:'PDF',  faculty:'Dr. Arun Pillai',   date:'2026-03-10', size:'3.8 MB' }

  ],



  /* Department timetable slots */

  timetable: [

    { day:'Monday',    time:'09:00-10:00', course:'CSE301', room:'CR-101', faculty:'Prof. Meera Singh', batch:'CSE-A' },

    { day:'Monday',    time:'10:00-11:00', course:'CSE302', room:'CR-102', faculty:'Dr. Rajiv Rao',     batch:'CSE-A' },

    { day:'Monday',    time:'11:00-12:00', course:'CSE401', room:'CR-103', faculty:'Prof. Meera Singh', batch:'CSE-B' },

    { day:'Tuesday',   time:'09:00-10:00', course:'CSE302', room:'CR-101', faculty:'Dr. Rajiv Rao',     batch:'CSE-A' },

    { day:'Tuesday',   time:'10:00-11:00', course:'CSE501', room:'Lab-1',  faculty:'Dr. Arun Pillai',   batch:'CSE-C' },

    { day:'Wednesday', time:'09:00-10:00', course:'CSE301', room:'CR-101', faculty:'Prof. Meera Singh', batch:'CSE-A' },

    { day:'Thursday',  time:'11:00-12:00', course:'CSE402', room:'CR-104', faculty:'Dr. Rajiv Rao',     batch:'CSE-B' },

    { day:'Friday',    time:'09:00-10:00', course:'CSE401', room:'CR-103', faculty:'Prof. Meera Singh', batch:'CSE-A' }

  ]

};



var DEFAULT_INSTITUTE = 'EduSys Demo College';

var ROLE_OPTIONS = ['Admin','Head','HOD','Faculty','Account','Admissions','Railway Concession'];



function safeTrim(val) { return (val || '').toString().trim(); }

function getCurrentInstitute() {

  var stored = safeTrim(storeGet('edusys-college'));

  return stored || DEFAULT_INSTITUTE;

}

function getUserInstitute(user) {

  return safeTrim(user && user.institute) || DEFAULT_INSTITUTE;

}

function normalizeDept(input) {

  var raw = safeTrim(input);

  if (!raw) return '';

  var db = dbGet();

  var known = [];

  if (db && db.departments && db.departments.length) {
    known = db.departments.map(function(d) { return d.name; });
  }

  known = known.concat(['Finance','Admissions','Student Services','Administration','All','General']);

  var match = known.find(function(k) { return k.toLowerCase() === raw.toLowerCase(); });

  return match || raw;

}

function isKnownDept(name) {

  var raw = safeTrim(name);

  if (!raw) return false;

  var db = dbGet();

  var known = [];

  if (db && db.departments && db.departments.length) {
    known = db.departments.map(function(d) { return d.name; });
  }

  known = known.concat(['Finance','Admissions','Student Services','Administration','All','General']);

  return known.some(function(k) { return k.toLowerCase() === raw.toLowerCase(); });

}



/* ── DB HELPERS ──────────────────────────────────────────────

   Load / save demo DB from localStorage.

   First run seeds with SEED_DATA; subsequent runs use stored.

   ──────────────────────────────────────────────────────────── */

function dbLoad() {

  try {

    var raw = storeGet(DEMO_DB_KEY);

    return raw ? JSON.parse(raw) : null;

  } catch(e) { return null; }

}

function dbSave(data) {

  try { storeSet(DEMO_DB_KEY, JSON.stringify(data)); } catch(e) {}

}

function dbGet() {

  var d = dbLoad();

  if (!d) { d = JSON.parse(JSON.stringify(SEED_DATA)); dbSave(d); }

  var changed = false;

  if (d && d.users && d.users.length) {

    d.users.forEach(function(u) {

      if (!safeTrim(u.institute)) { u.institute = DEFAULT_INSTITUTE; changed = true; }

      if (!u.status) { u.status = 'Active'; changed = true; }

    });

    /* Seed mock faculty approvals if missing */
    var mockFaculty = [
      { name:'Prof. Arjun Mehta', email:'arjun.cse@edusys.in', role:'Faculty', dept:'CSE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-19', institute:DEFAULT_INSTITUTE },
      { name:'Dr. Kavya Iyer',   email:'kavya.cse@edusys.in', role:'Faculty', dept:'CSE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-19', institute:DEFAULT_INSTITUTE },
      { name:'Prof. Rahul Nair', email:'rahul.ece@edusys.in', role:'Faculty', dept:'ECE', status:'Pending', lastLogin:'—', requestedRole:'Faculty', requestedOn:'2026-03-18', institute:DEFAULT_INSTITUTE },
      { name:'Ms. Shruti Rao',   email:'shruti.mba@edusys.in', role:'Faculty', dept:'MBA', status:'Pending', lastLogin:'?', requestedRole:'Faculty', requestedOn:'2026-03-17', institute:DEFAULT_INSTITUTE }
    ];
    var existingEmails = d.users.map(function(u) { return (u.email || '').toLowerCase(); });
    var nextId = d.users.reduce(function(maxId, u) {
      return (u && u.id && u.id > maxId) ? u.id : maxId;
    }, 0);
    mockFaculty.forEach(function(m) {
      if (existingEmails.indexOf(m.email.toLowerCase()) === -1) {
        nextId += 1;
        m.id = nextId;
        d.users.push(m);
        changed = true;
      }
    });

  }

  if (changed) dbSave(d);

  // Sync missing students from SEED_DATA
  if (SEED_DATA && SEED_DATA.students && Array.isArray(SEED_DATA.students)) {
    var existingIds = d.students ? d.students.map(function(s) { return s.id; }) : [];
    var newStudents = SEED_DATA.students.filter(function(s) { return existingIds.indexOf(s.id) === -1; });
    if (newStudents.length > 0) {
      if (!d.students) d.students = [];
      d.students = d.students.concat(newStudents);
      dbSave(d);
    }
  }

  return d;

}

function dbReset() {

  storeRemove(DEMO_DB_KEY);

  showToast('Demo data restored to defaults', 'info');

  setTimeout(function() { location.reload(); }, 800);

}



/* ── AUTH ────────────────────────────────────────────────────

   Login / logout / session stored in localStorage.

   Key: edusys_session → { email, role, name, dept, title }

   ──────────────────────────────────────────────────────────── */

var SESSION_KEY = 'edusys_session';



function authLogin(email, password, role) {

  /* Find user matching email+password (case-insensitive email) */

  var user = DEMO_USERS.find(function(u) {

    return u.email.toLowerCase() === email.toLowerCase() && u.password === password;

  });

  var fromDb = false;

  if (!user) {

    var db = dbGet();

    var dbUser = db.users.find(function(u) {

      return u.email && u.email.toLowerCase() === email.toLowerCase() && u.password === password;

    });

    if (dbUser) {
      if (dbUser.status && dbUser.status !== 'Active') {
        var msg = dbUser.status === 'Pending'
          ? 'Account pending approval'
          : dbUser.status === 'Rejected'
            ? 'Account request rejected'
            : 'Account ' + dbUser.status.toLowerCase();
        showToast(msg, 'warning');
        return false;
      }
      user = dbUser;
      fromDb = true;
    }
  }

  if (!user) { showToast('Invalid email or password', 'error'); return false; }

  /* If a specific role was requested, verify it matches */

  if (role && user.role !== role) {

    showToast('This account does not have the ' + role + ' role', 'error'); return false;

  }

  var institute = user.institute || getCurrentInstitute();

  if (user.role === 'Head' && institute) storeSet('edusys-college', institute);

  storeSet(SESSION_KEY, JSON.stringify({

    email: user.email, role: user.role, name: user.name, dept: user.dept, title: user.title || user.role, institute: institute

  }));

  showToast('Logged in as ' + user.name + ' (' + user.role + ')');

  if (fromDb) {

    var db2 = dbGet();

    var u2 = db2.users.find(function(u) { return u.id === user.id; });

    if (u2) { u2.lastLogin = new Date().toLocaleString(); dbSave(db2); }

  }

  return true;

}



function authLoginAsRole(role) {

  /* One-click demo login — picks the matching demo user */

  var user = DEMO_USERS.find(function(u) { return u.role === role; });

  if (!user) return false;

  var institute = user.institute || getCurrentInstitute();

  if (user.role === 'Head' && institute) storeSet('edusys-college', institute);

  storeSet(SESSION_KEY, JSON.stringify({

    email: user.email, role: user.role, name: user.name, dept: user.dept, title: user.title || user.role, institute: institute

  }));

  showToast('Logged in as ' + user.name + ' (' + user.role + ')');

  return true;

}



function authLogout() {

  storeRemove(SESSION_KEY);

  showPage('edusys-access');

  showToast('Logged out successfully', 'info');

}



function setAccessMode(mode) {

  var signup = document.getElementById('access-signup');

  var login = document.getElementById('access-login');

  if (!signup || !login) return;

  var isSignup = mode === 'signup';

  signup.style.display = isSignup ? '' : 'none';

  login.style.display = isSignup ? 'none' : '';

  var btnSignup = document.getElementById('access-toggle-signup');

  var btnLogin = document.getElementById('access-toggle-login');

  if (btnSignup) btnSignup.classList.toggle('btn-primary', isSignup);

  if (btnLogin) btnLogin.classList.toggle('btn-primary', !isSignup);

  var err = document.getElementById('access-signup-error');

  var ok = document.getElementById('access-signup-success');

  var errLogin = document.getElementById('access-error');

  if (err) err.style.display = 'none';

  if (ok) ok.style.display = 'none';

  if (errLogin) errLogin.style.display = 'none';

  if (typeof storeSet === 'function') storeSet('edusys-access-mode', isSignup ? 'signup' : 'login');

}



function initAccessMode() {

  var mode = (typeof storeGet === 'function' ? storeGet('edusys-access-mode') : null) || 'signup';

  setAccessMode(mode);

  var instInput = document.getElementById('signup-institute');

  var inst = getCurrentInstitute();

  if (instInput && !safeTrim(instInput.value)) instInput.value = inst;

  var keyInput = document.getElementById('signup-key');

  var storedKey = (typeof storeGet === 'function') ? storeGet('edusys-key') : null;

  if (keyInput && storedKey && !safeTrim(keyInput.value)) keyInput.value = storedKey;

  bindAccessApprovalHint();

}

function updateAccessApprovalHint() {

  var roleEl = document.getElementById('signup-role');

  var hintEl = document.getElementById('access-approval-hint');

  if (!roleEl || !hintEl) return;

  var role = safeTrim(roleEl.value) || 'Faculty';

  var approver = (role === 'Faculty') ? 'HOD' : 'Head';

  hintEl.textContent = 'Your request is sent to the ' + approver + ' for approval before access is granted.';

}



function bindAccessApprovalHint() {

  var roleEl = document.getElementById('signup-role');

  if (!roleEl) return;

  if (roleEl.dataset && roleEl.dataset.approvalHint === '1') {

    updateAccessApprovalHint();

    return;

  }

  roleEl.addEventListener('change', updateAccessApprovalHint);

  if (roleEl.dataset) roleEl.dataset.approvalHint = '1';

  updateAccessApprovalHint();

}



function requestAccess() {

  var errEl = document.getElementById('access-signup-error');

  var okEl = document.getElementById('access-signup-success');

  function showErr(msg) {

    if (okEl) okEl.style.display = 'none';

    if (errEl) {

      errEl.textContent = '✖ ' + msg;

      errEl.style.display = 'block';

    }

  }

  function showOk(msg) {

    if (errEl) errEl.style.display = 'none';

    if (okEl) {

      okEl.textContent = '✓ ' + msg;

      okEl.style.display = 'block';

    }

  }



  var name = safeTrim((document.getElementById('signup-name') || {}).value);

  var email = safeTrim((document.getElementById('signup-email') || {}).value).toLowerCase();

  var password = safeTrim((document.getElementById('signup-password') || {}).value);

  var role = safeTrim((document.getElementById('signup-role') || {}).value) || 'Faculty';

  var deptRaw = safeTrim((document.getElementById('signup-dept') || {}).value);
  var dept = normalizeDept(deptRaw) || 'General';

  var institute = safeTrim((document.getElementById('signup-institute') || {}).value) || getCurrentInstitute();

  var key = safeTrim((document.getElementById('signup-key') || {}).value);



  if (!name || !email || !password || !key) return showErr('Please fill all required fields');

  var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) return showErr('Please enter a valid email address');

  if (password.length < 8) return showErr('Password must be at least 8 characters');

  if ((role === 'Faculty' || role === 'HOD') && !isKnownDept(dept)) {
    return showErr('Please choose a valid department so the approval reaches the correct HOD.');
  }



  var storedKey = (typeof storeGet === 'function') ? storeGet('edusys-key') : null;

  var keyValid = (storedKey && key === storedKey) || key === 'EDU-DEMO-2026';

  if (!keyValid) return showErr('Invalid System Key. Contact the Head for the correct key.');



  var db = dbGet();

  var existsDemo = DEMO_USERS.some(function(u) { return u.email.toLowerCase() === email; });

  var existsDb = db.users.some(function(u) { return u.email && u.email.toLowerCase() === email; });

  if (existsDemo || existsDb) return showErr('An account with this email already exists.');



  var now = new Date();

  db.users.push({

    id: Date.now(),

    name: name,

    email: email,

    role: role,

    requestedRole: role,

    dept: dept,

    status: 'Pending',

    lastLogin: '—',

    institute: institute,

    password: password,

    requestedOn: now.toISOString().split('T')[0]

  });

  db.auditLogs = db.auditLogs || [];

  db.auditLogs.unshift({

    id: Date.now(),

    user: name,

    action: 'Access Requested',

    target: role + ' — ' + dept,

    timestamp: now.toLocaleString(),

    ip: '127.0.0.1'

  });

  dbSave(db);



  var loginEmail = document.getElementById('access-email');

  var loginKey = document.getElementById('access-key');

  if (loginEmail) loginEmail.value = email;

  if (loginKey) loginKey.value = key;

  var passEl = document.getElementById('signup-password');

  if (passEl) passEl.value = '';



  showOk('Request submitted. Awaiting ' + (role === 'Faculty' ? 'HOD' : 'Head') + ' approval.');

  setAccessMode('login');

}



function getSession() {

  try {

    var raw = storeGet(SESSION_KEY);

    return raw ? JSON.parse(raw) : null;

  } catch(e) { return null; }

}



function getRole() {

  var s = getSession();

  return s ? s.role : null;

}



/* ── ROLE PERMISSIONS ────────────────────────────────────────

   Map each role to the sidebar modules they can access.

   Modules not listed → hidden via CSS (display:none on nav-item).

   ──────────────────────────────────────────────────────────── */

var ROLE_MODULES = {

  Admin: [

    'overview','admissions','students','academics','attendance','exams',

    'faculty','finance','hr','library','hostel','transport','placements',

    'research','facilities','inventory','procurement','service',

    'communications','compliance','integrations','analytics','attainment',

    'coverage','add-feature',

    /* Admin-only extras */

    'role-users','role-audit','role-config','role-backup'

  ],

  Head: [
    'overview','students','finance','attendance','analytics','communications','compliance','add-feature',
    /* Head-only extras */
    'role-perf','role-proposals','role-accounts','role-strategic'
  ],

  HOD: [
    'overview','students','academics','exams','faculty',
    'compliance','analytics','communications','add-feature',
    /* HOD-only extras */
    'role-dept','role-timetable','role-leave','role-marks','role-marks-viewer','role-meetings','role-hod-accounts'
  ],

  Faculty: [

    'overview','add-feature',

    /* Faculty-only */

    'role-mycourses','role-attendance','role-marks','role-marks-viewer','role-meetings','role-assignments',

    'role-materials','role-schedule','role-announce'

  ],

  Account: [

    'overview','students','communications','analytics','add-feature'

  ],

  Admissions: [

    'overview','students','add-feature'

  ],

  'Railway Concession': [

    'overview','add-feature'

  ]

};



/* ── ROLE-SPECIFIC SIDEBAR CONFIG ───────────────────────────

   Defines extra nav items injected per role into the sidebar.

   ──────────────────────────────────────────────────────────── */

var ROLE_NAV = {

  Admin: [

    { id:'role-users',  icon:'👤', label:'User Management',    section:'Admin Tools' },

    { id:'role-audit',  icon:'📋', label:'Audit Logs',          section:'Admin Tools' },

    { id:'role-config', icon:'⚙',  label:'System Config',       section:'Admin Tools' },

    { id:'role-backup', icon:'💾', label:'Backup & Restore',    section:'Admin Tools' }

  ],

  Head: [
    { id:'role-perf',      icon:'📊', label:'Performance Review', section:'Head Tools' },
    { id:'role-proposals', icon:'', label:'HOD Proposals',      section:'Head Tools' },
    { id:'role-accounts',  icon:'&#128101;', label:'Account Approvals',  section:'Head Tools' },
    { id:'role-strategic', icon:'🗺', label:'Strategic Reports',  section:'Head Tools' }
  ],
  HOD: [

    { id:'role-dept',      icon:'',  label:'Dept. Management',  section:'HOD Tools' },

    { id:'role-timetable', icon:'🗓',  label:'Timetable',          section:'HOD Tools' },

    { id:'role-hod-accounts', icon:'',  label:'Faculty Approvals',   section:'HOD Tools' },
    { id:'role-leave',     icon:'📅',  label:'Leave Requests',     section:'HOD Tools' },

    { id:'role-marks',     icon:'',  label:'Internal Marks',     section:'HOD Tools' },
    { id:'role-marks-viewer', icon:'', label:'Marks Viewer',     section:'HOD Tools' },
    { id:'role-meetings', icon:'', label:'Video Meetings',       section:'HOD Tools' }

  ],

  Faculty: [

    { id:'role-mycourses',  icon:'📚', label:'My Courses',         section:'My Dashboard' },

    { id:'role-schedule',   icon:'🗓', label:'My Schedule',        section:'My Dashboard' },
    { id:'role-attendance', icon:'', label:'Take Attendance',    section:'My Dashboard' },
    { id:'role-assignments',icon:'📋', label:'Assignments',        section:'My Dashboard' },
    { id:'role-marks',      icon:'', label:'Enter Marks',        section:'My Dashboard' },
    { id:'role-marks-viewer', icon:'', label:'Marks Viewer',     section:'My Dashboard' },
    { id:'role-meetings', icon:'', label:'Video Meetings',       section:'My Dashboard' },
    { id:'role-materials',  icon:'', label:'Study Materials',    section:'My Dashboard' },

    { id:'role-announce',   icon:'📣', label:'Post Announcement',  section:'My Dashboard' }

  ],

  Account: [],

  Admissions: [],

  'Railway Concession': []

};



/* 

   ROLE DASHBOARD HTML BUILDERS

   Each returns an HTML string rendered into the module-wrap.

    */



/* ── SHARED WIDGET HELPERS ─────────────────────────────────── */

function widgetKpi(label, value, sub, subType) {

  subType = subType || 'neutral';

  return '<div class="kpi-card">'

    + '<div class="kpi-label">' + label + '</div>'

    + '<div class="kpi-value">' + value + '</div>'

    + '<span class="kpi-sub kpi-' + subType + '">' + sub + '</span>'

    + '</div>';

}

function widgetBar(label, pct, colorClass) {

  colorClass = colorClass || '';

  return '<div class="bar-row"><span class="bar-label">' + label + '</span>'

    + '<div class="bar-track"><div class="bar-fill ' + colorClass + '" style="width:' + pct + '%">' + pct + '%</div></div></div>';

}

function widgetTable(heads, rows, emptyMsg) {

  var th = '<thead><tr>' + heads.map(function(h){return '<th>'+h+'</th>';}).join('') + '</tr></thead>';

  var empty = '<tr><td colspan="'+heads.length+'" style="text-align:center;color:var(--text3);padding:20px">'+

    (emptyMsg||'No records')+'</td></tr>';

  var tb = '<tbody>'+(rows.length?rows.map(function(r){

    return '<tr>'+r.map(function(c){return '<td>'+c+'</td>';}).join('')+'</tr>';

  }).join(''):empty)+'</tbody>';

  return '<div class="table-wrap"><table class="table">'+th+tb+'</table></div>';

}



/* 

   ADMIN ROLE SECTIONS

    */



/* Admin: Override overview with richer admin dashboard */

function buildAdminOverride() {

  var db = dbGet();

  var totalStudents = db.students.length;

  var totalFaculty  = db.faculty.length;

  var totalDepts    = db.departments.length;

  var totalUsers    = db.users.length;

  var activeUsers   = db.users.filter(function(u){return u.status==='Active';}).length;

  var pendingLeave  = db.leaveRequests.filter(function(l){return l.status==='Pending';}).length;



  return '<div class="module-header"><div class="module-title">Admin Dashboard</div>'

    + '<div class="module-sub">Full system control — Users, Departments, Analytics, Configuration</div></div>'

    + '<div class="kpi-grid">'

    + widgetKpi('Total Users', totalUsers, activeUsers+' active', 'up')

    + widgetKpi('Departments', totalDepts, 'Fully configured', 'up')

    + widgetKpi('Students', totalStudents, 'Across all depts', 'up')

    + widgetKpi('Faculty', totalFaculty, pendingLeave+' leave pending', pendingLeave>0?'down':'neutral')

    + '</div>'

    + '<div class="grid grid-2">'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Department Overview</h3>'

    + widgetTable(['Dept','HOD','Students','Faculty','Rating'],

        db.departments.map(function(d){

          var stars = d.rating >= 4.4 ? '🟢' : d.rating >= 4.0 ? '🟡' : '🔴';

          return [d.name, d.hod, d.students, d.faculty, stars+' '+d.rating];

        }))

    + '</div>'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Recent Activity</h3>'

    + widgetTable(['User','Action','Target','Time'],

        db.auditLogs.slice(0,4).map(function(l){

          return [l.user.split(' ').pop(), l.action, l.target.substring(0,20), l.timestamp.split(' ')[1]];

        }))

    + '</div></div>';

}



/* Admin: User Management */

function buildAdminUsers() {

  var db = dbGet();

  var roleColors = {

    Admin:'purple', Head:'blue', HOD:'accent', Faculty:'green',

    Account:'yellow', Admissions:'blue', 'Railway Concession':'orange'

  };

  return '<div class="module-header"><div class="module-title">User Management</div>'

    + '<div class="module-sub">Create, edit, delete users and assign roles. Changes saved to localStorage.</div></div>'

    + '<div class="panel"><div class="form-section-title">Add New User</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Full Name</label><input class="form-input" id="nu-name" placeholder="Dr. Name"/></div>'

    + '<div class="form-group"><label class="form-label">Email</label><input class="form-input" id="nu-email" type="email" placeholder="user@edusys.in"/></div>'

    + '<div class="form-group"><label class="form-label">Role</label><select class="form-select" id="nu-role"><option>Admin</option><option>Head</option><option>HOD</option><option>Faculty</option><option>Account</option><option>Admissions</option><option>Railway Concession</option></select></div>'

    + '<div class="form-group"><label class="form-label">Department</label><select class="form-select" id="nu-dept"><option>All</option><option>CSE</option><option>ECE</option><option>ME</option><option>Civil</option><option>MBA</option></select></div>'

    + '<div class="form-group"><label class="form-label">Password</label><input class="form-input" id="nu-pass" type="password" placeholder="Temp password"/></div>'

    + '</div>'

    + '<div class="form-actions">'

    + '<button class="btn btn-primary" onclick="adminAddUser()">+ Add User</button>'

    + '</div></div>'

    + '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'

    + '<h3 style="font-family:var(--font-head)">All Users</h3>'

    + '<span class="badge badge-blue">'+db.users.length+' users</span></div>'

    + widgetTable(['Name','Email','Role','Dept','Last Login','Status','Action'],

        db.users.map(function(u){

          var rc = roleColors[u.role]||'gray';

          var st = u.status==='Active'?'<span class="badge badge-green">Active</span>':'<span class="badge badge-red">Inactive</span>';

          var act = '<button class="btn btn-sm" onclick="adminToggleUser('+u.id+')">'+

            (u.status==='Active'?'Deactivate':'Activate')+'</button> '+

            '<button class="btn btn-sm btn-danger" onclick="adminDeleteUser('+u.id+')">Del</button>';

          return ['<span class="badge badge-'+rc+'">'+u.role+'</span> '+u.name, u.email, u.role, u.dept, u.lastLogin, st, act];

        }))

    + '</div>';

}



/* Admin: Audit Logs */

function buildAdminAudit() {

  var db = dbGet();

  return '<div class="module-header"><div class="module-title">Audit Logs</div>'

    + '<div class="module-sub">Track all system actions. Every login, data change, and admin operation is logged.</div></div>'

    + '<div class="panel">'

    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'

    + '<h3 style="font-family:var(--font-head)">Activity Log</h3>'

    + '<button class="btn btn-sm" onclick="adminClearLogs()">Clear Logs</button></div>'

    + widgetTable(['User','Action','Target','IP','Timestamp'],

        db.auditLogs.map(function(l){

          return [l.user, '<span class="badge badge-blue">'+l.action+'</span>', l.target, l.ip, l.timestamp];

        }))

    + '</div>';

}



/* Admin: System Config */

function buildAdminConfig() {

  return '<div class="module-header"><div class="module-title">System Configuration</div>'

    + '<div class="module-sub">Manage institution settings, academic year, and ERP configuration.</div></div>'

    + '<div class="panel"><div class="form-section-title">Institution Settings</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Institution Name</label><input class="form-input" value="Northstar University" id="cfg-name"/></div>'

    + '<div class="form-group"><label class="form-label">Academic Year</label><select class="form-select" id="cfg-year"><option>2025–2026</option><option>2026–2027</option></select></div>'

    + '<div class="form-group"><label class="form-label">Current Semester</label><select class="form-select" id="cfg-sem"><option>Even (Jan–May)</option><option>Odd (Jul–Dec)</option></select></div>'

    + '<div class="form-group"><label class="form-label">Max Attendance Shortage %</label><input class="form-input" type="number" value="25" id="cfg-att"/></div>'

    + '<div class="form-group"><label class="form-label">CGPA Scale</label><select class="form-select"><option>10-point</option><option>4-point</option></select></div>'

    + '<div class="form-group"><label class="form-label">Attendance Method</label><select class="form-select"><option>Geofenced GPS</option><option>Biometric</option><option>Manual</option></select></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="adminSaveConfig()">Save Configuration</button></div></div>'

    + '<div class="panel"><div class="form-section-title">ERP Module Access Control</div>'

    + '<div class="grid grid-3" style="margin-top:12px">'

    + buildModuleToggle('Admissions','admissions-enabled',true)

    + buildModuleToggle('Finance','finance-enabled',true)

    + buildModuleToggle('HR & Payroll','hr-enabled',true)

    + buildModuleToggle('Library','library-enabled',true)

    + buildModuleToggle('Hostel','hostel-enabled',true)

    + buildModuleToggle('Transport','transport-enabled',true)

    + buildModuleToggle('Research','research-enabled',true)

    + buildModuleToggle('Placements','placements-enabled',true)

    + buildModuleToggle('Compliance','compliance-enabled',true)

    + '</div></div>';

}

function buildModuleToggle(name, id, checked) {

  return '<div class="integration-card '+(checked?'active-card':'')+'">'

    + '<div class="integration-info"><div><div class="integration-name">'+name+'</div>'

    + '<div class="integration-status">'+(checked?'Enabled':'Disabled')+'</div></div></div>'

    + '<label class="toggle"><input type="checkbox" id="'+id+'" '+(checked?'checked':'')

    + ' onchange="adminToggleModule(this,\''+name+'\')"/><span class="toggle-track"></span></label></div>';

}



/* Admin: Backup */

function buildAdminBackup() {

  return '<div class="module-header"><div class="module-title">Backup &amp; Restore</div>'

    + '<div class="module-sub">Export demo data or restore to factory defaults using localStorage.</div></div>'

    + '<div class="grid grid-2">'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Export Data</h3>'

    + '<p style="color:var(--text2);font-size:14px;margin-bottom:16px">Download all ERP data as a JSON file for offline backup.</p>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="adminExportData()">⬇ Export JSON</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Restore Defaults</h3>'

    + '<p style="color:var(--text2);font-size:14px;margin-bottom:16px">Reset all demo data to the original seed values. This cannot be undone.</p>'

    + '<div class="form-actions"><button class="btn btn-danger" onclick="confirmReset()">↺ Restore Factory Data</button></div></div>'

    + '</div>';

}



/* 

   HEAD ROLE SECTIONS

    */



function buildPrincipalOverride() {

  var db = dbGet();

  var avgAtt = Math.round(db.attendance.reduce(function(s,a){return s+a.pct;},0)/db.attendance.length);

  var pendingProposals = db.proposals.filter(function(p){return p.status==='Pending';}).length;



  return '<div class="module-header"><div class="module-title">Head\'s Dashboard</div>'

    + '<div class="module-sub">Institution performance at a glance — Departments, Faculty, Students, Compliance</div></div>'

    + '<div class="kpi-grid">'

    + widgetKpi('Avg. Attendance', avgAtt+'%', 'Across all depts', avgAtt>=85?'up':'down')

    + widgetKpi('HOD Proposals', pendingProposals, 'Awaiting approval', pendingProposals>0?'down':'neutral')

    + widgetKpi('Enrollment', '1,200', 'Total active students', 'up')

    + widgetKpi('NAAC Progress', '64%', 'Evidence gathered', 'neutral')

    + '</div>'

    + '<div class="grid grid-2">'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Department Performance</h3>'

    + '<div class="bar-chart-wrap">'

    + db.departments.map(function(d){

        var pct = Math.round(d.rating/5*100);

        return widgetBar(d.name, pct, pct>=88?'bar-fill-green':'');

      }).join('')

    + '</div></div>'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Pending Announcements</h3>'

    + widgetTable(['Title','Author','Priority','Date'],

        db.announcements.slice(0,4).map(function(a){

          var pc = a.priority==='High'?'red':a.priority==='Medium'?'yellow':'gray';

          return [a.title.substring(0,28)+'…', a.author, '<span class="badge badge-'+pc+'">'+a.priority+'</span>', a.date];

        }))

    + '</div></div>';

}



function buildPrincipalPerf() {

  var db = dbGet();

  return '<div class="module-header"><div class="module-title">Performance Review</div>'

    + '<div class="module-sub">Faculty and Department performance metrics for institutional review.</div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Faculty Performance</h3>'

    + widgetTable(['Faculty','Dept','Courses','Teaching Load','Status'],

        db.faculty.map(function(f){

          var load = f.load > 16 ? '<span class="badge badge-yellow">High</span>' : '<span class="badge badge-green">Normal</span>';

          return [f.name, f.dept, f.courses.length, f.load+' hrs/wk '+load, sbadge(f.status)];

        }))

    + '</div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:16px">Attendance by Department</h3>'

    + '<div class="bar-chart-wrap">'

    + widgetBar('CSE', 91, 'bar-fill-green')

    + widgetBar('ECE', 88, 'bar-fill-green')

    + widgetBar('ME',  83, '')

    + widgetBar('Civil', 79, '')

    + widgetBar('MBA', 86, '')

    + '</div></div>';

}



function buildPrincipalProposals() {

  var db = dbGet();

  return '<div class="module-header"><div class="module-title">HOD Proposals</div>'

    + '<div class="module-sub">Review and approve department proposals submitted by Heads of Departments.</div></div>'

    + '<div class="panel">'

    + widgetTable(['HOD','Dept','Proposal','Description','Status','Action'],

        db.proposals.map(function(p){

          var act = p.status==='Pending'

            ? '<button class="btn btn-sm btn-success" onclick="principalApproveProposal('+p.id+',true)">Approve</button> '

            + '<button class="btn btn-sm btn-danger" onclick="principalApproveProposal('+p.id+',false)">Reject</button>'

            : '<span class="badge badge-'+(p.status==='Approved'?'green':'red')+'">'+p.status+'</span>';

          return [p.hod, p.dept, p.title, p.description.substring(0,35)+'…', sbadge(p.status), act];

        }))

    + '</div>';

}



function buildPrincipalStrategic() {

  return '<div class="module-header"><div class="module-title">Strategic Reports</div>'

    + '<div class="module-sub">Institution-wide reports for strategic planning and accreditation.</div></div>'

    + '<div class="kpi-grid">'

    + widgetKpi('Placement Rate', '76%', 'Current batch', 'up')

    + widgetKpi('Research Papers', '42', 'Published this year', 'up')

    + widgetKpi('Alumni Network', '8,400+', 'Registered alumni', 'up')

    + widgetKpi('Industry MoUs', '23', 'Active partnerships', 'up')

    + '</div>'

    + '<div class="grid grid-2">'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:16px">Enrollment Trend</h3>'

    + '<div class="bar-chart-wrap">'

    + widgetBar('2022-23', 68, '')

    + widgetBar('2023-24', 74, '')

    + widgetBar('2024-25', 81, 'bar-fill-green')

    + widgetBar('2025-26', 88, 'bar-fill-green')

    + '</div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:16px">Placement by Package</h3>'

    + '<div class="bar-chart-wrap">'

    + widgetBar('3–5 LPA', 35, '')

    + widgetBar('5–8 LPA', 45, 'bar-fill-green')

    + widgetBar('8–12 LPA', 15, 'bar-fill-green')

    + widgetBar('12+ LPA', 5, 'bar-fill-green')

    + '</div></div></div>';

}



/* 

   HOD ROLE SECTIONS

    */



function buildPrincipalAccounts() {

  var db = dbGet();

  var sess = getSession();

  var institute = getCurrentInstitute();

  var selfEmail = sess ? sess.email : '';

  var users = db.users.filter(function(u) { return getUserInstitute(u) === institute; });

  if (selfEmail) users = users.filter(function(u) { return u.email !== selfEmail; });



  function roleSelectHtml(u) {

    var current = u.requestedRole || u.role || 'Faculty';

    return '<select class="form-select" id="acct-role-'+u.id+'">'

      + ROLE_OPTIONS.map(function(r) {

        return '<option'+(r===current?' selected':'')+'>'+r+'</option>';

      }).join('')

      + '</select>';

  }



  var nonFaculty = users.filter(function(u) {
    var r = u.requestedRole || u.role;
    return r !== 'Faculty';
  });

  var pending = nonFaculty.filter(function(u) { return u.status === 'Pending'; });

  var active = nonFaculty.filter(function(u) { return u.status === 'Active'; });



  var pendingRows = pending.map(function(u) {

    var act = '<button class="btn btn-sm btn-success" onclick="principalApproveAccount('+u.id+',true)">Approve</button> '

      + '<button class="btn btn-sm btn-danger" onclick="principalApproveAccount('+u.id+',false)">Reject</button>';

    return [u.name, u.email, u.dept, roleSelectHtml(u), u.requestedOn || '—', act];

  });



  var activeRows = active.map(function(u) {

    var act = '<button class="btn btn-sm" onclick="principalUpdateRole('+u.id+')">Update Role</button> '
      + '<button class="btn btn-sm btn-danger" onclick="principalRemoveAccount('+u.id+')">Remove</button>';

    return [u.name, u.email, u.dept, roleSelectHtml(u), sbadge(u.status), act];

  });



  return '<div class="module-header"><div class="module-title">Account Approvals</div>'

    + '<div class="module-sub">Manage access requests and roles for ' + institute + '.</div></div>'

    + '<div class="panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'

    + '<h3 style="font-family:var(--font-head)">Pending Requests</h3>'

    + '<span class="badge badge-yellow">' + pending.length + ' pending</span></div>'

    + widgetTable(['Name','Email','Dept','Role','Requested On','Decision'], pendingRows, 'No pending requests')

    + '</div>'

    + '<div class="panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'

    + '<h3 style="font-family:var(--font-head)">Active Accounts</h3>'

    + '<span class="badge badge-green">' + active.length + ' active</span></div>'

    + widgetTable(['Name','Email','Dept','Role','Status','Manage'], activeRows, 'No active accounts')

    + '</div>';

}



function principalApproveAccount(id, approve) {

  var db = dbGet();

  var u = db.users.find(function(x) { return x.id === id; });

  if (!u) return;
  var reqRole = u.requestedRole || u.role;
  if (reqRole === 'Faculty') {
    showToast('Faculty approvals are handled by HOD', 'warning');
    return;
  }

  if (approve) {

    var roleSel = document.getElementById('acct-role-' + id);

    var newRole = roleSel ? roleSel.value : u.role;

    u.role = newRole || u.role;
    u.requestedRole = null;

    u.status = 'Active';

    u.lastLogin = u.lastLogin || '—';

    showToast('Account approved: ' + u.name);

  } else {

    u.status = 'Rejected';

    showToast('Account rejected: ' + u.name, 'warning');

  }

  dbSave(db);

  renderRoleSection('role-accounts');

}



function principalUpdateRole(id) {

  var db = dbGet();

  var u = db.users.find(function(x) { return x.id === id; });

  if (!u) return;

  var roleSel = document.getElementById('acct-role-' + id);

  if (roleSel) u.role = roleSel.value;

  dbSave(db);

  showToast('Role updated for ' + u.name);

  renderRoleSection('role-accounts');

}




function buildHODAccounts() {
  var db = dbGet();
  var sess = getSession();
  var myDept = (sess && sess.dept) ? sess.dept : '';
  var deptLabel = myDept || 'All Departments';
  var institute = getCurrentInstitute();

  var pending = db.users.filter(function(u) {
    var r = u.requestedRole || u.role;
    return u.status === 'Pending' && r === 'Faculty'
      && (!myDept || u.dept === myDept)
      && getUserInstitute(u) === institute;
  });

  var facultyUsers = db.users.filter(function(u) {
    return u.role === 'Faculty' && u.status === 'Active'
      && (!myDept || u.dept === myDept)
      && getUserInstitute(u) === institute;
  });

  var pendingRows = pending.map(function(u) {
    var act = '<button class="btn btn-sm btn-success" onclick="hodApproveFaculty('+u.id+',true)">Approve</button> '
      + '<button class="btn btn-sm btn-danger" onclick="hodApproveFaculty('+u.id+',false)">Reject</button>';
    return [u.name, u.email, u.dept, u.requestedOn || '—', act];
  });

  return '<div class="module-header"><div class="module-title">Faculty Accounts - ' + deptLabel + '</div>'
    + '<div class="module-sub">Approve faculty requests and manage accounts under your department.</div></div>'
    + '<div class="panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    + '<h3 style="font-family:var(--font-head)">Pending Faculty Requests</h3>'
    + '<span class="badge badge-yellow">' + pending.length + ' pending</span></div>'
    + widgetTable(['Name','Email','Dept','Requested On','Decision'], pendingRows, 'No pending faculty requests')
    + '</div>'
    + '<div class="panel"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px">'
    + '<h3 style="font-family:var(--font-head)">Faculty Directory</h3>'
    + '<span class="badge badge-blue">' + facultyUsers.length + ' accounts</span></div>'
    + widgetTable(['Name','Email','Role','Status','Last Login','Manage'],
        facultyUsers.map(function(u){
          var act = '<button class="btn btn-sm btn-danger" onclick="hodRemoveFaculty('+u.id+')">Remove</button>';
          return [u.name, u.email, u.role, sbadge(u.status || 'Active'), u.lastLogin || '-', act];
        }),
        'No faculty accounts found for this department.'
      )
    + '</div>';
}


function hodApproveFaculty(id, approve) {
  var db = dbGet();
  var sess = getSession();
  var institute = getCurrentInstitute();
  var myDept = sess ? sess.dept : '';
  var u = db.users.find(function(x) { return x.id === id; });
  if (!u) return;
  if (u.dept !== myDept || getUserInstitute(u) !== institute) {
    showToast('Not allowed to approve this request', 'warning');
    return;
  }

  if (approve) {
    u.role = 'Faculty';
    u.requestedRole = null;
    u.status = 'Active';
    u.lastLogin = u.lastLogin || '—';
    showToast('Faculty approved: ' + u.name);
  } else {
    u.status = 'Rejected';
    showToast('Faculty rejected: ' + u.name, 'warning');
  }
  dbSave(db);
  renderRoleSection('role-hod-accounts');
}


function principalRemoveAccount(id) {
  var db = dbGet();
  var sess = getSession();
  var u = db.users.find(function(x) { return x.id === id; });
  if (!u) return;
  if (sess && u.email === sess.email) {
    showToast('You cannot remove your own account', 'warning');
    return;
  }
  if (!confirm('Remove account for ' + u.name + '?')) return;
  db.users = db.users.filter(function(x) { return x.id !== id; });
  dbSave(db);
  showToast('Account removed: ' + u.name);
  renderRoleSection('role-accounts');
}


function hodRemoveFaculty(id) {
  var db = dbGet();
  var sess = getSession();
  var institute = getCurrentInstitute();
  var myDept = (sess && sess.dept) ? sess.dept : '';
  var u = db.users.find(function(x) { return x.id === id; });
  if (!u) return;
  if (u.role !== 'Faculty') {
    showToast('Only faculty accounts can be removed here', 'warning');
    return;
  }
  if ((myDept && u.dept !== myDept) || getUserInstitute(u) !== institute) {
    showToast('Not allowed to remove this account', 'warning');
    return;
  }
  if (!confirm('Remove faculty account for ' + u.name + '?')) return;
  db.users = db.users.filter(function(x) { return x.id !== id; });
  dbSave(db);
  showToast('Faculty removed: ' + u.name);
  renderRoleSection('role-hod-accounts');
}

function buildHODOverride() {

  var db = dbGet();

  var sess = getSession();

  var myDept = sess ? sess.dept : 'CSE';

  var deptStudents = db.students.filter(function(s){return s.dept===myDept;});

  var deptFaculty  = db.faculty.filter(function(f){return f.dept===myDept;});

  var deptCourses  = db.courses.filter(function(c){return c.dept===myDept;});

  var pendingLeave = db.leaveRequests.filter(function(l){return l.dept===myDept&&l.status==='Pending';});



  return '<div class="module-header"><div class="module-title">HOD Dashboard — ' + myDept + '</div>'

    + '<div class="module-sub">Department overview: ' + myDept + ' — Students, Faculty, Courses, Attendance</div></div>'

    + '<div class="kpi-grid">'

    + widgetKpi('Dept. Students', deptStudents.length, myDept+' dept', 'up')

    + widgetKpi('Faculty', deptFaculty.length, pendingLeave.length+' leave pending', pendingLeave.length>0?'down':'neutral')

    + widgetKpi('Active Courses', deptCourses.length, 'This semester', 'up')

    + widgetKpi('Avg. Attendance', '89%', myDept+' dept', 'up')

    + '</div>'

    + '<div class="grid grid-2">'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Course-wise Attendance</h3>'

    + '<div class="bar-chart-wrap">'

    + deptCourses.map(function(c){

        var pct = 75+Math.floor(Math.random()*20);

        return widgetBar(c.code, pct, pct>=85?'bar-fill-green':'');

      }).join('')

    + '</div></div>'

    + '<div class="panel">'

    + '<h3 style="font-family:var(--font-head);margin-bottom:14px">Leave Requests</h3>'

    + widgetTable(['Faculty','Dates','Days','Reason','Action'],

        pendingLeave.concat(db.leaveRequests.filter(function(l){return l.dept===myDept&&l.status!=='Pending';})).slice(0,4)

        .map(function(l){

          var act = l.status==='Pending'

            ? '<button class="btn btn-sm btn-success" onclick="hodApproveLeave('+l.id+',true)">✓</button> '

            + '<button class="btn btn-sm btn-danger" onclick="hodApproveLeave('+l.id+',false)">✕</button>'

            : sbadge(l.status);

          return [l.faculty.split(' ').pop(), l.from+' – '+l.to, l.days, l.reason, act];

        }))

    + '</div></div>';

}



function buildHODDept() {

  var db = dbGet();

  var sess = getSession();

  var myDept = sess ? sess.dept : 'CSE';

  var deptInfo = db.departments.find(function(d){return d.name===myDept;}) || {};

  return '<div class="module-header"><div class="module-title">Department Management — ' + myDept + '</div>'

    + '<div class="module-sub">Manage faculty assignments, courses, and department configuration.</div></div>'

    + '<div class="grid grid-2">'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Assign Course to Faculty</h3>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="hod-course">'

    + db.courses.filter(function(c){return c.dept===myDept;}).map(function(c){return '<option>'+c.code+' – '+c.name+'</option>';}).join('')

    + '</select></div>'

    + '<div class="form-group"><label class="form-label">Faculty</label><select class="form-select" id="hod-faculty">'

    + db.faculty.filter(function(f){return f.dept===myDept;}).map(function(f){return '<option>'+f.name+'</option>';}).join('')

    + '</select></div></div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="hodAssignCourse()">Assign Course</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Submit HOD Proposal</h3>'

    + '<div class="form-grid">'

    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Proposal Title</label><input class="form-input" id="hod-prop-title" placeholder="New course / Lab upgrade / Event…"/></div>'

    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Description</label><textarea class="form-textarea" id="hod-prop-desc" rows="2" placeholder="Details for Head review…"></textarea></div>'

    + '</div><div class="form-actions"><button class="btn btn-primary" onclick="hodSubmitProposal()">Submit to Head</button></div></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Faculty List — ' + myDept + '</h3>'

    + widgetTable(['Name','Designation','Load','Courses','Leave Balance','Status'],

        db.faculty.filter(function(f){return f.dept===myDept;}).map(function(f){

          return [f.name, f.desig, f.load+' hrs', f.courses.join(', ')||'—', f.leaveBalance+' days', sbadge(f.status)];

        }))

    + '</div>';

}



function buildHODTimetable() {

  var db = dbGet();

  var sess = getSession();

  var myDept = sess ? sess.dept : 'CSE';

  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];

  var slots = db.timetable;



  var table = '<div class="table-wrap"><table class="table">'

    + '<thead><tr><th>Time</th>' + days.map(function(d){return '<th>'+d+'</th>';}).join('') + '</tr></thead><tbody>';



  var times = Array.from(new Set(slots.map(function(s){return s.time;}))).sort();

  times.forEach(function(t) {

    table += '<tr><td><strong>'+t+'</strong></td>';

    days.forEach(function(d) {

      var slot = slots.find(function(s){return s.day===d && s.time===t;});

      if (slot) {

        table += '<td style="background:rgba(109,139,255,0.08);border-radius:6px">'

          + '<div style="font-weight:600;font-size:12px">'+slot.course+'</div>'

          + '<div style="color:var(--text2);font-size:11px">'+slot.room+'</div>'

          + '<div style="color:var(--text3);font-size:10px">'+slot.faculty.split(' ').pop()+'</div>'

          + '</td>';

      } else {

        table += '<td style="color:var(--text3);font-size:11px">—</td>';

      }

    });

    table += '</tr>';

  });

  table += '</tbody></table></div>';



  return '<div class="module-header"><div class="module-title">Department Timetable — ' + myDept + '</div>'

    + '<div class="module-sub">Weekly schedule for all courses and faculty in ' + myDept + ' department.</div></div>'

    + '<div class="panel">' + table + '</div>';

}



function buildHODLeave() {

  var db = dbGet();

  var sess = getSession();

  var myDept = sess ? sess.dept : 'CSE';

  var leaves = db.leaveRequests.filter(function(l){return l.dept===myDept;});



  return '<div class="module-header"><div class="module-title">Faculty Leave Requests</div>'

    + '<div class="module-sub">Approve or reject faculty leave applications for your department.</div></div>'

    + '<div class="panel">'

    + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'

    + '<h3 style="font-family:var(--font-head)">Leave Applications</h3>'

    + '<span class="badge badge-red">'+leaves.filter(function(l){return l.status==='Pending';}).length+' pending</span></div>'

    + widgetTable(['Faculty','Applied On','Period','Days','Reason','Status','Action'],

        leaves.map(function(l){

          var act = l.status==='Pending'

            ? '<button class="btn btn-sm btn-success" onclick="hodApproveLeave('+l.id+',true)">Approve</button> '

            + '<button class="btn btn-sm btn-danger" onclick="hodApproveLeave('+l.id+',false)">Reject</button>'

            : sbadge(l.status);

          return [l.faculty, l.appliedOn, l.from+' – '+l.to, l.days+'d', l.reason, sbadge(l.status), act];

        }))

    + '</div>';

}



function buildHODMarks() {

  var db = dbGet();

  var sess = getSession();

  var myDept = sess ? sess.dept : 'CSE';

  return '<div class="module-header"><div class="module-title">Internal Marks Review</div>'

    + '<div class="module-sub">Review and approve internal mark submissions from faculty in your department.</div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Submitted Marks</h3>'

    + widgetTable(['Course','Exam','Student','Roll No','Marks/Max','Grade','Status'],

        db.marks.map(function(m){

          var pct = Math.round(m.marks/m.maxMarks*100);

          var gc = pct>=90?'green':pct>=75?'blue':pct>=60?'yellow':'red';

          return [m.course, m.exam, m.student, m.roll, m.marks+'/'+m.maxMarks,

            '<span class="badge badge-'+gc+'">'+m.grade+'</span>',

            '<span class="badge badge-yellow">Pending HOD</span>'];

        }))

    + '<div class="form-actions" style="margin-top:14px">'

    + '<button class="btn btn-success" onclick="hodApproveAllMarks()">✓ Approve All Submissions</button>'

    + '</div></div>';

}



/* 

   FACULTY ROLE SECTIONS

    */



function buildFacultyOverride() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myCourses = db.courses.filter(function(c){return c.faculty===myName;});

  var myAssign  = db.assignments.filter(function(a){

    return myCourses.some(function(c){return c.code===a.course;});

  });

  var pending = myAssign.filter(function(a){return a.status==='Active';}).length;



  return '<div class="module-header"><div class="module-title">Faculty Dashboard</div>'

    + '<div class="module-sub">Welcome, ' + myName + ' — Your courses, students, and tasks</div></div>'

    + '<div class="kpi-grid">'

    + widgetKpi('My Courses', myCourses.length, 'Active this sem', 'up')

    + widgetKpi('Total Students', myCourses.reduce(function(s,c){return s+c.enrolled;},0), 'Enrolled across courses', 'up')

    + widgetKpi('Assignments', pending, 'Active/open', pending>0?'down':'neutral')

    + widgetKpi('Avg. Attendance', '89%', 'Your classes', 'up')

    + '</div>'

    + '<div class="grid grid-2">'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Courses</h3>'

    + widgetTable(['Code','Course','Enrolled','Syllabus %','Status'],

        myCourses.map(function(c){

          var sc = c.syllabus>=80?'green':c.syllabus>=60?'yellow':'red';

          return [c.code, c.name, c.enrolled, '<div class="progress-bar"><div class="progress-fill" style="width:'+c.syllabus+'%"></div></div> '+c.syllabus+'%', '<span class="badge badge-'+sc+'">'+c.syllabus+'% done</span>'];

        }))

    + '</div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Today\'s Announcements</h3>'

    + widgetTable(['Title','Author','Priority'],

        db.announcements.slice(0,3).map(function(a){

          var pc = a.priority==='High'?'red':a.priority==='Medium'?'yellow':'gray';

          return [a.title.substring(0,28)+'…', a.author, '<span class="badge badge-'+pc+'">'+a.priority+'</span>'];

        }))

    + '</div></div>';

}



function buildFacultyMyCourses() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myCourses = db.courses.filter(function(c){return c.faculty===myName;});



  return '<div class="module-header"><div class="module-title">My Courses</div>'

    + '<div class="module-sub">All courses assigned to you this semester with syllabus progress.</div></div>'

    + myCourses.map(function(c){

        return '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:start">'

          + '<div><h3 style="font-family:var(--font-head)">' + c.code + ' — ' + c.name + '</h3>'

          + '<p style="color:var(--text2);font-size:13px">Credits: '+c.credits+' | Sem '+c.sem+' | '+c.enrolled+' students | '+c.dept+'</p></div>'

          + '<span class="badge badge-blue">'+c.code+'</span></div>'

          + '<div style="margin:12px 0"><div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">'

          + '<span>Syllabus Progress</span><strong>'+c.syllabus+'%</strong></div>'

          + '<div class="progress-bar"><div class="progress-fill '+(c.syllabus>=80?'progress-fill-green':'progress-fill-yellow')+'" style="width:'+c.syllabus+'%"></div></div></div>'

          + '<div class="form-actions"><button class="btn btn-sm" onclick="facultyUpdateSyllabus(\''+c.code+'\')">Update Progress</button>'

          + '<button class="btn btn-sm" onclick="showToast(\'Syllabus PDF opened for '+c.code+'\')">View Syllabus</button></div></div>';

      }).join('')

    + (myCourses.length===0?'<div class="panel"><p style="color:var(--text3);text-align:center;padding:30px">No courses assigned yet.</p></div>':'');

}



function buildFacultyAttendance() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myCourses = db.courses.filter(function(c){return c.faculty===myName;});

  var recentAtt = db.attendance.filter(function(a){

    return myCourses.some(function(c){return c.code===a.course;});

  });



  return '<div class="module-header"><div class="module-title">Take Attendance</div>'

    + '<div class="module-sub">Record geofence-verified attendance for your classes.</div></div>'

    + '<div class="panel">'

    + '<div class="geo-demo" style="margin-bottom:18px;height:150px">'

    + '<div class="geo-ring"></div><div class="geo-ring"></div><div class="geo-ring"></div>'

    + '<div class="geo-dot"></div><span class="geo-label">Campus geofence — verified location</span></div>'

    + '<div class="form-section-title">Record Today\'s Attendance</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fac-att-course">'

    + myCourses.map(function(c){return '<option value="'+c.code+'">'+c.code+' – '+c.name+'</option>';}).join('')

    + '</select></div>'

    + '<div class="form-group"><label class="form-label">Class / Batch</label><select class="form-select" id="fac-att-class"><option>CSE-A</option><option>CSE-B</option><option>CSE-C</option></select></div>'

    + '<div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="fac-att-date" value="'+new Date().toISOString().split('T')[0]+'"/></div>'

    + '<div class="form-group"><label class="form-label">Present / Total</label>'

    + '<div style="display:flex;gap:8px"><input class="form-input" type="number" id="fac-att-present" placeholder="Present" style="width:50%"/>'

    + '<input class="form-input" type="number" id="fac-att-total" placeholder="Total" style="width:50%"/></div></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyMarkAttendance()">✓ Submit Attendance</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Recent Attendance Records</h3>'

    + widgetTable(['Course','Class','Date','Present','Total','%'],

        recentAtt.map(function(a){

          var pc = a.pct>=85?'green':a.pct>=75?'yellow':'red';

          return [a.course, a.cls, a.date, a.present, a.total, '<span class="badge badge-'+pc+'">'+a.pct+'%</span>'];

        }))

    + '</div>';

}



function buildFacultyMarks() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myCourses = db.courses.filter(function(c){return c.faculty===myName;});

  var myMarks = db.marks.filter(function(m){

    return myCourses.some(function(c){return c.code===m.course;});

  });



  return '<div class="module-header"><div class="module-title">Enter Student Marks</div>'

    + '<div class="module-sub">Upload internal assessment marks for your courses. Submitted for HOD approval.</div></div>'

    + '<div class="panel"><div class="form-section-title">Add Mark Entry</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fm-course">'

    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'

    + '<div class="form-group"><label class="form-label">Exam Type</label><select class="form-select" id="fm-exam"><option>Mid Semester</option><option>Unit Test 1</option><option>Unit Test 2</option><option>Assignment</option></select></div>'

    + '<div class="form-group"><label class="form-label">Student Roll No</label><input class="form-input" id="fm-roll" placeholder="CSE-101"/></div>'

    + '<div class="form-group"><label class="form-label">Student Name</label><input class="form-input" id="fm-student" placeholder="Priya Sharma"/></div>'

    + '<div class="form-group"><label class="form-label">Marks Obtained</label><input class="form-input" type="number" id="fm-marks" placeholder="42"/></div>'

    + '<div class="form-group"><label class="form-label">Maximum Marks</label><input class="form-input" type="number" id="fm-max" value="50"/></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyAddMark()">+ Add Mark</button>'

    + '<button class="btn btn-success" onclick="facultySubmitMarks()">📤 Submit to HOD</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Marks Entered</h3>'

    + widgetTable(['Course','Exam','Student','Roll','Marks/Max','Grade'],

        myMarks.map(function(m){

          var pct = Math.round(m.marks/m.maxMarks*100);

          var gc = pct>=90?'green':pct>=75?'blue':pct>=60?'yellow':'red';

          return [m.course, m.exam, m.student, m.roll, m.marks+'/'+m.maxMarks, '<span class="badge badge-'+gc+'">'+m.grade+'</span>'];

        }))

    + '</div>';

}



/* 
   MARKS VIEWER (FACULTY + HOD)
   Step-by-step pages with route-style navigation.
*/

var MARKS_VIEWER_DEPARTMENTS = [
  { id:'computer-engineering', label:'Computer Engineering' },
  { id:'information-technology', label:'Information Technology' },
  { id:'ai-data-science', label:'Artificial Intelligence & Data Science' }
];

var MARKS_VIEWER_YEARS = [
  { id:'first-year', label:'First Year' },
  { id:'second-year', label:'Second Year' },
  { id:'third-year', label:'Third Year' },
  { id:'final-year', label:'Final Year' }
];

var MARKS_VIEWER_SEMESTERS = [
  { id:'semester-1', label:'Semester 1' },
  { id:'semester-2', label:'Semester 2' }
];

var MARKS_VIEWER_SUBJECTS = [
  { id:'data-structures', label:'Data Structures', crumb:'Data Structures' },
  { id:'dbms', label:'Database Management Systems', crumb:'DBMS' },
  { id:'machine-learning', label:'Machine Learning', crumb:'Machine Learning' }
];

var MARKS_VIEWER_MARKS = {
  'dbms': [
    { roll:1, name:'Rahul Sharma', internal:18, external:65 },
    { roll:2, name:'Sneha Patil', internal:17, external:70 },
    { roll:3, name:'Amit Kumar', internal:15, external:60 }
  ],
  'data-structures': [
    { roll:1, name:'Neha Verma', internal:19, external:66 },
    { roll:2, name:'Arjun Singh', internal:16, external:62 },
    { roll:3, name:'Priya Shah', internal:18, external:68 }
  ],
  'machine-learning': [
    { roll:1, name:'Karan Mehta', internal:20, external:72 },
    { roll:2, name:'Ishita Rao', internal:17, external:69 },
    { roll:3, name:'Vikram Joshi', internal:16, external:64 }
  ]
};

function marksViewerFind(list, id) {
  if (!id) return null;
  var key = String(id).toLowerCase();
  return list.find(function(item){ return String(item.id).toLowerCase() === key; }) || null;
}

function marksViewerGetRoutePath() {
  var base = '/marks-viewer';
  var path = (window.location && window.location.pathname) ? window.location.pathname : '';
  if (path.indexOf(base) !== -1) {
    return path.slice(path.indexOf(base));
  }
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  if (hash.indexOf(base) !== -1) {
    return hash.slice(hash.indexOf(base));
  }
  return base;
}

function marksViewerNormalizePath(path) {
  return String(path || '').split('?')[0].split('#')[0].replace(/\/+$/,'') || '/marks-viewer';
}

function marksViewerGetState() {
  var base = '/marks-viewer';
  var clean = marksViewerNormalizePath(marksViewerGetRoutePath());
  if (clean.indexOf(base) !== 0) clean = base;
  var parts = clean.split('/').filter(Boolean);
  var dept = marksViewerFind(MARKS_VIEWER_DEPARTMENTS, parts[1]);
  var year = dept ? marksViewerFind(MARKS_VIEWER_YEARS, parts[2]) : null;
  var semester = year ? marksViewerFind(MARKS_VIEWER_SEMESTERS, parts[3]) : null;
  var subject = semester ? marksViewerFind(MARKS_VIEWER_SUBJECTS, parts[4]) : null;
  return { dept: dept, year: year, semester: semester, subject: subject };
}

function marksViewerEnsureRoute() {
  var base = '/marks-viewer';
  var path = (window.location && window.location.pathname) ? window.location.pathname : '';
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  if (path.indexOf(base) !== -1 || hash.indexOf(base) !== -1) return;
  try {
    history.replaceState({ marksViewer:true }, '', base);
  } catch(e) {
    window.location.hash = '#' + base;
  }
}

function marksViewerNavigate(path, replace) {
  var target = marksViewerNormalizePath(path);
  try {
    if (replace) history.replaceState({ marksViewer:true }, '', target);
    else history.pushState({ marksViewer:true }, '', target);
  } catch(e) {
    window.location.hash = '#' + target;
  }
  if (typeof renderRoleSection === 'function') renderRoleSection('role-marks-viewer');
}

function marksViewerBreadcrumb(state) {
  var base = '/marks-viewer';
  var crumbs = [
    { label:'Marks Viewer', path: base }
  ];
  if (state.dept) crumbs.push({ label: state.dept.label, path: base + '/' + state.dept.id });
  if (state.year) crumbs.push({ label: state.year.label, path: base + '/' + state.dept.id + '/' + state.year.id });
  if (state.semester) crumbs.push({ label: state.semester.label, path: base + '/' + state.dept.id + '/' + state.year.id + '/' + state.semester.id });
  if (state.subject) crumbs.push({ label: state.subject.crumb || state.subject.label, path: base + '/' + state.dept.id + '/' + state.year.id + '/' + state.semester.id + '/' + state.subject.id });

  var trail = crumbs.map(function(c, idx) {
    var sep = idx ? '<span style="color:var(--text3);padding:0 4px">></span>' : '';
    return sep + '<button class="btn btn-sm btn-secondary" onclick="marksViewerNavigate(\'' + c.path + '\')">' + c.label + '</button>';
  }).join('');

  return '<div class="panel" style="padding:14px 18px;margin-bottom:18px;display:flex;flex-wrap:wrap;align-items:center;gap:4px">' + trail + '</div>';
}

function marksViewerSelectionPanel(title, items, buildPath) {
  return '<div class="panel">'
    + '<div class="form-section-title">' + title + '</div>'
    + '<div class="grid grid-3">'
    + items.map(function(item){
        var path = buildPath(item);
        var sub = item.sub ? '<div style="color:var(--text3);font-size:12px;margin-top:4px">' + item.sub + '</div>' : '';
        return '<div class="integration-card" style="cursor:pointer" onclick="marksViewerNavigate(\'' + path + '\')">'
          + '<div><div style="font-weight:600">' + item.label + '</div>' + sub + '</div>'
          + '<span class="badge badge-blue">Select</span>'
          + '</div>';
      }).join('')
    + '</div></div>';
}

function marksViewerMarksTable(subjectId) {
  var rows = (MARKS_VIEWER_MARKS[subjectId] || []).slice().sort(function(a,b){ return a.roll - b.roll; });
  return '<div class="panel"><div class="form-section-title">Student Marks</div>'
    + widgetTable(['Roll Number','Student Name','Internal Marks','External Marks','Total Marks'],
      rows.map(function(r){
        var total = (Number(r.internal) || 0) + (Number(r.external) || 0);
        return [r.roll, r.name, r.internal, r.external, total];
      }),
      'No marks found for this subject.'
    )
    + '</div>';
}

function buildMarksViewer() {
  marksViewerEnsureRoute();
  var state = marksViewerGetState();
  var base = '/marks-viewer';
  var body = '';

  if (!state.dept) {
    body = marksViewerSelectionPanel('Select Department', MARKS_VIEWER_DEPARTMENTS, function(item){
      return base + '/' + item.id;
    });
  } else if (!state.year) {
    body = marksViewerSelectionPanel('Select Academic Year', MARKS_VIEWER_YEARS, function(item){
      return base + '/' + state.dept.id + '/' + item.id;
    });
  } else if (!state.semester) {
    body = marksViewerSelectionPanel('Select Semester', MARKS_VIEWER_SEMESTERS, function(item){
      return base + '/' + state.dept.id + '/' + state.year.id + '/' + item.id;
    });
  } else if (!state.subject) {
    body = marksViewerSelectionPanel('Select Subject', MARKS_VIEWER_SUBJECTS, function(item){
      return base + '/' + state.dept.id + '/' + state.year.id + '/' + state.semester.id + '/' + item.id;
    });
  } else {
    body = marksViewerMarksTable(state.subject.id);
  }

  return '<div class="module-header"><div class="module-title">Marks Viewer</div>'
    + '<div class="module-sub">Browse student marks by department, year, semester, and subject.</div></div>'
    + marksViewerBreadcrumb(state)
    + body;
}

if (typeof window !== 'undefined') {
  window.marksViewerNavigate = marksViewerNavigate;
  if (!window.__marksViewerPopstateBound) {
    window.addEventListener('popstate', function() {
      var active = document.querySelector('.module-section.active');
      if (active && active.id === 'role-marks-viewer' && typeof renderRoleSection === 'function') {
        renderRoleSection('role-marks-viewer');
      }
    });
    window.__marksViewerPopstateBound = true;
  }
}

/*
   VIDEO MEETINGS (FRONTEND-ONLY)
   Meetings dashboard + meeting room with mock video tiles.
*/

var MEETING_UI_STATE = { mic:true, cam:true, screen:false };
var MEETING_MEDIA = { stream:null, error:null, screenStream:null };
var MEETING_RTC = {
  socket: null,
  peers: {},
  userId: null,
  meetingId: null,
  pinnedId: null,
  pinAuto: false,
  localStream: null
};

function meetingsGetRoutePath() {
  var base = '/meetings';
  var path = (window.location && window.location.pathname) ? window.location.pathname : '';
  if (path.indexOf(base) !== -1) {
    return path.slice(path.indexOf(base));
  }
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  if (hash.indexOf(base) !== -1) {
    return hash.slice(hash.indexOf(base));
  }
  return base;
}

function meetingsNormalizePath(path) {
  return String(path || '').split('?')[0].split('#')[0].replace(/\/+$/,'') || '/meetings';
}

function meetingsGetState() {
  var base = '/meetings';
  var clean = meetingsNormalizePath(meetingsGetRoutePath());
  if (clean.indexOf(base) !== 0) clean = base;
  var parts = clean.split('/').filter(Boolean);
  var meetingId = parts[1] ? parts[1] : null;
  return { meetingId: meetingId };
}

function meetingsEnsureRoute() {
  var base = '/meetings';
  var path = (window.location && window.location.pathname) ? window.location.pathname : '';
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  if (path.indexOf(base) !== -1 || hash.indexOf(base) !== -1) return;
  try {
    history.replaceState({ meetings:true }, '', base);
  } catch(e) {
    window.location.hash = '#' + base;
  }
}

function meetingsNavigate(path, replace) {
  var target = meetingsNormalizePath(path);
  try {
    if (replace) history.replaceState({ meetings:true }, '', target);
    else history.pushState({ meetings:true }, '', target);
  } catch(e) {
    window.location.hash = '#' + target;
  }
  if (typeof renderRoleSection === 'function') renderRoleSection('role-meetings');
}

function generateMeetingId() {
  var len = 8 + Math.floor(Math.random() * 3);
  var chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var id = '';
  for (var i = 0; i < len; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function sanitizeMeetingId(raw) {
  return String(raw || '').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12);
}

function meetingStart() {
  MEETING_UI_STATE = { mic:true, cam:true, screen:false };
  fetch('/api/meetings/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  }).then(function(res){
    if (!res.ok) throw new Error('create failed');
    return res.json();
  }).then(function(data){
    var id = data && data.meetingId ? data.meetingId : generateMeetingId();
    openMeetingWindow(id);
    showToast('Meeting started in a new window. You are the host.');
  }).catch(function(){
    var id = generateMeetingId();
    openMeetingWindow(id);
    showToast('Meeting started (offline mode).', 'warning');
  });
}

function meetingJoin() {
  var id = sanitizeMeetingId(gv('meeting-join-id'));
  if (!id) { showToast('Enter a valid meeting ID', 'error'); return; }
  MEETING_UI_STATE = { mic:true, cam:true, screen:false };
  fetch('/api/meetings/' + id).then(function(res){
    if (!res.ok) throw new Error('not found');
    return res.json();
  }).then(function(){
    openMeetingWindow(id);
  }).catch(function(){
    showToast('Meeting not found', 'error');
  });
}

function meetingToggle(type) {
  if (!MEETING_UI_STATE) MEETING_UI_STATE = { mic:true, cam:true, screen:false };
  MEETING_UI_STATE[type] = !MEETING_UI_STATE[type];
  var btn = g('meeting-' + type + '-btn');
  if (!btn) return;
  btn.classList.toggle('is-off', !MEETING_UI_STATE[type]);
  if (type === 'mic') {
    document.body.classList.toggle('meeting-mic-off', !MEETING_UI_STATE.mic);
  }
  if (type === 'cam') {
    document.body.classList.toggle('meeting-cam-off', !MEETING_UI_STATE.cam);
  }
  var icon = btn.querySelector('.meet-control-icon');
  if (type === 'mic') {
    if (icon) icon.innerHTML = MEETING_UI_STATE.mic ? meetIconMicOn() : meetIconMicOff();
    if (MEETING_MEDIA.stream) {
      MEETING_MEDIA.stream.getAudioTracks().forEach(function(t){ t.enabled = MEETING_UI_STATE.mic; });
    }
  }
  if (type === 'cam') {
    if (icon) icon.innerHTML = MEETING_UI_STATE.cam ? meetIconCamOn() : meetIconCamOff();
    if (MEETING_MEDIA.stream) {
      MEETING_MEDIA.stream.getVideoTracks().forEach(function(t){ t.enabled = MEETING_UI_STATE.cam; });
    }
  }
  if (type === 'screen') {
    if (icon) icon.innerHTML = meetIconScreenShare();
    if (MEETING_UI_STATE.screen) {
      startScreenShare().catch(function(){
        MEETING_UI_STATE.screen = false;
        btn.classList.add('is-off');
        showToast('Screen share cancelled', 'warning');
      });
    } else {
      stopScreenShare();
    }
  }
}

function meetingLeave() {
  cleanupMeeting();
  if (isMeetingOnlyWindow()) {
    try { window.close(); return; } catch(e) { /* ignore */ }
  }
  meetingsNavigate('/meetings');
}

function cleanupMeeting() {
  if (MEETING_RTC.socket) {
    try { MEETING_RTC.socket.emit('leave-room'); } catch(e) {}
    try { MEETING_RTC.socket.disconnect(); } catch(e) {}
  }
  Object.keys(MEETING_RTC.peers).forEach(function(id){
    var pc = MEETING_RTC.peers[id];
    if (pc) { try { pc.close(); } catch(e) {} }
  });
  MEETING_RTC.peers = {};
  MEETING_RTC.socket = null;
  MEETING_RTC.meetingId = null;
  MEETING_RTC.pinnedId = null;
  MEETING_RTC.pinAuto = false;
  if (MEETING_MEDIA.screenStream) {
    MEETING_MEDIA.screenStream.getTracks().forEach(function(t){ t.stop(); });
    MEETING_MEDIA.screenStream = null;
  }
  if (MEETING_MEDIA.stream) {
    MEETING_MEDIA.stream.getTracks().forEach(function(t){ t.stop(); });
    MEETING_MEDIA.stream = null;
  }
  MEETING_RTC.localStream = null;
}

function openMeetingWindow(meetingId) {
  var base = String(window.location.href || '').split('#')[0].split('?')[0];
  var url = base + '#/meetings/' + meetingId + '?meetingOnly=1';
  window.open(url, '_blank', 'noopener');
}

function isMeetingOnlyWindow() {
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  var search = (window.location && window.location.search) ? window.location.search : '';
  return hash.indexOf('meetingOnly=1') !== -1 || search.indexOf('meetingOnly=1') !== -1;
}

function setMeetingOnlyMode(on) {
  if (!document || !document.body) return;
  document.body.classList.toggle('meeting-only', !!on);
}

function getMeetingUserId() {
  var key = 'edusys_meet_user';
  var existing = storeGet ? storeGet(key) : null;
  if (existing) return existing;
  var id = 'u' + Math.random().toString(36).slice(2, 10);
  if (storeSet) storeSet(key, id);
  return id;
}

function initMeetingRoom(meetingId) {
  if (MEETING_RTC.meetingId === meetingId && MEETING_RTC.socket) return;
  MEETING_RTC.meetingId = meetingId;
  MEETING_RTC.userId = getMeetingUserId();
  syncLocalTile();
  initMeetingMedia();
  setTimeout(function(){ initMeetingSocket(meetingId); }, 120);
  if (!MEETING_RTC._boundUnload) {
    window.addEventListener('beforeunload', cleanupMeeting);
    MEETING_RTC._boundUnload = true;
  }
}

function initMeetingSocket(meetingId) {
  if (MEETING_RTC.socket || !window.io) return;
  var socket = io({ transports: ['websocket', 'polling'] });
  MEETING_RTC.socket = socket;

  socket.on('connect', function() {
    socket.emit('join-room', { meetingId: meetingId, userId: MEETING_RTC.userId });
  });

  socket.on('join-success', function(payload) {
    var data = payload || {};
    var list = Array.isArray(data.participants) ? data.participants : [];
    list.forEach(function(p) {
      if (!p || p.userId === MEETING_RTC.userId) return;
      createPeerConnection(p.userId, true);
    });
    if (data.screenShareUserId) {
      pinTile(data.screenShareUserId, true);
    }
  });

  socket.on('user-joined', function(payload) {
    var id = payload ? payload.userId : null;
    if (!id || id === MEETING_RTC.userId) return;
    createPeerConnection(id, true);
  });

  socket.on('offer', function(payload) {
    handleOffer(payload || {});
  });

  socket.on('answer', function(payload) {
    handleAnswer(payload || {});
  });

  socket.on('ice-candidate', function(payload) {
    handleIce(payload || {});
  });

  socket.on('user-left', function(payload) {
    var id = payload ? payload.userId : null;
    if (id) removePeer(id);
  });

  socket.on('screen-share-started', function(payload) {
    var id = payload ? payload.userId : null;
    if (id) pinTile(id, true);
  });

  socket.on('screen-share-stopped', function(payload) {
    var id = payload ? payload.userId : null;
    if (id && MEETING_RTC.pinAuto && MEETING_RTC.pinnedId === id) {
      clearPin();
    }
  });
}

function createPeerConnection(remoteId, isInitiator) {
  if (!remoteId || MEETING_RTC.peers[remoteId]) return;
  var pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  MEETING_RTC.peers[remoteId] = pc;
  addLocalTracks(pc);

  pc.onicecandidate = function(e) {
    if (e.candidate && MEETING_RTC.socket) {
      MEETING_RTC.socket.emit('ice-candidate', {
        meetingId: MEETING_RTC.meetingId,
        targetId: remoteId,
        candidate: e.candidate,
        from: MEETING_RTC.userId
      });
    }
  };

  pc.ontrack = function(e) {
    var stream = e.streams && e.streams[0] ? e.streams[0] : null;
    if (stream) attachRemoteStream(remoteId, stream);
  };

  pc.onconnectionstatechange = function() {
    var st = pc.connectionState;
    if (st === 'failed' || st === 'disconnected' || st === 'closed') {
      removePeer(remoteId);
    }
  };

  if (isInitiator) {
    ensureLocalStream(function() {
      pc.createOffer().then(function(offer) {
        return pc.setLocalDescription(offer).then(function() {
          if (MEETING_RTC.socket) {
            MEETING_RTC.socket.emit('offer', {
              meetingId: MEETING_RTC.meetingId,
              targetId: remoteId,
              offer: offer,
              from: MEETING_RTC.userId
            });
          }
        });
      }).catch(function(){});
    });
  }
}

function handleOffer(payload) {
  var from = payload.from;
  if (!from || from === MEETING_RTC.userId) return;
  if (!MEETING_RTC.peers[from]) createPeerConnection(from, false);
  var pc = MEETING_RTC.peers[from];
  if (!pc) return;
  pc.setRemoteDescription(new RTCSessionDescription(payload.offer)).then(function() {
    return ensureLocalStream(function() {
      pc.createAnswer().then(function(answer) {
        pc.setLocalDescription(answer).then(function() {
          if (MEETING_RTC.socket) {
            MEETING_RTC.socket.emit('answer', {
              meetingId: MEETING_RTC.meetingId,
              targetId: from,
              answer: answer,
              from: MEETING_RTC.userId
            });
          }
        });
      });
    });
  }).catch(function(){});
}

function handleAnswer(payload) {
  var from = payload.from;
  var pc = from ? MEETING_RTC.peers[from] : null;
  if (!pc) return;
  pc.setRemoteDescription(new RTCSessionDescription(payload.answer)).catch(function(){});
}

function handleIce(payload) {
  var from = payload.from;
  var pc = from ? MEETING_RTC.peers[from] : null;
  if (!pc || !payload.candidate) return;
  pc.addIceCandidate(new RTCIceCandidate(payload.candidate)).catch(function(){});
}

function addLocalTracks(pc) {
  if (!MEETING_RTC.localStream) return;
  var senders = pc.getSenders().map(function(s){ return s.track; }).filter(Boolean);
  var audioTracks = MEETING_RTC.localStream.getAudioTracks();
  audioTracks.forEach(function(track) {
    var exists = senders.some(function(t){ return t && t.kind === track.kind; });
    if (!exists) pc.addTrack(track, MEETING_RTC.localStream);
  });
  var videoSource = MEETING_MEDIA.screenStream || MEETING_RTC.localStream;
  var videoTracks = videoSource ? videoSource.getVideoTracks() : [];
  if (videoTracks[0]) {
    var vExists = senders.some(function(t){ return t && t.kind === 'video'; });
    if (!vExists) pc.addTrack(videoTracks[0], videoSource);
  }
}

function replaceVideoTrack(newTrack) {
  Object.keys(MEETING_RTC.peers).forEach(function(id) {
    var pc = MEETING_RTC.peers[id];
    if (!pc) return;
    var sender = pc.getSenders().find(function(s){ return s.track && s.track.kind === 'video'; });
    if (sender && newTrack) {
      sender.replaceTrack(newTrack).catch(function(){});
    }
  });
}

function ensureLocalStream(cb) {
  if (MEETING_RTC.localStream) return cb();
  var tries = 0;
  (function wait() {
    if (MEETING_RTC.localStream) return cb();
    if (tries++ > 30) return;
    setTimeout(wait, 100);
  })();
}

function attachRemoteStream(userId, stream) {
  var tile = ensureRemoteTile(userId);
  if (!tile) return;
  var video = tile.querySelector('video');
  if (!video) return;
  try {
    video.srcObject = stream;
  } catch(e) {
    video.src = URL.createObjectURL(stream);
  }
  video.play().catch(function(){});
}

function ensureRemoteTile(userId) {
  var grid = g('meet-grid');
  if (!grid || !userId) return null;
  var existing = grid.querySelector('.meet-tile[data-user-id=\"' + userId + '\"]');
  if (existing) return existing;
  var tile = document.createElement('div');
  tile.className = 'meet-tile';
  tile.setAttribute('data-user-id', userId);
  tile.innerHTML =
    '<video class=\"meet-video-el\" autoplay playsinline></video>' +
    '<div class=\"meet-name\">' + formatParticipantLabel(userId) + '</div>';
  grid.appendChild(tile);
  applyPinLayout();
  updateParticipantCount();
  return tile;
}

function removePeer(userId) {
  var pc = MEETING_RTC.peers[userId];
  if (pc) {
    try { pc.close(); } catch(e) {}
    delete MEETING_RTC.peers[userId];
  }
  var grid = g('meet-grid');
  if (grid) {
    var tile = grid.querySelector('.meet-tile[data-user-id=\"' + userId + '\"]');
    if (tile) tile.remove();
  }
  if (MEETING_RTC.pinnedId === userId && MEETING_RTC.pinAuto) {
    clearPin();
  } else {
    applyPinLayout();
  }
  updateParticipantCount();
}

function formatParticipantLabel(userId) {
  return 'Participant ' + String(userId).slice(-4).toUpperCase();
}

function syncLocalTile() {
  var tile = document.querySelector('.meet-tile--local');
  if (!tile) return;
  tile.setAttribute('data-user-id', MEETING_RTC.userId);
  var label = tile.querySelector('.meet-name');
  if (label) label.textContent = 'You';
  updateParticipantCount();
}

function updateParticipantCount() {
  var el = g('meet-participant-count');
  if (!el) return;
  var grid = g('meet-grid');
  var count = grid ? grid.querySelectorAll('.meet-tile').length : 1;
  el.textContent = count;
}

function pinTile(userId, auto) {
  MEETING_RTC.pinnedId = userId;
  MEETING_RTC.pinAuto = !!auto;
  applyPinLayout();
}

function clearPin() {
  MEETING_RTC.pinnedId = null;
  MEETING_RTC.pinAuto = false;
  applyPinLayout();
}

function applyPinLayout() {
  var grid = g('meet-grid');
  if (!grid) return;
  var pinned = MEETING_RTC.pinnedId;
  grid.classList.toggle('meet-grid--pinned', !!pinned);
  grid.querySelectorAll('.meet-tile').forEach(function(tile) {
    var id = tile.getAttribute('data-user-id');
    tile.classList.toggle('meet-tile--pinned', !!pinned && id === pinned);
  });
}

function initMeetingMedia() {
  if (window.__meetingMediaInit) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    MEETING_MEDIA.error = 'Camera / mic not supported in this browser';
    renderMeetingMediaFallback(MEETING_MEDIA.error);
    showToast('Camera / mic not supported in this browser', 'warning');
    return;
  }
  window.__meetingMediaInit = true;
  navigator.mediaDevices.getUserMedia({ video:true, audio:true }).then(function(stream){
    MEETING_MEDIA.stream = stream;
    MEETING_MEDIA.error = null;
    MEETING_RTC.localStream = stream;
    attachLocalStream(stream);
    Object.keys(MEETING_RTC.peers).forEach(function(id){
      var pc = MEETING_RTC.peers[id];
      if (pc) addLocalTracks(pc);
    });
    // Apply current toggle state to tracks
    stream.getAudioTracks().forEach(function(t){ t.enabled = MEETING_UI_STATE.mic; });
    stream.getVideoTracks().forEach(function(t){ t.enabled = MEETING_UI_STATE.cam; });
  }).catch(function(){
    MEETING_MEDIA.error = 'Unable to access camera or microphone';
    renderMeetingMediaFallback(MEETING_MEDIA.error);
    showToast('Unable to access camera or microphone', 'warning');
  });
}

function renderMeetingMediaFallback(message) {
  var wrap = document.querySelector('.meeting-room');
  if (!wrap) return;
  var existing = document.getElementById('meeting-media-error');
  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'meeting-media-error';
    existing.className = 'meet-media-error';
    wrap.insertBefore(existing, wrap.firstChild);
  }
  existing.textContent = message || 'Unable to access media devices';
}

function attachLocalStream(stream) {
  document.querySelectorAll('.meet-video-el[data-local=\"1\"], .meet-self-video').forEach(function(el){
    try {
      el.srcObject = stream;
    } catch(e) {
      el.src = URL.createObjectURL(stream);
    }
    el.muted = true;
    el.play().catch(function(){ /* autoplay may be blocked */ });
  });
}

function startScreenShare() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
    return Promise.reject(new Error('Screen share not supported'));
  }
  return navigator.mediaDevices.getDisplayMedia({ video:true, audio:false }).then(function(stream){
    MEETING_MEDIA.screenStream = stream;
    attachLocalStream(stream);
    var track = stream.getVideoTracks()[0];
    if (track) replaceVideoTrack(track);
    pinTile(MEETING_RTC.userId, true);
    if (MEETING_RTC.socket) {
      MEETING_RTC.socket.emit('screen-share-started', {
        meetingId: MEETING_RTC.meetingId,
        userId: MEETING_RTC.userId
      });
    }
    if (track) {
      track.onended = function() {
        MEETING_UI_STATE.screen = false;
        var btn = g('meeting-screen-btn');
        if (btn) btn.classList.add('is-off');
        stopScreenShare();
        showToast('Screen sharing stopped');
      };
    }
    showToast('Screen sharing started');
  });
}

function stopScreenShare() {
  if (MEETING_MEDIA.screenStream) {
    MEETING_MEDIA.screenStream.getTracks().forEach(function(t){ t.stop(); });
    MEETING_MEDIA.screenStream = null;
  }
  if (MEETING_RTC.pinAuto && MEETING_RTC.pinnedId === MEETING_RTC.userId) {
    clearPin();
  }
  if (MEETING_RTC.socket) {
    MEETING_RTC.socket.emit('screen-share-stopped', {
      meetingId: MEETING_RTC.meetingId,
      userId: MEETING_RTC.userId
    });
  }
  if (MEETING_MEDIA.stream) {
    var camTrack = MEETING_MEDIA.stream.getVideoTracks()[0];
    if (camTrack) replaceVideoTrack(camTrack);
    attachLocalStream(MEETING_MEDIA.stream);
  }
}

function buildVideoGrid(participants) {
  return '<div class="meet-grid" id="meet-grid">'
    + participants.map(function(p){
        var active = p.active ? ' meet-tile--active' : '';
        var localAttr = p.local ? ' data-local="1"' : '';
        var localClass = p.local ? ' meet-tile--local' : '';
        var pid = p.id ? String(p.id) : '';
        var dataId = pid ? ' data-user-id="' + pid + '"' : '';
        return '<div class="meet-tile' + active + localClass + '"' + dataId + '>'
          + '<video class="meet-video-el"' + localAttr + ' autoplay playsinline muted></video>'
          + '<div class="meet-name">' + p.label + '</div>'
          + '</div>';
      }).join('')
    + '</div>';
}

function buildMeetingControls() {
  return '<div class="meeting-controls-bar">'
    + '<button class="meet-control" id="meeting-mic-btn" onclick="meetingToggle(\'mic\')" aria-label="Toggle microphone" title="Microphone">'
    + '<span class="meet-control-icon">' + meetIconMicOn() + '</span>'
    + '</button>'
    + '<button class="meet-control" id="meeting-cam-btn" onclick="meetingToggle(\'cam\')" aria-label="Toggle camera" title="Camera">'
    + '<span class="meet-control-icon">' + meetIconCamOn() + '</span>'
    + '</button>'
    + '<button class="meet-control" id="meeting-screen-btn" onclick="meetingToggle(\'screen\')" aria-label="Share screen" title="Share screen">'
    + '<span class="meet-control-icon">' + meetIconScreenShare() + '</span>'
    + '</button>'
    + '<button class="meet-control meet-control--danger" id="meeting-leave-btn" onclick="meetingLeave()" aria-label="Leave meeting" title="Leave">'
    + '<span class="meet-control-icon">' + meetIconLeave() + '</span>'
    + '</button>'
    + '</div>';
}

function buildMeetingsDashboard() {
  return '<div class="module-header"><div class="module-title">Video Meetings</div>'
    + '<div class="module-sub">Start a new meeting or join an existing one using a meeting ID.</div></div>'
    + '<div class="panel">'
    + '<div class="form-section-title">Meetings Dashboard</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="meetingStart()">Start Meeting</button>'
    + '<button class="btn" onclick="meetingJoin()">Join Meeting</button>'
    + '</div>'
    + '<div class="form-grid" style="margin-top:10px">'
    + '<div class="form-group"><label class="form-label">Enter Meeting ID</label><input class="form-input" id="meeting-join-id" placeholder="e.g. abc123xyz"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="meetingJoin()">Join Meeting</button></div>'
    + '</div>';
}

function meetIconMicOn() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Zm5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.93V20h2v-2.07A7 7 0 0 0 19 11h-2Z"/></svg>';
}

function meetIconMicOff() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m19 11-2 0a5 5 0 0 1-7.06 4.58l-1.5 1.5A7 7 0 0 0 13 17.93V20h-2v-2.07A7 7 0 0 1 5 11h2a5 5 0 0 0 2.18 4.13l-1.42 1.42A7 7 0 0 1 3 11h2a7 7 0 0 0 1.11 3.73L3 17.84 4.41 19.25 20.59 3.07 19.17 1.66 15.5 5.33A3 3 0 0 0 9 6v5c0 .42.08.82.22 1.2l1.61-1.61V6a1 1 0 1 1 2 0v3.17l3.67-3.67L19 11Z"/></svg>';
}

function meetIconCamOn() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17 10.5V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3.5l4 4v-11l-4 4Z"/></svg>';
}

function meetIconCamOff() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 6.5-4 4V7a2 2 0 0 0-2-2H7.83l2 2H15v3.5l4-4Zm-2.21 13.21L3.29 4.21 4.7 2.8 20.2 18.3 18.79 19.71ZM7 17h8a2 2 0 0 0 2-2v-2.17l-8-8H5v10a2 2 0 0 0 2 2Z"/></svg>';
}

function meetIconScreenShare() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 3H3a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h6v2H7v2h10v-2h-2v-2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 11H3V5h18v9Z"/></svg>';
}

function meetIconLeave() {
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17v-2h4v-2h-4v-2l-3 3 3 3Zm9-12h-8a2 2 0 0 0-2 2v3h2V7h8v10h-8v-3H9v3a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/></svg>';
}

function buildMeetingRoom(meetingId) {
  var participants = [
    { id:'local', label:'You', local:true }
  ];
  var count = 1;
  return '<div class="meeting-room">'
    + '<div class="meet-topbar">'
    + '<div class="meet-title">Meeting Room</div>'
    + '<div class="meet-meta">Meeting ID: <strong>' + meetingId + '</strong></div>'
    + '<div class="meet-actions">'
    + '<span class="meet-pill">Live</span>'
    + '<span class="meet-pill meet-pill--neutral"><span id="meet-participant-count">' + count + '</span> Participants</span>'
    + '<button class="meet-chip">Chat</button>'
    + '</div>'
    + '</div>'
    + '<div class="meet-stage">'
    + buildVideoGrid(participants)
    + '</div>'
    + buildMeetingControls()
    + '</div>';
}

function buildMeetingsRouter() {
  meetingsEnsureRoute();
  var state = meetingsGetState();
  setMeetingOnlyMode(isMeetingOnlyWindow() && !!state.meetingId);
  if (state.meetingId) {
    setTimeout(function(){ initMeetingRoom(state.meetingId); }, 60);
  }
  return state.meetingId ? buildMeetingRoom(state.meetingId) : buildMeetingsDashboard();
}

if (typeof window !== 'undefined') {
  window.meetingsNavigate = meetingsNavigate;
  if (!window.__meetingsPopstateBound) {
    window.addEventListener('popstate', function() {
      var active = document.querySelector('.module-section.active');
      if (active && active.id === 'role-meetings' && typeof renderRoleSection === 'function') {
        renderRoleSection('role-meetings');
      }
    });
    window.__meetingsPopstateBound = true;
  }
}

function maybeOpenMeetingsDeepLink() {
  var base = '/meetings';
  var path = (window.location && window.location.pathname) ? window.location.pathname : '';
  var hash = (window.location && window.location.hash) ? window.location.hash : '';
  if (path.indexOf(base) === -1 && hash.indexOf(base) === -1) return;
  setMeetingOnlyMode(isMeetingOnlyWindow());
  if (typeof showPage === 'function') showPage('erp');
  setTimeout(function() {
    if (typeof renderRoleSection === 'function') {
      renderRoleSection('role-meetings');
    }
  }, 180);
}

function buildFacultyAssignments() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myCourses = db.courses.filter(function(c){return c.faculty===myName;});

  var myAssign = db.assignments.filter(function(a){return myCourses.some(function(c){return c.code===a.course;});});



  return '<div class="module-header"><div class="module-title">Manage Assignments</div>'

    + '<div class="module-sub">Create and track assignments for your courses.</div></div>'

    + '<div class="panel"><div class="form-section-title">Create Assignment</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fa-course">'

    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'

    + '<div class="form-group"><label class="form-label">Assignment Title</label><input class="form-input" id="fa-title" placeholder="e.g. Binary Tree Implementation"/></div>'

    + '<div class="form-group"><label class="form-label">Deadline</label><input class="form-input" type="date" id="fa-deadline"/></div>'

    + '<div class="form-group"><label class="form-label">Max Marks</label><input class="form-input" type="number" id="fa-marks" value="10"/></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyCreateAssignment()">+ Create Assignment</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Assignments</h3>'

    + widgetTable(['Course','Title','Deadline','Submitted','Total','Status'],

        myAssign.map(function(a){

          var pct = Math.round(a.submitted/a.total*100);

          var sc = a.status==='Active'?'blue':'gray';

          return [a.course, a.title, a.deadline, a.submitted, a.total,

            '<div class="progress-bar" style="width:80px;display:inline-block"><div class="progress-fill" style="width:'+pct+'%"></div></div> '

            +'<span class="badge badge-'+sc+'">'+a.status+'</span>'];

        }))

    + '</div>';

}



function buildFacultyMaterials() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myMats = db.materials.filter(function(m){return m.faculty===myName;});



  return '<div class="module-header"><div class="module-title">Study Materials</div>'

    + '<div class="module-sub">Upload lecture notes, slides, and reference materials for students.</div></div>'

    + '<div class="panel"><div class="form-section-title">Upload Material</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fmat-course">'

    + db.courses.filter(function(c){return c.faculty===myName;}).map(function(c){return '<option>'+c.code+'</option>';}).join('')

    + '</select></div>'

    + '<div class="form-group"><label class="form-label">Title</label><input class="form-input" id="fmat-title" placeholder="Module 4 — Sorting Algorithms"/></div>'

    + '<div class="form-group"><label class="form-label">File Type</label><select class="form-select" id="fmat-type"><option>PDF</option><option>PPT</option><option>Video</option><option>Link</option></select></div>'

    + '<div class="form-group"><label class="form-label">Upload File</label><input class="form-input" type="file" id="fmat-file" style="padding:7px"/></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyUploadMaterial()">📤 Upload Material</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Uploaded Materials</h3>'

    + widgetTable(['Course','Title','Type','Date','Size'],

        myMats.map(function(m){

          var tc = m.type==='PDF'?'red':m.type==='PPT'?'orange':'blue';

          return [m.course, m.title, '<span class="badge badge-'+tc+'">'+m.type+'</span>', m.date, m.size];

        }))

    + '</div>';

}



function buildFacultySchedule() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var mySlots = db.timetable.filter(function(t){return t.faculty===myName;});

  var days = ['Monday','Tuesday','Wednesday','Thursday','Friday'];



  return '<div class="module-header"><div class="module-title">My Schedule</div>'

    + '<div class="module-sub">Weekly teaching schedule for your assigned courses.</div></div>'

    + '<div class="panel">'

    + widgetTable(['Day','Time','Course','Room','Batch'],

        mySlots.map(function(s){

          return [s.day, s.time, '<strong>'+s.course+'</strong>', s.room, s.batch];

        }))

    + '</div>';

}



function buildFacultyAnnounce() {

  var db = dbGet();

  var sess = getSession();

  var myName = sess ? sess.name : 'Prof. Meera Singh';

  var myAnn = db.announcements.filter(function(a){return a.author===myName||(sess&&a.author===sess.name);});



  return '<div class="module-header"><div class="module-title">Post Announcement</div>'

    + '<div class="module-sub">Send notices to your students or department. Visible in student portal.</div></div>'

    + '<div class="panel"><div class="form-section-title">New Announcement</div>'

    + '<div class="form-grid">'

    + '<div class="form-group"><label class="form-label">Title</label><input class="form-input" id="fann-title" placeholder="Assignment deadline reminder…"/></div>'

    + '<div class="form-group"><label class="form-label">Audience</label><select class="form-select" id="fann-audience"><option>My Students</option><option>CSE Department</option><option>All Students</option></select></div>'

    + '<div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="fann-priority"><option>Low</option><option>Medium</option><option>High</option></select></div>'

    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Message</label><textarea class="form-textarea" id="fann-content" rows="3" placeholder="Type your announcement…"></textarea></div>'

    + '</div>'

    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyPostAnnouncement()">📣 Post Announcement</button></div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Institution Notices</h3>'

    + widgetTable(['Title','Author','Audience','Priority','Date'],

        db.announcements.map(function(a){

          var pc = a.priority==='High'?'red':a.priority==='Medium'?'yellow':'gray';

          return [a.title.substring(0,30)+'…', a.author, a.audience,

            '<span class="badge badge-'+pc+'">'+a.priority+'</span>', a.date];

        }))

    + '</div>';

}



/* 

   ACTION HANDLERS — Role-specific button callbacks

    */



/* Admin actions */

function adminAddUser() {

  var db = dbGet();

  var name = (g('nu-name')||{}).value; var email = (g('nu-email')||{}).value;

  var role = (g('nu-role')||{}).value; var dept  = (g('nu-dept')||{}).value;

  var pass = (g('nu-pass')||{}).value;

  if (!name||!email||!pass) { showToast('Fill all fields', 'error'); return; }

  db.users.push({ id:Date.now(), name:name, email:email, role:role, dept:dept,

    status:'Active', lastLogin:'Never' });

  db.auditLogs.unshift({ id:Date.now(), user:getSession().name, action:'User Created',

    target:name+' ('+role+')', timestamp:new Date().toLocaleString(), ip:'127.0.0.1' });

  dbSave(db);

  showToast(name + ' added as ' + role);

  renderRoleSection(getCurrentRoleSection());

}

function adminToggleUser(id) {

  var db = dbGet();

  var u = db.users.find(function(x){return x.id===id;});

  if (!u) return;

  u.status = u.status==='Active'?'Inactive':'Active';

  dbSave(db);

  showToast(u.name + ' ' + u.status);

  renderRoleSection('role-users');

}

function adminDeleteUser(id) {

  var db = dbGet();

  var idx = db.users.findIndex(function(x){return x.id===id;});

  if (idx===-1) return;

  var name = db.users[idx].name;

  db.users.splice(idx,1);

  dbSave(db); showToast(name + ' deleted', 'info');

  renderRoleSection('role-users');

}

function adminSaveConfig() { showToast('Configuration saved successfully'); }

function adminToggleModule(cb, name) { showToast(name + (cb.checked?' enabled':' disabled')); }

function adminClearLogs() {

  var db = dbGet(); db.auditLogs = []; dbSave(db);

  showToast('Audit logs cleared', 'info');

  renderRoleSection('role-audit');

}

function adminExportData() {

  var db = dbGet();

  var blob = new Blob([JSON.stringify(db, null, 2)], {type:'application/json'});

  var url = URL.createObjectURL(blob);

  var a = document.createElement('a');

  a.href = url; a.download = 'edusys_backup_'+Date.now()+'.json'; a.click();

  showToast('Data exported successfully');

}

function confirmReset() {

  if (confirm('Reset ALL demo data to factory defaults? This cannot be undone.')) { dbReset(); }

}



/* Head actions */

function principalApproveProposal(id, approve) {

  var db = dbGet();

  var p = db.proposals.find(function(x){return x.id===id;});

  if (!p) return;

  p.status = approve ? 'Approved' : 'Rejected';

  dbSave(db);

  showToast('Proposal ' + p.status.toLowerCase(), approve?'success':'info');

  renderRoleSection('role-proposals');

}



/* HOD actions */

function hodApproveLeave(id, approve) {

  var db = dbGet();

  var l = db.leaveRequests.find(function(x){return x.id===id;});

  if (!l) return;

  l.status = approve ? 'Approved' : 'Rejected';

  dbSave(db); showToast('Leave ' + l.status.toLowerCase());

  renderRoleSection(getCurrentRoleSection());

}

function hodAssignCourse() {

  var course = (g('hod-course')||{}).value || '';

  var faculty = (g('hod-faculty')||{}).value || '';

  if (!course||!faculty) return;

  var db = dbGet();

  var code = course.split('–')[0].trim();

  var c = db.courses.find(function(x){return x.code===code;});

  if (c) c.faculty = faculty;

  var f = db.faculty.find(function(x){return x.name===faculty;});

  if (f && !f.courses.includes(code)) f.courses.push(code);

  dbSave(db); showToast(code + ' assigned to ' + faculty);

  renderRoleSection('role-dept');

}

function hodSubmitProposal() {

  var title = (g('hod-prop-title')||{}).value;

  var desc  = (g('hod-prop-desc')||{}).value;

  if (!title) { showToast('Enter a proposal title', 'error'); return; }

  var db = dbGet(); var sess = getSession();

  db.proposals.unshift({ id:Date.now(), hod:sess.name, dept:sess.dept,

    title:title, description:desc||'—', status:'Pending', date:new Date().toISOString().split('T')[0] });

  dbSave(db); showToast('Proposal submitted to Head');

  renderRoleSection('role-dept');

}

function hodApproveAllMarks() {

  showToast('All mark submissions approved and forwarded to COE');

  renderRoleSection('role-marks');

}



/* Faculty actions */

function facultyMarkAttendance() {

  var course   = (g('fac-att-course')||{}).value;

  var cls      = (g('fac-att-class')||{}).value;

  var date     = (g('fac-att-date')||{}).value;

  var present  = parseInt((g('fac-att-present')||{}).value)||0;

  var total    = parseInt((g('fac-att-total')||{}).value)||1;

  if (!present||!total) { showToast('Enter present and total count', 'error'); return; }

  var db = dbGet();

  var pct = Math.round(present/total*100);

  db.attendance.push({ id:Date.now(), cls:cls, course:course, date:date, present:present, total:total, pct:pct });

  dbSave(db); showToast('Attendance recorded — ' + pct + '%');

  renderRoleSection('role-attendance');

}

function facultyAddMark() {

  var course  = (g('fm-course')||{}).value;

  var exam    = (g('fm-exam')||{}).value;

  var roll    = (g('fm-roll')||{}).value;

  var student = (g('fm-student')||{}).value;

  var marks   = parseInt((g('fm-marks')||{}).value)||0;

  var max     = parseInt((g('fm-max')||{}).value)||50;

  if (!roll||!student) { showToast('Fill student details', 'error'); return; }

  var pct = Math.round(marks/max*100);

  var grade = pct>=90?'A+':pct>=80?'A':pct>=70?'B':pct>=60?'C':pct>=50?'D':'F';

  var db = dbGet();

  db.marks.push({ id:Date.now(), course:course, exam:exam, student:student, roll:roll, marks:marks, maxMarks:max, grade:grade });

  dbSave(db); showToast('Mark added for ' + student);

  renderRoleSection('role-marks');

}

function facultySubmitMarks() { showToast('Marks submitted to HOD for approval'); }

function facultyCreateAssignment() {

  var course   = (g('fa-course')||{}).value;

  var title    = (g('fa-title')||{}).value;

  var deadline = (g('fa-deadline')||{}).value;

  var marks    = parseInt((g('fa-marks')||{}).value)||10;

  if (!title||!deadline) { showToast('Fill assignment title and deadline', 'error'); return; }

  var db = dbGet();

  var c = db.courses.find(function(x){return x.code===course;});

  db.assignments.push({ id:Date.now(), course:course, title:title, deadline:deadline,

    submitted:0, total:(c?c.enrolled:40), status:'Active' });

  dbSave(db); showToast('Assignment created: ' + title);

  renderRoleSection('role-assignments');

}

function facultyUploadMaterial() {

  var course = (g('fmat-course')||{}).value;

  var title  = (g('fmat-title')||{}).value;

  var type   = (g('fmat-type')||{}).value;

  var sess   = getSession();

  if (!title) { showToast('Enter material title', 'error'); return; }

  var db = dbGet();

  db.materials.push({ id:Date.now(), course:course, title:title, type:type,

    faculty:sess.name, date:new Date().toISOString().split('T')[0], size:'—' });

  dbSave(db); showToast('Material uploaded: ' + title);

  renderRoleSection('role-materials');

}

function facultyPostAnnouncement() {

  var title    = (g('fann-title')||{}).value;

  var audience = (g('fann-audience')||{}).value;

  var priority = (g('fann-priority')||{}).value;

  var content  = (g('fann-content')||{}).value;

  if (!title) { showToast('Enter announcement title', 'error'); return; }

  var db = dbGet(); var sess = getSession();

  db.announcements.unshift({ id:Date.now(), title:title, author:sess.name,

    audience:audience, date:new Date().toISOString().split('T')[0], priority:priority, content:content });

  dbSave(db); showToast('Announcement posted: ' + title);

  renderRoleSection('role-announce');

}

function facultyUpdateSyllabus(code) {

  var pct = prompt('Enter new syllabus % for ' + code + ' (0–100):');

  if (!pct) return;

  pct = Math.min(100, Math.max(0, parseInt(pct)||0));

  var db = dbGet();

  var c = db.courses.find(function(x){return x.code===code;});

  if (c) { c.syllabus = pct; dbSave(db); }

  showToast(code + ' syllabus updated to ' + pct + '%');

  renderRoleSection('role-mycourses');

}



/* 

   ROLE ENGINE — Core wiring of roles into the ERP shell

    */



/* Map role section IDs to their builder functions */

var SECTION_BUILDERS = {

  /* Admin extras */

  'role-users':    buildAdminUsers,

  'role-audit':    buildAdminAudit,

  'role-config':   buildAdminConfig,

  'role-backup':   buildAdminBackup,

  /* Head extras */

  'role-perf':       buildPrincipalPerf,

  'role-proposals':  buildPrincipalProposals,

  'role-strategic':  buildPrincipalStrategic,

  'role-accounts':   buildPrincipalAccounts,

  /* HOD extras */

  'role-dept':      buildHODDept,

  'role-timetable': buildHODTimetable,

  'role-leave':     buildHODLeave,

  'role-marks':     buildHODMarks,       /* HOD view */
  'role-hod-accounts': buildHODAccounts,
  'role-marks-viewer': buildMarksViewer,
  'role-meetings': buildMeetingsRouter,

  /* Faculty extras */

  'role-mycourses':  buildFacultyMyCourses,

  'role-attendance': buildFacultyAttendance,

  'role-assignments':buildFacultyAssignments,

  'role-materials':  buildFacultyMaterials,

  'role-schedule':   buildFacultySchedule,

  'role-announce':   buildFacultyAnnounce

};

/* Faculty marks builder (different from HOD marks) */

var _HOD_MARKS_BUILDER = SECTION_BUILDERS['role-marks'];

SECTION_BUILDERS['role-marks'] = function() {

  var role = getRole();

  if (role === 'HOD') return _HOD_MARKS_BUILDER();

  return buildFacultyMarks();

};



var _currentRoleSection = null;

function getCurrentRoleSection() { return _currentRoleSection; }



/* Main role section renderer — called when nav item is clicked */

function renderRoleSection(sectionId) {

  _currentRoleSection = sectionId;

  var builder = SECTION_BUILDERS[sectionId];

  if (!builder) return;

  /* Find or create the section element */

  var el = document.getElementById(sectionId);

  if (!el) {

    el = document.createElement('section');

    el.className = 'module-section';

    el.id = sectionId;

    var wrap = document.querySelector('.module-wrap');

    if (wrap) wrap.appendChild(el);

  }

  el.innerHTML = builder();

  /* Show this section, hide others */

  document.querySelectorAll('.module-section').forEach(function(s) {

    s.classList.toggle('active', s.id === sectionId);

  });

  var mw = document.querySelector('.module-wrap');

  if (mw) mw.scrollTop = 0;

}



/* Inject role-specific nav items into sidebar */

function injectRoleNav(role) {

  var sidebarNav = document.getElementById('module-nav');

  if (!sidebarNav) return;

  /* Remove any previously injected role sections */

  sidebarNav.querySelectorAll('.role-nav-section, .role-nav-item').forEach(function(el) {

    el.remove();

  });



  /* Insert role features after Main section (keep Overview + Main block at top). */

  var labels = sidebarNav.querySelectorAll('.sidebar-section-label');
  var insertPoint = null;
  labels.forEach(function(label) {
    var text = (label.textContent || '').trim();
    if (!insertPoint && text && text !== 'Main') insertPoint = label;
  });

  if (!insertPoint) {
    var insertAfter = sidebarNav.querySelector('.nav-item[data-module="overview"]')
      || sidebarNav.querySelector('.sidebar-logo');
    insertPoint = insertAfter ? insertAfter.nextSibling : sidebarNav.firstChild;
  }

  function insertRoleEl(el) {
    sidebarNav.insertBefore(el, insertPoint);
  }



  var items = ROLE_NAV[role];

  if (!items || !items.length) return;

  /* Group by section label */

  var sections = {};

  items.forEach(function(item) {

    if (!sections[item.section]) sections[item.section] = [];

    sections[item.section].push(item);

  });



  var orderedSectionLabels = Object.keys(sections).map(function(label, idx) {

    return { label: label, idx: idx };

  });

  orderedSectionLabels.sort(function(a, b) {

    var aStudent = a.label.indexOf('Student Mgmt') > -1;

    var bStudent = b.label.indexOf('Student Mgmt') > -1;

    if (aStudent !== bStudent) return aStudent ? -1 : 1;

    return a.idx - b.idx;

  });



  orderedSectionLabels.forEach(function(section) {

    var sectionLabel = section.label;

    /* Section label */

    var labelEl = document.createElement('span');

    labelEl.className = 'sidebar-section-label role-nav-section';

    labelEl.textContent = sectionLabel;

    insertRoleEl(labelEl);

    /* Nav items */

    sections[sectionLabel].forEach(function(item) {

      var btn = document.createElement('button');

      btn.className = 'nav-item role-nav-item';

      btn.setAttribute('data-role-section', item.id);

      btn.textContent = item.label;

      btn.addEventListener('click', function() {

        /* Deactivate all nav items */

        document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });

        btn.classList.add('active');

        if (item.module) {

          document.querySelectorAll('.module-section').forEach(function(s) {

            s.classList.toggle('active', s.id === item.module);

          });

          var mw = document.querySelector('.module-wrap');

          if (mw) mw.scrollTop = 0;

        } else {

          renderRoleSection(item.id);

        }

      });

      insertRoleEl(btn);

    });

  });

}



/* Hide sidebar modules not allowed for this role */

function applyRolePermissions(role) {

  var allowed = ROLE_MODULES[role] || [];

  /* Standard modules: show/hide based on permissions */

  document.querySelectorAll('.nav-item[data-module]').forEach(function(btn) {

    var mod = btn.getAttribute('data-module');

    var show = allowed.indexOf(mod) > -1;

    btn.style.display = show ? '' : 'none';

  });

  /* Standard section labels: hide if all items in section are hidden */

  document.querySelectorAll('.sidebar-section-label:not(.role-nav-section)').forEach(function(label) {

    var next = label.nextElementSibling;

    var anyVisible = false;

    while (next && next.tagName === 'BUTTON') {

      if (next.style.display !== 'none') anyVisible = true;

      next = next.nextElementSibling;

    }

    label.style.display = anyVisible ? '' : 'none';

  });

}



function applyRoleRestrictions(role) {
  if (document.body) document.body.classList.remove('role-head');
  if (role !== 'Head') return;
  if (document.body) document.body.classList.add('role-head');
  var blocked = ['add-invoice','add-student','delete-student','convert-student'];
  blocked.forEach(function(action) {
    document.querySelectorAll('[data-action="'+action+'"]').forEach(function(btn) {
      btn.disabled = true;
      btn.style.display = 'none';
    });
  });
}

/* Override the overview section with role-specific content */

function applyRoleOverview(role) {

  var overviewEl = document.getElementById('overview');

  if (!overviewEl) return;

  var overrideMap = {

    Admin:     buildAdminOverride,

    Head: buildPrincipalOverride,

    HOD:       buildHODOverride,

    Faculty:   buildFacultyOverride,

    Account:   buildAccountOverview,

    Admissions: buildAdmissionsOverview,

    'Railway Concession': buildRailwayOverview

  };

  if (overrideMap[role]) {

    overviewEl.innerHTML = overrideMap[role]();

  }

}



/* Show role badge in topbar */

function showRoleBadge(sess) {

  var topbar = document.querySelector('.topbar');

  if (!topbar) return;

  var existing = topbar.querySelector('.role-badge-wrap');

  if (existing) existing.remove();

  var colors = {

    Admin:'purple', Head:'blue', HOD:'accent', Faculty:'green',

    Account:'yellow', Admissions:'blue', 'Railway Concession':'orange'

  };

  var wrap = document.createElement('div');

  wrap.className = 'role-badge-wrap';

  wrap.style.cssText = 'display:flex;align-items:center;gap:8px;flex-shrink:0;margin-right:4px';

  wrap.innerHTML = '<div class="role-user"><div class="role-user-name">'

    + sess.name + '</div></div>'

    + '<span class="badge badge-' + (colors[sess.role]||'gray') + '">' + sess.role + '</span>';

  /* Insert after search box */

  var search = topbar.querySelector('.search-box');

  if (search && search.nextSibling) {

    topbar.insertBefore(wrap, search.nextSibling);

  } else {

    topbar.appendChild(wrap);

  }

  /* Add logout button */

  var actions = topbar.querySelector('.topbar-actions');

  if (actions && !actions.querySelector('.logout-btn')) {

    var logoutBtn = document.createElement('button');

    logoutBtn.className = 'btn btn-sm btn-danger logout-btn';

    logoutBtn.innerHTML = '<svg class="logout-svg" viewBox="0 0 24 24" aria-label="Logout" role="img">'
      + '<path d="M4.5 4.5h8v15h-8z" stroke="#ef4444" stroke-width="2" stroke-linejoin="round" fill="none" />'
      + '<path d="M12.5 12h7" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" />'
      + '<path d="M16.5 9l3 3-3 3" stroke="#ef4444" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />'
      + '<circle cx="9.5" cy="12" r="0.9" fill="#ef4444" />'
      + '</svg>';

    logoutBtn.addEventListener('click', authLogout);

    actions.appendChild(logoutBtn);

  }

}



/* ──────────────────────────────────────────────────────────

   MAIN ROLE INIT — called from initERP() hook

   ────────────────────────────────────────────────────────── */

function initRoleDashboard() {

  var sess = getSession();

  if (!sess) return; /* No session — default behavior */

  var role = sess.role;

  /* 1. Inject role-specific nav sections */

  injectRoleNav(role);

  /* 2. Apply permissions (hide/show modules) */

  applyRolePermissions(role);

  applyRoleRestrictions(role);

  /* 3. Override the overview panel */

  applyRoleOverview(role);

  /* 4. Show role badge + logout in topbar */

  showRoleBadge(sess);

  /* 5. For Faculty — auto-navigate to their dashboard */

  if (role === 'Faculty') {

    var btn = document.querySelector('.nav-item[data-role-section="role-mycourses"]');

    if (btn) btn.click();

  }

}



/* 

   ENHANCED ACCESS PAGE — Role-based login

    */



/* Override enterERP to support role-based login */

function enterERP() {

  var email    = ((g('access-email')||{}).value||'').trim();

  var password = ((g('access-password')||{}).value||'').trim();

  var key      = ((g('access-key')||{}).value||'').trim();

  var errEl    = g('access-error');



  /* Demo key bypass (original behavior) */

  if (key === 'EDU-DEMO-2026') {

    if (errEl) errEl.style.display = 'none';

    /* Default to Admin for plain key login */

    authLoginAsRole('Admin');

    showPage('erp');

    return;

  }

  /* Stored key match */

  var stored = storeGet('edusys-key');

  if (stored && key === stored) {

    if (errEl) errEl.style.display = 'none';

    authLoginAsRole('Admin');

    showPage('erp');

    return;

  }

  /* Email + password login */

  if (email && password) {

    if (authLogin(email, password)) {

      if (errEl) errEl.style.display = 'none';

      showPage('erp');

      return;

    }

    if (errEl) errEl.style.display = 'block';

    return;

  }

  if (errEl) errEl.style.display = 'block';

}



/* One-click demo login buttons */

function enterERPDemo() {

  authLoginAsRole('Admin');

  showPage('erp');

}



function loginAsRole(role) {

  authLoginAsRole(role);

  showPage('erp');

}



/* Add role selector UI to the access page */

function enhanceAccessPage() {

  /* Guard: only inject once — check whole page not just first panel */

  if (document.querySelector('#edusys-access .role-selector')) return;

  var panel = document.querySelector('#edusys-access .panel');

  if (!panel) return;



  /* Role quick-login section */

  var roleSection = document.createElement('div');

  roleSection.className = 'panel role-selector';

  roleSection.style.marginTop = '16px';

  roleSection.innerHTML = '<div class="form-section-title">Demo  Login as Role</div>'
    + '<p style="color:var(--text2);font-size:13px;margin-bottom:14px">One-click login to explore role-specific dashboards with realistic demo data.</p>'

    + '<div class="grid grid-2" style="gap:10px">'

    + buildRoleCard('Admin',     '&#128100;', 'admin@edusys.in',     'admin123',     'purple', 'Full system access, user management, audit logs')
    + buildRoleCard('Head', '&#127979;', 'head@edusys.in', 'head123', 'blue',   'Institution performance, approve HOD proposals')
    + buildRoleCard('HOD',       '&#128218;', 'hod@edusys.in',       'hod123',       'accent', 'CSE dept management, leave approvals, timetable')
    + buildRoleCard('Faculty',   '&#128104;&#8205;&#127979;', 'faculty@edusys.in',   'faculty123',   'green',  'My courses, attendance, marks, assignments')
    + buildRoleCard('Account',   '&#128176;', 'accounts@edusys.in',  'accounts123',  'yellow', 'Student accounts, finance, outstanding, analytics')
    + buildRoleCard('Admissions','&#127891;', 'admissions@edusys.in','admissions123','blue',   'Admissions pipeline, caste/category, documents')
    + buildRoleCard('Railway Concession','&#128646;', 'concession@edusys.in','concession123','orange', 'Concession requests and appointment scheduling')
    + '</div>';



  /* Insert after last panel */

  var lastPanel = document.querySelector('#edusys-access .panel:last-of-type');

  if (lastPanel) lastPanel.after(roleSection);

  else document.querySelector('#edusys-access main, #edusys-access > div').appendChild(roleSection);

}



function buildRoleCard(role, icon, email, pass, color, desc) {

  return '<div class="integration-card '+(color==='green'?'active-card':'')+'" style="flex-direction:column;align-items:flex-start;gap:8px;cursor:pointer" onclick="loginAsRole(\''+role+'\') ">'

    + '<div style="display:flex;align-items:center;gap:10px;width:100%">'

    + '<span style="font-size:22px">'+icon+'</span>'

    + '<div><div class="integration-name"><span class="badge badge-'+color+'">'+role+'</span></div>'

    + '<div class="integration-status">'+email+'  /  '+pass+'</div></div></div>'

    + '<div style="font-size:11px;color:var(--text3);line-height:1.5">'+desc+'</div>'

    + '<button class="btn btn-sm btn-primary" style="width:100%;margin-top:2px" onclick="loginAsRole(\''+role+'\');event.stopPropagation()">Login as '+role+' &rarr;</button>'
    + '</div>';

}



/* 

   HOOK INTO EXISTING initERP

   Monkey-patch showPage to run role init after ERP loads.

    */

(function() {

  var _origShowPage = window.showPage;

  window.showPage = function(id) {

    _origShowPage(id);

    if (id === 'erp') {

      /* Run role dashboard init after initERP completes */

      setTimeout(initRoleDashboard, 50);

    }

    if (id === 'edusys-access') {
      /* Enhance access page with role selector */
      setTimeout(enhanceAccessPage, 50);
      setTimeout(initAccessMode, 60);
    }
  };

  /* Also patch initERP's internal re-init guard so role nav re-applies on revisit */

  var _origInitERP = window.initERP;

  if (_origInitERP) {

    window.initERP = function() {

      _origInitERP();

      /* Re-apply role on every ERP init (handles page revisit) */

      setTimeout(initRoleDashboard, 80);

    };

  }

})();



/* ── BOOT ─────────────────────────────────────────────────── */

/* Restore role if already in ERP (e.g. page refresh with session in localStorage) */

(function() {

  var activePage = document.querySelector('.page.active');

  if (activePage && activePage.id === 'erp') {

    setTimeout(initRoleDashboard, 100);

  }

  /* Enhance access page on first load */
  if (activePage && activePage.id === 'edusys-access') {
    setTimeout(enhanceAccessPage, 50);
    setTimeout(initAccessMode, 60);
  }

  /* Deep-link into meetings in a new window */
  setTimeout(maybeOpenMeetingsDeepLink, 120);
})();

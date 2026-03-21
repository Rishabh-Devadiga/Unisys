/* ============================================================
   features.js — UniSys EduSys Extended Feature Set
   Implements all features from the Admin/Head spec (Doc 1)
   and the Professor/OBE spec (Doc 2).
   Extends roles.js without modifying any existing file.
   All data via localStorage (demo mode — no backend).
   ============================================================ */
window.__edusysFeaturesVersion = '2026-03-17-firebase-email-queue-v1';

/* ══════════════════════════════════════════════════════════
   EXTENDED SEED DATA
   Appended to dbGet() output on first access.
   ══════════════════════════════════════════════════════════ */
var EXT_SEED = {

  /* Course Outcomes (COs) per course — OBE core */
  courseOutcomes: [
    { id:1,  courseId:'CSE301', code:'CO1', description:'Analyse linear & non-linear data structures',       bloom:'Analysis',    target:70 },
    { id:2,  courseId:'CSE301', code:'CO2', description:'Design efficient algorithms for sorting/searching', bloom:'Synthesis',   target:70 },
    { id:3,  courseId:'CSE301', code:'CO3', description:'Apply graph algorithms to real-world problems',     bloom:'Application', target:65 },
    { id:4,  courseId:'CSE301', code:'CO4', description:'Evaluate time & space complexity of algorithms',    bloom:'Evaluation',  target:70 },
    { id:5,  courseId:'CSE401', code:'CO1', description:'Explain OSI/TCP-IP model and protocols',            bloom:'Understanding',target:70 },
    { id:6,  courseId:'CSE401', code:'CO2', description:'Configure and troubleshoot network setups',         bloom:'Application', target:65 },
    { id:7,  courseId:'CSE401', code:'CO3', description:'Analyse security vulnerabilities in networks',      bloom:'Analysis',    target:60 },
    { id:8,  courseId:'CSE302', code:'CO1', description:'Design normalised relational schemas',              bloom:'Synthesis',   target:70 },
    { id:9,  courseId:'CSE302', code:'CO2', description:'Write complex SQL queries and transactions',        bloom:'Application', target:70 },
    { id:10, courseId:'CSE302', code:'CO3', description:'Evaluate database design trade-offs',               bloom:'Evaluation',  target:65 }
  ],

  /* Program Outcomes (POs) — standard NBA 12 POs */
  programOutcomes: [
    { id:1,  code:'PO1',  description:'Engineering Knowledge',        category:'Technical' },
    { id:2,  code:'PO2',  description:'Problem Analysis',             category:'Technical' },
    { id:3,  code:'PO3',  description:'Design/Development of Solutions', category:'Technical' },
    { id:4,  code:'PO4',  description:'Conduct Investigations',       category:'Technical' },
    { id:5,  code:'PO5',  description:'Modern Tool Usage',            category:'Technical' },
    { id:6,  code:'PO6',  description:'The Engineer and Society',     category:'Generic' },
    { id:7,  code:'PO7',  description:'Environment and Sustainability',category:'Generic' },
    { id:8,  code:'PO8',  description:'Ethics',                       category:'Generic' },
    { id:9,  code:'PO9',  description:'Individual and Team Work',     category:'Generic' },
    { id:10, code:'PO10', description:'Communication',                category:'Generic' },
    { id:11, code:'PO11', description:'Project Management',           category:'Generic' },
    { id:12, code:'PO12', description:'Life-long Learning',           category:'Generic' }
  ],

  /* CO-PO mapping matrix (strength: 3=High, 2=Medium, 1=Low, 0=None) */
  coPOMapping: [
    { courseId:'CSE301', coCode:'CO1', mappings:{ PO1:3, PO2:3, PO3:2, PO4:1, PO5:1, PO6:0, PO7:0, PO8:0, PO9:1, PO10:1, PO11:1, PO12:2 } },
    { courseId:'CSE301', coCode:'CO2', mappings:{ PO1:3, PO2:3, PO3:3, PO4:2, PO5:2, PO6:0, PO7:0, PO8:0, PO9:1, PO10:1, PO11:2, PO12:2 } },
    { courseId:'CSE301', coCode:'CO3', mappings:{ PO1:2, PO2:3, PO3:3, PO4:2, PO5:3, PO6:1, PO7:0, PO8:0, PO9:2, PO10:1, PO11:2, PO12:2 } },
    { courseId:'CSE301', coCode:'CO4', mappings:{ PO1:3, PO2:3, PO3:2, PO4:3, PO5:2, PO6:0, PO7:0, PO8:0, PO9:1, PO10:1, PO11:1, PO12:3 } },
    { courseId:'CSE401', coCode:'CO1', mappings:{ PO1:3, PO2:2, PO3:2, PO4:1, PO5:3, PO6:1, PO7:1, PO8:0, PO9:1, PO10:2, PO11:1, PO12:2 } },
    { courseId:'CSE401', coCode:'CO2', mappings:{ PO1:2, PO2:3, PO3:3, PO4:2, PO5:3, PO6:1, PO7:1, PO8:1, PO9:2, PO10:2, PO11:2, PO12:2 } },
    { courseId:'CSE401', coCode:'CO3', mappings:{ PO1:2, PO2:3, PO3:2, PO4:3, PO5:2, PO6:2, PO7:1, PO8:2, PO9:1, PO10:2, PO11:1, PO12:3 } }
  ],

  /* Assessment items tagged to COs (for OBE mark entry) */
  assessmentItems: [
    { id:1, course:'CSE301', exam:'Mid Semester', qNo:'Q1', coIds:['CO1','CO2'], maxMarks:15, bloomLevel:'Analysis' },
    { id:2, course:'CSE301', exam:'Mid Semester', qNo:'Q2', coIds:['CO3'],       maxMarks:15, bloomLevel:'Application' },
    { id:3, course:'CSE301', exam:'Mid Semester', qNo:'Q3', coIds:['CO4'],       maxMarks:20, bloomLevel:'Evaluation' },
    { id:4, course:'CSE401', exam:'Mid Semester', qNo:'Q1', coIds:['CO1'],       maxMarks:20, bloomLevel:'Understanding' },
    { id:5, course:'CSE401', exam:'Mid Semester', qNo:'Q2', coIds:['CO2','CO3'], maxMarks:30, bloomLevel:'Application' }
  ],

  /* CO-wise attainment data (auto-calculated; stored after faculty input) */
  coAttainment: [
    { courseId:'CSE301', coCode:'CO1', direct:74, indirect:68, combined:72.8, level:2, target:70, status:'Met',     semester:'2025-26 Even' },
    { courseId:'CSE301', coCode:'CO2', direct:81, indirect:75, combined:79.8, level:3, target:70, status:'Met',     semester:'2025-26 Even' },
    { courseId:'CSE301', coCode:'CO3', direct:58, indirect:62, combined:58.8, level:1, target:65, status:'Not Met', semester:'2025-26 Even' },
    { courseId:'CSE301', coCode:'CO4', direct:70, indirect:65, combined:68.5, level:2, target:70, status:'Borderline', semester:'2025-26 Even' },
    { courseId:'CSE401', coCode:'CO1', direct:79, indirect:72, combined:77.4, level:3, target:70, status:'Met',     semester:'2025-26 Even' },
    { courseId:'CSE401', coCode:'CO2', direct:65, indirect:60, combined:63.5, level:2, target:65, status:'Met',     semester:'2025-26 Even' },
    { courseId:'CSE401', coCode:'CO3', direct:52, indirect:55, combined:52.6, level:1, target:60, status:'Not Met', semester:'2025-26 Even' }
  ],

  /* Exit survey responses (indirect attainment) */
  surveyResponses: [
    { courseId:'CSE301', coCode:'CO1', responses:[ 4,5,4,3,5,4,4,3,5,4 ] },
    { courseId:'CSE301', coCode:'CO2', responses:[ 5,4,5,4,5,5,4,5,4,4 ] },
    { courseId:'CSE301', coCode:'CO3', responses:[ 3,3,2,3,4,3,3,2,3,3 ] },
    { courseId:'CSE301', coCode:'CO4', responses:[ 4,3,4,4,3,4,3,4,4,3 ] }
  ],

  /* Session/lecture CO mapping (Faculty schedule enrichment) */
  sessionLogs: [
    { id:1, faculty:'Prof. Meera Singh', course:'CSE301', date:'2026-03-10', topic:'Binary Trees — Introduction',    coIds:['CO1'],      batch:'CSE-A', duration:60 },
    { id:2, faculty:'Prof. Meera Singh', course:'CSE301', date:'2026-03-11', topic:'BST Insert/Delete Operations',   coIds:['CO1','CO2'],batch:'CSE-A', duration:60 },
    { id:3, faculty:'Prof. Meera Singh', course:'CSE301', date:'2026-03-12', topic:'Graph BFS/DFS Traversal',        coIds:['CO3'],      batch:'CSE-A', duration:60 },
    { id:4, faculty:'Prof. Meera Singh', course:'CSE401', date:'2026-03-10', topic:'OSI Model — Layers 1-4',         coIds:['CO1'],      batch:'CSE-B', duration:60 },
    { id:5, faculty:'Prof. Meera Singh', course:'CSE401', date:'2026-03-13', topic:'TCP Handshake & Congestion',     coIds:['CO1','CO2'],batch:'CSE-B', duration:60 }
  ],

  /* Action plans for continuous improvement */
  actionPlans: [
    { id:1, faculty:'Prof. Meera Singh', course:'CSE301', coCode:'CO3', semester:'2025-26 Even',
      issue:'CO3 attainment below target (58.8% vs 65%)',
      action:'Add 2 extra tutorial sessions on graph algorithms; include more practice problems in assignments',
      targetSem:'2026-27 Odd', status:'Planned', createdOn:'2026-03-14' },
    { id:2, faculty:'Prof. Meera Singh', course:'CSE401', coCode:'CO3', semester:'2025-26 Even',
      issue:'Network security CO not met (52.6% vs 60%)',
      action:'Introduce hands-on lab session with Wireshark; add security MCQs in unit tests',
      targetSem:'2026-27 Odd', status:'Planned', createdOn:'2026-03-14' }
  ],

  /* Workflow approvals queue (Admin/Head) */
  approvalQueue: [
    { id:1, type:'Budget Request',    requester:'Dr. Rajiv Rao',    dept:'CSE', amount:120000, description:'DSP Lab upgrade — 15 new units', status:'Pending', date:'2026-03-12' },
    { id:2, type:'Leave Application', requester:'Prof. Meera Singh',dept:'CSE', amount:null,   description:'Personal leave 3 days (Mar 17-19)', status:'Pending', date:'2026-03-10' },
    { id:3, type:'Procurement PO',    requester:'Library',          dept:'Central', amount:85000, description:'Journal subscriptions renewal 2026', status:'Pending', date:'2026-03-08' },
    { id:4, type:'Event Approval',    requester:'T&P Cell',         dept:'CSE', amount:15000, description:'Infosys campus drive logistics', status:'Approved', date:'2026-03-05' }
  ],

  /* Financial summary for Admin/Head */
  financialSummary: {
    tuitionRevenue:  48000000,
    hostelRevenue:   8500000,
    otherRevenue:    2000000,
    salaryExpense:   28000000,
    infraExpense:    6000000,
    adminExpense:    3500000,
    researchExpense: 2500000,
    budgetUtilPct:   72,
    collectionPct:   82
  },

  /* Inventory / resource bookings */
  resourceBookings: [
    { id:1, resource:'Seminar Hall A', bookedBy:'Dr. Rajiv Rao',    dept:'CSE', date:'2026-03-20', time:'10:00-12:00', purpose:'Faculty Workshop',  status:'Confirmed' },
    { id:2, resource:'Lab-3 (CSE)',    bookedBy:'Prof. Meera Singh', dept:'CSE', date:'2026-03-18', time:'11:00-13:00', purpose:'Practical CSE301',  status:'Confirmed' },
    { id:3, resource:'Conference Room',bookedBy:'Dr. Anita Sharma',  dept:'Admin',date:'2026-03-16',time:'11:00-12:00', purpose:'HOD Monthly Meet', status:'Confirmed' }
  ],

  /* Compliance / NAAC criteria tracker */
  naacCriteria: [
    { id:1, criterion:'C1 — Curricular Aspects',           target:100, achieved:72, evidences:8,  total:11, status:'In Progress' },
    { id:2, criterion:'C2 — Teaching-Learning',            target:100, achieved:80, evidences:12, total:15, status:'In Progress' },
    { id:3, criterion:'C3 — Research & Extension',         target:100, achieved:65, evidences:10, total:14, status:'In Progress' },
    { id:4, criterion:'C4 — Infrastructure',               target:100, achieved:88, evidences:14, total:16, status:'In Progress' },
    { id:5, criterion:'C5 — Student Support',              target:100, achieved:70, evidences:7,  total:10, status:'In Progress' },
    { id:6, criterion:'C6 — Governance & Leadership',      target:100, achieved:60, evidences:6,  total:10, status:'Needs Attention' },
    { id:7, criterion:'C7 — Institutional Values',         target:100, achieved:55, evidences:5,  total:9,  status:'Needs Attention' }
  ],

  /* Multi-campus data (Admin) */
  campuses: [
    { id:1, name:'Main Campus — Northstar',  location:'Bengaluru', students:1200, faculty:65,  status:'Active' },
    { id:2, name:'North Extension Campus',   location:'Mysore',    students:480,  faculty:28,  status:'Active' },
    { id:3, name:'Tech Park Annex',          location:'Bengaluru', students:240,  faculty:14,  status:'Active' }
  ],

  /* Student lifecycle flags */
  studentFlags: [
    { studentId:4,  roll:'CSE-104', name:'Karan Gupta',   flag:'Low Attendance (74%)',    severity:'Warning', raisedBy:'Prof. Meera Singh', date:'2026-03-12' },
    { studentId:2,  roll:'CSE-102', name:'Rohan Mehta',   flag:'CO3 Attainment Gap',      severity:'Info',    raisedBy:'OBE Engine',        date:'2026-03-14' },
    { studentId:9,  roll:'MBA-201', name:'Pooja Reddy',   flag:'Fee Payment Overdue',     severity:'Urgent',  raisedBy:'Finance',           date:'2026-03-10' }
  ],

  /* Admissions: caste/category data */
  studentCategories: [
    { studentId:1, category:'General', caste:'General' },
    { studentId:2, category:'OBC',     caste:'OBC-NCL' },
    { studentId:3, category:'SC',      caste:'SC' },
    { studentId:4, category:'OBC',     caste:'OBC-NCL' },
    { studentId:5, category:'General', caste:'General' },
    { studentId:9, category:'OBC',     caste:'OBC-NCL' }
  ],

  /* Admissions: submitted documents */
  studentDocuments: [
    { id:1, studentId:1, type:'10th Marksheet',      status:'Verified',  submittedOn:'2026-03-02' },
    { id:2, studentId:1, type:'12th Marksheet',      status:'Verified',  submittedOn:'2026-03-02' },
    { id:3, studentId:2, type:'Caste Certificate',   status:'Submitted', submittedOn:'2026-03-05' },
    { id:4, studentId:3, type:'Transfer Certificate',status:'Pending',   submittedOn:'2026-03-06' },
    { id:5, studentId:4, type:'Income Certificate',  status:'Submitted', submittedOn:'2026-03-07' },
    { id:6, studentId:9, type:'Degree Certificate',  status:'Verified',  submittedOn:'2026-03-01' }
  ],

  /* Accounts: outstanding fees */
  feeOutstanding: [
    { id:1, studentId:4, type:'Tuition Fee', amount:45000, dueDate:'2026-03-10', status:'Overdue' },
    { id:2, studentId:2, type:'Hostel Fee',  amount:18000, dueDate:'2026-03-25', status:'Pending' },
    { id:3, studentId:9, type:'Exam Fee',    amount:2500,  dueDate:'2026-03-30', status:'Pending' }
  ],

  /* Railway concession requests */
  concessionRequests: [
    { id:1, studentId:2, route:'Bengaluru - Mysore',  requestDate:'2026-03-12', status:'Requested', appointmentDate:'', appointmentTime:'' },
    { id:2, studentId:4, route:'Mysore - Bengaluru',  requestDate:'2026-03-11', status:'Requested', appointmentDate:'', appointmentTime:'' },
    { id:3, studentId:9, route:'Bengaluru - Chennai', requestDate:'2026-03-08', status:'Scheduled', appointmentDate:'2026-03-18', appointmentTime:'10:30' }
  ],

  /* Student behavior records */
  behaviorRecords: [
    { id:1, studentId:1, student:'Priya Sharma', roll:'CSE-101', dept:'CSE', type:'positive', category:'participation', severity:'low',
      description:'Led the class discussion on tree traversals', action:'Appreciated in class', recordedBy:'Prof. Meera Singh', date:'2026-03-12', status:'Open' },
    { id:2, studentId:4, student:'Karan Gupta', roll:'CSE-104', dept:'CSE', type:'negative', category:'discipline', severity:'medium',
      description:'Late submission of lab assignment', action:'Warned and counseled', recordedBy:'Prof. Meera Singh', date:'2026-03-11', status:'Open' }
  ],

  /* CIA marks (continuous internal assessment) */
  ciaMarks: [
    { id:1, studentId:1, student:'Priya Sharma', roll:'CSE-101', dept:'CSE', course:'CSE301', cia:'CIA1', marks:42, maxMarks:50,
      date:'2026-03-10', enteredBy:'Prof. Meera Singh', status:'Pending' },
    { id:2, studentId:2, student:'Rohan Mehta', roll:'CSE-102', dept:'CSE', course:'CSE301', cia:'CIA1', marks:38, maxMarks:50,
      date:'2026-03-10', enteredBy:'Prof. Meera Singh', status:'Pending' }
  ],

  /* ESE marks (end semester exam) */
  eseMarks: [
    { id:1, studentId:1, student:'Priya Sharma', roll:'CSE-101', dept:'CSE', course:'CSE301', marks:78, maxMarks:100, semester:'5',
      academicYear:'2025-26', date:'2026-03-14', enteredBy:'Prof. Meera Singh', status:'Pending' }
  ],

  /* Detailed attendance entries (per-student) */
  attendanceEntries: [
    { id:1, studentId:1, roll:'CSE-101', dept:'CSE', course:'CSE301', date:'2026-03-04', status:'present', markedBy:'Prof. Meera Singh' },
    { id:2, studentId:2, roll:'CSE-102', dept:'CSE', course:'CSE301', date:'2026-03-04', status:'late',    markedBy:'Prof. Meera Singh' },
    { id:3, studentId:3, roll:'CSE-103', dept:'CSE', course:'CSE301', date:'2026-03-04', status:'present', markedBy:'Prof. Meera Singh' },
    { id:4, studentId:4, roll:'CSE-104', dept:'CSE', course:'CSE301', date:'2026-03-04', status:'absent',  markedBy:'Prof. Meera Singh' },
    { id:5, studentId:5, roll:'CSE-105', dept:'CSE', course:'CSE301', date:'2026-03-05', status:'present', markedBy:'Prof. Meera Singh' },
    { id:6, studentId:4, roll:'CSE-104', dept:'CSE', course:'CSE301', date:'2026-03-05', status:'absent',  markedBy:'Prof. Meera Singh' },
    { id:7, studentId:1, roll:'CSE-101', dept:'CSE', course:'CSE401', date:'2026-03-06', status:'present', markedBy:'Prof. Meera Singh' },
    { id:8, studentId:2, roll:'CSE-102', dept:'CSE', course:'CSE401', date:'2026-03-06', status:'present', markedBy:'Prof. Meera Singh' },
    { id:9, studentId:4, roll:'CSE-104', dept:'CSE', course:'CSE401', date:'2026-03-06', status:'excused', markedBy:'Prof. Meera Singh' }
  ],

  /* Research & publications */
  publications: [
    { id:1, faculty:'Dr. Rajiv Rao',     title:'Optimised Graph Partitioning for Distributed Systems', journal:'IEEE Trans. Parallel', year:2025, type:'Journal', poId:'PO4' },
    { id:2, faculty:'Dr. Arun Pillai',   title:'Transfer Learning in Low-Resource NLP Tasks',          journal:'ACL 2025',            year:2025, type:'Conference', poId:'PO3' },
    { id:3, faculty:'Prof. Meera Singh', title:'Cache-Oblivious Algorithms for Tree Traversal',        journal:'ACM TOCS',            year:2026, type:'Journal', poId:'PO2' }
  ]
};

/* ── Extend dbGet to inject EXT_SEED fields on first access ── */
var _origDbGet = window.dbGet;
window.dbGet = function() {
  var d = _origDbGet();
  /* Inject extended collections if not yet present */
  var extKeys = Object.keys(EXT_SEED);
  var changed = false;
  extKeys.forEach(function(k) {
    if (!d[k]) { d[k] = JSON.parse(JSON.stringify(EXT_SEED[k])); changed = true; }
  });
  if (changed) dbSave(d);
  return d;
};

/* ══════════════════════════════════════════════════════════
   SHARED OBE HELPERS
   Reusable across Faculty, HOD, and Admin/Head sections.
   ══════════════════════════════════════════════════════════ */

/* Calculate attainment level (0–3) from percentage */
function obeLevel(pct, target) {
  if (pct >= target + 10) return 3;
  if (pct >= target)      return 2;
  if (pct >= target - 10) return 1;
  return 0;
}
function obeLevelBadge(level, pct) {
  var colors = ['red','yellow','blue','green'];
  var labels = ['Level 0','Level 1','Level 2','Level 3'];
  return '<span class="badge badge-' + colors[level] + '">' + labels[level] + ' (' + pct + '%)</span>';
}
function obeStatusBadge(status) {
  var m = { 'Met':'green', 'Not Met':'red', 'Borderline':'yellow' };
  return '<span class="badge badge-' + (m[status]||'gray') + '">' + status + '</span>';
}
/* Radar chart (SVG-based, no library) for CO-PO mapping */
function buildRadarSVG(labels, values, maxVal) {
  maxVal = maxVal || 3;
  var n = labels.length;
  var cx = 140, cy = 140, r = 100;
  var angles = labels.map(function(_,i){ return (i/n)*2*Math.PI - Math.PI/2; });
  var pts = values.map(function(v,i){
    var ratio = v/maxVal;
    return [ cx + ratio*r*Math.cos(angles[i]), cy + ratio*r*Math.sin(angles[i]) ];
  });
  var polyPts = pts.map(function(p){return p[0]+','+p[1];}).join(' ');
  /* Grid circles */
  var grid = [1,2,3].map(function(level){
    var ratio = level/maxVal;
    var gpts = angles.map(function(a){
      return [(cx+ratio*r*Math.cos(a)).toFixed(1),(cy+ratio*r*Math.sin(a)).toFixed(1)].join(',');
    }).join(' ');
    return '<polygon points="'+gpts+'" fill="none" stroke="rgba(148,163,184,0.2)" stroke-width="1"/>';
  }).join('');
  /* Axis lines */
  var axes = angles.map(function(a){
    return '<line x1="'+cx+'" y1="'+cy+'" x2="'+(cx+r*Math.cos(a)).toFixed(1)+'" y2="'+(cy+r*Math.sin(a)).toFixed(1)+'" stroke="rgba(148,163,184,0.25)" stroke-width="1"/>';
  }).join('');
  /* Labels */
  var lbls = labels.map(function(l,i){
    var x = (cx+(r+18)*Math.cos(angles[i])).toFixed(1);
    var y = (cy+(r+18)*Math.sin(angles[i])+4).toFixed(1);
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="10" fill="var(--text2)">'+l+'</text>';
  }).join('');
  return '<svg width="280" height="280" viewBox="0 0 280 280">'
    + grid + axes
    + '<polygon points="'+polyPts+'" fill="rgba(109,139,255,0.25)" stroke="var(--accent)" stroke-width="2"/>'
    + lbls
    + '</svg>';
}

/* ══════════════════════════════════════════════════════════
   ADMIN EXTENDED SECTIONS
   ══════════════════════════════════════════════════════════ */

/* Admin: Student Lifecycle Management */
function buildAdminStudentLifecycle() {
  var db = dbGet();
  var flags = db.studentFlags || [];
  var students = db.students || [];
  return '<div class="module-header"><div class="module-title">Student Management &amp; Lifecycle</div>'
    + '<div class="module-sub">Centralised student records: admissions → enrollment → academic history → alumni. Retention flags and self-service analytics.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Total Students', students.length, 'Active records', 'up')
    + widgetKpi('Retention Rate', '94%', 'vs last year 91%', 'up')
    + widgetKpi('Alumni Registered', '8,420', 'Portal active', 'up')
    + widgetKpi('Flagged Students', flags.length, 'Needs attention', flags.length>0?'down':'neutral')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Retention &amp; Risk Flags</h3>'
    + widgetTable(['Student','Roll','Flag','Severity','Raised By','Date','Action'],
        flags.map(function(f){
          var sc = f.severity==='Urgent'?'red':f.severity==='Warning'?'yellow':'blue';
          return [f.name, f.roll, f.flag, '<span class="badge badge-'+sc+'">'+f.severity+'</span>',
            f.raisedBy, f.date,
            '<button class="btn btn-sm" onclick="adminResolveFlag('+f.studentId+')">Resolve</button>'];
        }))
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Lifecycle Stage Distribution</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('Applied', 85, '')
    + widgetBar('Enrolled', 78, 'bar-fill-green')
    + widgetBar('Active', 94, 'bar-fill-green')
    + widgetBar('Alumni', 100, 'bar-fill-green')
    + '</div></div>';
}

/* Admin: Admissions & Enrollment Management */
function buildAdminAdmissions() {
  var db = dbGet();
  var admissions = db.admissions || [];
  return '<div class="module-header"><div class="module-title">Admissions &amp; Enrollment Management</div>'
    + '<div class="module-sub">Automated workflows: application intake → eligibility → document processing → seat allocation. Demographic analytics and conversion dashboards.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Applications', '1,842', 'This cycle', 'up')
    + widgetKpi('Conversion Rate', '68%', 'Applied→Enrolled', 'up')
    + widgetKpi('Seats Filled', '96%', 'Across all programs', 'up')
    + widgetKpi('Avg Score', '76.4', 'Entrance percentile', 'neutral')
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Enrollment by Program</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('B.Tech CSE', 96, 'bar-fill-green')
    + widgetBar('B.Tech ECE', 92, 'bar-fill-green')
    + widgetBar('B.Tech ME',  88, '')
    + widgetBar('MBA',        100, 'bar-fill-green')
    + widgetBar('B.Sc',       75, '')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Diversity Metrics</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('Female Students', 42, '')
    + widgetBar('Rural Background', 35, '')
    + widgetBar('Scholarship Holders', 28, 'bar-fill-green')
    + widgetBar('First-Generation', 31, '')
    + '</div></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Recent Applications</h3>'
    + widgetTable(['Applicant','Program','Stage','Score','Applied On','Action'],
        (db.admissions||[]).concat([
          { name:'Sneha Iyer',   program:'B.Tech CSE', stage:'Verified',  score:88, appliedOn:'2026-03-10' },
          { name:'Arjun Das',    program:'MBA',        stage:'Applied',   score:74, appliedOn:'2026-03-12' },
          { name:'Meera Nair',   program:'B.Tech ECE', stage:'Offered',   score:82, appliedOn:'2026-03-08' }
        ]).slice(0,5).map(function(a){
          return [a.name, a.program, sbadge(a.stage||'Applied'), a.score, a.appliedOn||'2026-03-'+Math.floor(Math.random()*14+1),
            '<button class="btn btn-sm" onclick="showToast(\'Profile opened for '+a.name+'\')">View</button>'];
        }))
    + '</div>';
}

/* Admin: Academic Management */
function buildAdminAcademic() {
  var db = dbGet();
  var courses = db.courses || [];
  var cos = db.courseOutcomes || [];
  return '<div class="module-header"><div class="module-title">Academic Management</div>'
    + '<div class="module-sub">Course scheduling with conflict detection, grading tools, curriculum management, and accreditation outcome tracking (OBE/NBA/NAAC).</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Active Courses', courses.length, 'This semester', 'up')
    + widgetKpi('COs Defined', cos.length, 'Across ' + courses.length + ' courses', 'up')
    + widgetKpi('Timetable Conflicts', '0', 'Last checked today', 'up')
    + widgetKpi('OBE Compliance', '78%', 'Courses fully tagged', 'neutral')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Course Registry with CO Status</h3>'
    + widgetTable(['Code','Course','Dept','Faculty','Credits','COs','OBE Status'],
        courses.map(function(c){
          var coCnt = cos.filter(function(co){return co.courseId===c.code;}).length;
          var obeStatus = coCnt>0?'<span class="badge badge-green">Tagged</span>':'<span class="badge badge-red">Untagged</span>';
          return [c.code, c.name, c.dept, c.faculty, c.credits+'cr', coCnt, obeStatus];
        }))
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">NAAC Criteria Attainment Progress</h3>'
    + '<div class="bar-chart-wrap">'
    + (db.naacCriteria||[]).map(function(nc){
        return widgetBar(nc.criterion.split('—')[0].trim(), nc.achieved, nc.achieved>=80?'bar-fill-green':nc.achieved>=60?'':'');
      }).join('')
    + '</div></div>';
}

/* Admin: Financial Management */
function buildAdminFinancial() {
  var db = dbGet();
  var fin = db.financialSummary || EXT_SEED.financialSummary;
  var totalRev = fin.tuitionRevenue + fin.hostelRevenue + fin.otherRevenue;
  var totalExp = fin.salaryExpense + fin.infraExpense + fin.adminExpense + fin.researchExpense;
  var surplus  = totalRev - totalExp;
  function cr(n){ return '₹' + (n/10000000).toFixed(2) + ' Cr'; }
  return '<div class="module-header"><div class="module-title">Financial Management</div>'
    + '<div class="module-sub">Integrated budgeting, general ledger, fee collection, invoicing, scholarships, payment gateways with audit trails and real-time dashboards.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Total Revenue', cr(totalRev), 'Current FY', 'up')
    + widgetKpi('Total Expenditure', cr(totalExp), 'Current FY', 'neutral')
    + widgetKpi('Surplus', cr(surplus), 'Budget health', surplus>0?'up':'down')
    + widgetKpi('Collection Rate', fin.collectionPct+'%', 'Fee collected on time', fin.collectionPct>=80?'up':'down')
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Revenue Breakdown</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('Tuition Fees', Math.round(fin.tuitionRevenue/totalRev*100), 'bar-fill-green')
    + widgetBar('Hostel Fees',  Math.round(fin.hostelRevenue/totalRev*100), '')
    + widgetBar('Other Income', Math.round(fin.otherRevenue/totalRev*100), '')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Expenditure Breakdown</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('Salaries',      Math.round(fin.salaryExpense/totalExp*100), '')
    + widgetBar('Infrastructure',Math.round(fin.infraExpense/totalExp*100), '')
    + widgetBar('Administration',Math.round(fin.adminExpense/totalExp*100), '')
    + widgetBar('Research',      Math.round(fin.researchExpense/totalExp*100), 'bar-fill-green')
    + '</div></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Budget Utilisation</h3>'
    + '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px"><span>Overall Budget Utilisation</span><strong>' + fin.budgetUtilPct + '%</strong></div>'
    + '<div class="progress-bar"><div class="progress-fill progress-fill-green" style="width:'+fin.budgetUtilPct+'%"></div></div>'
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-sm btn-primary" onclick="showToast(\'Financial report exported as PDF\')">Export PDF Report</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'Excel ledger downloaded\')">Download Ledger (Excel)</button>'
    + '</div></div>';
}

/* Admin: Approval Workflow Centre */
function buildAdminApprovals() {
  var db = dbGet();
  var queue = db.approvalQueue || [];
  return '<div class="module-header"><div class="module-title">Approval Workflow Centre</div>'
    + '<div class="module-sub">Centralised approval queue for budget requests, leave, procurement, and events with full audit trail.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Pending Approvals', queue.filter(function(a){return a.status==='Pending';}).length, 'Awaiting action', 'down')
    + widgetKpi('Approved This Week', queue.filter(function(a){return a.status==='Approved';}).length, 'Processed', 'up')
    + widgetKpi('Avg. Resolution', '1.8 days', 'This month', 'neutral')
    + widgetKpi('SLA Breach', '0', 'On track', 'up')
    + '</div>'
    + '<div class="panel">'
    + widgetTable(['Type','Requester','Dept','Amount','Description','Status','Action'],
        queue.map(function(q){
          var act = q.status==='Pending'
            ? '<button class="btn btn-sm btn-success" onclick="adminApproveWorkflow('+q.id+',true)">Approve</button> '
            + '<button class="btn btn-sm btn-danger" onclick="adminApproveWorkflow('+q.id+',false)">Reject</button>'
            : sbadge(q.status);
          return [q.type, q.requester, q.dept, q.amount?'₹'+q.amount.toLocaleString():'—',
            q.description.substring(0,35)+'…', sbadge(q.status), act];
        }))
    + '</div>';
}

/* Admin: Multi-Campus Overview */
function buildAdminMultiCampus() {
  var db = dbGet();
  return '<div class="module-header"><div class="module-title">Multi-Campus Management</div>'
    + '<div class="module-sub">Centralized oversight across all campuses with data synchronization and comparative performance dashboards.</div></div>'
    + '<div class="panel">'
    + widgetTable(['Campus','Location','Students','Faculty','Status','Action'],
        (db.campuses||[]).map(function(c){
          return [c.name, c.location, c.students, c.faculty, sbadge(c.status),
            '<button class="btn btn-sm" onclick="showToast(\''+c.name+' dashboard opened\')">View</button>'];
        }))
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Students per Campus</h3>'
    + '<div class="bar-chart-wrap">'
    + (db.campuses||[]).map(function(c){
        var tot = (db.campuses||[]).reduce(function(s,x){return s+x.students;},0);
        return widgetBar(c.name.split('—')[0].trim(), Math.round(c.students/tot*100), 'bar-fill-green');
      }).join('')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Automation Engine</h3>'
    + '<p style="color:var(--text2);font-size:14px;margin-bottom:14px">Workflow automation rules active across all campuses.</p>'
    + '<div style="display:flex;flex-direction:column;gap:10px">'
    + buildAutoRule('Auto-fee reminder after 7 days overdue', true)
    + buildAutoRule('Attendance shortage alert at 75%', true)
    + buildAutoRule('CO attainment gap notification to HOD', true)
    + buildAutoRule('Monthly accreditation evidence reminder', false)
    + '</div></div></div>';
}
function buildAutoRule(label, active) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--surface2);border-radius:var(--r-sm)">'
    + '<span style="font-size:13px">' + label + '</span>'
    + '<span class="badge badge-' + (active?'green':'gray') + '">' + (active?'Active':'Off') + '</span>'
    + '</div>';
}

/* Admin: OBE Programme-Level Dashboard */
function buildAdminOBE() {
  var db = dbGet();
  var pos = db.programOutcomes || [];
  var coAtt = db.coAttainment || [];
  /* Aggregate PO attainment from CO-PO mapping */
  var poScores = {};
  pos.forEach(function(po){ poScores[po.code] = { total:0, count:0 }; });
  (db.coPOMapping||[]).forEach(function(m){
    var att = coAtt.find(function(a){return a.courseId===m.courseId&&a.coCode===m.coCode;});
    if (!att) return;
    Object.keys(m.mappings).forEach(function(poCode){
      var str = m.mappings[poCode];
      if (str > 0 && poScores[poCode]) {
        poScores[poCode].total += att.combined * str;
        poScores[poCode].count += str;
      }
    });
  });
  var poRows = pos.map(function(po){
    var sc = poScores[po.code];
    var avg = sc && sc.count > 0 ? Math.round(sc.total/sc.count) : '—';
    var lvl = typeof avg === 'number' ? obeLevel(avg, 60) : '—';
    return [po.code, po.description.substring(0,40), po.category,
      typeof avg==='number'?avg+'%':'—',
      typeof lvl==='number'?obeLevelBadge(lvl,avg):'<span class="badge badge-gray">No data</span>'];
  });
  return '<div class="module-header"><div class="module-title">OBE Programme-Level Dashboard</div>'
    + '<div class="module-sub">Institution-wide CO/PO attainment view. Aggregated from all course submissions for NBA/NAAC accreditation.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('POs Measured', pos.length, 'NBA standard 12', 'up')
    + widgetKpi('Courses OBE-Tagged', coAtt.length > 0 ? db.courses.filter(function(c){return coAtt.some(function(a){return a.courseId===c.code;});}).length : 0, 'With CO data', 'up')
    + widgetKpi('Avg CO Attainment', coAtt.length ? Math.round(coAtt.reduce(function(s,a){return s+a.combined;},0)/coAtt.length)+'%' : '—', 'All courses', 'neutral')
    + widgetKpi('COs Below Target', coAtt.filter(function(a){return a.status==='Not Met';}).length, 'Need improvement', 'down')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Programme Outcome Attainment</h3>'
    + widgetTable(['PO','Description','Category','Attainment','Level'], poRows)
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">NAAC Criterion Progress</h3>'
    + '<div class="bar-chart-wrap">'
    + (db.naacCriteria||[]).map(function(nc){
        return widgetBar(nc.criterion.split('—')[0].trim(), nc.achieved, nc.achieved>=80?'bar-fill-green':'');
      }).join('')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CO Status Summary — All Courses</h3>'
    + widgetTable(['Course','CO','Combined %','Level','Status'],
        coAtt.map(function(a){
          return [a.courseId, a.coCode, a.combined+'%', obeLevelBadge(a.level,a.combined), obeStatusBadge(a.status)];
        }))
    + '</div></div>';
}

/* Admin: Resource & Asset Booking */
function buildAdminResources() {
  var db = dbGet();
  return '<div class="module-header"><div class="module-title">Resource &amp; Asset Management</div>'
    + '<div class="module-sub">Facility bookings, classroom/lab/transport allocation, inventory procurement, and maintenance scheduling.</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Upcoming Resource Bookings</h3>'
    + widgetTable(['Resource','Booked By','Dept','Date','Time','Purpose','Status'],
        (db.resourceBookings||[]).map(function(b){
          return [b.resource, b.bookedBy, b.dept, b.date, b.time, b.purpose, sbadge(b.status)];
        }))
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-primary" onclick="adminAddBooking()">+ New Booking</button>'
    + '</div></div>'
    + '<div class="grid grid-3">'
    + buildResourceCard('Classrooms', '18/22', 'In use now', 'blue')
    + buildResourceCard('Labs', '8/12', 'In use now', 'green')
    + buildResourceCard('Seminar Halls', '2/4', 'In use now', 'accent')
    + '</div>';
}
function buildResourceCard(name, usage, sub, color) {
  return '<div class="kpi-card"><div class="kpi-label">'+name+'</div>'
    +'<div class="kpi-value" style="-webkit-text-fill-color:var(--'+color+')">'+ usage+'</div>'
    +'<span class="kpi-sub kpi-neutral">'+sub+'</span></div>';
}

/* ============================================================
   ADMIN SUB-SCHEMAS — Accounts, Admissions, Railway Concession
   ============================================================ */

function findStudentById(db, id) {
  return (db.students || []).find(function(s){ return s.id === id; }) || {};
}

function buildAccountOverview() {
  var db = dbGet();
  var items = db.feeOutstanding || [];
  var pending = items.filter(function(i){ return i.status !== 'Paid'; });
  var overdue = items.filter(function(i){ return i.status === 'Overdue'; });
  var totalDue = pending.reduce(function(s,i){ return s + (i.amount || 0); }, 0);
  return '<div class="module-header"><div class="module-title">Accounts Dashboard</div>'
    + '<div class="module-sub">Student fee status, outstanding balances, and quick finance insights.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Outstanding Students', pending.length, 'Fees pending', pending.length ? 'down' : 'up')
    + widgetKpi('Total Due', '₹' + totalDue.toLocaleString(), 'Across all students', pending.length ? 'down' : 'up')
    + widgetKpi('Overdue', overdue.length, 'Needs follow-up', overdue.length ? 'down' : 'neutral')
    + widgetKpi('Paid Today', items.filter(function(i){ return i.status === 'Paid'; }).length, 'Transactions logged', 'up')
    + '</div>';
}

function buildAdmissionsOverview() {
  var db = dbGet();
  var cats = db.studentCategories || [];
  var docs = db.studentDocuments || [];
  var pendingDocs = docs.filter(function(d){ return d.status !== 'Verified'; });
  return '<div class="module-header"><div class="module-title">Admissions Dashboard</div>'
    + '<div class="module-sub">Admissions pipeline with caste/category and document verification.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Applicants', (db.admissions || []).length, 'Current cycle', 'up')
    + widgetKpi('Students Categorized', cats.length, 'Caste/Category entries', 'up')
    + widgetKpi('Docs Pending', pendingDocs.length, 'Awaiting verification', pendingDocs.length ? 'down' : 'up')
    + widgetKpi('Docs Verified', docs.length - pendingDocs.length, 'Completed', 'up')
    + '</div>';
}

function buildRailwayOverview() {
  var db = dbGet();
  var reqs = db.concessionRequests || [];
  var scheduled = reqs.filter(function(r){ return (r.appointmentDate || r.status === 'Scheduled'); });
  var pending = reqs.filter(function(r){ return !r.appointmentDate && r.status !== 'Scheduled'; });
  return '<div class="module-header"><div class="module-title">Railway Concession Dashboard</div>'
    + '<div class="module-sub">Track concession requests and assign appointment dates and time slots.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Requests', reqs.length, 'Total submitted', 'up')
    + widgetKpi('Scheduled', scheduled.length, 'Appointments fixed', scheduled.length ? 'up' : 'neutral')
    + widgetKpi('Pending', pending.length, 'Need appointment date', pending.length ? 'down' : 'up')
    + widgetKpi('Completed', reqs.filter(function(r){ return r.status === 'Completed'; }).length, 'Closed', 'neutral')
    + '</div>';
}

function buildAccountOutstanding() {
  var db = dbGet();
  var rows = (db.feeOutstanding || []).map(function(o){
    var s = findStudentById(db, o.studentId);
    var name = s.name || '—';
    var roll = s.roll || '—';
    var status = o.status || 'Pending';
    var action = status === 'Paid'
      ? '<span class="badge badge-green">Paid</span>'
      : '<button class="btn btn-sm btn-success" onclick="accountMarkPaid('+o.id+')">Mark Paid</button>';
    return [
      name,
      roll,
      o.type || 'Fee',
      '₹' + Number(o.amount || 0).toLocaleString(),
      o.dueDate || '—',
      sbadge(status),
      action
    ];
  });

  return '<div class="module-header"><div class="module-title">Outstanding Fees</div>'
    + '<div class="module-sub">Track pending and overdue student payments. Mark items as paid once collected.</div></div>'
    + widgetTable(['Student','Roll','Fee Type','Amount','Due Date','Status','Action'], rows);
}

function buildAdmissionsCasteCategory() {
  var db = dbGet();
  var rows = (db.studentCategories || []).map(function(c){
    var s = findStudentById(db, c.studentId);
    return [
      s.name || '—',
      s.roll || '—',
      s.dept || '—',
      c.category || '—',
      c.caste || '—'
    ];
  });
  return '<div class="module-header"><div class="module-title">Student Caste / Category</div>'
    + '<div class="module-sub">Admissions category details for enrolled students.</div></div>'
    + widgetTable(['Student','Roll','Dept','Category','Caste'], rows);
}

function buildAdmissionsDocuments() {
  var db = dbGet();
  var rows = (db.studentDocuments || []).map(function(d){
    var s = findStudentById(db, d.studentId);
    return [
      s.name || '—',
      s.roll || '—',
      d.type || '—',
      sbadge(d.status || 'Pending'),
      d.submittedOn || '—'
    ];
  });
  return '<div class="module-header"><div class="module-title">Student Documents</div>'
    + '<div class="module-sub">View submitted documents and verification status.</div></div>'
    + widgetTable(['Student','Roll','Document','Status','Submitted On'], rows);
}


function formatTimeLabel(h, m) {
  var ampm = h >= 12 ? 'PM' : 'AM';
  var h12 = h % 12;
  if (h12 === 0) h12 = 12;
  var mm = (m < 10 ? '0' : '') + m;
  return h12 + ':' + mm + ' ' + ampm;
}

function formatTimeSlot(value) {
  if (!value) return '—';
  var parts = value.split(':');
  if (parts.length < 2) return value;
  var h = parseInt(parts[0], 10);
  var m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return value;
  var endH = h;
  var endM = m + 30;
  if (endM >= 60) { endM -= 60; endH += 1; }
  return formatTimeLabel(h, m) + ' - ' + formatTimeLabel(endH, endM);
}

function buildTimeSlotOptions(selected) {
  var opts = '<option value="">Select</option>';
  var h = 9;
  var m = 30;
  while (true) {
    var hh = (h < 10 ? '0' : '') + h;
    var mm = (m < 10 ? '0' : '') + m;
    var val = hh + ':' + mm;
    var label = formatTimeSlot(val);
    var sel = selected === val ? ' selected' : '';
    opts += '<option value="' + val + '"' + sel + '>' + label + '</option>';
    if (h === 16 && m === 30) break;
    m += 30;
    if (m >= 60) { m = 0; h += 1; }
  }
  return opts;
}

function buildRailwayConcessionAppointments() {
  var db = dbGet();
  var rows = (db.concessionRequests || []).map(function(r){
    var s = findStudentById(db, r.studentId);
    var status = r.appointmentDate ? 'Scheduled' : (r.status || 'Requested');
    var inputId = 'rc-appt-' + r.id;
    var timeId = 'rc-time-' + r.id;
    var btnLabel = r.appointmentDate ? 'Update' : 'Set';
    var action = '<div style="display:flex;gap:6px;align-items:center">'
      + '<input type="date" class="form-input" id="'+inputId+'" value="'+(r.appointmentDate || '')+'"/>'
      + '<select class="form-select" id="'+timeId+'">'+buildTimeSlotOptions(r.appointmentTime)+'</select>'
      + '<button class="btn btn-sm btn-primary" onclick="railwaySetAppointment('+r.id+')">'+btnLabel+'</button>'
      + '</div>';
    return [
      s.name || '—',
      s.roll || '—',
      r.route || '—',
      r.requestDate || '—',
      sbadge(status),
      r.appointmentDate || '—',
      formatTimeSlot(r.appointmentTime),
      action
    ];
  });

  return '<div class="module-header"><div class="module-title">Railway Concession Scheduling</div>'
    + '<div class="module-sub">Students request concessions; assign appointment date and time slot for verification.</div></div>'
    + widgetTable(['Student','Roll','Route','Requested On','Status','Date','Time Slot','Action'], rows);
}

/* ══════════════════════════════════════════════════════════
   HEAD EXTENDED SECTIONS
   ══════════════════════════════════════════════════════════ */

/* Head: Student Enrollment Statistics */
function buildPrincipalEnrollment() {
  return '<div class="module-header"><div class="module-title">Student Enrollment Statistics</div>'
    + '<div class="module-sub">Enrollment trends, demographic analytics, diversity metrics, and conversion funnel reporting.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Total Enrolled', '1,200', 'Active students', 'up')
    + widgetKpi('New This Year', '342', '+8% vs last year', 'up')
    + widgetKpi('Dropout Rate', '2.1%', 'Below national avg', 'up')
    + widgetKpi('Waitlisted', '48', 'Pending seats', 'neutral')
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">4-Year Enrollment Trend</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('2022-23', 68, '')
    + widgetBar('2023-24', 74, '')
    + widgetBar('2024-25', 81, 'bar-fill-green')
    + widgetBar('2025-26', 88, 'bar-fill-green')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Enrollment by Department</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('CSE', 96, 'bar-fill-green')
    + widgetBar('ECE', 92, 'bar-fill-green')
    + widgetBar('ME',  88, '')
    + widgetBar('Civil',84, '')
    + widgetBar('MBA', 100, 'bar-fill-green')
    + '</div></div></div>';
}

/* Head: OBE Programme Overview */
function buildPrincipalOBE() {
  var db = dbGet();
  var coAtt = db.coAttainment || [];
  var metCnt    = coAtt.filter(function(a){return a.status==='Met';}).length;
  var notMetCnt = coAtt.filter(function(a){return a.status==='Not Met';}).length;
  var borderCnt = coAtt.filter(function(a){return a.status==='Borderline';}).length;
  return '<div class="module-header"><div class="module-title">Academic Progress &amp; OBE Monitoring</div>'
    + '<div class="module-sub">CO/PO attainment institution-wide, academic progress monitoring, and accreditation readiness.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('COs Met Target', metCnt, 'Out of '+coAtt.length+' measured', 'up')
    + widgetKpi('COs Below Target', notMetCnt, 'Require action plans', notMetCnt>0?'down':'up')
    + widgetKpi('Borderline COs', borderCnt, 'Need monitoring', borderCnt>0?'neutral':'up')
    + widgetKpi('NAAC Readiness', '64%', 'Evidence gathered', 'neutral')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CO Attainment by Course</h3>'
    + widgetTable(['Course','CO','Direct %','Indirect %','Combined','Level','Status'],
        coAtt.map(function(a){
          return [a.courseId, a.coCode, a.direct+'%', a.indirect+'%', a.combined+'%',
            obeLevelBadge(a.level, a.combined), obeStatusBadge(a.status)];
        }))
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Action Plans Submitted</h3>'
    + widgetTable(['Faculty','Course','CO','Issue','Action','Target Sem','Status'],
        (db.actionPlans||[]).map(function(p){
          return [p.faculty.split(' ').pop(), p.course, p.coCode,
            p.issue.substring(0,30)+'…', p.action.substring(0,35)+'…',
            p.targetSem, sbadge(p.status)];
        }))
    + '</div>';
}

/* Head: Institutional Attendance Reports */
function buildPrincipalAttendance() {
  var db = dbGet();
  return '<div class="module-header"><div class="module-title">Institutional Attendance Reports</div>'
    + '<div class="module-sub">Geofence-verified attendance analysis across departments, courses, and batches. Shortage flags and trend analysis.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Overall Avg', '89%', 'Across all depts', 'up')
    + widgetKpi('Below 75%', '3 students', 'Shortage risk', 'down')
    + widgetKpi('Best Dept', 'CSE — 92%', 'This month', 'up')
    + widgetKpi('Lowest Course', 'CSE401 CO3', '81%', 'neutral')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Course-wise Attendance</h3>'
    + widgetTable(['Course','Class','Date','Present','Total','%','Status'],
        (db.attendance||[]).map(function(a){
          var pct = a.pct || Math.round((a.present/(a.total||a.present))*100);
          var sc = pct>=85?'green':pct>=75?'yellow':'red';
          return [a.course, a.cls, a.date, a.present, a.total||a.present,
            '<span class="badge badge-'+sc+'">'+pct+'%</span>', sbadge('Active')];
        }))
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="showToast(\'Attendance report exported as PDF\')">Export Attendance Report</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'Excel file downloaded\')">Download Excel</button>'
    + '</div>';
}

/* Head: Academic Calendar */
function buildPrincipalCalendar() {
  var db = dbGet();
  return '<div class="module-header"><div class="module-title">Academic Calendar</div>'
    + '<div class="module-sub">View all scheduled exams, holidays, events, placements, and compliance dates for the semester.</div></div>'
    + '<div class="panel">'
    + widgetTable(['Event','Start','End','Type','Dept'],
        (db.calendar||[]).map(function(c){
          var tc = c.type==='Exam'?'red':c.type==='Holiday'?'green':c.type==='Placement'?'blue':c.type==='Compliance'?'purple':'accent';
          return [c.event, c.start, c.end, '<span class="badge badge-'+tc+'">'+c.type+'</span>', c.dept];
        }))
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-primary" onclick="principalAddCalEvent()">+ Add Event</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'Calendar exported as PDF\')">Export Calendar</button>'
    + '</div></div>';
}

/* Head: Communication & Notifications Hub */
function buildPrincipalComms() {
  var db = dbGet();
  return '<div class="module-header"><div class="module-title">Communications &amp; Notification Hub</div>'
    + '<div class="module-sub">Unified notification system via email, SMS, mobile app, and portals. Post institution-wide announcements with priority levels.</div></div>'
    + '<div class="panel"><div class="form-section-title">Post Institution Announcement</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Title</label><input class="form-input" id="pc-title" placeholder="Announcement title…"/></div>'
    + '<div class="form-group"><label class="form-label">Audience</label><select class="form-select" id="pc-audience"><option>All</option><option>Students</option><option>Faculty</option><option>HODs</option><option>Parents</option></select></div>'
    + '<div class="form-group"><label class="form-label">Channel</label><select class="form-select" id="pc-channel"><option>All Channels</option><option>Email</option><option>SMS</option><option>App</option><option>Portal</option></select></div>'
    + '<div class="form-group"><label class="form-label">Priority</label><select class="form-select" id="pc-priority"><option>High</option><option>Medium</option><option>Low</option></select></div>'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Message</label><textarea class="form-textarea" id="pc-msg" rows="3" placeholder="Type your announcement…"></textarea></div>'
    + '</div><div class="form-actions"><button class="btn btn-primary" onclick="principalPostAnnouncement()">📣 Post Announcement</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Recent Announcements</h3>'
    + widgetTable(['Title','Author','Audience','Channel','Priority','Date'],
        (db.announcements||[]).map(function(a){
          var pc = a.priority==='High'?'red':a.priority==='Medium'?'yellow':'gray';
          return [a.title.substring(0,30)+'…', a.author, a.audience, a.channel||'Email',
            '<span class="badge badge-'+pc+'">'+a.priority+'</span>', a.date];
        }))
    + '</div>';
}

/* ══════════════════════════════════════════════════════════
   FACULTY OBE EXTENDED SECTIONS  (Doc 2 — Core Features)
   ══════════════════════════════════════════════════════════ */

/* Faculty: CO Management & Viewing */
function buildFacultyCO() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var cos = db.courseOutcomes || [];
  return '<div class="module-header"><div class="module-title">Course Outcome (CO) Management</div>'
    + '<div class="module-sub">View and edit COs for your assigned courses. Define Bloom\'s levels. Submit to HOD for approval. Version history tracked.</div></div>'
    + myCourses.map(function(c){
        var coCOs = cos.filter(function(co){return co.courseId===c.code;});
        return '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
          + '<h3 style="font-family:var(--font-head)">' + c.code + ' — ' + c.name + '</h3>'
          + '<span class="badge badge-blue">'+coCOs.length+' COs</span></div>'
          + widgetTable(['CO Code','Description','Bloom\'s Level','Target %','Action'],
              coCOs.map(function(co){
                var bc = co.bloom==='Analysis'||co.bloom==='Evaluation'?'purple':co.bloom==='Synthesis'?'blue':co.bloom==='Application'?'green':'accent';
                return [co.code, co.description.substring(0,45)+'…',
                  '<span class="badge badge-'+bc+'">'+co.bloom+'</span>', co.target+'%',
                  '<button class="btn btn-sm" onclick="facultyEditCO(\''+c.code+'\',\''+co.code+'\')">Edit</button>'];
              }))
          + '<div class="form-actions" style="margin-top:10px">'
          + '<button class="btn btn-sm btn-primary" onclick="facultyAddCO(\''+c.code+'\')">+ Add CO</button>'
          + '<button class="btn btn-sm" onclick="showToast(\'CO changes submitted to HOD for approval\')">Submit to HOD</button>'
          + '</div></div>';
      }).join('');
}

/* Faculty: CO-PO Mapping View */
function buildFacultyCOPO() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var mappings = db.coPOMapping || [];
  var pos = (db.programOutcomes||[]).slice(0,6); /* Show PO1-PO6 for space */

  return '<div class="module-header"><div class="module-title">CO-PO Mapping Contribution</div>'
    + '<div class="module-sub">View predefined CO-PO mappings for your courses. Suggest adjustments. Tag sessions/lectures to COs for coverage tracking.</div></div>'
    + myCourses.map(function(c){
        var myMappings = mappings.filter(function(m){return m.courseId===c.code;});
        if (!myMappings.length) return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:8px">'+c.code+' — '+c.name+'</h3><p style="color:var(--text3);font-size:13px">No CO-PO mapping defined yet.</p></div>';
        /* Build matrix table */
        var headers = ['CO'].concat(pos.map(function(p){return p.code;}));
        var rows = myMappings.map(function(m){
          var cells = [m.coCode].concat(pos.map(function(p){
            var str = m.mappings[p.code]||0;
            var colors = ['—','<span class="badge badge-gray">1</span>','<span class="badge badge-yellow">2</span>','<span class="badge badge-green">3</span>'];
            return colors[str]||'—';
          }));
          return cells;
        });
        /* Build radar SVG from mapping strengths */
        var avgScores = pos.map(function(po){
          var total=0, cnt=0;
          myMappings.forEach(function(m){ total+=(m.mappings[po.code]||0); cnt++; });
          return cnt?Math.round(total/cnt*33.3):0;
        });
        return '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">'+c.code+' — CO-PO Matrix (3=High, 2=Med, 1=Low)</h3>'
          + '<div style="display:grid;grid-template-columns:1fr auto;gap:20px;align-items:start">'
          + widgetTable(headers, rows)
          + '<div style="text-align:center"><div style="font-size:12px;color:var(--text2);margin-bottom:8px">PO Coverage Radar</div>'
          + buildRadarSVG(pos.map(function(p){return p.code;}), avgScores, 100) + '</div>'
          + '</div>'
          + '<div class="form-actions"><button class="btn btn-sm" onclick="showToast(\'CO-PO adjustment submitted to HOD for review\')">Suggest Adjustment</button></div></div>';
      }).join('');
}

/* Faculty: OBE Assessment Tagging & Mark Entry with CO linking */
function buildFacultyOBEMarks() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var coAtt = db.coAttainment || [];
  var items = db.assessmentItems || [];

  return '<div class="module-header"><div class="module-title">OBE Mark Entry &amp; CO Attainment</div>'
    + '<div class="module-sub">Enter marks with CO tagging per question. Auto-calculates per-CO attainment. Preview before submitting to HOD for roll-up.</div></div>'
    + '<div class="panel"><div class="form-section-title">Enter Marks with CO Tagging</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="obe-course" onchange="obeUpdateCOs()">'
    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'
    + '<div class="form-group"><label class="form-label">Exam / Component</label><select class="form-select" id="obe-exam"><option>Mid Semester</option><option>End Semester</option><option>Unit Test 1</option><option>Assignment</option></select></div>'
    + '<div class="form-group"><label class="form-label">Student Roll No</label><input class="form-input" id="obe-roll" placeholder="CSE-101"/></div>'
    + '<div class="form-group"><label class="form-label">Student Name</label><input class="form-input" id="obe-student" placeholder="Priya Sharma"/></div>'
    + '</div>'
    + '<div id="obe-question-rows" style="margin:14px 0">'
    + buildOBEQuestionRows(myCourses.length ? myCourses[0].code : 'CSE301', db)
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="facultyOBESubmitMarks()">Save &amp; Calculate CO Attainment</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'Bulk Excel upload: use template with CO columns\',\'info\')">📥 Bulk Upload (Excel)</button>'
    + '</div></div>'

    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CO Attainment Preview — My Courses</h3>'
    + '<p style="color:var(--text2);font-size:13px;margin-bottom:14px">Live preview before final submission to HOD. Direct attainment from marks; indirect from exit survey.</p>'
    + widgetTable(['Course','CO','Direct %','Indirect %','Combined','Level','Target','Status'],
        coAtt.filter(function(a){
          return myCourses.some(function(c){return c.code===a.courseId;});
        }).map(function(a){
          return [a.courseId, a.coCode, a.direct+'%', a.indirect+'%', a.combined+'%',
            obeLevelBadge(a.level, a.combined), a.target+'%', obeStatusBadge(a.status)];
        }))
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-success" onclick="showToast(\'CO attainment data submitted to HOD for final roll-up\')">📤 Submit to HOD</button>'
    + '</div></div>';
}

function buildOBEQuestionRows(courseCode, db) {
  var items = (db.assessmentItems||[]).filter(function(i){return i.course===courseCode;});
  var cos = (db.courseOutcomes||[]).filter(function(co){return co.courseId===courseCode;});
  var coOptions = cos.map(function(co){return '<option>'+co.code+'</option>';}).join('');
  if (!items.length) items = [
    { qNo:'Q1', coIds:['CO1'], maxMarks:20, bloomLevel:'Analysis' },
    { qNo:'Q2', coIds:['CO2'], maxMarks:20, bloomLevel:'Application' },
    { qNo:'Q3', coIds:['CO3'], maxMarks:10, bloomLevel:'Evaluation' }
  ];
  return '<div class="table-wrap"><table class="table"><thead><tr><th>Question</th><th>CO Tag</th><th>Bloom\'s Level</th><th>Max Marks</th><th>Marks Obtained</th></tr></thead><tbody>'
    + items.map(function(item, i){
        return '<tr>'
          + '<td><strong>'+item.qNo+'</strong></td>'
          + '<td><select class="form-select" style="min-width:80px"><option>'+item.coIds[0]+'</option>'+coOptions+'</select></td>'
          + '<td><select class="form-select" style="min-width:110px"><option>'+item.bloomLevel+'</option><option>Knowledge</option><option>Understanding</option><option>Application</option><option>Analysis</option><option>Synthesis</option><option>Evaluation</option></select></td>'
          + '<td>'+item.maxMarks+'</td>'
          + '<td><input class="form-input" type="number" id="obe-q'+i+'-marks" placeholder="0" max="'+item.maxMarks+'" style="width:70px"/></td>'
          + '</tr>';
      }).join('')
    + '</tbody></table></div>';
}

/* Faculty: Direct & Indirect Attainment View */
function buildFacultyAttainmentView() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var coAtt = db.coAttainment || [];
  var surveys = db.surveyResponses || [];

  return '<div class="module-header"><div class="module-title">CO Attainment — Direct &amp; Indirect</div>'
    + '<div class="module-sub">Combined attainment view: direct (marks-based) + indirect (exit survey). Configure weights and view gap analysis.</div></div>'
    + myCourses.map(function(c){
        var myCoAtt = coAtt.filter(function(a){return a.courseId===c.code;});
        if (!myCoAtt.length) return '<div class="panel"><h3 style="font-family:var(--font-head)">'+c.code+' — No attainment data yet</h3></div>';
        /* Course summary */
        var avgDirect   = Math.round(myCoAtt.reduce(function(s,a){return s+a.direct;},0)/myCoAtt.length);
        var avgIndirect = Math.round(myCoAtt.reduce(function(s,a){return s+a.indirect;},0)/myCoAtt.length);
        var avgCombined = Math.round(myCoAtt.reduce(function(s,a){return s+a.combined;},0)/myCoAtt.length);
        var notMet = myCoAtt.filter(function(a){return a.status==='Not Met';}).length;
        return '<div class="panel">'
          + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">'
          + '<h3 style="font-family:var(--font-head)">'+c.code+' — '+c.name+'</h3>'
          + (notMet>0?'<span class="badge badge-red">'+notMet+' CO'+(notMet>1?'s':'')+' below target</span>':'<span class="badge badge-green">All COs met</span>')
          + '</div>'
          + '<div class="kpi-grid" style="margin-bottom:16px">'
          + widgetKpi('Avg Direct', avgDirect+'%', 'From marks', avgDirect>=70?'up':'down')
          + widgetKpi('Avg Indirect', avgIndirect+'%', 'From surveys', avgIndirect>=70?'up':'neutral')
          + widgetKpi('Avg Combined', avgCombined+'%', '80% direct + 20% indirect', avgCombined>=70?'up':'down')
          + widgetKpi('COs Not Met', notMet, 'Need action plan', notMet>0?'down':'up')
          + '</div>'
          + '<div class="bar-chart-wrap">'
          + myCoAtt.map(function(a){
              return widgetBar(a.coCode+' ('+a.combined+'%)', a.combined, a.status==='Met'?'bar-fill-green':a.combined>=60?'':'');
            }).join('')
          + '</div>'
          + '<div class="form-actions" style="margin-top:14px">'
          + (notMet>0?'<button class="btn btn-sm btn-primary" onclick="facultyCreateActionPlan(\''+c.code+'\')">+ Create Action Plan</button>':'')
          + '<button class="btn btn-sm" onclick="showToast(\'Attainment report downloaded for '+c.code+'\')">Export Report</button>'
          + '</div></div>';
      }).join('');
}

/* Faculty: Exit Survey Entry (Indirect Attainment) */
function buildFacultyExitSurvey() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});

  return '<div class="module-header"><div class="module-title">Course Exit Survey</div>'
    + '<div class="module-sub">Upload or enter student survey responses (Likert 1–5 per CO). Used as indirect attainment component (20% weight).</div></div>'
    + '<div class="panel"><div class="form-section-title">Enter Survey Responses</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="survey-course">'
    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'
    + '<div class="form-group"><label class="form-label">CO</label><select class="form-select" id="survey-co"><option>CO1</option><option>CO2</option><option>CO3</option><option>CO4</option></select></div>'
    + '<div class="form-group"><label class="form-label">Avg Likert Score (1–5)</label><input class="form-input" type="number" id="survey-score" min="1" max="5" step="0.1" placeholder="3.8"/></div>'
    + '<div class="form-group"><label class="form-label">Responses Collected</label><input class="form-input" type="number" id="survey-count" placeholder="45"/></div>'
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="facultySaveSurvey()">Save Survey Data</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'Excel survey template downloaded\',\'info\')">📥 Download Template</button>'
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Survey Summary</h3>'
    + widgetTable(['Course','CO','Avg Score','Normalized %','Responses','Status'],
        (db.surveyResponses||[]).filter(function(s){
          return myCourses.some(function(c){return c.code===s.courseId;});
        }).map(function(s){
          var avg = s.responses.reduce(function(a,b){return a+b;},0)/s.responses.length;
          var norm = Math.round((avg-1)/4*100);
          var sc = norm>=70?'green':norm>=50?'yellow':'red';
          return [s.courseId, s.coCode, avg.toFixed(1)+'/5', '<span class="badge badge-'+sc+'">'+norm+'%</span>', s.responses.length, sbadge('Active')];
        }))
    + '</div>';
}

/* Faculty: Session/Lecture CO Coverage Mapping */
function buildFacultySessionMap() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var sessionLogs = (db.sessionLogs||[]).filter(function(l){return l.faculty===myName;});

  return '<div class="module-header"><div class="module-title">Session / Lecture CO Mapping</div>'
    + '<div class="module-sub">Plan each lecture, tutorial, and lab to specific COs. Track coverage % over semester. Spot uncovered COs early.</div></div>'
    + '<div class="panel"><div class="form-section-title">Log Session</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="sl-course">'
    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'
    + '<div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="sl-date" value="'+new Date().toISOString().split('T')[0]+'"/></div>'
    + '<div class="form-group"><label class="form-label">Topic</label><input class="form-input" id="sl-topic" placeholder="e.g. BFS Traversal"/></div>'
    + '<div class="form-group"><label class="form-label">CO Tag</label><select class="form-select" id="sl-co"><option>CO1</option><option>CO2</option><option>CO3</option><option>CO4</option></select></div>'
    + '<div class="form-group"><label class="form-label">Batch</label><select class="form-select" id="sl-batch"><option>CSE-A</option><option>CSE-B</option><option>CSE-C</option></select></div>'
    + '<div class="form-group"><label class="form-label">Duration (mins)</label><input class="form-input" type="number" id="sl-dur" value="60"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyLogSession()">Log Session</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CO Coverage Progress</h3>'
    + myCourses.map(function(c){
        var cos = (db.courseOutcomes||[]).filter(function(co){return co.courseId===c.code;});
        var logs = sessionLogs.filter(function(l){return l.course===c.code;});
        var totalSessions = logs.length || 1;
        return '<div style="margin-bottom:16px"><div style="font-weight:600;font-size:14px;margin-bottom:8px">'+c.code+'</div>'
          + cos.map(function(co){
              var covered = logs.filter(function(l){return l.coIds.indexOf(co.code)>-1;}).length;
              var pct = Math.round(covered/totalSessions*100);
              return '<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>'+co.code+' — '+co.description.substring(0,35)+'</span><span>'+covered+' sessions</span></div>'
                + '<div class="progress-bar"><div class="progress-fill '+(pct>=80?'progress-fill-green':pct>=50?'':'progress-fill-yellow')+'" style="width:'+pct+'%"></div></div>';
            }).join('')
          + '</div>';
      }).join('')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Session Log</h3>'
    + widgetTable(['Course','Date','Topic','CO','Batch','Duration'],
        sessionLogs.map(function(l){
          return [l.course, l.date, l.topic.substring(0,30), l.coIds.join('+'), l.batch, l.duration+'min'];
        }))
    + '</div>';
}

/* Faculty: Action Plan Logger (Continuous Improvement) */
function buildFacultyActionPlan() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var plans = (db.actionPlans||[]).filter(function(p){return p.faculty===myName;});
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});

  return '<div class="module-header"><div class="module-title">Continuous Improvement &amp; Action Plans</div>'
    + '<div class="module-sub">Log action plans for COs that missed targets. Link improvements to next semester planning. Required for NBA/NAAC self-study.</div></div>'
    + '<div class="panel"><div class="form-section-title">Create Action Plan</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="ap-course">'
    + myCourses.map(function(c){return '<option>'+c.code+'</option>';}).join('')+'</select></div>'
    + '<div class="form-group"><label class="form-label">CO</label><select class="form-select" id="ap-co"><option>CO1</option><option>CO2</option><option>CO3</option><option>CO4</option></select></div>'
    + '<div class="form-group"><label class="form-label">Target Semester</label><select class="form-select" id="ap-sem"><option>2026-27 Odd</option><option>2026-27 Even</option></select></div>'
    + '<div class="form-group"><label class="form-label">Status</label><select class="form-select" id="ap-status"><option>Planned</option><option>In Progress</option><option>Completed</option></select></div>'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Issue Identified</label><textarea class="form-textarea" id="ap-issue" rows="2" placeholder="e.g. CO3 attainment below 65% target…"></textarea></div>'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Corrective Action</label><textarea class="form-textarea" id="ap-action" rows="2" placeholder="e.g. Add 2 extra tutorial sessions; redesign assignment questions…"></textarea></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultySaveActionPlan()">+ Save Action Plan</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Action Plans</h3>'
    + widgetTable(['Course','CO','Issue','Action','Target Sem','Status'],
        plans.map(function(p){
          var sc = p.status==='Completed'?'green':p.status==='In Progress'?'blue':'yellow';
          return [p.course, p.coCode, p.issue.substring(0,30)+'…', p.action.substring(0,35)+'…',
            p.targetSem, '<span class="badge badge-'+sc+'">'+p.status+'</span>'];
        }))
    + '</div>';
}

/* Faculty: Research & Publications with PO Linking */
function buildFacultyResearch() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myPubs = (db.publications||[]).filter(function(p){return p.faculty===myName;});

  return '<div class="module-header"><div class="module-title">Research, Publications &amp; PD Tracking</div>'
    + '<div class="module-sub">Log research contributions linked to Programme Outcomes (POs/PSOs). Used for NBA faculty criteria and annual appraisal.</div></div>'
    + '<div class="panel"><div class="form-section-title">Add Publication / Achievement</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Title</label><input class="form-input" id="rp-title" placeholder="Paper / Book chapter / Patent title…"/></div>'
    + '<div class="form-group"><label class="form-label">Journal / Conference</label><input class="form-input" id="rp-journal" placeholder="IEEE Transactions / ICML 2026…"/></div>'
    + '<div class="form-group"><label class="form-label">Year</label><input class="form-input" type="number" id="rp-year" value="2026"/></div>'
    + '<div class="form-group"><label class="form-label">Type</label><select class="form-select" id="rp-type"><option>Journal</option><option>Conference</option><option>Book Chapter</option><option>Patent</option><option>Award</option></select></div>'
    + '<div class="form-group"><label class="form-label">Linked PO (Optional)</label><select class="form-select" id="rp-po"><option>—</option><option>PO1</option><option>PO2</option><option>PO3</option><option>PO4</option><option>PO5</option></select></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyAddPublication()">+ Add Entry</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Publications</h3>'
    + widgetTable(['Title','Journal','Year','Type','PO Link'],
        myPubs.map(function(p){
          return [p.title.substring(0,40)+'…', p.journal, p.year,
            '<span class="badge badge-blue">'+p.type+'</span>',
            p.poId?'<span class="badge badge-green">'+p.poId+'</span>':'—'];
        }))
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-sm" onclick="showToast(\'Appraisal dossier exported as PDF\')">Export Dossier PDF</button>'
    + '</div></div>';
}

/* Faculty: Leave & Workload + CO Coverage */
function buildFacultyWorkload() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var sessionLogs = (db.sessionLogs||[]).filter(function(l){return l.faculty===myName;});
  var myLeave = (db.leaveRequests||[]).filter(function(l){return l.faculty===myName;});
  var totalCOs = 0, coveredCOs = new Set();
  myCourses.forEach(function(c){
    var cos = (db.courseOutcomes||[]).filter(function(co){return co.courseId===c.code;});
    totalCOs += cos.length;
    sessionLogs.forEach(function(l){if(l.course===c.code) l.coIds.forEach(function(co){coveredCOs.add(c.code+co);});});
  });
  var coCoveragePct = totalCOs > 0 ? Math.round(coveredCOs.size/totalCOs*100) : 0;

  return '<div class="module-header"><div class="module-title">Leave, Duty &amp; Workload</div>'
    + '<div class="module-sub">Manage workload, apply for leave, and view CO coverage % to ensure OBE delivery continuity.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Teaching Load', myCourses.length + ' courses', 'This semester', 'neutral')
    + widgetKpi('CO Coverage', coCoveragePct+'%', 'Sessions mapped to COs', coCoveragePct>=70?'up':'down')
    + widgetKpi('Leave Balance', '12 days', 'Available', 'neutral')
    + widgetKpi('Leave Taken', myLeave.filter(function(l){return l.status==='Approved';}).length + ' requests', 'Approved', 'neutral')
    + '</div>'
    + '<div class="panel"><div class="form-section-title">Apply for Leave</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">From Date</label><input class="form-input" type="date" id="lv-from"/></div>'
    + '<div class="form-group"><label class="form-label">To Date</label><input class="form-input" type="date" id="lv-to"/></div>'
    + '<div class="form-group"><label class="form-label">Reason</label><select class="form-select" id="lv-reason"><option>Personal</option><option>Medical</option><option>Conference</option><option>Family</option></select></div>'
    + '<div class="form-group"><label class="form-label">Alternate Arrangement</label><input class="form-input" id="lv-alt" placeholder="e.g. Prof. Rajiv will cover CSE301…"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facultyApplyLeave()">Submit Leave Request</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Leave History</h3>'
    + widgetTable(['From','To','Days','Reason','Submitted','Status'],
        myLeave.map(function(l){
          return [l.from, l.to, l.days+'d', l.reason, l.appliedOn, sbadge(l.status)];
        }))
    + '</div>';
}

/* Faculty: OBE Self-Report & Export */
function buildFacultyOBEReport() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Prof. Meera Singh';
  var myCourses = (db.courses||[]).filter(function(c){return c.faculty===myName;});
  var coAtt = (db.coAttainment||[]).filter(function(a){
    return myCourses.some(function(c){return c.code===a.courseId;});
  });
  return '<div class="module-header"><div class="module-title">OBE Reports &amp; Self-Service Exports</div>'
    + '<div class="module-sub">Course attainment sheets, student CO performance, appraisal exports. Required for HOD submission and promotion dossiers.</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Course Attainment Summary</h3>'
    + widgetTable(['Course','CO','Direct','Indirect','Combined','Level','Status','Semester'],
        coAtt.map(function(a){
          return [a.courseId, a.coCode, a.direct+'%', a.indirect+'%', a.combined+'%',
            obeLevelBadge(a.level, a.combined), obeStatusBadge(a.status), a.semester];
        }))
    + '</div>'
    + '<div class="grid grid-2">'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Export Options</h3>'
    + '<div style="display:flex;flex-direction:column;gap:10px">'
    + '<button class="btn btn-primary" onclick="showToast(\'Course Attainment PDF generated\')">📄 Course Attainment Sheet (PDF)</button>'
    + '<button class="btn" onclick="showToast(\'Student CO performance Excel downloaded\')">📊 Student CO Performance (Excel)</button>'
    + '<button class="btn" onclick="showToast(\'Action plans report downloaded\')">📋 Action Plans Report (PDF)</button>'
    + '<button class="btn" onclick="showToast(\'Self-appraisal dossier exported\')">🎓 Self-Appraisal Dossier (PDF)</button>'
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Performance at a Glance</h3>'
    + '<div class="bar-chart-wrap">'
    + myCourses.map(function(c){
        var myAtt = coAtt.filter(function(a){return a.courseId===c.code;});
        var avg = myAtt.length ? Math.round(myAtt.reduce(function(s,a){return s+a.combined;},0)/myAtt.length) : 0;
        return widgetBar(c.code, avg, avg>=70?'bar-fill-green':'');
      }).join('')
    + '</div></div></div>';
}

/* ══════════════════════════════════════════════════════════
   HOD EXTENDED SECTIONS
   ══════════════════════════════════════════════════════════ */

/* HOD: OBE Roll-up & Dept CO-PO Attainment */
function buildHODOBE() {
  var db = dbGet();
  var sess = getSession();
  var myDept = sess ? sess.dept : 'CSE';
  var deptCourses = (db.courses||[]).filter(function(c){return c.dept===myDept;});
  var coAtt = (db.coAttainment||[]).filter(function(a){
    return deptCourses.some(function(c){return c.code===a.courseId;});
  });
  var metCnt    = coAtt.filter(function(a){return a.status==='Met';}).length;
  var notMetCnt = coAtt.filter(function(a){return a.status==='Not Met';}).length;

  return '<div class="module-header"><div class="module-title">OBE Roll-Up — ' + myDept + ' Department</div>'
    + '<div class="module-sub">Aggregated CO/PO attainment from all faculty submissions. Final PO attainment calculation for NBA Annual Report.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('COs Measured', coAtt.length, myDept+' dept', 'up')
    + widgetKpi('COs Met Target', metCnt, 'Out of '+coAtt.length, 'up')
    + widgetKpi('COs Below Target', notMetCnt, 'Need action plans', notMetCnt>0?'down':'up')
    + widgetKpi('Action Plans Logged', (db.actionPlans||[]).length, 'Submitted by faculty', 'neutral')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CO Attainment — All ' + myDept + ' Courses</h3>'
    + widgetTable(['Course','CO','Direct %','Indirect %','Combined','Level','Target','Status'],
        coAtt.map(function(a){
          return [a.courseId, a.coCode, a.direct+'%', a.indirect+'%', a.combined+'%',
            obeLevelBadge(a.level, a.combined), a.target+'%', obeStatusBadge(a.status)];
        }))
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Faculty Action Plans</h3>'
    + widgetTable(['Faculty','Course','CO','Issue','Action','Status','Target Sem'],
        (db.actionPlans||[]).map(function(p){
          var sc = p.status==='Completed'?'green':p.status==='In Progress'?'blue':'yellow';
          return [p.faculty.split(' ').pop(), p.course, p.coCode, p.issue.substring(0,30)+'…',
            p.action.substring(0,35)+'…', '<span class="badge badge-'+sc+'">'+p.status+'</span>', p.targetSem];
        }))
    + '<div class="form-actions" style="margin-top:14px">'
    + '<button class="btn btn-primary" onclick="showToast(\'Dept OBE report submitted to Head\')">📤 Submit to Head</button>'
    + '<button class="btn btn-sm" onclick="showToast(\'NBA Annual Report PDF generated\')">Export NBA Report</button>'
    + '</div></div>';
}

/* HOD: Dept Analytics & Reports */
function buildHODAnalytics() {
  var db = dbGet();
  var sess = getSession();
  var myDept = sess ? sess.dept : 'CSE';
  var deptStudents = (db.students||[]).filter(function(s){return s.dept===myDept;});
  var deptFaculty  = (db.faculty||[]).filter(function(f){return f.dept===myDept;});

  return '<div class="module-header"><div class="module-title">Department Academic Reports</div>'
    + '<div class="module-sub">Faculty performance, student CGPA distribution, attendance analytics, and placement data for ' + myDept + ' department.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Avg CGPA', (deptStudents.reduce(function(s,st){return s+st.cgpa;},0)/Math.max(deptStudents.length,1)).toFixed(2), myDept+' dept', 'up')
    + widgetKpi('Avg Attendance', Math.round(deptStudents.reduce(function(s,st){return s+st.attendance;},0)/Math.max(deptStudents.length,1))+'%', 'Geofence verified', 'up')
    + widgetKpi('Faculty Avg Load', Math.round(deptFaculty.reduce(function(s,f){return s+f.load;},0)/Math.max(deptFaculty.length,1))+' hrs', 'per week', 'neutral')
    + widgetKpi('Placement Rate', '82%', myDept+' final year', 'up')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Student Performance — CGPA Distribution</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('9.0 – 10.0', Math.round(deptStudents.filter(function(s){return s.cgpa>=9;}).length/Math.max(deptStudents.length,1)*100), 'bar-fill-green')
    + widgetBar('8.0 – 8.9',  Math.round(deptStudents.filter(function(s){return s.cgpa>=8&&s.cgpa<9;}).length/Math.max(deptStudents.length,1)*100), 'bar-fill-green')
    + widgetBar('7.0 – 7.9',  Math.round(deptStudents.filter(function(s){return s.cgpa>=7&&s.cgpa<8;}).length/Math.max(deptStudents.length,1)*100), '')
    + widgetBar('Below 7.0',  Math.round(deptStudents.filter(function(s){return s.cgpa<7;}).length/Math.max(deptStudents.length,1)*100), '')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Student Detail — ' + myDept + '</h3>'
    + widgetTable(['Name','Roll','Year','CGPA','Attendance','Status'],
        deptStudents.map(function(s){
          var ac = s.attendance>=85?'green':s.attendance>=75?'yellow':'red';
          var gc = s.cgpa>=8?'green':s.cgpa>=7?'blue':'yellow';
          return [s.name, s.roll, s.year, '<span class="badge badge-'+gc+'">'+s.cgpa+'</span>',
            '<span class="badge badge-'+ac+'">'+s.attendance+'%</span>', sbadge(s.status)];
        }))
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="showToast(\'Dept report exported\')">Export Dept Report</button>'
    + '</div>';
}

/* ══════════════════════════════════════════════════════════
   EXTENDED ACTION HANDLERS
   ══════════════════════════════════════════════════════════ */

function adminApproveWorkflow(id, approve) {
  var db = dbGet();
  var item = (db.approvalQueue||[]).find(function(q){return q.id===id;});
  if (!item) return;
  item.status = approve ? 'Approved' : 'Rejected';
  dbSave(db);
  showToast(item.type + (approve?' approved':' rejected'));
  renderRoleSection('role-approvals');
}
function adminResolveFlag(studentId) {
  var db = dbGet();
  db.studentFlags = (db.studentFlags||[]).filter(function(f){return f.studentId!==studentId;});
  dbSave(db); showToast('Flag resolved');
  renderRoleSection('role-lifecycle');
}
function adminAddBooking() { showToast('Resource booking form — add via Facilities module', 'info'); }

function accountMarkPaid(id) {
  var db = dbGet();
  var item = (db.feeOutstanding || []).find(function(x){ return x.id === id; });
  if (!item) return;
  item.status = 'Paid';
  item.paidOn = new Date().toISOString().split('T')[0];
  dbSave(db);
  showToast('Payment marked as paid');
  renderRoleSection('role-account-outstanding');
}

function railwaySetAppointment(id) {
  var db = dbGet();
  var item = (db.concessionRequests || []).find(function(x){ return x.id === id; });
  if (!item) return;
  var input = g('rc-appt-' + id);
  var timeInput = g('rc-time-' + id);
  var date = input ? input.value : '';
  var time = timeInput ? timeInput.value : '';
  if (!date) { showToast('Select appointment date', 'error'); return; }
  if (!time) { showToast('Select appointment time slot', 'error'); return; }
  item.appointmentDate = date;
  item.appointmentTime = time;
  item.status = 'Scheduled';
  dbSave(db);
  showToast('Appointment scheduled');
  renderRoleSection('role-railway-concession');
}

function principalAddCalEvent() {
  var db = dbGet();
  var title = prompt('Event title:');
  if (!title) return;
  db.calendar = db.calendar || [];
  db.calendar.push({ id:Date.now(), event:title, start:'2026-04-01', end:'2026-04-01', type:'Event', dept:'All' });
  dbSave(db); showToast('Calendar event added');
  renderRoleSection('role-calendar');
}
function principalPostAnnouncement() {
  var title = (g('pc-title')||{}).value;
  var audience = (g('pc-audience')||{}).value;
  var channel  = (g('pc-channel')||{}).value;
  var priority = (g('pc-priority')||{}).value;
  var msg      = (g('pc-msg')||{}).value;
  if (!title) { showToast('Enter announcement title', 'error'); return; }
  var db = dbGet(); var sess = getSession();
  (db.announcements = db.announcements||[]).unshift({
    id:Date.now(), title:title, author:sess.name, audience:audience,
    channel:channel, date:new Date().toISOString().split('T')[0], priority:priority, content:msg
  });
  dbSave(db); showToast('Announcement posted to ' + audience);
  renderRoleSection('role-comms');
}

/* Faculty OBE actions */
function obeUpdateCOs() {
  var db = dbGet();
  var courseCode = (g('obe-course')||{}).value || 'CSE301';
  var el = g('obe-question-rows');
  if (el) el.innerHTML = buildOBEQuestionRows(courseCode, db);
}
function facultyOBESubmitMarks() {
  var roll    = (g('obe-roll')||{}).value;
  var student = (g('obe-student')||{}).value;
  if (!roll) { showToast('Enter student roll number', 'error'); return; }
  showToast('Marks saved. CO attainment recalculated. Ready to submit to HOD.');
  renderRoleSection('role-obe-marks');
}
function facultyEditCO(courseCode, coCode) {
  var db = dbGet();
  var co = (db.courseOutcomes||[]).find(function(c){return c.courseId===courseCode&&c.code===coCode;});
  if (!co) return;
  var newDesc = prompt('Edit CO description:', co.description);
  if (newDesc) { co.description = newDesc; dbSave(db); showToast('CO updated — pending HOD approval'); renderRoleSection('role-co-mgmt'); }
}
function facultyAddCO(courseCode) {
  var desc = prompt('New CO description:');
  if (!desc) return;
  var db = dbGet();
  var cos = (db.courseOutcomes||[]).filter(function(c){return c.courseId===courseCode;});
  var newCode = 'CO' + (cos.length + 1);
  db.courseOutcomes = db.courseOutcomes || [];
  db.courseOutcomes.push({ id:Date.now(), courseId:courseCode, code:newCode, description:desc, bloom:'Application', target:70 });
  dbSave(db); showToast('CO'+newCode+' added — pending HOD approval');
  renderRoleSection('role-co-mgmt');
}
function facultySaveSurvey() {
  var course = (g('survey-course')||{}).value;
  var co     = (g('survey-co')||{}).value;
  var score  = parseFloat((g('survey-score')||{}).value)||0;
  var count  = parseInt((g('survey-count')||{}).value)||0;
  if (!score||!count) { showToast('Enter score and response count', 'error'); return; }
  var db = dbGet();
  db.surveyResponses = db.surveyResponses || [];
  /* Build fake response array from avg score */
  var fakeResponses = Array.from({length:count}, function(){ return Math.round(score+Math.random()*0.6-0.3); });
  db.surveyResponses.push({ courseId:course, coCode:co, responses:fakeResponses });
  dbSave(db); showToast('Survey data saved for ' + course + ' ' + co);
  renderRoleSection('role-exit-survey');
}
function facultyLogSession() {
  var course = (g('sl-course')||{}).value;
  var date   = (g('sl-date')||{}).value;
  var topic  = (g('sl-topic')||{}).value;
  var co     = (g('sl-co')||{}).value;
  var batch  = (g('sl-batch')||{}).value;
  var dur    = parseInt((g('sl-dur')||{}).value)||60;
  if (!topic) { showToast('Enter session topic', 'error'); return; }
  var db = dbGet(); var sess = getSession();
  db.sessionLogs = db.sessionLogs || [];
  db.sessionLogs.push({ id:Date.now(), faculty:sess.name, course:course, date:date, topic:topic, coIds:[co], batch:batch, duration:dur });
  dbSave(db); showToast('Session logged: ' + topic);
  renderRoleSection('role-session-map');
}
function facultySaveActionPlan() {
  var course  = (g('ap-course')||{}).value;
  var co      = (g('ap-co')||{}).value;
  var sem     = (g('ap-sem')||{}).value;
  var status  = (g('ap-status')||{}).value;
  var issue   = (g('ap-issue')||{}).value;
  var action  = (g('ap-action')||{}).value;
  if (!issue||!action) { showToast('Fill issue and action fields', 'error'); return; }
  var db = dbGet(); var sess = getSession();
  db.actionPlans = db.actionPlans || [];
  db.actionPlans.push({ id:Date.now(), faculty:sess.name, course:course, coCode:co, semester:'2025-26 Even', issue:issue, action:action, targetSem:sem, status:status, createdOn:new Date().toISOString().split('T')[0] });
  dbSave(db); showToast('Action plan saved for ' + course + ' ' + co);
  renderRoleSection('role-action-plan');
}
function facultyCreateActionPlan(courseCode) {
  /* Pre-fill and navigate to action plan section */
  renderRoleSection('role-action-plan');
  setTimeout(function(){
    var el = g('ap-course');
    if (el) el.value = courseCode;
    showToast('Fill in the action plan details below', 'info');
  }, 200);
}
function facultyAddPublication() {
  var title   = (g('rp-title')||{}).value;
  var journal = (g('rp-journal')||{}).value;
  var year    = parseInt((g('rp-year')||{}).value)||2026;
  var type    = (g('rp-type')||{}).value;
  var po      = (g('rp-po')||{}).value;
  if (!title) { showToast('Enter publication title', 'error'); return; }
  var db = dbGet(); var sess = getSession();
  db.publications = db.publications || [];
  db.publications.push({ id:Date.now(), faculty:sess.name, title:title, journal:journal||'—', year:year, type:type, poId:po!=='—'?po:null });
  dbSave(db); showToast('Publication added: ' + title.substring(0,40));
  renderRoleSection('role-research');
}
function facultyApplyLeave() {
  var from   = (g('lv-from')||{}).value;
  var to     = (g('lv-to')||{}).value;
  var reason = (g('lv-reason')||{}).value;
  if (!from||!to) { showToast('Select leave dates', 'error'); return; }
  var days = Math.round((new Date(to)-new Date(from))/(1000*60*60*24))+1;
  var db = dbGet(); var sess = getSession();
  db.leaveRequests = db.leaveRequests || [];
  db.leaveRequests.push({ id:Date.now(), faculty:sess.name, dept:sess.dept, from:from, to:to, days:days, reason:reason, status:'Pending', appliedOn:new Date().toISOString().split('T')[0] });
  dbSave(db); showToast('Leave request submitted to HOD ('+days+' days)');
  renderRoleSection('role-workload');
}

/* ══════════════════════════════════════════════════════════
   REGISTER ALL NEW SECTIONS with SECTION_BUILDERS and ROLE_NAV
   ══════════════════════════════════════════════════════════ */

/* ============================================================
   Student Management System Features (HOD + Faculty)
   Adds: Defaulters, CIA/ESE, Behavior, Reports/Export
   Keeps existing UI shell; uses role nav + panels.
   ============================================================ */

function smCsvEscape(val) {
  var s = (val === null || val === undefined) ? '' : String(val);
  if (s.indexOf('"') > -1) s = s.replace(/"/g, '""');
  if (s.indexOf(',') > -1 || s.indexOf('\n') > -1) s = '"' + s + '"';
  return s;
}

function smDownloadCSV(filename, headers, rows) {
  var lines = [];
  lines.push(headers.map(smCsvEscape).join(','));
  rows.forEach(function(r) { lines.push(r.map(smCsvEscape).join(',')); });
  var blob = new Blob([lines.join('\n')], { type:'text/csv;charset=utf-8;' });
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(function() { URL.revokeObjectURL(url); }, 300);
}

function smGradeFromPct(pct) {
  if (pct >= 90) return 'O';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B+';
  if (pct >= 50) return 'B';
  if (pct >= 40) return 'C';
  return 'F';
}

function smBadge(text, color) {
  return '<span class="badge badge-' + color + '">' + text + '</span>';
}

function smMyDept() {
  var sess = getSession();
  return (sess && sess.dept) ? sess.dept : 'CSE';
}

function smDeptStudents(db, dept) {
  return (db.students || []).filter(function(s) { return s.dept === dept; });
}

function smLocalDateISO(d) {
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

function smTodayISO() {
  return smLocalDateISO(new Date());
}

function smDaysAgoISO(days) {
  var d = new Date();
  d.setDate(d.getDate() - days);
  return smLocalDateISO(d);
}

function smNumOrNull(v) {
  if (v === null || v === undefined) return null;
  var n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function smAttendancePct(student) {
  return smNumOrNull(student ? student.attendance : null);
}

function smStatusCountsForStudent(db, studentId, course, fromISO, toISO) {
  var rows = db.attendanceEntries || [];
  var counts = { present: 0, absent: 0, late: 0, excused: 0, total: 0, presentLike: 0 };
  rows.forEach(function(r) {
    if (studentId && r.studentId !== studentId) return;
    if (course && r.course !== course) return;
    if (fromISO && r.date < fromISO) return;
    if (toISO && r.date > toISO) return;
    if (!r.status) return;
    counts.total += 1;
    if (r.status === 'present') counts.present += 1;
    else if (r.status === 'absent') counts.absent += 1;
    else if (r.status === 'late') counts.late += 1;
    else if (r.status === 'excused') counts.excused += 1;
    if (r.status === 'present' || r.status === 'late') counts.presentLike += 1;
  });
  return counts;
}

function smMonthlyPct(db, studentId, course) {
  var fromISO = smDaysAgoISO(29);
  var toISO = smTodayISO();
  var c = smStatusCountsForStudent(db, studentId, course, fromISO, toISO);
  if (!c.total) return null;
  return Math.round((c.presentLike / c.total) * 100);
}

/* Backward compatibility */
function smFortnightPct(db, studentId, course) {
  return smMonthlyPct(db, studentId, course);
}

function smDefaulters(students, threshold) {
  threshold = Number(threshold) || 75;
  var db = dbGet();
  var useDetailed = Array.isArray(db.attendanceEntries) && db.attendanceEntries.length > 0;
  return students.filter(function(s) {
    var att = null;
    if (useDetailed && s && s.id) att = smMonthlyPct(db, s.id, null);
    if (att === null) att = smAttendancePct(s);
    return att !== null && att < threshold;
  });
}

function smCourseAttendanceAverages(db, dept) {
  var courses = (db.courses || []).filter(function(c) { return c.dept === dept; });
  var detailed = db.attendanceEntries || [];
  var summaryRows = db.attendance || [];
  return courses.map(function(c) {
    var avg = 0;
    var fromISO = smDaysAgoISO(13);
    var toISO = smTodayISO();
    var myEntries = detailed.filter(function(r) { return r.course === c.code && r.date >= fromISO && r.date <= toISO; });
    if (myEntries.length) {
      var byStudent = {};
      myEntries.forEach(function(r) {
        if (!byStudent[r.studentId]) byStudent[r.studentId] = { presentLike: 0, total: 0 };
        byStudent[r.studentId].total += 1;
        if (r.status === 'present' || r.status === 'late') byStudent[r.studentId].presentLike += 1;
      });
      var pctList = Object.keys(byStudent).map(function(k) {
        var s = byStudent[k];
        return s.total ? (s.presentLike / s.total) * 100 : 0;
      });
      avg = pctList.length ? Math.round(pctList.reduce(function(s, v) { return s + v; }, 0) / pctList.length) : 0;
    } else {
      var my = summaryRows.filter(function(r) { return r.course === c.code; });
      avg = my.length ? Math.round(my.reduce(function(s, r) { return s + (Number(r.pct) || 0); }, 0) / my.length) : 0;
    }
    return { code: c.code, name: c.name, avg: avg };
  });
}

var HOD_DEF_KEY = 'edusys_hod_def_threshold';

function hodGetThreshold() {
  return Number(storeGet(HOD_DEF_KEY) || 75);
}

function hodApplyThreshold() {
  var v = Number((g('hod-def-threshold') || {}).value) || 75;
  storeSet(HOD_DEF_KEY, v);
  renderRoleSection('role-hod-defaulters');
}

function hodExportDefaulters() {
  var db = dbGet();
  var dept = smMyDept();
  var threshold = hodGetThreshold();
  var list = smDefaulters(smDeptStudents(db, dept), threshold);
  smDownloadCSV(
    'defaulters_' + dept + '.csv',
    ['Roll', 'Name', 'Dept', 'Year', 'Attendance', 'CGPA'],
    list.map(function(s) { return [s.roll, s.name, s.dept, s.year, s.attendance + '%', s.cgpa]; })
  );
  showToast('Defaulters exported (' + list.length + ')');
}

function hodSendDefaulterSMS() {
  showToast('SMS queued to parents', 'info');
}

function smCopyText(text, okMsg, promptTitle) {
  try {
    if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        showToast(okMsg || 'Copied to clipboard', 'success');
      }).catch(function() {
        prompt(promptTitle || 'Copy this text:', text);
      });
      return;
    }
  } catch(e) {}
  prompt(promptTitle || 'Copy this text:', text);
}

function smEmailDefaulters(list, dept, threshold) {
  list = list || [];
  var fromISO = smDaysAgoISO(13);
  var toISO = smTodayISO();
  var sess = getSession();
  var sender = sess ? (sess.name + ' (' + sess.role + ')') : 'Faculty';

  function mockEmailFor(student) {
    var roll = (student && student.roll) ? String(student.roll) : 'student';
    var local = roll.toLowerCase().replace(/[^a-z0-9]+/g, '.');
    local = local.replace(/\\.+/g, '.').replace(/^\\.|\\.$/g, '');
    return local + '@mock.edu';
  }

  if (!list.length) {
    showToast('No defaulters found for current threshold', 'info');
    return;
  }

  var subject = 'Attendance Alert — Please Attend Lectures (' + (dept || 'Dept') + ')';
  var db = dbGet();
  db.emailOutbox = db.emailOutbox || [];

  var now = new Date();
  var nowISO = now.toISOString();

  var sent = list.map(function(s) {
    var to = mockEmailFor(s);
    var studentName = (s && s.name) ? s.name : 'Student';
    var roll = (s && s.roll) ? s.roll : '';
    var pct = (s && s.id) ? smMonthlyPct(db, s.id, null) : null;
    if (pct === null) pct = smAttendancePct(s);
    var attLine = (pct === null) ? 'below required threshold' : (pct + '% (below ' + (threshold || 75) + '%)');

    var body = 'Dear ' + studentName + (roll ? ' (' + roll + ')' : '') + ',\\n\\n'
      + 'This is a reminder that your attendance for the last 14 days (' + fromISO + ' to ' + toISO + ') is ' + attLine + '.\\n'
      + 'Please attend your lectures regularly to avoid shortage of attendance and academic issues.\\n\\n'
      + 'If you have any genuine issue, contact your class mentor/HOD.\\n\\n'
      + 'Regards,\\n' + sender + '\\n';

    return {
      id: Date.now() + Math.floor(Math.random() * 1000),
      to: to,
      dept: dept || '',
      threshold: Number(threshold) || 75,
      roll: roll,
      name: studentName,
      subject: subject,
      body: body,
      windowFrom: fromISO,
      windowTo: toISO,
      sentAt: nowISO,
      status: 'mock_sent',
      sentBy: sender
    };
  });

  /* Prepend newest */
  db.emailOutbox = sent.concat(db.emailOutbox);
  dbSave(db);

  /* Firebase integration: queue into Firestore `mail` collection (works with Trigger Email extension). */
  var mailReady = (typeof window.firebaseMailReady === 'function') ? !!window.firebaseMailReady() : false;
  var mailStatus = (typeof window.firebaseMailStatus === 'function') ? String(window.firebaseMailStatus()) : 'unknown';
  if (mailReady && typeof window.queueEmail === 'function') {
    Promise.allSettled(sent.map(function(m) {
      return window.queueEmail({
        to: m.to,
        message: {
          subject: m.subject,
          text: m.body
        },
        meta: {
          dept: m.dept,
          threshold: m.threshold,
          roll: m.roll,
          name: m.name,
          windowFrom: m.windowFrom,
          windowTo: m.windowTo,
          sentBy: m.sentBy,
          status: m.status
        }
      });
    })).then(function(results) {
      var ok = results.filter(function(r) { return r.status === 'fulfilled'; }).length;
      var fail = results.length - ok;
      if (ok) showToast('Mail sent to ' + ok + ' defaulter(s) (queued via Firebase)', 'success');
      if (fail) showToast(fail + ' mail(s) failed to queue (Firebase: ' + mailStatus + ')', 'warning');
      if (fail) {
        var firstErr = results.find(function(r) { return r.status === 'rejected'; });
        if (firstErr && firstErr.reason) {
          showToast('Queue error: ' + String(firstErr.reason.message || firstErr.reason), 'warning');
        }
      }
    }).catch(function() {
      showToast('Firebase queue error (Firebase: ' + mailStatus + ')', 'warning');
    });
    return;
  }

  showToast('Firebase mail not ready (' + mailStatus + '); saved to outbox only (mock)', 'warning');
}

function smEmailMeAsDefaulter(toEmail, dept, threshold) {
  var db = dbGet();
  var list = smDefaulters(smDeptStudents(db, dept), threshold);
  if (!list.length) { showToast('No defaulters for current threshold', 'info'); return; }
  var s = list[0];
  var fromISO = smDaysAgoISO(13);
  var toISO = smTodayISO();
  var sess = getSession();
  var sender = sess ? (sess.name + ' (' + sess.role + ')') : 'Faculty';
  var pct = (s && s.id) ? smMonthlyPct(db, s.id, null) : null;
  if (pct === null) pct = smAttendancePct(s);
  var attLine = (pct === null) ? 'below required threshold' : (pct + '% (below ' + (threshold || 75) + '%)');

  var subject = 'Attendance Alert — Please Attend Lectures (' + (dept || 'Dept') + ')';
  var body = 'Dear ' + (s.name || 'Student') + (s.roll ? (' (' + s.roll + ')') : '') + ',\\n\\n'
    + 'This is a reminder that your attendance for the last 14 days (' + fromISO + ' to ' + toISO + ') is ' + attLine + '.\\n'
    + 'Please attend your lectures regularly to avoid shortage of attendance and academic issues.\\n\\n'
    + 'If you have any genuine issue, contact your class mentor/HOD.\\n\\n'
    + 'Regards,\\n' + sender + '\\n';

  var mailReady = (typeof window.firebaseMailReady === 'function') ? !!window.firebaseMailReady() : false;
  var mailStatus = (typeof window.firebaseMailStatus === 'function') ? String(window.firebaseMailStatus()) : 'unknown';
  if (mailReady && typeof window.queueEmail === 'function') {
    window.queueEmail({
      to: toEmail,
      message: { subject: subject, text: body },
      meta: { dept: dept, threshold: Number(threshold) || 75, mode: 'test_to_self', sentBy: sender }
    }).then(function() {
      showToast('Mail sent to ' + toEmail + ' (queued via Firebase)', 'success');
    }).catch(function(e) {
      showToast('Failed to queue test mail (Firebase: ' + mailStatus + ')', 'warning');
      if (e) showToast('Queue error: ' + String(e.message || e), 'warning');
    });
    return;
  }

  showToast('Firebase mail not ready (' + mailStatus + '); cannot send test mail yet', 'warning');
}

function hodEmailDefaulters() {
  console.log('🚀 hodEmailDefaulters clicked');
  var dept = smMyDept();
  var threshold = hodGetThreshold();
  
  fetch('http://localhost:3001/send-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold: threshold,
      department: dept
    })
  })
    .then(res => {
      console.log('Response received:', res);
      return res.json();
    })
    .then(data => {
      console.log('Data:', data);
      if (data.success) {
        showToast('✅ Emails sent successfully!\nTotal: ' + data.totalStudents + ', Sent: ' + data.successCount, 'success');
      } else {
        showToast('⚠️ Failed to send emails: ' + (data.error || 'Unknown error'), 'error');
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showToast('❌ Error: ' + err.message, 'error');
    });
}

function hodEmailMeAsDefaulter() {
  var dept = smMyDept();
  var threshold = hodGetThreshold();
  var last = storeGet('edusys_test_email') || '';
  var to = (prompt('Enter test email (recipient):', last) || '').trim();
  if (!to || to.indexOf('@') === -1) { showToast('Please enter a valid email', 'warning'); return; }
  storeSet('edusys_test_email', to);
  smEmailMeAsDefaulter(to, dept, threshold);
}

function hodApproveCIA(id, ok) {
  var db = dbGet();
  var it = (db.ciaMarks || []).find(function(x) { return x.id === id; });
  if (it) it.status = ok ? 'Approved' : 'Rejected';
  dbSave(db);
  showToast('CIA ' + (ok ? 'approved' : 'rejected'));
  renderRoleSection('role-hod-cia-ese');
}

function hodApproveESE(id, ok) {
  var db = dbGet();
  var it = (db.eseMarks || []).find(function(x) { return x.id === id; });
  if (it) it.status = ok ? 'Approved' : 'Rejected';
  dbSave(db);
  showToast('ESE ' + (ok ? 'approved' : 'rejected'));
  renderRoleSection('role-hod-cia-ese');
}

function hodApproveAllCIA() {
  var db = dbGet();
  (db.ciaMarks || []).forEach(function(x) { if (x.status === 'Pending') x.status = 'Approved'; });
  dbSave(db);
  showToast('All CIA submissions approved');
  renderRoleSection('role-hod-cia-ese');
}

function hodApproveAllESE() {
  var db = dbGet();
  (db.eseMarks || []).forEach(function(x) { if (x.status === 'Pending') x.status = 'Approved'; });
  dbSave(db);
  showToast('All ESE submissions approved');
  renderRoleSection('role-hod-cia-ese');
}

function hodMarkBehaviorReviewed(id) {
  var db = dbGet();
  var it = (db.behaviorRecords || []).find(function(r) { return r.id === id; });
  if (it) it.status = 'Reviewed';
  dbSave(db);
  showToast('Behavior record reviewed');
  renderRoleSection('role-hod-behavior');
}

function buildHODDefaulters() {
  var db = dbGet();
  var dept = smMyDept();
  var threshold = hodGetThreshold();
  var students = smDeptStudents(db, dept);
  var defaulters = smDefaulters(students, threshold);

  return '<div class="module-header"><div class="module-title">Monthly Defaulters — ' + dept + '</div>'
    + '<div class="module-sub">Students below the attendance threshold (default 75%)</div></div>'
    + '<div class="panel"><div class="form-section-title">Filter & Actions</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Threshold (%)</label><input class="form-input" id="hod-def-threshold" type="number" value="' + threshold + '"/></div>'
    + '<div class="form-group"><label class="form-label">Department</label><input class="form-input" value="' + dept + '" disabled/></div>'
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="hodApplyThreshold()">Apply</button>'
    + '<button class="btn" onclick="hodExportDefaulters()">Export CSV</button>'
    + '<button class="btn" onclick="hodEmailDefaulters()">Email Defaulters</button>'
    + '<button class="btn" onclick="hodEmailMeAsDefaulter()">Email Me (Test)</button>'
    + '<button class="btn btn-danger" onclick="hodSendDefaulterSMS()">Send SMS</button>'
    + '</div></div>'
    + '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<h3 style="font-family:var(--font-head)">Defaulter List</h3>'
    + '<span class="badge badge-red">' + defaulters.length + ' below ' + threshold + '%</span></div>'
    + widgetTable(['Roll','Name','Year','Attendance','CGPA','Flag'],
        defaulters.map(function(s) {
          var pct = (s && s.id) ? smMonthlyPct(db, s.id, null) : null;
          if (pct === null) pct = smAttendancePct(s);
          var color = (pct !== null && pct < 65) ? 'red' : 'yellow';
          return [s.roll, s.name, s.year, pct === null ? '—' : smBadge(pct + '%', color), s.cgpa, smBadge('Defaulter', 'red')];
        }))
    + '</div>';
}

function buildHODCIAESE() {
  var db = dbGet();
  var dept = smMyDept();
  var cia = (db.ciaMarks || []).filter(function(m) { return m.dept === dept; });
  var ese = (db.eseMarks || []).filter(function(m) { return m.dept === dept; });
  var pendingCIA = cia.filter(function(m) { return m.status === 'Pending'; }).length;
  var pendingESE = ese.filter(function(m) { return m.status === 'Pending'; }).length;

  return '<div class="module-header"><div class="module-title">CIA &amp; ESE Review — ' + dept + '</div>'
    + '<div class="module-sub">Approve or reject marks entered by faculty.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('CIA Pending', pendingCIA, 'Awaiting approval', pendingCIA ? 'down' : 'up')
    + widgetKpi('ESE Pending', pendingESE, 'Awaiting approval', pendingESE ? 'down' : 'up')
    + widgetKpi('CIA Entries', cia.length, 'Total submissions', 'neutral')
    + widgetKpi('ESE Entries', ese.length, 'Total submissions', 'neutral')
    + '</div>'
    + '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<h3 style="font-family:var(--font-head)">CIA Submissions</h3>'
    + '<button class="btn btn-success btn-sm" onclick="hodApproveAllCIA()">Approve All</button></div>'
    + widgetTable(['Course','CIA','Student','Roll','Marks','Status','Action'],
        cia.map(function(m) {
          var pct = m.maxMarks ? Math.round(m.marks / m.maxMarks * 100) : 0;
          var grade = smGradeFromPct(pct);
          var act = m.status === 'Pending'
            ? '<button class="btn btn-sm btn-success" onclick="hodApproveCIA(' + m.id + ',true)">Approve</button> '
              + '<button class="btn btn-sm btn-danger" onclick="hodApproveCIA(' + m.id + ',false)">Reject</button>'
            : sbadge(m.status);
          return [m.course, m.cia, m.student, m.roll, m.marks + '/' + m.maxMarks + ' ' + smBadge(grade, 'blue'), sbadge(m.status), act];
        }))
    + '</div>'
    + '<div class="panel"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
    + '<h3 style="font-family:var(--font-head)">ESE Submissions</h3>'
    + '<button class="btn btn-success btn-sm" onclick="hodApproveAllESE()">Approve All</button></div>'
    + widgetTable(['Course','Student','Roll','Marks','Sem','Year','Status','Action'],
        ese.map(function(m) {
          var pct = m.maxMarks ? Math.round(m.marks / m.maxMarks * 100) : 0;
          var grade = smGradeFromPct(pct);
          var act = m.status === 'Pending'
            ? '<button class="btn btn-sm btn-success" onclick="hodApproveESE(' + m.id + ',true)">Approve</button> '
              + '<button class="btn btn-sm btn-danger" onclick="hodApproveESE(' + m.id + ',false)">Reject</button>'
            : sbadge(m.status);
          return [m.course, m.student, m.roll, m.marks + '/' + m.maxMarks + ' ' + smBadge(grade, 'blue'),
            'Sem ' + (m.semester || '—'), (m.academicYear || '—'), sbadge(m.status), act];
        }))
    + '</div>';
}

function buildHODBehavior() {
  var db = dbGet();
  var dept = smMyDept();
  var list = (db.behaviorRecords || []).filter(function(r) { return r.dept === dept; });
  var openCount = list.filter(function(r) { return r.status === 'Open'; }).length;

  return '<div class="module-header"><div class="module-title">Behavior Records — ' + dept + '</div>'
    + '<div class="module-sub">Review student behavior incidents recorded by faculty.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Open Records', openCount, 'Needs review', openCount ? 'down' : 'up')
    + widgetKpi('Total Records', list.length, 'This term', 'neutral')
    + widgetKpi('Negative', list.filter(function(r){return r.type==="negative";}).length, 'Incidents', 'neutral')
    + widgetKpi('Positive', list.filter(function(r){return r.type==="positive";}).length, 'Incidents', 'up')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Incidents</h3>'
    + widgetTable(['Date','Student','Roll','Type','Severity','Description','Action','Status'],
        list.slice().sort(function(a,b){return (a.date<b.date)?1:-1;}).map(function(r) {
          var sevColor = r.severity === 'high' ? 'red' : (r.severity === 'medium' ? 'yellow' : 'green');
          var typeColor = r.type === 'negative' ? 'red' : (r.type === 'positive' ? 'green' : 'gray');
          var statusCell = r.status === 'Open'
            ? '<button class="btn btn-sm" onclick="hodMarkBehaviorReviewed(' + r.id + ')">Mark Reviewed</button>'
            : sbadge(r.status);
          return [r.date, r.student, r.roll, smBadge(r.type, typeColor), smBadge(r.severity, sevColor), r.description, (r.action || '—'), statusCell];
        }))
    + '</div>';
}

function buildHODReports() {
  var db = dbGet();
  var dept = smMyDept();
  var threshold = hodGetThreshold();
  var students = smDeptStudents(db, dept);
  var defaulters = smDefaulters(students, threshold);
  var attVals = students.map(smAttendancePct).filter(function(v){ return v !== null; });
  var avgAtt = attVals.length ? Math.round(attVals.reduce(function(s, v) { return s + v; }, 0) / attVals.length) : 0;
  var behavior = (db.behaviorRecords || []).filter(function(r) { return r.dept === dept; });
  var byCourse = smCourseAttendanceAverages(db, dept);

  return '<div class="module-header"><div class="module-title">Reports &amp; Visuals — ' + dept + '</div>'
    + '<div class="module-sub">Attendance and performance snapshots for the department.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Avg Attendance', avgAtt + '%', dept + ' dept', avgAtt >= 75 ? 'up' : 'down')
    + widgetKpi('Defaulters', defaulters.length, 'Below ' + threshold + '%', defaulters.length ? 'down' : 'up')
    + widgetKpi('Behavior Records', behavior.length, 'Logged', 'neutral')
    + widgetKpi('Courses', (db.courses || []).filter(function(c){return c.dept===dept;}).length, 'Active', 'up')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Course-wise Attendance</h3>'
    + '<div class="bar-chart-wrap">'
    + (byCourse.length
        ? byCourse.map(function(c) { return widgetBar(c.code, c.avg, c.avg >= 85 ? 'bar-fill-green' : ''); }).join('')
        : '<p style="color:var(--text3);font-size:13px">No course data available.</p>')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Defaulter Summary</h3>'
    + widgetTable(['Roll','Name','Attendance','Suggestion'],
        defaulters.slice(0, 10).map(function(s) {
          var att = smAttendancePct(s);
          var msg = (att !== null && att < 65) ? 'Parent meeting' : 'Extra tutorial + monitor';
          return [s.roll, s.name, att === null ? '—' : smBadge(att + '%', att < 65 ? 'red' : 'yellow'), msg];
        }))
    + '</div>';
}

var HOD_ATT_COURSE_KEY = 'edusys_hod_att_course';

function hodSetAttCourse(v) {
  if (v) storeSet(HOD_ATT_COURSE_KEY, v);
  renderRoleSection('role-hod-attendance');
}

function hodExportAttendanceSummary() {
  var db = dbGet();
  var dept = smMyDept();
  var course = storeGet(HOD_ATT_COURSE_KEY) || '';
  var fromISO = smDaysAgoISO(13);
  var toISO = smTodayISO();
  var students = smDeptStudents(db, dept);

  var rows = students.map(function(s) {
    var c = smStatusCountsForStudent(db, s.id, course || null, fromISO, toISO);
    var pct = c.total ? Math.round((c.presentLike / c.total) * 100) : '';
    return [s.roll, s.name, dept, course || 'All', String(c.present), String(c.absent), String(c.late), String(c.excused), String(c.total), pct ? (pct + '%') : ''];
  }).filter(function(r) { return r[8] !== '0'; });

  smDownloadCSV(
    'attendance_summary_' + dept + (course ? '_' + course : '') + '.csv',
    ['Roll', 'Name', 'Dept', 'Course', 'Present', 'Absent', 'Late', 'Excused', 'Total', 'Percentage'],
    rows
  );
  showToast('Attendance summary exported (' + rows.length + ')');
}

function buildHODAttendanceSummary() {
  var db = dbGet();
  var dept = smMyDept();
  var fromISO = smDaysAgoISO(13);
  var toISO = smTodayISO();
  var students = smDeptStudents(db, dept);
  var courses = (db.courses || []).filter(function(c) { return c.dept === dept; });
  var course = (storeGet(HOD_ATT_COURSE_KEY) || '');

  var courseOptions = '<option value="">All Courses</option>'
    + courses.map(function(c) { return '<option value="' + c.code + '">' + c.code + ' — ' + c.name + '</option>'; }).join('');

  var computed = students.map(function(s) {
    var c = smStatusCountsForStudent(db, s.id, course || null, fromISO, toISO);
    var pct = c.total ? Math.round((c.presentLike / c.total) * 100) : null;
    return { roll: s.roll, name: s.name, year: s.year, pct: pct, counts: c };
  }).filter(function(x) { return x.counts.total > 0; });

  computed.sort(function(a, b) { return (a.pct || 0) - (b.pct || 0); });

  var avgPct = computed.length
    ? Math.round(computed.reduce(function(s, x) { return s + (x.pct || 0); }, 0) / computed.length)
    : 0;

  return '<div class="module-header"><div class="module-title">Attendance Summary — ' + dept + '</div>'
    + '<div class="module-sub">Last 14 days attendance (present+late counted as present).</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('Avg Attendance', avgPct + '%', 'Last 14 days', avgPct >= 75 ? 'up' : 'down')
    + widgetKpi('Students Tracked', computed.length, 'With records', 'neutral')
    + widgetKpi('Defaulter Threshold', hodGetThreshold() + '%', 'Policy', 'neutral')
    + widgetKpi('Defaulters', smDefaulters(students, hodGetThreshold()).length, 'Below threshold', 'down')
    + '</div>'
    + '<div class="panel"><div class="form-section-title">Filters</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="hod-att-course" onchange="hodSetAttCourse(this.value)">' + courseOptions + '</select></div>'
    + '<div class="form-group"><label class="form-label">Window</label><input class="form-input" value="' + fromISO + ' to ' + toISO + '" disabled/></div>'
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn" onclick="hodExportAttendanceSummary()">Export CSV</button>'
    + '<button class="btn btn-primary" onclick="renderRoleSection(\'role-hod-defaulters\')">View Defaulters</button>'
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Student-wise Summary</h3>'
    + widgetTable(['Roll','Name','Year','Present/Total','%','Flag'],
        computed.map(function(x) {
          var flag = (x.pct !== null && x.pct < hodGetThreshold()) ? smBadge('Defaulter', 'red') : smBadge('OK', 'green');
          var pc = (x.pct !== null && x.pct < 65) ? 'red' : (x.pct !== null && x.pct < 75) ? 'yellow' : 'green';
          return [
            x.roll,
            x.name,
            x.year,
            x.counts.presentLike + '/' + x.counts.total,
            smBadge((x.pct === null ? '—' : (x.pct + '%')), pc),
            flag
          ];
        }))
    + '</div>';
}

/* ============================================================
   SHARED ATTENDANCE TRACKING (HOD + Faculty)
   Daily per-subject marking + summaries.
   ============================================================ */
var ATT_TRACK_KEY = 'edusys_att_track_v1';

function attTrackGetState() {
  try { return JSON.parse(storeGet(ATT_TRACK_KEY) || '{}'); } catch(e) { return {}; }
}
function attTrackSetState(patch) {
  var cur = attTrackGetState();
  Object.keys(patch || {}).forEach(function(k) { cur[k] = patch[k]; });
  storeSet(ATT_TRACK_KEY, JSON.stringify(cur));
}

function attTrackSemToYearLabel(sem) {
  sem = Number(sem);
  if (!Number.isFinite(sem)) return null;
  if (sem <= 2) return '1st Year';
  if (sem <= 4) return '2nd Year';
  if (sem <= 6) return '3rd Year';
  return '4th Year';
}

function attTrackLoad() {
  var st = attTrackGetState();
  var dept = (st.dept || smMyDept() || '').trim();
  var sem = String(st.sem || '');
  var batch = (st.batch || '').trim();
  var course = (st.course || '').trim();
  var date = (st.date || smTodayISO());
  if (!dept || !sem || !course || !date) {
    showToast('Select department, semester, subject, and date first', 'warning');
    return;
  }
  attTrackSetState({ loaded: true });
  renderRoleSection(attTrackIsHOD() ? 'role-hod-attendance' : 'role-faculty-attendance');
}

function attTrackIsHOD() {
  var s = getSession();
  return !!(s && s.role === 'HOD');
}

function attTrackMarkAll(status) {
  document.querySelectorAll('#att-track-body tr').forEach(function(tr) {
    var sid = tr.getAttribute('data-student-id');
    if (!sid) return;
    var r = tr.querySelector('input[type=\"radio\"][name=\"att_' + sid + '\"][value=\"' + status + '\"]');
    if (r) r.checked = true;
  });
}

function attTrackSave() {
  var st = attTrackGetState();
  var dept = (st.dept || smMyDept() || '').trim();
  var sem = String(st.sem || '');
  var batch = (st.batch || '').trim();
  var course = (st.course || '').trim();
  var date = (st.date || smTodayISO());
  if (!dept || !sem || !course || !date) { showToast('Missing required inputs', 'error'); return; }

  var db = dbGet();
  var sess = getSession();
  db.attendanceEntries = db.attendanceEntries || [];

  var rows = Array.from(document.querySelectorAll('#att-track-body tr'));
  if (!rows.length) { showToast('No students loaded', 'warning'); return; }

  rows.forEach(function(tr) {
    var studentId = Number(tr.getAttribute('data-student-id'));
    var roll = tr.getAttribute('data-roll') || '';
    var statusEl = tr.querySelector('input[type=\"radio\"][name=\"att_' + studentId + '\"]:checked');
    var status = statusEl ? statusEl.value : 'present';
    var remarks = (tr.querySelector('input[data-att-remarks]') || {}).value || '';

    var existing = db.attendanceEntries.find(function(a) {
      return a.studentId === studentId && a.course === course && a.date === date;
    });
    if (existing) {
      existing.status = status;
      existing.markedBy = sess ? sess.name : 'Faculty';
      existing.remarks = remarks || '';
      existing.dept = dept;
      existing.roll = roll || existing.roll;
      existing.semester = sem;
      existing.batch = batch;
    } else {
      db.attendanceEntries.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        studentId: studentId,
        roll: roll,
        dept: dept,
        semester: sem,
        batch: batch,
        course: course,
        date: date,
        status: status,
        markedBy: sess ? sess.name : 'Faculty',
        remarks: remarks || ''
      });
    }
  });

  dbSave(db);
  showToast('Attendance saved for ' + course + ' (' + date + ')');
  renderRoleSection(attTrackIsHOD() ? 'role-hod-attendance' : 'role-faculty-attendance');
}

function buildAttendanceTrackingShared() {
  var db = dbGet();
  var sess = getSession();
  var st = attTrackGetState();

  var dept = (st.dept || (sess && sess.dept) || smMyDept() || '').trim();
  var sem = String(st.sem || '5');
  var batch = (st.batch || '').trim();
  var date = (st.date || smTodayISO());
  var loaded = !!st.loaded;

  var deptOptions = (db.departments || []).map(function(d) {
    var sel = d.name === dept ? ' selected' : '';
    return '<option' + sel + '>' + d.name + '</option>';
  }).join('');

  var semOptions = [1,2,3,4,5,6,7,8].map(function(n) {
    return '<option value=\"' + n + '\"' + (String(n) === sem ? ' selected' : '') + '>' + n + '</option>';
  }).join('');

  var courses = (db.courses || []).filter(function(c) {
    if (dept && c.dept !== dept) return false;
    if (sem && c.sem && String(c.sem) !== String(sem)) return false;
    return true;
  });
  var course = (st.course || (courses[0] ? courses[0].code : '') || '').trim();
  var courseOptions = courses.length
    ? courses.map(function(c) {
        var sel = c.code === course ? ' selected' : '';
        return '<option value=\"' + c.code + '\"' + sel + '>' + c.code + ' — ' + c.name + '</option>';
      }).join('')
    : '<option value=\"\">No subjects</option>';

  function studentScope() {
    var yearLabel = attTrackSemToYearLabel(sem);
    var list = (db.students || []).filter(function(s) { return !dept || s.dept === dept; });
    if (yearLabel) {
      var narrowed = list.filter(function(s) { return s.year === yearLabel; });
      if (narrowed.length) list = narrowed;
    }
    return list;
  }

  var students = loaded ? studentScope() : [];

  function existingStatus(studentId) {
    var e = (db.attendanceEntries || []).find(function(a) {
      return a.studentId === studentId && a.course === course && a.date === date;
    });
    return e ? e.status : 'present';
  }
  function existingRemarks(studentId) {
    var e = (db.attendanceEntries || []).find(function(a) {
      return a.studentId === studentId && a.course === course && a.date === date;
    });
    return e && e.remarks ? e.remarks : '';
  }

  function radio(studentId, val) {
    var chk = existingStatus(studentId) === val ? ' checked' : '';
    return '<input type=\"radio\" name=\"att_' + studentId + '\" value=\"' + val + '\"' + chk + ' />';
  }

  var body = students.map(function(s) {
    return '<tr data-student-id=\"' + s.id + '\" data-roll=\"' + s.roll + '\">'
      + '<td>' + s.roll + '</td>'
      + '<td>' + s.name + '</td>'
      + '<td style=\"text-align:center\">' + radio(s.id, 'present') + '</td>'
      + '<td style=\"text-align:center\">' + radio(s.id, 'absent') + '</td>'
      + '<td style=\"text-align:center\">' + radio(s.id, 'late') + '</td>'
      + '<td style=\"text-align:center\">' + radio(s.id, 'excused') + '</td>'
      + '<td><input class=\"form-input\" data-att-remarks value=\"' + (existingRemarks(s.id) || '').replace(/\"/g, '&quot;') + '\" placeholder=\"Remarks (optional)\"/></td>'
      + '</tr>';
  }).join('');

  var table = '<div class=\"table-wrap\"><table class=\"table\">'
    + '<thead><tr><th>Roll</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th><th style=\"min-width:220px\">Remarks</th></tr></thead>'
    + '<tbody id=\"att-track-body\">' + (body || '<tr><td colspan=\"7\" style=\"text-align:center;color:var(--text3);padding:20px\">' + (loaded ? 'No students for this class filter' : 'Click “Load Students” to pull the class list') + '</td></tr>') + '</tbody>'
    + '</table></div>';

  /* Summary (range + subject) */
  var fromISO = (st.sumFrom || smDaysAgoISO(13));
  var toISO = (st.sumTo || smTodayISO());
  var sumCourse = (st.sumCourse || course || '');
  var sumCourseOptions = '<option value=\"\">All Subjects</option>'
    + (db.courses || []).filter(function(c) { return !dept || c.dept === dept; }).map(function(c) {
      var sel = c.code === sumCourse ? ' selected' : '';
      return '<option value=\"' + c.code + '\"' + sel + '>' + c.code + ' — ' + c.name + '</option>';
    }).join('');

  var sumStudents = studentScope();
  var sumRows = sumStudents.map(function(s) {
    var c = smStatusCountsForStudent(db, s.id, sumCourse || null, fromISO, toISO);
    var presentLike = c.present + c.late + c.excused;
    var pct = c.total ? Math.round((presentLike / c.total) * 100) : null;
    return {
      roll: s.roll,
      name: s.name,
      present: c.present,
      absent: c.absent,
      late: c.late,
      excused: c.excused,
      total: c.total,
      pct: pct
    };
  }).filter(function(r) { return r.total > 0; });

  sumRows.sort(function(a, b) { return (a.pct === null ? 101 : a.pct) - (b.pct === null ? 101 : b.pct); });

  var summaryTable = widgetTable(
    ['Roll','Name','Present','Absent','Late','Excused','Total','%'],
    sumRows.map(function(r) {
      var pc = (r.pct !== null && r.pct < 65) ? 'red' : (r.pct !== null && r.pct < 75) ? 'yellow' : 'green';
      return [r.roll, r.name, String(r.present), String(r.absent), String(r.late), String(r.excused), String(r.total), r.pct === null ? '—' : smBadge(r.pct + '%', pc)];
    })
  );

  var who = sess ? (sess.role + ' — ' + sess.name) : 'Demo User';

  return '<div class=\"module-header\"><div class=\"module-title\">Attendance Tracking (Daily, Per Subject)</div>'
    + '<div class=\"module-sub\">Mark attendance, save/update by student+subject+date, and view summaries. Logged as: <strong>' + who + '</strong></div></div>'
    + '<div class=\"panel\"><div class=\"form-section-title\">Inputs</div>'
    + '<div class=\"form-grid\">'
    + '<div class=\"form-group\"><label class=\"form-label\">Department</label>'
      + '<select class=\"form-select\" onchange=\"attTrackSetState({dept:this.value, loaded:false})\">' + deptOptions + '</select></div>'
    + '<div class=\"form-group\"><label class=\"form-label\">Semester / Class</label>'
      + '<select class=\"form-select\" onchange=\"attTrackSetState({sem:this.value, loaded:false})\">' + semOptions + '</select></div>'
    + '<div class=\"form-group\"><label class=\"form-label\">Batch (optional)</label>'
      + '<input class=\"form-input\" value=\"' + (batch || '') + '\" placeholder=\"e.g. CSE-A\" oninput=\"attTrackSetState({batch:this.value})\"/></div>'
    + '<div class=\"form-group\"><label class=\"form-label\">Subject / Course</label>'
      + '<select class=\"form-select\" onchange=\"attTrackSetState({course:this.value, loaded:false})\">' + courseOptions + '</select></div>'
    + '<div class=\"form-group\"><label class=\"form-label\">Date</label>'
      + '<input class=\"form-input\" type=\"date\" value=\"' + date + '\" onchange=\"attTrackSetState({date:this.value, loaded:false})\"/></div>'
    + '</div>'
    + '<div class=\"form-actions\">'
    + '<button class=\"btn btn-primary\" onclick=\"attTrackLoad()\">Load Students</button>'
    + '<button class=\"btn btn-sm btn-success\" onclick=\"attTrackMarkAll(\'present\')\">Mark All Present</button>'
    + '<button class=\"btn btn-sm btn-danger\" onclick=\"attTrackMarkAll(\'absent\')\">Mark All Absent</button>'
    + '<button class=\"btn\" onclick=\"attTrackSave()\">Save / Update</button>'
    + '</div></div>'
    + '<div class=\"panel\"><h3 style=\"font-family:var(--font-head);margin-bottom:14px\">Daily List</h3>' + table + '</div>'
    + '<div class=\"panel\"><div class=\"form-section-title\">Summaries</div>'
    + '<div class=\"form-grid\">'
    + '<div class=\"form-group\"><label class=\"form-label\">From</label><input class=\"form-input\" type=\"date\" value=\"' + fromISO + '\" onchange=\"attTrackSetState({sumFrom:this.value})\"/></div>'
    + '<div class=\"form-group\"><label class=\"form-label\">To</label><input class=\"form-input\" type=\"date\" value=\"' + toISO + '\" onchange=\"attTrackSetState({sumTo:this.value})\"/></div>'
    + '<div class=\"form-group\" style=\"grid-column:1/-1\"><label class=\"form-label\">Subject</label><select class=\"form-select\" onchange=\"attTrackSetState({sumCourse:this.value})\">' + sumCourseOptions + '</select></div>'
    + '</div>'
    + '<div class=\"form-actions\">'
    + '<button class=\"btn\" onclick=\"renderRoleSection(attTrackIsHOD() ? \\\"role-hod-attendance\\\" : \\\"role-faculty-attendance\\\")\">Refresh Summary</button>'
    + '</div>'
    + summaryTable
    + '</div>';
}

function buildHODStudentPerformance() {
  /* Same view as faculty, but useful for department review */
  return buildFacultyStudentPerformance().replace('Student Performance', 'Student Performance (HOD View)');
}

var FAC_DEF_KEY = 'edusys_fac_def_threshold';

function facGetThreshold() {
  return Number(storeGet(FAC_DEF_KEY) || 75);
}

function facApplyThreshold() {
  var v = Number((g('fac-def-threshold') || {}).value) || 75;
  storeSet(FAC_DEF_KEY, v);
  renderRoleSection('role-faculty-defaulters');
}

function facExportDefaulters() {
  var db = dbGet();
  var dept = smMyDept();
  var threshold = facGetThreshold();
  var list = smDefaulters(smDeptStudents(db, dept), threshold);
  smDownloadCSV(
    'defaulters_' + dept + '_faculty.csv',
    ['Roll', 'Name', 'Dept', 'Year', 'Attendance', 'CGPA'],
    list.map(function(s) { return [s.roll, s.name, s.dept, s.year, s.attendance + '%', s.cgpa]; })
  );
  showToast('Defaulters exported (' + list.length + ')');
}

function facEmailDefaulters() {
  console.log('🚀 facEmailDefaulters clicked');
  var dept = smMyDept();
  var threshold = facGetThreshold();
  
  fetch('http://localhost:3001/send-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      threshold: threshold,
      department: dept
    })
  })
    .then(res => {
      console.log('Response received:', res);
      return res.json();
    })
    .then(data => {
      console.log('Data:', data);
      if (data.success) {
        showToast('✅ Emails sent successfully!\nTotal: ' + data.totalStudents + ', Sent: ' + data.successCount, 'success');
      } else {
        showToast('⚠️ Failed to send emails: ' + (data.error || 'Unknown error'), 'error');
      }
    })
    .catch(err => {
      console.error('Fetch error:', err);
      showToast('❌ Error: ' + err.message, 'error');
    });
}

function facEmailMeAsDefaulter() {
  var dept = smMyDept();
  var threshold = facGetThreshold();
  var last = storeGet('edusys_test_email') || '';
  var to = (prompt('Enter test email (recipient):', last) || '').trim();
  if (!to || to.indexOf('@') === -1) { showToast('Please enter a valid email', 'warning'); return; }
  storeSet('edusys_test_email', to);
  smEmailMeAsDefaulter(to, dept, threshold);
}

function facAddCIA() {
  var course = (g('fac-cia-course') || {}).value;
  var cia = (g('fac-cia-type') || {}).value || 'CIA1';
  var roll = ((g('fac-cia-roll') || {}).value || '').trim();
  var marks = Number((g('fac-cia-marks') || {}).value) || 0;
  var maxMarks = Number((g('fac-cia-max') || {}).value) || 50;
  var date = (g('fac-cia-date') || {}).value || new Date().toISOString().split('T')[0];
  if (!course || !roll) { showToast('Select course and roll number', 'error'); return; }

  var db = dbGet();
  var sess = getSession();
  var student = (db.students || []).find(function(s) { return s.roll === roll; });
  db.ciaMarks = db.ciaMarks || [];
  db.ciaMarks.push({
    id: Date.now(),
    studentId: student ? student.id : null,
    student: student ? student.name : 'Student',
    roll: roll,
    dept: student ? student.dept : smMyDept(),
    course: course,
    cia: cia,
    marks: marks,
    maxMarks: maxMarks,
    date: date,
    enteredBy: sess ? sess.name : 'Faculty',
    status: 'Pending'
  });
  dbSave(db);
  showToast('CIA saved for ' + roll);
  renderRoleSection('role-faculty-cia-ese');
}

function facAddESE() {
  var course = (g('fac-ese-course') || {}).value;
  var roll = ((g('fac-ese-roll') || {}).value || '').trim();
  var marks = Number((g('fac-ese-marks') || {}).value) || 0;
  var maxMarks = Number((g('fac-ese-max') || {}).value) || 100;
  var semester = ((g('fac-ese-sem') || {}).value || '').trim() || '5';
  var academicYear = ((g('fac-ese-year') || {}).value || '').trim() || '2025-26';
  var date = (g('fac-ese-date') || {}).value || new Date().toISOString().split('T')[0];
  if (!course || !roll) { showToast('Select course and roll number', 'error'); return; }

  var db = dbGet();
  var sess = getSession();
  var student = (db.students || []).find(function(s) { return s.roll === roll; });
  db.eseMarks = db.eseMarks || [];
  db.eseMarks.push({
    id: Date.now(),
    studentId: student ? student.id : null,
    student: student ? student.name : 'Student',
    roll: roll,
    dept: student ? student.dept : smMyDept(),
    course: course,
    marks: marks,
    maxMarks: maxMarks,
    semester: semester,
    academicYear: academicYear,
    date: date,
    enteredBy: sess ? sess.name : 'Faculty',
    status: 'Pending'
  });
  dbSave(db);
  showToast('ESE saved for ' + roll);
  renderRoleSection('role-faculty-cia-ese');
}

function facAddBehavior() {
  var roll = ((g('fac-bh-roll') || {}).value || '').trim();
  var type = (g('fac-bh-type') || {}).value || 'neutral';
  var category = (g('fac-bh-cat') || {}).value || 'other';
  var severity = (g('fac-bh-sev') || {}).value || 'low';
  var desc = ((g('fac-bh-desc') || {}).value || '').trim();
  var action = ((g('fac-bh-action') || {}).value || '').trim();
  if (!roll || !desc) { showToast('Select student and enter description', 'error'); return; }

  var db = dbGet();
  var sess = getSession();
  var student = (db.students || []).find(function(s) { return s.roll === roll; });
  db.behaviorRecords = db.behaviorRecords || [];
  db.behaviorRecords.push({
    id: Date.now(),
    studentId: student ? student.id : null,
    student: student ? student.name : 'Student',
    roll: roll,
    dept: student ? student.dept : smMyDept(),
    type: type,
    category: category,
    severity: severity,
    description: desc,
    action: action,
    recordedBy: sess ? sess.name : 'Faculty',
    date: new Date().toISOString().split('T')[0],
    status: 'Open'
  });
  dbSave(db);
  showToast('Behavior record saved');
  renderRoleSection('role-faculty-behavior');
}

function buildFacultyDefaultersSMS() {
  var db = dbGet();
  var dept = smMyDept();
  var threshold = facGetThreshold();
  var students = smDeptStudents(db, dept);
  var defaulters = smDefaulters(students, threshold);
  return '<div class="module-header"><div class="module-title">Defaulters — ' + dept + '</div>'
    + '<div class="module-sub">Attendance below threshold for your department</div></div>'
    + '<div class="panel"><div class="form-section-title">Filter</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Threshold (%)</label><input class="form-input" id="fac-def-threshold" type="number" value="' + threshold + '"/></div>'
    + '<div class="form-group"><label class="form-label">Department</label><input class="form-input" value="' + dept + '" disabled/></div>'
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-primary" onclick="facApplyThreshold()">Apply</button>'
    + '<button class="btn" onclick="facExportDefaulters()">Export CSV</button>'
    + '<button class="btn" onclick="facEmailDefaulters()">Email Defaulters</button>'
    + '<button class="btn" onclick="facEmailMeAsDefaulter()">Email Me (Test)</button>'
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Defaulter List</h3>'
    + widgetTable(['Roll','Name','Year','Attendance','CGPA'],
        defaulters.map(function(s) {
          var pct = (s && s.id) ? smMonthlyPct(db, s.id, null) : null;
          if (pct === null) pct = smAttendancePct(s);
          return [s.roll, s.name, s.year, pct === null ? '—' : smBadge(pct + '%', pct < 65 ? 'red' : 'yellow'), s.cgpa];
        }))
    + '</div>';
}

function buildFacultyCIAESE() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Faculty';
  var myCourses = (db.courses || []).filter(function(c) { return c.faculty === myName; });
  var myCourseCodes = myCourses.map(function(c) { return c.code; });
  var myCIA = (db.ciaMarks || []).filter(function(m) { return myCourseCodes.indexOf(m.course) > -1; });
  var myESE = (db.eseMarks || []).filter(function(m) { return myCourseCodes.indexOf(m.course) > -1; });

  var courseOptions = myCourseCodes.length
    ? myCourseCodes.map(function(c) { return '<option>' + c + '</option>'; }).join('')
    : '<option value="">No courses</option>';

  return '<div class="module-header"><div class="module-title">CIA &amp; ESE Entry</div>'
    + '<div class="module-sub">Enter marks for your courses. Submissions go to HOD for approval.</div></div>'
    + '<div class="panel"><div class="form-section-title">CIA Marks</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fac-cia-course">' + courseOptions + '</select></div>'
    + '<div class="form-group"><label class="form-label">CIA</label><select class="form-select" id="fac-cia-type"><option>CIA1</option><option>CIA2</option><option>CIA3</option></select></div>'
    + '<div class="form-group"><label class="form-label">Roll No</label><input class="form-input" id="fac-cia-roll" placeholder="CSE-101"/></div>'
    + '<div class="form-group"><label class="form-label">Marks</label><input class="form-input" type="number" id="fac-cia-marks" placeholder="42"/></div>'
    + '<div class="form-group"><label class="form-label">Max Marks</label><input class="form-input" type="number" id="fac-cia-max" value="50"/></div>'
    + '<div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="fac-cia-date"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facAddCIA()">+ Save CIA</button></div></div>'
    + '<div class="panel"><div class="form-section-title">ESE Marks</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fac-ese-course">' + courseOptions + '</select></div>'
    + '<div class="form-group"><label class="form-label">Semester</label><input class="form-input" id="fac-ese-sem" value="5"/></div>'
    + '<div class="form-group"><label class="form-label">Academic Year</label><input class="form-input" id="fac-ese-year" value="2025-26"/></div>'
    + '<div class="form-group"><label class="form-label">Roll No</label><input class="form-input" id="fac-ese-roll" placeholder="CSE-101"/></div>'
    + '<div class="form-group"><label class="form-label">Marks</label><input class="form-input" type="number" id="fac-ese-marks" placeholder="78"/></div>'
    + '<div class="form-group"><label class="form-label">Max Marks</label><input class="form-input" type="number" id="fac-ese-max" value="100"/></div>'
    + '<div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="fac-ese-date"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facAddESE()">+ Save ESE</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My CIA Entries</h3>'
    + widgetTable(['Course','CIA','Roll','Marks','Grade','Status'],
        myCIA.map(function(m) {
          var pct = m.maxMarks ? Math.round(m.marks / m.maxMarks * 100) : 0;
          return [m.course, m.cia, m.roll, m.marks + '/' + m.maxMarks, smBadge(smGradeFromPct(pct), 'blue'), sbadge(m.status)];
        }))
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My ESE Entries</h3>'
    + widgetTable(['Course','Roll','Marks','Grade','Status'],
        myESE.map(function(m) {
          var pct = m.maxMarks ? Math.round(m.marks / m.maxMarks * 100) : 0;
          return [m.course, m.roll, m.marks + '/' + m.maxMarks, smBadge(smGradeFromPct(pct), 'blue'), sbadge(m.status)];
        }))
    + '</div>';
}

function buildFacultyBehavior() {
  var db = dbGet();
  var dept = smMyDept();
  var sess = getSession();
  var myName = sess ? sess.name : 'Faculty';
  var students = smDeptStudents(db, dept);
  var records = (db.behaviorRecords || []).filter(function(r) { return r.recordedBy === myName; });
  var studentOptions = students.map(function(s) { return '<option>' + s.roll + '</option>'; }).join('');

  return '<div class="module-header"><div class="module-title">Behavior Records</div>'
    + '<div class="module-sub">Log behavior incidents for students. Visible to HOD for review.</div></div>'
    + '<div class="panel"><div class="form-section-title">Add Record</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Student (Roll)</label><select class="form-select" id="fac-bh-roll">' + studentOptions + '</select></div>'
    + '<div class="form-group"><label class="form-label">Type</label><select class="form-select" id="fac-bh-type"><option>positive</option><option>negative</option><option>neutral</option></select></div>'
    + '<div class="form-group"><label class="form-label">Category</label><select class="form-select" id="fac-bh-cat"><option>discipline</option><option>participation</option><option>leadership</option><option>misconduct</option><option>achievement</option><option>other</option></select></div>'
    + '<div class="form-group"><label class="form-label">Severity</label><select class="form-select" id="fac-bh-sev"><option>low</option><option>medium</option><option>high</option></select></div>'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Description</label><textarea class="form-textarea" id="fac-bh-desc" rows="2"></textarea></div>'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Action Taken</label><input class="form-input" id="fac-bh-action" placeholder="Counseling / Warning / Appreciation"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="facAddBehavior()">Save Record</button></div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">My Recent Records</h3>'
    + widgetTable(['Date','Student','Roll','Type','Severity','Status'],
        records.slice().sort(function(a,b){return (a.date<b.date)?1:-1;}).map(function(r) {
          var sevColor = r.severity === 'high' ? 'red' : (r.severity === 'medium' ? 'yellow' : 'green');
          var typeColor = r.type === 'negative' ? 'red' : (r.type === 'positive' ? 'green' : 'gray');
          return [r.date, r.student, r.roll, smBadge(r.type, typeColor), smBadge(r.severity, sevColor), sbadge(r.status)];
        }))
    + '</div>';
}

function buildFacultyReports() {
  var db = dbGet();
  var dept = smMyDept();
  var sess = getSession();
  var myName = sess ? sess.name : 'Faculty';
  var myCourses = (db.courses || []).filter(function(c) { return c.faculty === myName; });
  var myCourseCodes = myCourses.map(function(c) { return c.code; });
  var byCourse = (db.attendance || [])
    .filter(function(a) { return myCourseCodes.indexOf(a.course) > -1; })
    .reduce(function(acc, a) {
      if (!acc[a.course]) acc[a.course] = { sum: 0, n: 0 };
      acc[a.course].sum += Number(a.pct) || 0;
      acc[a.course].n += 1;
      return acc;
    }, {});
  var rows = Object.keys(byCourse).map(function(code) {
    return { code: code, avg: Math.round(byCourse[code].sum / Math.max(1, byCourse[code].n)) };
  });
  var myCIA = (db.ciaMarks || []).filter(function(m) { return myCourseCodes.indexOf(m.course) > -1; });
  var myESE = (db.eseMarks || []).filter(function(m) { return myCourseCodes.indexOf(m.course) > -1; });
  var avgCIA = myCIA.length ? Math.round(myCIA.reduce(function(s, m) { return s + (m.maxMarks ? (m.marks / m.maxMarks * 100) : 0); }, 0) / myCIA.length) : 0;
  var avgESE = myESE.length ? Math.round(myESE.reduce(function(s, m) { return s + (m.maxMarks ? (m.marks / m.maxMarks * 100) : 0); }, 0) / myESE.length) : 0;
  var defCount = smDefaulters(smDeptStudents(db, dept), facGetThreshold()).length;

  return '<div class="module-header"><div class="module-title">Reports &amp; Visuals</div>'
    + '<div class="module-sub">Quick snapshots for your classes.</div></div>'
    + '<div class="kpi-grid">'
    + widgetKpi('My Courses', myCourses.length, 'Assigned', 'up')
    + widgetKpi('Avg CIA', avgCIA + '%', 'Internal', avgCIA >= 70 ? 'up' : 'down')
    + widgetKpi('Avg ESE', avgESE + '%', 'End sem', avgESE >= 70 ? 'up' : 'down')
    + widgetKpi('Dept Defaulters', defCount, 'Below ' + facGetThreshold() + '%', defCount ? 'down' : 'up')
    + '</div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Course-wise Attendance</h3>'
    + '<div class="bar-chart-wrap">'
    + (rows.length
        ? rows.map(function(r) { return widgetBar(r.code, r.avg, r.avg >= 85 ? 'bar-fill-green' : ''); }).join('')
        : '<p style="color:var(--text3);font-size:13px">No attendance records for your courses.</p>')
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">CIA vs ESE Averages</h3>'
    + '<div class="bar-chart-wrap">'
    + widgetBar('CIA', avgCIA, avgCIA >= 70 ? 'bar-fill-green' : '')
    + widgetBar('ESE', avgESE, avgESE >= 70 ? 'bar-fill-green' : '')
    + '</div></div>';
}

function facLoadStudentsForAttendance() {
  renderRoleSection('role-faculty-attendance');
}

var FAC_ATT_COURSE_KEY = 'edusys_fac_det_att_course';
var FAC_ATT_DATE_KEY = 'edusys_fac_det_att_date';

function facSetDetAttCourse(v) {
  if (v) storeSet(FAC_ATT_COURSE_KEY, v);
  renderRoleSection('role-faculty-attendance');
}

function facSetDetAttDate(v) {
  if (v) storeSet(FAC_ATT_DATE_KEY, v);
  renderRoleSection('role-faculty-attendance');
}

function facMarkAllAttendance(status) {
  document.querySelectorAll('input[type="radio"][data-att-status="' + status + '"]').forEach(function(r) {
    r.checked = true;
  });
}

function facSaveDetailedAttendance() {
  var course = (g('fac-det-att-course') || {}).value;
  var date = (g('fac-det-att-date') || {}).value || smTodayISO();
  if (!course || !date) { showToast('Select course and date', 'error'); return; }

  var db = dbGet();
  var sess = getSession();
  var dept = smMyDept();
  db.attendanceEntries = db.attendanceEntries || [];

  var rows = document.querySelectorAll('#fac-det-att-body tr[data-student-id]');
  if (!rows.length) { showToast('No students loaded', 'warning'); return; }

  rows.forEach(function(tr) {
    var studentId = Number(tr.getAttribute('data-student-id')) || null;
    var roll = tr.getAttribute('data-roll') || '';
    var checked = tr.querySelector('input[type="radio"]:checked');
    var status = checked ? checked.value : 'present';
    if (!studentId) return;

    var existing = db.attendanceEntries.find(function(a) {
      return a.studentId === studentId && a.course === course && a.date === date;
    });
    if (existing) {
      existing.status = status;
      existing.markedBy = sess ? sess.name : 'Faculty';
    } else {
      db.attendanceEntries.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        studentId: studentId,
        roll: roll,
        dept: dept,
        course: course,
        date: date,
        status: status,
        markedBy: sess ? sess.name : 'Faculty'
      });
    }
  });

  dbSave(db);
  showToast('Attendance saved for ' + course + ' (' + date + ')');
  renderRoleSection('role-faculty-attendance');
}

function buildFacultyDetailedAttendance() {
  var db = dbGet();
  var sess = getSession();
  var myName = sess ? sess.name : 'Faculty';
  var dept = smMyDept();
  var myCourses = (db.courses || []).filter(function(c) { return c.faculty === myName; });
  var students = smDeptStudents(db, dept);
  var today = smTodayISO();

  var courseOptions = myCourses.length
    ? myCourses.map(function(c) { return '<option>' + c.code + '</option>'; }).join('')
    : '<option value="">No courses</option>';

  var selectedCourse = (storeGet(FAC_ATT_COURSE_KEY) || '') || (myCourses[0] ? myCourses[0].code : '');
  var selectedDate = (storeGet(FAC_ATT_DATE_KEY) || '') || today;

  function statusFor(studentId) {
    var e = (db.attendanceEntries || []).find(function(a) {
      return a.studentId === studentId && a.course === selectedCourse && a.date === selectedDate;
    });
    return e ? e.status : 'present';
  }

  var body = students.map(function(s) {
    var st = statusFor(s.id);
    function radio(val) {
      var chk = st === val ? ' checked' : '';
      return '<input type="radio" name="att_' + s.id + '" value="' + val + '" data-att-status="' + val + '"' + chk + ' />';
    }
    return '<tr data-student-id="' + s.id + '" data-roll="' + s.roll + '">'
      + '<td>' + s.roll + '</td>'
      + '<td>' + s.name + '</td>'
      + '<td style="text-align:center">' + radio('present') + '</td>'
      + '<td style="text-align:center">' + radio('absent') + '</td>'
      + '<td style="text-align:center">' + radio('late') + '</td>'
      + '<td style="text-align:center">' + radio('excused') + '</td>'
      + '</tr>';
  }).join('');

  var table = '<div class="table-wrap"><table class="table">'
    + '<thead><tr><th>Roll</th><th>Name</th><th>Present</th><th>Absent</th><th>Late</th><th>Excused</th></tr></thead>'
    + '<tbody id="fac-det-att-body">' + (body || '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:20px">No students</td></tr>') + '</tbody>'
    + '</table></div>';

  return '<div class="module-header"><div class="module-title">Attendance Tracking (Detailed)</div>'
    + '<div class="module-sub">Mark daily attendance with present/absent/late/excused for each student.</div></div>'
    + '<div class="panel"><div class="form-section-title">Select Class</div>'
    + '<div class="form-grid">'
    + '<div class="form-group"><label class="form-label">Department</label><input class="form-input" value="' + dept + '" disabled/></div>'
    + '<div class="form-group"><label class="form-label">Course</label><select class="form-select" id="fac-det-att-course" onchange="facSetDetAttCourse(this.value)">' + courseOptions + '</select></div>'
    + '<div class="form-group"><label class="form-label">Date</label><input class="form-input" type="date" id="fac-det-att-date" value="' + selectedDate + '" onchange="facSetDetAttDate(this.value)"/></div>'
    + '</div>'
    + '<div class="form-actions">'
    + '<button class="btn btn-sm btn-success" onclick="facMarkAllAttendance(\'present\')">Mark All Present</button>'
    + '<button class="btn btn-sm btn-danger" onclick="facMarkAllAttendance(\'absent\')">Mark All Absent</button>'
    + '<button class="btn btn-primary" onclick="facSaveDetailedAttendance()">Save Attendance</button>'
    + '</div></div>'
    + '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Students</h3>' + table + '</div>';
}

function smLatestMark(list, predicate) {
  var filtered = (list || []).filter(predicate);
  if (!filtered.length) return null;
  filtered.sort(function(a, b) { return (a.date || '') < (b.date || '') ? 1 : -1; });
  return filtered[0];
}

function smFindStudentByQuery(db, q) {
  q = (q || '').trim().toLowerCase();
  if (!q) return null;
  var students = db.students || [];
  return students.find(function(s) {
    return (s.roll || '').toLowerCase() === q || (s.name || '').toLowerCase().indexOf(q) > -1;
  }) || null;
}

function smStudentPerformanceRows(db, student) {
  if (!student) return [];
  var dept = student.dept;
  var courses = (db.courses || []).filter(function(c) { return c.dept === dept; });
  var ciaList = db.ciaMarks || [];
  var eseList = db.eseMarks || [];

  return courses.map(function(c) {
    function ciaMark(n) {
      var it = smLatestMark(ciaList, function(m) {
        return m.roll === student.roll && m.course === c.code && m.cia === n;
      });
      return it ? { marks: it.marks, max: it.maxMarks } : null;
    }
    var c1 = ciaMark('CIA1');
    var c2 = ciaMark('CIA2');
    var c3 = ciaMark('CIA3');
    var avg = null;
    if (c1 || c2 || c3) {
      var vals = [c1, c2, c3].filter(Boolean).map(function(x) { return x.max ? (x.marks / x.max) * 100 : 0; });
      avg = vals.length ? Math.round(vals.reduce(function(s, v) { return s + v; }, 0) / vals.length) : 0;
    }
    var ese = smLatestMark(eseList, function(m) {
      return m.roll === student.roll && m.course === c.code;
    });
    var esePct = ese && ese.maxMarks ? Math.round((ese.marks / ese.maxMarks) * 100) : null;

    var totalPct = null;
    if (avg !== null || esePct !== null) {
      var a = (avg === null) ? 0 : avg;
      var e = (esePct === null) ? 0 : esePct;
      totalPct = Math.round(a * 0.4 + e * 0.6);
    }

    return {
      course: c.code,
      courseName: c.name,
      cia1: c1 ? (c1.marks + '/' + c1.max) : '—',
      cia2: c2 ? (c2.marks + '/' + c2.max) : '—',
      cia3: c3 ? (c3.marks + '/' + c3.max) : '—',
      ciaAvg: avg === null ? '—' : (avg + '%'),
      ese: ese ? (ese.marks + '/' + ese.maxMarks) : '—',
      total: totalPct === null ? '—' : (totalPct + '%'),
      grade: totalPct === null ? '—' : smGradeFromPct(totalPct)
    };
  });
}

function buildFacultyStudentPerformance() {
  var db = dbGet();
  var dept = smMyDept();
  var q = (storeGet('edusys_perf_query') || '').trim();
  var found = q ? smFindStudentByQuery(db, q) : null;
  var rows = found ? smStudentPerformanceRows(db, found) : [];

  var hdr = '<div class="module-header"><div class="module-title">Student Performance</div>'
    + '<div class="module-sub">View CIA/ESE totals and grades for a student (department scope).</div></div>';

  var search = '<div class="panel"><div class="form-section-title">Search Student</div>'
    + '<div class="form-grid">'
    + '<div class="form-group" style="grid-column:1/-1"><label class="form-label">Roll No or Name</label>'
    + '<input class="form-input" id="perf-q" placeholder="e.g. CSE-101 or Priya" value="' + (q || '') + '"/></div>'
    + '</div>'
    + '<div class="form-actions"><button class="btn btn-primary" onclick="(function(){storeSet(\'edusys_perf_query\', (g(\'perf-q\')||{}).value||\'\'); renderRoleSection(\'role-faculty-performance\');})()">Search</button>'
    + '<button class="btn" onclick="(function(){storeRemove(\'edusys_perf_query\'); renderRoleSection(\'role-faculty-performance\');})()">Clear</button></div>'
    + '</div>';

  var info = found
    ? '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:6px">' + found.name + '</h3>'
      + '<p style="color:var(--text2);font-size:13px;margin:0">Roll: <strong>' + found.roll + '</strong> · Dept: <strong>' + found.dept + '</strong> · Year: <strong>' + found.year + '</strong></p></div>'
    : (q ? '<div class="panel"><p style="color:var(--text3);margin:0">No student found for "' + q + '" (try roll no like CSE-101).</p></div>' : '');

  var table = found
    ? '<div class="panel"><h3 style="font-family:var(--font-head);margin-bottom:14px">Marks Summary</h3>'
      + widgetTable(['Course','CIA1','CIA2','CIA3','CIA Avg','ESE','Total','Grade'],
          rows.map(function(r) {
            return [r.course + ' — ' + r.courseName, r.cia1, r.cia2, r.cia3, r.ciaAvg, r.ese, r.total, smBadge(r.grade, 'blue')];
          }))
      + '</div>'
    : '';

  return hdr + search + info + table;
}

/* Add new sections to SECTION_BUILDERS */
Object.assign(SECTION_BUILDERS, {
  /* Admin new */
  'role-lifecycle':   buildAdminStudentLifecycle,
  'role-admissions':  buildAdminAdmissions,
  'role-academic':    buildAdminAcademic,
  'role-financial':   buildAdminFinancial,
  'role-approvals':   buildAdminApprovals,
  'role-multicampus': buildAdminMultiCampus,
  'role-obe-admin':   buildAdminOBE,
  'role-resources':   buildAdminResources,
  /* Admin sub-schemas */
  'role-account-outstanding': buildAccountOutstanding,
  'role-admission-caste':     buildAdmissionsCasteCategory,
  'role-admission-docs':      buildAdmissionsDocuments,
  'role-railway-concession':  buildRailwayConcessionAppointments,
  /* Head new */
  'role-enrollment':  buildPrincipalEnrollment,
  'role-obe-principal': buildPrincipalOBE,
  'role-attendance-report': buildPrincipalAttendance,
  'role-calendar':    buildPrincipalCalendar,
  'role-comms':       buildPrincipalComms,
  /* HOD new */
  'role-hod-obe':     buildHODOBE,
  'role-hod-analytics': buildHODAnalytics,
  'role-hod-defaulters': buildHODDefaulters,
  'role-hod-cia-ese': buildHODCIAESE,
  'role-hod-behavior': buildHODBehavior,
  'role-hod-reports': buildHODReports,
  'role-hod-attendance': buildAttendanceTrackingShared,
  'role-hod-performance': buildHODStudentPerformance,
  /* Faculty OBE new */
  'role-co-mgmt':     buildFacultyCO,
  'role-co-po':       buildFacultyCOPO,
  'role-obe-marks':   buildFacultyOBEMarks,
  'role-attainment-view': buildFacultyAttainmentView,
  'role-exit-survey': buildFacultyExitSurvey,
  'role-session-map': buildFacultySessionMap,
  'role-action-plan': buildFacultyActionPlan,
  'role-research':    buildFacultyResearch,
  'role-workload':    buildFacultyWorkload,
  'role-obe-report':  buildFacultyOBEReport,
  /* Faculty Student Mgmt */
  'role-faculty-defaulters': buildFacultyDefaultersSMS,
  'role-faculty-cia-ese': buildFacultyCIAESE,
  'role-faculty-behavior': buildFacultyBehavior,
  'role-faculty-reports': buildFacultyReports,
  'role-faculty-attendance': buildAttendanceTrackingShared,
  'role-faculty-performance': buildFacultyStudentPerformance
});

/* Add new modules to ROLE_MODULES permissions */
ROLE_MODULES.Admin = ROLE_MODULES.Admin.concat([
  'role-lifecycle','role-admissions','role-academic','role-financial',
  'role-approvals','role-multicampus','role-obe-admin','role-resources'
]);
ROLE_MODULES.Head = ROLE_MODULES.Head.concat([
  'role-enrollment','role-obe-principal','role-attendance-report',
  'role-calendar','role-comms'
]);
ROLE_MODULES.HOD = ROLE_MODULES.HOD.concat([
  'role-hod-obe','role-hod-analytics',
  'role-hod-attendance','role-hod-performance',
  'role-hod-defaulters','role-hod-cia-ese','role-hod-behavior','role-hod-reports'
]);
ROLE_MODULES.Faculty = ROLE_MODULES.Faculty.concat([
  'role-co-mgmt','role-co-po','role-obe-marks','role-attainment-view',
  'role-exit-survey','role-session-map','role-action-plan','role-research','role-workload','role-obe-report',
  'role-faculty-attendance','role-faculty-performance',
  'role-faculty-defaulters','role-faculty-cia-ese','role-faculty-behavior','role-faculty-reports'
]);
ROLE_MODULES.Account = (ROLE_MODULES.Account || []).concat([
  'role-account-outstanding'
]);
ROLE_MODULES.Admissions = (ROLE_MODULES.Admissions || []).concat([
  'role-admission-caste','role-admission-docs'
]);
ROLE_MODULES['Railway Concession'] = (ROLE_MODULES['Railway Concession'] || []).concat([
  'role-railway-concession'
]);

/* Add new nav items to ROLE_NAV */
ROLE_NAV.Admin = ROLE_NAV.Admin.concat([
  { id:'role-lifecycle',   icon:'🔄', label:'Student Lifecycle',    section:'Admin — Students' },
  { id:'role-admissions',  icon:'📋', label:'Admissions Analytics', section:'Admin — Students' },
  { id:'role-academic',    icon:'📚', label:'Academic Management',  section:'Admin — Academic' },
  { id:'role-obe-admin',   icon:'🎯', label:'OBE Programme View',   section:'Admin — Academic' },
  { id:'role-financial',   icon:'💹', label:'Financial Dashboard',  section:'Admin — Finance' },
  { id:'role-approvals',   icon:'✅', label:'Approval Workflows',   section:'Admin — Finance' },
  { id:'role-resources',   icon:'🏗',  label:'Resource Booking',     section:'Admin — Operations' },
  { id:'role-multicampus', icon:'🌐', label:'Multi-Campus',         section:'Admin — Operations' }
]);
ROLE_NAV.Head = ROLE_NAV.Head.concat([
  { id:'role-enrollment',        icon:'📈', label:'Enrollment Stats',      section:'Head — Academic' },
  { id:'role-attendance-report', icon:'📍', label:'Attendance Reports',    section:'Head — Academic' },
  { id:'role-obe-principal',     icon:'🎯', label:'OBE & CO Attainment',   section:'Head — Academic' },
  { id:'role-calendar',          icon:'🗓', label:'Academic Calendar',     section:'Head — Admin' },
  { id:'role-comms',             icon:'📣', label:'Comm. Hub',             section:'Head — Admin' }
]);
ROLE_NAV.HOD = ROLE_NAV.HOD.concat([
  { id:'role-hod-attendance', icon:'📍', label:'Attendance Tracking',  section:'HOD — Student Mgmt' },
  { id:'role-hod-defaulters', icon:'⚠️', label:'Defaulters',         section:'HOD — Student Mgmt' },
  { id:'role-hod-cia-ese',    icon:'📝', label:'CIA & ESE',           section:'HOD — Student Mgmt' },
  { id:'role-hod-behavior',   icon:'🏷', label:'Behavior',            section:'HOD — Student Mgmt' },
  { id:'role-hod-performance', icon:'📈', label:'Student Performance', section:'HOD — Student Mgmt' },
  { id:'role-hod-reports',    icon:'📄', label:'Reports',             section:'HOD — Student Mgmt' },
  { id:'role-hod-obe',       icon:'🎯', label:'OBE Roll-Up',         section:'HOD — OBE' },
  { id:'role-hod-analytics', icon:'📊', label:'Dept Analytics',      section:'HOD — OBE' }
]);
ROLE_NAV.Faculty = ROLE_NAV.Faculty.concat([
  { id:'role-co-mgmt',          icon:'🎯', label:'CO Management',       section:'OBE Tools' },
  { id:'role-co-po',            icon:'🗺',  label:'CO-PO Mapping',       section:'OBE Tools' },
  { id:'role-obe-marks',        icon:'📝', label:'OBE Mark Entry',      section:'OBE Tools' },
  { id:'role-attainment-view',  icon:'📊', label:'Attainment View',     section:'OBE Tools' },
  { id:'role-exit-survey',      icon:'📋', label:'Exit Survey',         section:'OBE Tools' },
  { id:'role-session-map',      icon:'🗓', label:'Session CO Map',      section:'OBE Tools' },
  { id:'role-action-plan',      icon:'🔧', label:'Action Plans',        section:'OBE Tools' },
  { id:'role-obe-report',       icon:'📄', label:'OBE Reports',         section:'OBE Tools' },
  { id:'role-research',         icon:'🔬', label:'Research & Pubs',     section:'Faculty — Profile' },
  { id:'role-workload',         icon:'⚖',  label:'Leave & Workload',    section:'Faculty — Profile' },
  { id:'role-faculty-attendance', icon:'📍', label:'Attendance Tracking', section:'Faculty — Student Mgmt' },
  { id:'role-faculty-defaulters', icon:'⚠️', label:'Defaulters',        section:'Faculty — Student Mgmt' },
  { id:'role-faculty-cia-ese',    icon:'📝', label:'CIA & ESE',          section:'Faculty — Student Mgmt' },
  { id:'role-faculty-behavior',   icon:'🏷', label:'Behavior',           section:'Faculty — Student Mgmt' },
  { id:'role-faculty-performance', icon:'📈', label:'Student Performance', section:'Faculty — Student Mgmt' },
  { id:'role-faculty-reports',    icon:'📄', label:'Reports',            section:'Faculty — Student Mgmt' }
]);
ROLE_NAV.Account = (ROLE_NAV.Account || []).concat([
  { id:'module-finance', icon:'💰', label:'Finance', section:'Accounts — Finance', module:'finance' },
  { id:'role-account-outstanding', icon:'💳', label:'Outstanding Fees', section:'Accounts — Finance' }
]);
ROLE_NAV.Admissions = (ROLE_NAV.Admissions || []).concat([
  { id:'module-admissions', icon:'🎓', label:'Admissions', section:'Admissions — Students', module:'admissions' },
  { id:'role-admission-caste', icon:'🏷', label:'Caste / Category', section:'Admissions — Students' },
  { id:'role-admission-docs',  icon:'📁', label:'Student Documents', section:'Admissions — Students' }
]);
ROLE_NAV['Railway Concession'] = (ROLE_NAV['Railway Concession'] || []).concat([
  { id:'role-railway-concession', icon:'🚆', label:'Concession Scheduling', section:'Railway — Concession' }
]);

/* Force re-apply role nav when ERP is already active (handles hot-load) */
(function() {
  var sess = getSession();
  if (!sess) return;
  /* Re-inject nav only if ERP page is visible */
  var erpPage = document.getElementById('erp');
  if (erpPage && erpPage.classList.contains('active')) {
    /* Slight delay to run after roles.js initRoleDashboard */
    setTimeout(function() {
      injectRoleNav(sess.role);
      applyRolePermissions(sess.role);
    }, 200);
  }
})();

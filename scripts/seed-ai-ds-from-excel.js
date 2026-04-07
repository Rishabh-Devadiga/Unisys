const xlsx = require('xlsx');
const db = require('../database/db/postgres');

const excelPath = String.raw`C:\Users\Rishabh\Downloads\SEPM (TH) VI SEM TE AI&DS  Attendance.xlsx`;

function emailFromName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') + '@college.edu';
}
function pad3(n) { return String(n).padStart(3, '0'); }
function pick(arr, i) { return arr[i % arr.length]; }

function extractNames() {
  const wb = xlsx.readFile(excelPath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, { header: 1, raw: false });
  const names = [];
  for (const row of rows) {
    const rn = row && row[0];
    const name = row && row[1];
    const isNum = typeof rn === 'number' || (typeof rn === 'string' && rn.trim() && !Number.isNaN(Number(rn)));
    if (!isNum) continue;
    if (typeof name === 'string' && name.trim()) names.push(name.trim());
  }
  return names;
}

(async () => {
  const names = extractNames();
  if (!names.length) throw new Error('No names found in Excel.');

  const students = names.map((name, i) => {
    const attendance = 60 + (i * 7) % 36; // 60-95
    const cgpa = Number((6.5 + (i * 0.19) % 3.2).toFixed(2));
    return {
      id: i + 1,
      name,
      roll: 'AIDS-' + pad3(i + 1),
      dept: 'AI&DS',
      year: '3rd Year',
      status: 'Active',
      email: emailFromName(name),
      attendance,
      cgpa,
      phone: '98' + String(10000000 + i).slice(-8)
    };
  });

  const courses = [
    { id: 1, code: 'AIDS301', name: 'Software Engineering Project Mgmt', credits: 4, faculty: 'Prof. Meera Singh', dept: 'AI&DS', sem: '6', enrolled: students.length, syllabus: 78 },
    { id: 2, code: 'AIDS302', name: 'Data Mining', credits: 3, faculty: 'Dr. Rajiv Rao', dept: 'AI&DS', sem: '6', enrolled: students.length, syllabus: 82 },
    { id: 3, code: 'AIDS303', name: 'Deep Learning', credits: 4, faculty: 'Dr. Arun Pillai', dept: 'AI&DS', sem: '6', enrolled: students.length, syllabus: 74 }
  ];

  const attendanceEntries = [];
  const marks = [];
  const ciaMarks = [];
  const eseMarks = [];
  const behaviorRecords = [];
  const studentFlags = [];
  const feeOutstanding = [];
  const studentCategories = [];
  const studentDocuments = [];
  const concessionRequests = [];
  const fees = [];
  const admissions = [];

  const categories = ['General','OBC','SC','ST'];
  const docs = ['10th Marksheet','12th Marksheet','Caste Certificate','TC'];

  students.forEach((s, i) => {
    const status = s.attendance >= 75 ? 'present' : (s.attendance >= 70 ? 'late' : 'absent');
    attendanceEntries.push({
      id: i * 2 + 1,
      studentId: s.id,
      roll: s.roll,
      dept: s.dept,
      course: 'AIDS301',
      date: '2026-03-28',
      status,
      markedBy: 'Prof. Meera Singh'
    });
    attendanceEntries.push({
      id: i * 2 + 2,
      studentId: s.id,
      roll: s.roll,
      dept: s.dept,
      course: 'AIDS302',
      date: '2026-03-29',
      status: s.attendance >= 75 ? 'present' : 'absent',
      markedBy: 'Dr. Rajiv Rao'
    });

    const mark = Math.round(40 + (s.cgpa - 6.5) * 10 + (s.attendance - 60) * 0.2);
    marks.push({ id: i + 1, course: 'AIDS301', exam: 'Mid Semester', student: s.name, roll: s.roll, marks: Math.min(50, Math.max(18, mark)), maxMarks: 50, grade: mark >= 45 ? 'A' : mark >= 38 ? 'B' : mark >= 30 ? 'C' : 'D' });
    ciaMarks.push({ id: i + 1, studentId: s.id, student: s.name, roll: s.roll, dept: s.dept, course: 'AIDS301', cia: 'CIA1', marks: Math.min(30, Math.max(8, Math.round(mark * 0.6))), maxMarks: 30, date: '2026-03-25', enteredBy: 'Prof. Meera Singh', status: 'Pending' });
    eseMarks.push({ id: i + 1, studentId: s.id, student: s.name, roll: s.roll, dept: s.dept, course: 'AIDS301', marks: Math.min(100, Math.max(35, Math.round(mark * 2))), maxMarks: 100, semester: '6', academicYear: '2025-26', date: '2026-04-05', enteredBy: 'Prof. Meera Singh', status: 'Pending' });

    if (i < 15) {
      behaviorRecords.push({ id: i + 1, studentId: s.id, student: s.name, roll: s.roll, dept: s.dept, type: i % 3 === 0 ? 'negative' : 'positive', category: 'participation', severity: i % 3 === 0 ? 'medium' : 'low', description: i % 3 === 0 ? 'Late submission of SEPM assignment' : 'Active participation in lab', action: i % 3 === 0 ? 'Counseled' : 'Appreciated', recordedBy: 'Prof. Meera Singh', date: '2026-03-26', status: 'Open' });
    }

    if (s.attendance < 75) {
      studentFlags.push({ studentId: s.id, roll: s.roll, name: s.name, flag: `Low Attendance (${s.attendance}%)`, severity: s.attendance < 65 ? 'Urgent' : 'Warning', raisedBy: 'Attendance Engine', date: '2026-03-30' });
    }

    if (i % 4 === 0) {
      feeOutstanding.push({ id: i + 1, studentId: s.id, type: 'Tuition Fee', amount: 45000, dueDate: '2026-04-10', status: 'Pending' });
    }

    studentCategories.push({ studentId: s.id, category: pick(categories, i), caste: pick(categories, i) });
    studentDocuments.push({ id: i + 1, studentId: s.id, type: pick(docs, i), status: i % 3 === 0 ? 'Pending' : 'Verified', submittedOn: '2026-03-20' });

    if (i % 10 === 0) {
      concessionRequests.push({ id: i + 1, studentId: s.id, route: 'Bengaluru - Mumbai', requestDate: '2026-03-22', status: 'Requested', appointmentDate: '', appointmentTime: '' });
    }

    if (i < 30) {
      fees.push({ id: 200 + i, student_id: s.id, student_name: s.name, class: 'TE AI&DS', month: 'Mar', amount: 5200, status: i % 3 === 0 ? 'Pending' : 'Paid', due_date: '2026-03-31' });
    }

    if (i < 25) {
      admissions.push({ id: i + 1, name: s.name, program: 'AI&DS', stage: i % 2 === 0 ? 'Enrolled' : 'Verified', score: 70 + (i % 25) });
    }
  });

  const attendanceSummary = [
    { id: 1, cls: 'TE AI&DS', course: 'AIDS301', date: '2026-03-28', present: students.filter(s => s.attendance >= 75).length, total: students.length, pct: Math.round(students.filter(s => s.attendance >= 75).length / students.length * 100) },
    { id: 2, cls: 'TE AI&DS', course: 'AIDS302', date: '2026-03-29', present: students.filter(s => s.attendance >= 75).length, total: students.length, pct: Math.round(students.filter(s => s.attendance >= 75).length / students.length * 100) }
  ];

  const state = {
    admissions,
    students,
    courses,
    attendance: attendanceSummary,
    exams: [ { id: 1, exam: 'Mid Sem', course: 'AIDS301', date: '2026-04-02', hall: 'C-Block', marks: 0, inv: '' } ],
    faculty: [
      { id: 1, name: 'Prof. Meera Singh', dept: 'AI&DS', desig: 'Asst. Professor', load: 14, email: 'meera@college.edu', status: 'Active', leaveBalance: 12, courses: ['AIDS301'] },
      { id: 2, name: 'Dr. Rajiv Rao', dept: 'AI&DS', desig: 'Professor', load: 16, email: 'rao@college.edu', status: 'Active', leaveBalance: 10, courses: ['AIDS302'] }
    ],
    fees,
    hr: [],
    library: [],
    hostel: students.slice(0, 20).map((s, i) => ({ id: i + 1, room: 'H-' + (100 + i), block: 'A', student: s.name, capacity: 2, mess: 'North', status: 'Occupied' })),
    transport: students.slice(0, 15).map((s, i) => ({ id: i + 1, route: 'Route ' + ((i % 4) + 1), vehicle: 'Bus ' + (i % 4 + 1), driver: 'Driver ' + (i % 4 + 1), capacity: 50, time: '08:00', status: 'Active' })),
    placements: students.slice(0, 10).map((s, i) => ({ id: i + 1, company: 'TechCorp', role: 'Intern', pkg: 6 + (i % 3), date: '2026-04-15', type: 'Internship', status: 'Scheduled' })),
    research: [],
    facilities: [],
    inventory: [],
    procurement: [],
    service: [],
    communications: students.slice(0, 8).map((s, i) => ({ id: i + 1, audience: 'AI&DS', channel: 'Email', subject: 'Dept Notice', message: 'Reminder for SEPM review', date: '2026-03-30' })),
    compliance: [],
    departments: [ { id: 1, name: 'AI&DS', hod: 'Dr. Neha Kulkarni', students: students.length, faculty: 10, courses: courses.length, rating: 4.4 } ],
    assignments: [ { id: 1, course: 'AIDS301', title: 'SEPM Case Study', deadline: '2026-04-05', submitted: Math.round(students.length * 0.7), total: students.length, status: 'Active' } ],
    marks,
    leaveRequests: [],
    announcements: [ { id: 1, title: 'SEPM Review', author: 'HOD', audience: 'AI&DS', date: '2026-03-30', priority: 'High', content: 'Project review on April 3.' } ],
    calendar: [ { id: 1, event: 'Mid-Sem Exams', start: '2026-04-02', end: '2026-04-10', type: 'Exam', dept: 'AI&DS' } ],
    auditLogs: [ { id: 1, user: 'System', action: 'Seeded Student Records', target: 'AI&DS', timestamp: new Date().toLocaleString(), ip: '127.0.0.1' } ],
    proposals: [],
    materials: [ { id: 1, course: 'AIDS301', title: 'SEPM Notes', type: 'PDF', faculty: 'Prof. Meera Singh', date: '2026-03-27', size: '2.1 MB' } ],
    timetable: [ { day: 'Monday', time: '10:00-11:00', course: 'AIDS301', room: 'CR-201', faculty: 'Prof. Meera Singh', batch: 'TE AI&DS' } ],

    // Extended keys used by features.js
    studentFlags,
    behaviorRecords,
    ciaMarks,
    eseMarks,
    attendanceEntries,
    feeOutstanding,
    studentCategories,
    studentDocuments,
    concessionRequests,
    attendanceOverall: []
  };

  await db.setAppState('default', state);
  console.log('Seeded app_state with students:', students.length);
})();

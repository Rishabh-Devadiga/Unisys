/* ===== UniSys / EduSys — main.js ===== */

/* Safe storage wrapper (falls back if localStorage is blocked) */
window.__edusysMemStore = window.__edusysMemStore || {};
function storeGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return window.__edusysMemStore[key] || null; }
}
function storeSet(key, val) {
  try { localStorage.setItem(key, val); } catch(e) { window.__edusysMemStore[key] = String(val); }
}
function storeRemove(key) {
  try { localStorage.removeItem(key); } catch(e) { delete window.__edusysMemStore[key]; }
}

/* ── THEME ─────────────────────────────────────── */
const root = document.documentElement;
root.setAttribute('data-theme', storeGet('unisys-theme') || 'dark');
function updateThemeBtns() {
  const t = root.getAttribute('data-theme');
  document.querySelectorAll('.theme-btn').forEach(b => { b.textContent = t === 'light' ? '🌙' : '☀️'; });
}
updateThemeBtns();
function toggleTheme() {
  const n = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
  root.setAttribute('data-theme', n);
  storeSet('unisys-theme', n);
  updateThemeBtns();
}

/* ── TOAST ─────────────────────────────────────── */
let _toastTimer;
function showToast(msg, type) {
  type = type || 'success';
  const icons = { success: '✓', error: '✕', warning: '!', info: 'i' };
  const t = document.getElementById('toast');
  if (!t) return;
  t.className = 'toast toast-' + type;
  const ic = t.querySelector('.toast-icon');
  const ms = t.querySelector('.toast-msg');
  if (ic) ic.textContent = icons[type] || '✓';
  if (ms) ms.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function() { t.classList.remove('show'); }, 3200);
}

/* ── PAGE ROUTER ───────────────────────────────── */
function showPage(id) {
  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  const page = document.getElementById(id);
  if (page) { page.classList.add('active'); } else { console.warn('Page not found:', id); return; }
  window.scrollTo(0, 0);
  if (id === 'erp' && typeof getSession === 'function') {
    try {
      if (!getSession()) showToast('Tip: use Access Page → “Enter Demo ERP” / role login to see all features.', 'info');
    } catch(e) { /* ignore */ }
  }
  if (id === 'erp') { initERP(); }
  if (id === 'landing') { initLanding(); }
}

/* ── MODALS ────────────────────────────────────── */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}
document.addEventListener('click', function(e) {
  if (e.target && e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});
function submitJoin() {
  const name = (document.getElementById('jf-name') || {}).value;
  const email = (document.getElementById('jf-email') || {}).value;
  if (!name || !email) { showToast('Please fill your name and email', 'error'); return; }
  closeModal('join-modal');
  showToast('Welcome, ' + name + '! We\'ll reach out at ' + email);
}
function openPlan(name, price) {
  const t = document.getElementById('plan-title');
  const d = document.getElementById('plan-desc');
  if (t) t.textContent = 'Start ' + name + ' Plan';
  if (d) d.textContent = 'Subscribe to EduSys ' + name + ' at ' + price + '. Confirmation within 24 hours.';
  openModal('plan-modal');
}
function submitPlan() {
  const college = ((document.getElementById('pm-college') || {}).value || '').trim();
  if (!college) { showToast('Please enter your college name', 'error'); return; }
  closeModal('plan-modal');
  showToast('Plan confirmed for ' + college + '!');
}

/* ── SCROLL HELPER ─────────────────────────────── */
function smoothTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

/* ── FAQ ───────────────────────────────────────── */
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const ans = item.querySelector('.faq-a');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item').forEach(function(i) {
    i.classList.remove('open');
    const a = i.querySelector('.faq-a');
    if (a) a.classList.remove('open');
  });
  if (!isOpen) { item.classList.add('open'); if (ans) ans.classList.add('open'); }
}

/* ── LANDING INIT ──────────────────────────────── */
let _landingTabTimer = null;
function setLandingTab(tabId, btn) {
  document.querySelectorAll('#landing-tabs .tab-btn').forEach(function(b) { b.classList.remove('active'); });
  if (btn) btn.classList.add('active');
  document.querySelectorAll('#landing-patterns .pattern-card').forEach(function(c) {
    const match = c.dataset.tab === tabId;
    c.style.opacity = match ? '1' : '0.2';
    c.style.transform = match ? 'translateY(0)' : 'translateY(6px)';
  });
}
function initLanding() {
  const revEls = document.querySelectorAll('#landing .reveal');
  const obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1 });
  revEls.forEach(function(el, i) {
    el.style.transitionDelay = Math.min(i * 50, 280) + 'ms';
    obs.observe(el);
  });
  const firstTab = document.querySelector('#landing-tabs .tab-btn');
  setLandingTab('admissions', firstTab);
  clearInterval(_landingTabTimer);
  const order = ['admissions', 'attendance', 'exams', 'finance', 'hr'];
  let idx = 0;
  _landingTabTimer = setInterval(function() {
    idx = (idx + 1) % order.length;
    const b = document.querySelector('#landing-tabs [data-tab="' + order[idx] + '"]');
    setLandingTab(order[idx], b);
  }, 2800);
}

/* ── ERP STATE ─────────────────────────────────── */
const S = {
  admissions: [
    { id:1, name:'Riya Patel', program:'B.Tech CSE', stage:'Applied', score:82 },
    { id:2, name:'Aman Verma', program:'MBA', stage:'Offered', score:88 }
  ],
  students: [
    { id:1, name:'Priya Sharma', roll:'CSE-101', dept:'CSE', year:'3rd Year', status:'Active', email:'priya@college.edu' },
    { id:2, name:'Dev Malhotra', roll:'ME-204', dept:'ME', year:'2nd Year', status:'Active', email:'dev@college.edu' },
    { id:3, name:'Anjali Singh', roll:'ECE-305', dept:'ECE', year:'3rd Year', status:'Active', email:'anjali@college.edu' }
  ],
  courses: [
    { id:1, code:'CSE301', name:'Data Structures', credits:3, faculty:'Dr. Rao', sem:'5', cert:'DSA Certificate' },
    { id:2, code:'CSE401', name:'Computer Networks', credits:4, faculty:'Prof. Singh', sem:'7', cert:'Networks Certificate' }
  ],
  attendance: [
    { id:1, cls:'CSE A', course:'DSA', date:'2026-03-10', present:86 },
    { id:2, cls:'ECE B', course:'Signals', date:'2026-03-10', present:91 }
  ],
  exams: [
    { id:1, exam:'Mid Semester', course:'CSE301', date:'2026-04-02', hall:'H1', marks:100, inv:'Dr. Rao' },
    { id:2, exam:'End Semester', course:'CSE401', date:'2026-05-10', hall:'H3', marks:100, inv:'Prof. Singh' }
  ],
  faculty: [
    { id:1, name:'Dr. Rao', dept:'CSE', desig:'Professor', load:14, email:'rao@college.edu', status:'Active' },
    { id:2, name:'Prof. Singh', dept:'ECE', desig:'Assoc. Professor', load:12, email:'singh@college.edu', status:'Active' }
  ],
  fees: [
    { id:1, student:'Priya Sharma', type:'Tuition Fee', amount:45000, due:'2026-04-10', mode:'Online', status:'Pending' },
    { id:2, student:'Dev Malhotra', type:'Tuition Fee', amount:45000, due:'2026-03-01', mode:'Online', status:'Paid' }
  ],
  hr: [
    { id:1, name:'Rohit Jain', role:'Accountant', dept:'Finance', salary:55000, shift:'Day', status:'Active' },
    { id:2, name:'Meena Patel', role:'Librarian', dept:'Library', salary:42000, shift:'Day', status:'Active' }
  ],
  library: [
    { id:1, title:'Operating Systems', author:'Tanenbaum', isbn:'978-013', category:'Engineering', copies:4, status:'Available' },
    { id:2, title:'Algorithm Design', author:'Kleinberg', isbn:'978-032', category:'Engineering', copies:2, status:'Issued' }
  ],
  hostel: [
    { id:1, room:'B-210', block:'Block B', student:'Dev Malhotra', capacity:2, mess:'Full Board', status:'Occupied' },
    { id:2, room:'A-105', block:'Block A', student:'', capacity:2, mess:'No Mess', status:'Vacant' }
  ],
  transport: [
    { id:1, route:'North Loop', vehicle:'Bus 4', driver:'Mahesh', capacity:40, time:'07:30', status:'Active' }
  ],
  placements: [
    { id:1, company:'TCS', role:'Analyst', pkg:6, date:'2026-04-05', type:'Full Time', status:'Scheduled' },
    { id:2, company:'Infosys', role:'Developer', pkg:7.5, date:'2026-04-12', type:'Full Time', status:'Scheduled' }
  ],
  research: [
    { id:1, project:'AI Lab', pi:'Dr. Iyer', agency:'DST', funding:250000, start:'2026-01-01', status:'Active' }
  ],
  facilities: [
    { id:1, asset:'Generator', location:'Block A', tag:'ASSET-001', condition:'Good', ticket:'' }
  ],
  inventory: [
    { id:1, item:'Projectors', qty:6, unit:'Pieces', store:'Main Store', reorder:2, status:'In Stock' },
    { id:2, item:'Lab Computers', qty:30, unit:'Pieces', store:'Lab Store', reorder:5, status:'In Stock' }
  ],
  procurement: [
    { id:1, vendor:'Tech Supplies', item:'Laptops', qty:10, amount:180000, date:'2026-04-15', status:'Requested' }
  ],
  service: [
    { id:1, requester:'Library', category:'IT Support', subject:'Network issue', priority:'High', assigned:'IT Team', status:'Open' },
    { id:2, requester:'Block C', category:'Facilities', subject:'AC not working', priority:'Medium', assigned:'Maintenance', status:'In Progress' },
    { id:3, requester:'Finance Dept', category:'IT Support', subject:'Printer error', priority:'Low', assigned:'IT Team', status:'Open' }
  ],
  communications: [
    { id:1, audience:'Students', channel:'Email', subject:'Mid-sem notice', message:'Mid-sem schedule released', date:'2026-03-18' }
  ],
  compliance: [
    { id:1, title:'Criterion 1 Report', criterion:'Criterion 1', owner:'IQAC', type:'Document', status:'Submitted', file:'' }
  ]
};

/* ── TABLE HELPERS ─────────────────────────────── */
function sbadge(s) {
  const m = {
    Active:'green', Paid:'green', Available:'green', Completed:'green', Verified:'green', Approved:'green',
    Occupied:'blue', Scheduled:'blue', Submitted:'blue', 'In Progress':'yellow', 'On Hold':'yellow',
    Pending:'yellow', Overdue:'red', Open:'red', Requested:'orange',
    Draft:'gray', Closed:'gray', Inactive:'gray', Vacant:'gray'
  };
  return '<span class="badge badge-' + (m[s] || 'gray') + '">' + s + '</span>';
}
function badge(text, type) { return '<span class="badge badge-' + type + '">' + text + '</span>'; }

function renderT(id, heads, rows) {
  const el = document.getElementById(id);
  if (!el) return;
  const th = '<thead><tr>' + heads.map(function(h) { return '<th>' + h + '</th>'; }).join('') + '</tr></thead>';
  const empty = '<tr><td colspan="' + heads.length + '" style="text-align:center;color:var(--text3);padding:24px;font-size:13px">No records yet. Add one above.</td></tr>';
  const tb = '<tbody>' + (rows.length ? rows.map(function(r) {
    return '<tr>' + r.map(function(c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
  }).join('') : empty) + '</tbody>';
  el.innerHTML = th + tb;
}

function g(id) { return document.getElementById(id); }
function gv(id) { const e = g(id); return e ? e.value.trim() : ''; }
function gn(id) { const e = g(id); return e ? (Number(e.value) || 0) : 0; }

/* ── NOTIFICATIONS (MOCK) ─────────────────────────────────── */
const NOTIFICATIONS = [
  { id: 1, title: 'Assignment Uploaded', message: 'DBMS Assignment 2 has been uploaded.', time: '2 minutes ago', read: false },
  { id: 2, title: 'Meeting Scheduled', message: 'AI Lecture meeting scheduled.', time: '10 minutes ago', read: false },
  { id: 3, title: 'Fee Reminder', message: 'Semester fee is due in 3 days.', time: '1 hour ago', read: true },
  { id: 4, title: 'Library Notice', message: 'New journals added to the CS section.', time: 'Yesterday', read: true }
];
let _notifOpen = false;
let _notifReady = false;
let ERP_SOCKET = null;
let ERP_PRESENCE = { online: {} };
let ERP_USER = null;

function normalizeNotification(item) {
  if (!item) return null;
  return {
    id: item.id || ('n' + Date.now() + Math.random().toString(36).slice(2, 6)),
    title: item.title || 'Notification',
    message: item.message || '',
    time: item.time || 'Just now',
    meetingId: item.meetingId || null,
    read: !!item.read
  };
}

function pushNotification(item, prepend) {
  const next = normalizeNotification(item);
  if (!next) return;
  if (NOTIFICATIONS.some(function(n) { return n.id === next.id; })) return;
  if (prepend === false) NOTIFICATIONS.push(next);
  else NOTIFICATIONS.unshift(next);
  renderNotifications();
}

function replaceNotifications(list) {
  if (!Array.isArray(list) || !list.length) return;
  NOTIFICATIONS.length = 0;
  list.forEach(function(n) {
    const next = normalizeNotification(n);
    if (next) NOTIFICATIONS.push(next);
  });
  renderNotifications();
}

function renderNotifications() {
  const list = g('notif-list');
  const dot = g('notif-dot');
  const markAll = g('notif-mark-all');
  if (!list) return;

  if (!NOTIFICATIONS.length) {
    list.innerHTML = '<div class="notif-empty">No notifications</div>';
  } else {
    list.innerHTML = NOTIFICATIONS.map(function(n) {
      const state = n.read ? 'is-read' : 'is-unread';
      return '<div class="notif-item ' + state + '">'
        + '<div>'
          + '<div class="notif-item-title">' + (n.title || 'Notification') + '</div>'
          + '<div class="notif-item-msg">' + (n.message || '') + '</div>'
          + '<div class="notif-item-time">' + (n.time || 'Just now') + '</div>'
        + '</div>'
        + '<span class="notif-item-dot" aria-hidden="true"></span>'
      + '</div>';
    }).join('');
  }

  const hasUnread = NOTIFICATIONS.some(function(n) { return !n.read; });
  if (dot) dot.style.display = hasUnread ? 'block' : 'none';
  if (markAll) markAll.disabled = !hasUnread;
}

function setNotifOpen(open) {
  const panel = g('notif-panel');
  const toggle = g('notif-toggle');
  if (!panel || !toggle) return;
  _notifOpen = !!open;
  panel.classList.toggle('open', _notifOpen);
  panel.setAttribute('aria-hidden', _notifOpen ? 'false' : 'true');
  toggle.setAttribute('aria-expanded', _notifOpen ? 'true' : 'false');
}

function toggleNotifPanel() {
  setNotifOpen(!_notifOpen);
}

function initNotifications() {
  if (_notifReady) return;
  _notifReady = true;
  const root = g('notif-root');
  const toggle = g('notif-toggle');
  const panel = g('notif-panel');
  const markAll = g('notif-mark-all');
  if (!root || !toggle || !panel) return;

  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    toggleNotifPanel();
  });

  panel.addEventListener('click', function(e) { e.stopPropagation(); });

  if (markAll) {
    markAll.addEventListener('click', function(e) {
      e.preventDefault();
      NOTIFICATIONS.forEach(function(n) { n.read = true; });
      renderNotifications();
    });
  }

  document.addEventListener('click', function(e) {
    if (!_notifOpen) return;
    if (root && !root.contains(e.target)) setNotifOpen(false);
  });

  renderNotifications();
}

function getERPUser() {
  if (ERP_USER) return ERP_USER;
  var sess = (typeof getSession === 'function') ? getSession() : null;
  if (sess && sess.email) {
    ERP_USER = { id: sess.email, name: sess.name || sess.email };
    return ERP_USER;
  }
  var anon = storeGet('edusys-guest-id');
  if (!anon) {
    anon = 'guest-' + Math.random().toString(36).slice(2, 8);
    storeSet('edusys-guest-id', anon);
  }
  ERP_USER = { id: anon, name: 'Guest User' };
  return ERP_USER;
}

function initPresenceSocket() {
  if (ERP_SOCKET || !window.io) return;
  var user = getERPUser();
  ERP_SOCKET = io({ transports: ['websocket', 'polling'] });
  window.ERP_SOCKET = ERP_SOCKET;
  window.ERP_PRESENCE = ERP_PRESENCE;
  window.ERP_CURRENT_USER = user;

  ERP_SOCKET.on('connect', function() {
    ERP_SOCKET.emit('presence:join', { userId: user.id, name: user.name });
  });

  ERP_SOCKET.on('presence:update', function(payload) {
    ERP_PRESENCE = payload || { online: {} };
    window.ERP_PRESENCE = ERP_PRESENCE;
    if (typeof window.refreshInvitePanel === 'function') window.refreshInvitePanel();
  });

  ERP_SOCKET.on('notifications:sync', function(payload) {
    if (Array.isArray(payload) && payload.length) replaceNotifications(payload);
  });

  ERP_SOCKET.on('notification', function(payload) {
    pushNotification(payload);
  });
}

function updateAll() {
  renderT('admission-table', ['Applicant','Program','Stage','Score'],
    S.admissions.map(function(a) { return [a.name, a.program, sbadge(a.stage), a.score]; }));

  renderT('student-table', ['Name','Roll No','Dept','Year','Status','Email'],
    S.students.map(function(s) { return [s.name, s.roll, s.dept, s.year, sbadge(s.status), s.email || '—']; }));

  renderT('course-table', ['Code','Course','Credits','Faculty','Sem','Certificate'],
    S.courses.map(function(c) { return [c.code, c.name, badge(c.credits + ' cr','blue'), c.faculty, 'Sem ' + c.sem, c.cert]; }));

  renderT('attendance-table', ['Class','Course','Date','Present %'],
    S.attendance.map(function(a) { return [a.cls, a.course, a.date, badge(a.present + '%', a.present >= 75 ? 'green' : 'red')]; }));

  renderT('exam-table', ['Exam','Course','Date','Hall','Max Marks','Invigilator'],
    S.exams.map(function(e) { return [e.exam, e.course, e.date, e.hall, e.marks, e.inv]; }));

  renderT('faculty-table', ['Name','Dept','Designation','Load (hrs)','Email','Status'],
    S.faculty.map(function(f) { return [f.name, f.dept, f.desig, f.load, f.email, sbadge(f.status)]; }));

  renderT('fee-table', ['Student','Type','Amount','Due Date','Mode','Status'],
    S.fees.map(function(f) { return [f.student, f.type, '₹' + f.amount.toLocaleString(), f.due, f.mode, sbadge(f.status)]; }));

  renderT('hr-table', ['Name','Role','Dept','Salary','Shift','Status'],
    S.hr.map(function(h) { return [h.name, h.role, h.dept, '₹' + h.salary.toLocaleString(), h.shift, sbadge(h.status)]; }));

  renderT('library-table', ['Title','Author','ISBN','Category','Copies','Status'],
    S.library.map(function(l) { return [l.title, l.author, l.isbn, l.category, l.copies, sbadge(l.status)]; }));

  renderT('hostel-table', ['Room','Block','Student','Capacity','Mess','Status'],
    S.hostel.map(function(h) { return [h.room, h.block, h.student || '—', h.capacity, h.mess, sbadge(h.status)]; }));

  renderT('transport-table', ['Route','Vehicle','Driver','Capacity','Departure','Status'],
    S.transport.map(function(t) { return [t.route, t.vehicle, t.driver, t.capacity, t.time, sbadge(t.status)]; }));

  renderT('placement-table', ['Company','Role','Package','Date','Type','Status'],
    S.placements.map(function(p) { return [p.company, p.role, badge('₹' + p.pkg + ' LPA', 'green'), p.date, p.type, sbadge(p.status)]; }));

  renderT('research-table', ['Project','PI','Agency','Funding','Start','Status'],
    S.research.map(function(r) { return [r.project, r.pi, r.agency, '₹' + r.funding.toLocaleString(), r.start, sbadge(r.status)]; }));

  renderT('facility-table', ['Asset','Location','Tag','Condition','Ticket'],
    S.facilities.map(function(f) {
      const cond = f.condition;
      return [f.asset, f.location, f.tag, badge(cond, cond === 'Good' ? 'green' : cond === 'Fair' ? 'yellow' : 'red'), f.ticket || '—'];
    }));

  renderT('inventory-table', ['Item','Qty','Unit','Store','Reorder Level','Status'],
    S.inventory.map(function(i) { return [i.item, i.qty, i.unit, i.store, i.reorder, sbadge(i.status)]; }));

  renderT('procurement-table', ['Vendor','Item','Qty','Amount','Required By','Status'],
    S.procurement.map(function(p) { return [p.vendor, p.item, p.qty, '₹' + p.amount.toLocaleString(), p.date || '—', sbadge(p.status)]; }));

  renderT('service-table', ['Requester','Category','Subject','Priority','Assigned To','Status'],
    S.service.map(function(s) {
      const pcolor = (s.priority === 'High' || s.priority === 'Critical') ? 'red' : s.priority === 'Medium' ? 'yellow' : 'gray';
      return [s.requester, s.category, s.subject, badge(s.priority, pcolor), s.assigned, sbadge(s.status)];
    }));

  renderT('comm-table', ['Audience','Channel','Subject','Message','Date'],
    S.communications.map(function(c) { return [c.audience, c.channel, c.subject || '—', c.message, c.date]; }));

  renderT('compliance-table', ['Title','Criterion','Owner','Type','Status','File'],
    S.compliance.map(function(c) { return [c.title, c.criterion.split('—')[0].trim(), c.owner, c.type, sbadge(c.status), c.file || '—']; }));

  /* update count badges */
  const counts = {
    'adm-count': S.admissions.length + ' applicants',
    'stu-count': S.students.length + ' students',
    'crs-count': S.courses.length + ' courses',
    'att-count': S.attendance.length + ' records',
    'exam-count': S.exams.length + ' exams',
    'fac-count': S.faculty.length + ' faculty',
    'fee-count': S.fees.length + ' invoices',
    'hr-count': S.hr.length + ' employees',
    'lib-count': S.library.length + ' books',
    'hos-count': S.hostel.length + ' rooms',
    'trn-count': S.transport.length + ' routes',
    'plc-count': S.placements.length + ' drives',
    'res-count': S.research.length + ' projects',
    'fac-asset-count': S.facilities.length + ' assets',
    'inv-count': S.inventory.length + ' items',
    'proc-count': S.procurement.length + ' POs',
    'svc-count': S.service.filter(function(s) { return s.status === 'Open' || s.status === 'In Progress'; }).length + ' open',
    'com-count': S.communications.length + ' sent',
    'comp-count': S.compliance.length + ' items'
  };
  Object.keys(counts).forEach(function(id) {
    const el = g(id); if (el) el.textContent = counts[id];
  });
  /* sidebar badges */
  const nb1 = g('nb-admissions'); if (nb1) nb1.textContent = S.admissions.length;
  const nb2 = g('nb-finance'); if (nb2) nb2.textContent = S.fees.filter(function(f) { return f.status === 'Pending' || f.status === 'Overdue'; }).length;
  const nb3 = g('nb-service'); if (nb3) nb3.textContent = S.service.filter(function(s) { return s.status === 'Open'; }).length;
  /* KPI cards */
  const ks = g('kpi-students'); if (ks) ks.textContent = (1842 + S.students.length - 3).toLocaleString();
  const kt = g('kpi-tickets'); if (kt) kt.textContent = (128 + S.service.length - 3);
}

/* ── ERP ACTIONS ───────────────────────────────── */
const A = {
  'add-admission': function() {
    S.admissions.push({ id: Date.now(), name: gv('admission-name') || 'New Applicant', program: gv('admission-program'), stage: gv('admission-stage'), score: gn('admission-score') });
    showToast('Applicant added');
  },
  'convert-student': function() {
    const a = S.admissions.shift();
    if (!a) { showToast('No applicants to convert', 'error'); return; }
    S.students.push({ id: Date.now(), name: a.name, roll: 'NEW-' + String(Date.now()).slice(-4), dept: a.program.indexOf('CSE') > -1 ? 'CSE' : a.program.indexOf('ECE') > -1 ? 'ECE' : 'MBA', year: '1st Year', status: 'Active', email: '' });
    showToast(a.name + ' converted to student');
  },
  'add-student': function() {
    S.students.push({ id: Date.now(), name: gv('student-name') || 'New Student', roll: gv('student-roll') || ('ROLL-' + String(Date.now()).slice(-4)), dept: gv('student-dept'), year: gv('student-year'), status: gv('student-status'), email: gv('student-email') });
    showToast('Student registered');
  },
  'delete-student': function() {
    const s = S.students.pop();
    showToast(s ? s.name + ' removed' : 'No students to remove', s ? 'success' : 'error');
  },
  'add-course': function() {
    S.courses.push({ id: Date.now(), code: gv('course-code') || 'NEW101', name: gv('course-name') || 'New Course', credits: gn('course-credits') || 3, faculty: gv('course-faculty'), sem: gv('course-sem'), cert: gv('course-cert') || 'Certificate' });
    showToast('Course added');
  },
  'update-course': function() {
    const code = gv('course-code');
    const c = S.courses.find(function(x) { return x.code === code; });
    if (!c) { showToast('Course code not found', 'error'); return; }
    if (gv('course-name')) c.name = gv('course-name');
    if (gn('course-credits')) c.credits = gn('course-credits');
    if (gv('course-faculty')) c.faculty = gv('course-faculty');
    showToast('Course updated');
  },
  'delete-course': function() {
    const code = gv('course-code');
    const idx = S.courses.findIndex(function(x) { return x.code === code; });
    if (idx === -1) { showToast('Course code not found', 'error'); return; }
    S.courses.splice(idx, 1); showToast('Course deleted');
  },
  'issue-course-cert': function() {
    const code = gv('course-code');
    const c = S.courses.find(function(x) { return x.code === code; });
    if (!c) { showToast('Course code not found', 'error'); return; }
    showToast('Certificate issued: ' + c.cert);
  },
  'mark-attendance': function() {
    S.attendance.push({ id: Date.now(), cls: gv('att-class'), course: gv('att-course'), date: gv('att-date') || new Date().toISOString().split('T')[0], present: gn('att-present') });
    showToast('Attendance recorded');
  },
  'schedule-exam': function() {
    S.exams.push({ id: Date.now(), exam: gv('exam-name'), course: gv('exam-course') || 'TBD', date: gv('exam-date') || '2026-04-15', hall: gv('exam-hall') || 'H1', marks: gn('exam-marks') || 100, inv: gv('exam-inv') || 'TBD' });
    showToast('Exam scheduled');
  },
  'publish-results': function() { showToast('Results published to student portal'); },
  'add-faculty': function() {
    S.faculty.push({ id: Date.now(), name: gv('faculty-name') || 'New Faculty', dept: gv('faculty-dept'), desig: gv('faculty-desig'), load: gn('faculty-load') || 12, email: gv('faculty-email'), status: gv('faculty-status') });
    showToast('Faculty added');
  },
  'add-invoice': function() {
    S.fees.push({ id: Date.now(), student: gv('fee-student') || 'Student', type: gv('fee-type'), amount: gn('fee-amount') || 0, due: gv('fee-due') || '2026-04-30', mode: gv('fee-mode'), status: gv('fee-status') });
    showToast('Invoice created');
  },
  'record-payment': function() {
    const p = S.fees.find(function(f) { return f.status === 'Pending' || f.status === 'Overdue'; });
    if (p) { p.status = 'Paid'; showToast('Payment recorded for ' + p.student); }
    else showToast('No pending invoices', 'warning');
  },
  'add-employee': function() {
    S.hr.push({ id: Date.now(), name: gv('hr-name') || 'Employee', role: gv('hr-role') || 'Staff', dept: gv('hr-dept'), salary: gn('hr-salary') || 0, shift: gv('hr-shift'), status: gv('hr-status') });
    showToast('Employee added');
  },
  'run-payroll': function() { showToast('Payroll processed for ' + S.hr.length + ' employees'); },
  'add-book': function() {
    S.library.push({ id: Date.now(), title: gv('lib-title') || 'New Book', author: gv('lib-author') || 'Author', isbn: gv('lib-isbn') || '—', category: gv('lib-category'), copies: gn('lib-copies') || 1, status: gv('lib-status') });
    showToast('Book added to catalog');
  },
  'issue-book': function() {
    const b = S.library.find(function(l) { return l.status === 'Available'; });
    if (b) { b.status = 'Issued'; showToast('Book issued: ' + b.title); }
    else showToast('No available books', 'warning');
  },
  'allocate-room': function() {
    S.hostel.push({ id: Date.now(), room: gv('hostel-room') || 'X-101', block: gv('hostel-block'), student: gv('hostel-student') || '—', capacity: gn('hostel-capacity') || 2, mess: gv('hostel-mess'), status: gv('hostel-status') });
    showToast('Room allocated');
  },
  'add-route': function() {
    S.transport.push({ id: Date.now(), route: gv('transport-route') || 'New Route', vehicle: gv('transport-vehicle') || 'Bus', driver: gv('transport-driver') || 'Driver', capacity: gn('transport-capacity') || 40, time: gv('transport-time') || '07:30', status: gv('transport-status') });
    showToast('Route added');
  },
  'add-placement': function() {
    const pkgEl = g('place-package');
    S.placements.push({ id: Date.now(), company: gv('place-company') || 'Company', role: gv('place-role') || 'Role', pkg: pkgEl ? Number(pkgEl.value) || 0 : 0, date: gv('place-date') || '2026-04-15', type: gv('place-type'), status: gv('place-status') });
    showToast('Placement drive added');
  },
  'add-research': function() {
    S.research.push({ id: Date.now(), project: gv('res-project') || 'Project', pi: gv('res-pi') || 'PI', agency: gv('res-agency') || 'Internal', funding: gn('res-fund') || 0, start: gv('res-start') || '—', status: gv('res-status') });
    showToast('Research project added');
  },
  'add-asset': function() {
    S.facilities.push({ id: Date.now(), asset: gv('fac-asset') || 'Asset', location: gv('fac-location') || 'Block A', tag: gv('fac-tag') || ('ASSET-' + (S.facilities.length + 1)), condition: gv('fac-condition'), ticket: gv('fac-ticket') });
    showToast('Asset logged');
  },
  'raise-ticket': function() {
    S.service.push({ id: Date.now(), requester: 'Facilities', category: 'Facilities', subject: 'Maintenance required', priority: 'High', assigned: 'Maintenance Team', status: 'Open' });
    showToast('Ticket raised');
  },
  'add-inventory': function() {
    S.inventory.push({ id: Date.now(), item: gv('inv-item') || 'Item', qty: gn('inv-qty') || 0, unit: gv('inv-unit'), store: gv('inv-store'), reorder: gn('inv-reorder') || 1, status: gv('inv-status') });
    showToast('Item added to inventory');
  },
  'issue-inventory': function() {
    const item = S.inventory.find(function(i) { return i.qty > 0; });
    if (item) {
      item.qty = Math.max(0, item.qty - 1);
      if (item.qty <= item.reorder) item.status = 'Low Stock';
      showToast('Item issued: ' + item.item);
    } else showToast('No stock available', 'warning');
  },
  'add-procurement': function() {
    S.procurement.push({ id: Date.now(), vendor: gv('proc-vendor') || 'Vendor', item: gv('proc-item') || 'Item', qty: gn('proc-qty') || 1, amount: gn('proc-amount') || 0, date: gv('proc-date') || '—', status: gv('proc-status') });
    showToast('Purchase order created');
  },
  'add-ticket': function() {
    S.service.push({ id: Date.now(), requester: gv('svc-requester') || 'User', category: gv('svc-category'), subject: gv('svc-subject') || 'Support needed', priority: gv('svc-priority'), assigned: gv('svc-assigned') || 'Support Team', status: gv('svc-status') });
    showToast('Ticket created');
  },
  'send-broadcast': function() {
    S.communications.push({ id: Date.now(), audience: gv('comm-audience'), channel: gv('comm-channel'), subject: gv('comm-subject') || 'Announcement', message: gv('comm-message') || '—', date: new Date().toLocaleDateString() });
    showToast('Broadcast sent successfully');
  },
  'add-evidence': function() {
    const fileEl = g('comp-file');
    S.compliance.push({ id: Date.now(), title: gv('comp-title') || 'Evidence', criterion: gv('comp-criterion'), owner: gv('comp-owner') || 'IQAC', type: gv('comp-type'), status: gv('comp-status'), file: (fileEl && fileEl.files[0]) ? fileEl.files[0].name : '' });
    showToast('Evidence added');
  }
};

/* ── ERP INIT ──────────────────────────────────── */
let _erpReady = false;
function initERP() {
  updateAll();
  if (_erpReady) return;
  _erpReady = true;

  initNotifications();
  initPresenceSocket();

  /* sidebar nav */
  const sidebarNav = document.getElementById('module-nav');
  if (sidebarNav) {
    sidebarNav.addEventListener('click', function(e) {
      const btn = e.target.closest('.nav-item[data-module]');
      if (!btn) return;
      document.querySelectorAll('.nav-item').forEach(function(n) { n.classList.remove('active'); });
      btn.classList.add('active');
      const target = btn.dataset.module;
      document.querySelectorAll('.module-section').forEach(function(s) {
        s.classList.toggle('active', s.id === target);
      });
      const mw = document.querySelector('.module-wrap');
      if (mw) mw.scrollTop = 0;
    });
  }

  /* module jump buttons */
  document.querySelectorAll('[data-module-jump]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const t = btn.getAttribute('data-module-jump');
      const navBtn = document.querySelector('.nav-item[data-module="' + t + '"]');
      if (navBtn) navBtn.click();
    });
  });

  /* action buttons */
  document.querySelectorAll('[data-action]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      const action = btn.getAttribute('data-action');
      if (A[action]) { A[action](); updateAll(); }
    });
  });

  /* CSV course upload */
  const csvInput = g('course-upload');
  if (csvInput) {
    csvInput.addEventListener('change', function(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function() {
        const lines = reader.result.trim().split('\n');
        let count = 0;
        lines.slice(1).forEach(function(line) {
          const parts = line.split(',');
          const code = parts[0] && parts[0].trim();
          const name = parts[1] && parts[1].trim();
          if (code && name) {
            S.courses.push({ id: Date.now() + count, code: code, name: name, credits: Number(parts[2]) || 3, faculty: (parts[3] || '').trim(), sem: (parts[4] || '1').trim(), cert: (parts[5] || 'Certificate').trim() });
            count++;
          }
        });
        updateAll();
        showToast(count + ' courses imported from CSV');
      };
      reader.readAsText(file);
    });
  }

  /* attainment calculator */
  const calcBtn = g('calc-btn');
  if (calcBtn) {
    function computeAttainment() {
      const achieved = Array.from(document.querySelectorAll('.co-achieved')).map(function(el) { return Number(el.value) || 0; });
      const targets  = Array.from(document.querySelectorAll('.co-target')).map(function(el)  { return Number(el.value) || 70; });
      const credits  = Array.from(document.querySelectorAll('.co-credits')).map(function(el) { return Math.max(1, Number(el.value) || 1); });
      const weightEl = g('weight');
      const method = weightEl ? weightEl.value : 'equal';
      let total = 0, wSum = 0;
      achieved.forEach(function(v, i) {
        const w = method === 'weighted' ? credits[i] : 1;
        total += v * w; wSum += w;
      });
      const overall = wSum ? total / wSum : 0;
      const targetVal = Number((g('target') || {}).value) || 70;
      const gap = targetVal - overall;
      const sc = g('calc-score'); if (sc) sc.textContent = 'Overall: ' + overall.toFixed(1) + '%';
      const gp = g('calc-gap');   if (gp) gp.textContent = 'Gap: ' + (gap > 0 ? gap.toFixed(1) : '0') + '%';
      const st = g('calc-status');
      if (st) st.textContent = overall >= targetVal ? '✅ On Track' : overall >= targetVal - 10 ? '⚠️ Monitor' : '🔴 Action Needed';
      document.querySelectorAll('.co-gap-cell').forEach(function(cell, i) {
        const gval = achieved[i] - targets[i];
        cell.textContent = (gval >= 0 ? '+' : '') + gval.toFixed(0) + '%';
        cell.style.color = gval >= 0 ? 'var(--green)' : 'var(--red)';
      });
    }
    calcBtn.addEventListener('click', computeAttainment);
    document.querySelectorAll('.co-achieved, .co-target, .co-credits').forEach(function(el) {
      el.addEventListener('input', computeAttainment);
    });
    computeAttainment();
  }

  /* 3D canvas */
  const canvas = g('admin-canvas');
  if (canvas && window.THREE) {
    const pref = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    cam.position.set(0, 0, 7);
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setClearColor(0, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    const grp = new THREE.Group(); scene.add(grp);
    grp.add(new THREE.Mesh(new THREE.DodecahedronGeometry(1.3, 0), new THREE.MeshStandardMaterial({ color: 0x9b7bff, metalness: 0.6, roughness: 0.2, emissive: 0x1a1038, emissiveIntensity: 0.4 })));
    const halo = new THREE.Mesh(new THREE.RingGeometry(2.1, 2.45, 64), new THREE.MeshBasicMaterial({ color: 0x6ee7ff, side: THREE.DoubleSide, transparent: true, opacity: 0.22 }));
    halo.rotation.x = Math.PI / 2; grp.add(halo);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(2.75, 0.055, 16, 120), new THREE.MeshStandardMaterial({ color: 0x6d8bff, metalness: 0.4, roughness: 0.3 }));
    ring.rotation.x = Math.PI / 2.8; grp.add(ring);
    const dots = new THREE.Group();
    const dg = new THREE.SphereGeometry(0.04, 12, 12);
    const dm = new THREE.MeshStandardMaterial({ color: 0x6ee7ff, metalness: 0.3, roughness: 0.2 });
    for (let i = 0; i < 36; i++) {
      const d = new THREE.Mesh(dg, dm);
      const a = (i / 36) * Math.PI * 2;
      d.position.set(Math.cos(a) * 2.55, Math.sin(a) * 0.4, Math.sin(a) * 1.15);
      dots.add(d);
    }
    grp.add(dots);
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const kl = new THREE.PointLight(0x9b7bff, 1.2, 20); kl.position.set(4, 2, 6); scene.add(kl);
    const fl = new THREE.PointLight(0x6ee7ff, 0.8, 20); fl.position.set(-4, -2, 5); scene.add(fl);
    let tx = 0, ty = 0;
    function resizeCanvas() {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height, false);
      cam.aspect = r.width / r.height;
      cam.updateProjectionMatrix();
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', function(e) {
      tx = (e.clientX / innerWidth - 0.5) * 0.35;
      ty = (e.clientY / innerHeight - 0.5) * 0.28;
    });
    (function animate() {
      if (!pref) { grp.rotation.y += 0.004; grp.rotation.x += 0.002; dots.rotation.y += 0.003; }
      grp.rotation.x += (ty - grp.rotation.x) * 0.025;
      grp.rotation.y += (tx - grp.rotation.y) * 0.025;
      renderer.render(scene, cam);
      requestAnimationFrame(animate);
    })();
  }

  if (window.FeatureBuilder && typeof window.FeatureBuilder.init === 'function') {
    window.FeatureBuilder.init();
  }

  /* Debug: Verify Add Feature button exists */
  var addFeatureBtn = document.querySelector('.nav-item[data-module="add-feature"]');
  var addFeatureSection = document.getElementById('add-feature');
  console.log('[ADD FEATURE] Button found:', !!addFeatureBtn, 'Section found:', !!addFeatureSection);
  if (addFeatureBtn) {
    console.log('[ADD FEATURE] Button text:', addFeatureBtn.textContent.trim());
    console.log('[ADD FEATURE] Button classes:', addFeatureBtn.className);
  }
}

/* ── ACCESS PAGE ───────────────────────────────── */
function enterERP() {
  const key = ((g('access-key') || {}).value || '').trim();
  const stored = storeGet('edusys-key');
  const errEl = g('access-error');
  if ((stored && key === stored) || key === 'EDU-DEMO-2026') {
    if (errEl) errEl.style.display = 'none';
    showPage('erp');
    showToast('Welcome to EduSys ERP!');
  } else {
    if (errEl) errEl.style.display = 'block';
  }
}
function enterERPDemo() { showPage('erp'); showToast('Welcome to EduSys Demo!'); }
function fillDemo() {
  const k = g('access-key'); if (k) k.value = 'EDU-DEMO-2026';
  const e = g('access-email'); if (e) e.value = 'demo@edusys.in';
  const p = g('access-password'); if (p) p.value = 'demo123';
  showToast('Credentials filled — click Enter ERP', 'info');
}

/* ── CREATE SYSTEM (WITH EMAIL OTP VERIFICATION) ─────────────────────────────── */
// Registration with OTP verification is now handled by sendOtpForSignup() in otp.js
// This function maintains backward compatibility but is delegated to otp.js
function registerCollege() {
  // Delegate to OTP verification flow
  if (typeof sendOtpForSignup === 'function') {
    sendOtpForSignup();
  } else {
    showToast('OTP module not loaded. Please refresh the page.', 'error');
  }
}
function copyKey() {
  const key = (g('generated-key') || {}).textContent || '';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(key).then(function() { showToast('Key copied to clipboard!'); }).catch(function() { showToast('Key: ' + key); });
  } else { showToast('Key: ' + key); }
}

/* ── SEND EMAILS TO DEFAULTERS ────────────────── */
function sendEmailsToDefaulters() {
  const statusDiv = g('email-status');
  const btn = event.target;
  
  if (!statusDiv) {
    showToast('Email status display not found', 'error');
    return;
  }
  
  // Disable button and show loading state
  btn.disabled = true;
  btn.textContent = 'Sending...';
  statusDiv.style.display = 'block';
  statusDiv.innerHTML = '⏳ Sending emails...';
  statusDiv.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  statusDiv.style.borderColor = 'rgba(59, 130, 246, 0.3)';
  statusDiv.style.color = 'var(--text1)';
  
  // Call the backend endpoint
  fetch('http://localhost:3001/send-emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({})
  })
  .then(function(response) {
    if (!response.ok) throw new Error('HTTP ' + response.status);
    return response.json();
  })
  .then(function(data) {
    // Handle success
    statusDiv.innerHTML = '✅ <strong>Emails sent successfully!</strong><br>' +
      'Total: ' + data.totalStudents + ' students<br>' +
      'Sent: ' + data.successCount + '<br>' +
      'Failed: ' + data.failureCount + '<br><br>' +
      'From: ' + (data.fromEmail || 'edusysalert@gmail.com') + '<br>' +
      '<small>' + data.message + '</small>';
    statusDiv.style.backgroundColor = 'rgba(34, 197, 94, 0.1)';
    statusDiv.style.borderColor = 'rgba(34, 197, 94, 0.3)';
    statusDiv.style.color = 'var(--green)';
    showToast('SMTP sent from ' + (data.fromEmail || 'edusysalert@gmail.com') + ' to ' + data.successCount + ' defaulters!', 'success');
  })
  .catch(function(error) {
    // Handle error
    statusDiv.innerHTML = '❌ <strong>Error sending emails</strong><br>' + 
      '<small>' + error.message + '</small>';
    statusDiv.style.backgroundColor = 'rgba(248, 113, 113, 0.1)';
    statusDiv.style.borderColor = 'rgba(248, 113, 113, 0.3)';
    statusDiv.style.color = 'var(--red)';
    showToast('Failed to send emails: ' + error.message, 'error');
    console.error('Error:', error);
  })
  .finally(function() {
    // Re-enable button
    btn.disabled = false;
    btn.textContent = 'Send Warning Emails →';
  });
}

/* ── SEARCH ────────────────────────────────────── */
function handleSearch(query) {
  const clearBtn = g('search-clear');
  const panel = g('search-results');
  if (!query || !query.trim()) {
    if (panel) panel.style.display = 'none';
    if (clearBtn) clearBtn.style.display = 'none';
    return;
  }
  if (clearBtn) clearBtn.style.display = 'block';
  const q = query.toLowerCase();
  const hits = [];
  S.students.forEach(function(s) { if (s.name.toLowerCase().indexOf(q) > -1 || s.roll.toLowerCase().indexOf(q) > -1) hits.push({ type:'Student', name:s.name, detail:s.roll+' · '+s.dept+' · '+s.status }); });
  S.faculty.forEach(function(f) { if (f.name.toLowerCase().indexOf(q) > -1) hits.push({ type:'Faculty', name:f.name, detail:f.dept+' · '+f.desig }); });
  S.courses.forEach(function(c) { if (c.name.toLowerCase().indexOf(q) > -1 || c.code.toLowerCase().indexOf(q) > -1) hits.push({ type:'Course', name:c.code+' · '+c.name, detail:'Sem '+c.sem+' · '+c.faculty }); });
  S.service.forEach(function(s) { if (s.requester.toLowerCase().indexOf(q) > -1 || s.subject.toLowerCase().indexOf(q) > -1) hits.push({ type:'Ticket', name:s.subject, detail:s.category+' · '+s.priority+' · '+s.status }); });
  S.fees.forEach(function(f) { if (f.student.toLowerCase().indexOf(q) > -1) hits.push({ type:'Invoice', name:f.student, detail:'₹'+f.amount.toLocaleString()+' · '+f.status }); });
  S.admissions.forEach(function(a) { if (a.name.toLowerCase().indexOf(q) > -1) hits.push({ type:'Applicant', name:a.name, detail:a.program+' · '+a.stage }); });

  const body = g('search-results-body');
  if (body) {
    body.innerHTML = hits.length === 0
      ? '<p style="color:var(--text3);font-size:14px;padding:8px 0">No results for "' + query + '"</p>'
      : hits.map(function(h) {
          return '<div style="display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">'
            + '<span class="badge badge-blue">' + h.type + '</span>'
            + '<div><div style="font-size:14px;font-weight:600">' + h.name + '</div>'
            + '<div style="font-size:12px;color:var(--text2)">' + h.detail + '</div></div></div>';
        }).join('');
  }
  if (panel) panel.style.display = 'block';
}
function clearSearch() {
  const si = g('global-search'); if (si) si.value = '';
  const sr = g('search-results'); if (sr) sr.style.display = 'none';
  const sc = g('search-clear'); if (sc) sc.style.display = 'none';
}

/* ── UTILS ─────────────────────────────────────── */
function toggleIntegration(cb, name) { showToast(name + (cb.checked ? ' activated' : ' paused')); }
function approveItem(btn, type) {
  const row = btn.closest('tr');
  if (!row) return;
  const badgeEl = row.querySelector('.badge');
  if (badgeEl) { badgeEl.textContent = 'Approved'; badgeEl.className = 'badge badge-green'; }
  btn.textContent = '✓ Done'; btn.disabled = true;
  showToast(type + ' approved');
}
function showCreateRecord() {
  const active = document.querySelector('.module-section.active');
  if (active) {
    const btn = active.querySelector('[data-action^="add"]');
    if (btn) { btn.click(); return; }
  }
  showToast('Navigate to a module to create records', 'info');
}

/* ── LOGOUT HANDLER ────────────────────────────── */
window.handleNavbarLogout = async function handleNavbarLogout() {
  try {
    if (window.supabase_client?.auth?.signOut) {
      await window.supabase_client.auth.signOut();
    }
    let handled = false;
    if (typeof window.logout === "function") {
      await window.logout();
      handled = true;
    } else if (typeof window.handleLogout === "function" && window.handleLogout !== window.handleNavbarLogout) {
      await window.handleLogout();
      handled = true;
    }
    if (!handled && typeof window.authLogout === "function") {
      window.authLogout();
    }
  } catch (err) {
    console.error("Logout failed:", err);
  } finally {
    if (typeof window.showPage === "function") {
      window.showPage("edusys-access");
    }
  }
};

/* ── BOOT ──────────────────────────────────────── */
initLanding();

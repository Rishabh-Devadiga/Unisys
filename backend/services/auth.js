const ROLE_TIERS = {
  admin: 'admin',
  head: 'admin',
  account: 'admin',
  admissions: 'admin',
  'railway concession': 'admin',
  faculty: 'faculty',
  hod: 'faculty',
  student: 'student'
};

function normalizeRole(role) {
  const raw = String(role || '').trim().toLowerCase();
  return ROLE_TIERS[raw] || '';
}

function getUserFromHeaders(req) {
  const email = String(req.headers['x-user-email'] || '').trim();
  const rawRole = String(req.headers['x-user-role'] || '').trim();
  const institute = String(req.headers['x-user-institute'] || req.headers['x-erp-institute'] || '').trim();
  const role = normalizeRole(rawRole);
  const id = String(req.headers['x-user-id'] || email || '').trim();

  if (!email || !role) return null;
  return { id, email, role, rawRole: rawRole || role, institute };
}

function getUserFromSession(req) {
  const sess = req.session && req.session.user ? req.session.user : null;
  if (!sess) return null;
  const email = String(sess.email || '').trim();
  const rawRole = String(sess.role || '').trim();
  const institute = String(sess.institute || '').trim();
  const role = normalizeRole(rawRole);
  const id = String(sess.id || email || '').trim();
  if (!email || !role) return null;
  return { id, email, role, rawRole: rawRole || role, institute };
}

function requireAuth(allowedRoles) {
  const allowed = Array.isArray(allowedRoles) ? allowedRoles.map(normalizeRole) : [];

  return (req, res, next) => {
    const user = getUserFromSession(req) || getUserFromHeaders(req);
    if (!user) {
      return res.status(401).json({ ok: false, error: 'Unauthorized' });
    }
    if (allowed.length && !allowed.includes(user.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    req.user = user;
    return next();
  };
}

module.exports = {
  requireAuth,
  getUserFromHeaders,
  getUserFromSession,
  normalizeRole
};

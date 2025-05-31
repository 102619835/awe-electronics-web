function ensureAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.redirect('/login');
}

function ensureRole(role) {
  return (req, res, next) => {
    if (req.session.role === role) return next();
    res.status(403).send('Forbidden');
  };
}

module.exports = { ensureAuthenticated, ensureRole };
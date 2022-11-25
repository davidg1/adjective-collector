
// Middleware function that checks if user is logged in
exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash('error', 'You are not logged in.');
  res.redirect('/sign-in');
}

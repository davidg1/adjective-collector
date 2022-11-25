const User = require('../models/user');
const LocalStrategy = require('passport-local').Strategy;

module.exports = passport => {
  passport.use(new LocalStrategy(
    (username, password, done) => {
      User.findOne({ username: username }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, {message: 'No user found with that username.'});
        }
        user.verifyPassword(password, (err, isVerified) => {
          if (err) {
            return done(err);
          }
          if (isVerified) {
            return done(null, user, {message: 'Welcome!! You are now logged in.'});
          }
          done(null, false, {message: 'Password is invalid.'});
        });
      });
    }
  ));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });
}

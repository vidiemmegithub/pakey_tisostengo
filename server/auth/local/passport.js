const passport = require('passport'),
      LocalStrategy = require('passport-local').Strategy;

exports.setup = function (User) {
  passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password' // this is the virtual field on the model
    },
    function(email, password, done) {
      User.findOne({
        email: email.toLowerCase()
      }, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'L\'indirizzo email non è registrato' });
        }
        if (user.enablingToken && user.enablingToken !== "") {
          return done(null, false, { message: 'In attesa di conferma della registrazione' });
        }
        if (!user.authenticate(password)) {
          return done(null, false, { message: 'La password non è corretta' });
        }
        return done(null, user);
      });
    }
  ));
};

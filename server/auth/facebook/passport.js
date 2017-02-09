const passport = require('passport'),
      FacebookStrategy = require('passport-facebook').Strategy;

exports.setup = function (User, config) {
  passport.use(new FacebookStrategy({
      profileFields: ['id', 'emails', 'name', 'gender', 'photos'],
      clientID: config.facebook.clientID,
      clientSecret: config.facebook.clientSecret,
      callbackURL: config.facebook.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      if (profile.emails && profile.emails.length > 0) {
        User.findOne({
          'facebook.id': profile.id
        },
        function(err, user) {
          if (err) {
            return done(err);
          }
          if (!user) {
            user = new User({
              firstname: profile.name.givenName,
              lastname: profile.name.familyName,
              gender: (profile.gender === 'female') ? 'F' : 'M',
              picture: (profile.photos && profile.photos.length > 0 ) ? profile.photos[0].value : '',
              email: profile.emails[0].value,
              provider: 'facebook',
              facebook: profile._json
            });
            user.save(function(err) {
              if (err) {
                return done(err);
              }
              done(err, user);
            });
          }
          else {
            return done(err, user);
          }
        })
      }
      else {
        return done(new Error("Error in extracting user email from Facebook profile"));
      }
    }
  ));
};

'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');

var router = express.Router();

router.post('/', function(req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) {
      return res.status(401).json(error);
    }
    if (!user) {
      return res.status(404).json({message: 'Qualcosa non è andato a buon fine. prova di nuovo.'});
    }
    if (user.banned) {
      return res.status(401).json({message: 'Non è possibile accedere o reiscriversi con l\'indirizzo e-mail inserito. L\'utente è bannato. Per informazioni contatta l\'assistenza di TiSOStengo.'});
    }

    var token = auth.signToken(user._id, user.role);
    res.json({token: token});
  })(req, res, next)
});

module.exports = router;
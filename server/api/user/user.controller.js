'use strict';

const config = require('../../config/environment'),
      User = require('./user.model'),
      mongoose = require('mongoose'),
      Question = require('../question/question.model'),
      Article = require('../article/article.model'),
      Picture = require('../picture/picture.model'),
      Coupon = require('../coupon/coupon.model'),
      _ = require('lodash'),
      auth = require('../../auth/auth.service'),
      co = require('co'),
      nodemailer = require('nodemailer'),
      transport = nodemailer.createTransport(config.email),
      fs = require('fs'),
      generatePassword = require('password-generator'),
      braintree = require("braintree"),
      util = require('util'),
      gateway = braintree.connect({
        environment: config.braintree.environment,
        merchantId: config.braintree.merchantId,
        publicKey: config.braintree.publicKey,
        privateKey: config.braintree.privateKey
      }),
      googleMapsClient = require('@google/maps').createClient({
        key: config.googlemaps.token
      }),
      async = require('async'),
      json2xls = require('json2xls');


/**
 * Get list of qualified users
 */
exports.index = function (req, res) {
  co(function*() {
    let _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false };
    }
    try {
      if(typeof req.query.keysearch != 'undefined' && req.query.keysearch != ''){
        req.filter.$or = [
          {'firstname': { $regex: req.query.keysearch, $options: '$i'}},
          {'lastname': { $regex: req.query.keysearch, $options: '$i'}}
        ];
      }
      _users = yield User.find(req.filter, req.fields, {
        limit: req.paging.limit,
        skip: req.paging.skip,
        sort: req.sort
      });
      return res.status(200).json({ users: _users });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Get list of all users
 */
exports.indexAll = function (req, res) {
  co(function*() {
    let _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false };
    }
    try {
      _users = yield User.find(req.filter, req.fields, {
        limit: req.paging.limit,
        skip: req.paging.skip,
        sort: req.sort
      });
      _users = yield Coupon.populate(_users, {path: 'subscriptions.coupon'});
      return res.status(200).json({ users: _users });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Get list of specialists
 */
exports.getSpecialists = function (req, res) {
  co(function*() {
    let _users, _picture;
    try {
      _users = yield User.find({
        $and:[
          {'role':'qualified'},
          {$or:
            [
              {'specialization':{$in:req.body.params.specializations}},
              {'secondarySpecializations':{$in:req.body.params.specializations}}
            ]
          }
        ]}, {});
      for(var i=0;i<_users.length;i++){
        _picture = yield Picture.findOne({name:_users[i].picture}).exec(function (err, items) {});
        _users[i].picture = _picture.picture;
      }
      return res.status(200).json({ users: _users });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Get list of users followed by the requester
 */
exports.indexUserMeFollowed = function (req, res) {
  co(function*() {
    let _user, _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false };
    }
    try {
      _user = yield User.findById(req.user._id, { 'followed': true });
      _users = yield User.find(_.merge(req.filter, { role: 'qualified', '$or': [{banned: false},{banned: null}] }, { '_id': { '$in': _user.followed } }), req.fields, {
        limit: req.paging.limit,
        skip: req.paging.skip,
        sort: req.sort
      });
      return res.status(200).json({ users: _users });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Get list of users followed by the given user
 */
exports.indexUserFollowed = function (req, res) {
  co(function*() {
    let _user, _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false };
    }
    try {
      _user = yield User.findById(req.params.id, { 'followed': true });
      _users = yield User.find(_.merge(req.filter, { 'role': 'qualified' }, { '_id': { '$in': _user.followed } }), req.fields, {
        limit: req.paging.limit,
        skip: req.paging.skip,
        sort: req.sort
      });
      return res.status(200).json({ users: _users });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};


/**
 * Get list of users at wich is requested much questions
 */
exports.indexRequested = function (req, res) {
  co(function*() {
    let _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false, __v: false };
    }
    try {
      let _questionsTmp = yield Question.aggregate()
          .group({_id: '$target_user', question_count: {$sum: 1}})
          .sort({'question_count': -1})
          .limit(req.paging.limit)
          .skip(req.paging.skip)
          .exec();
      _users = yield User.populate(_questionsTmp, {path: '_id', select: req.fields, match: {'$or': [{banned: false},{banned: null}]}});

      // remove banned users
      _.remove(_users, user => !user._id);

      return res.status(200).json({'users': _users.map(user => user._id)});
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Get list of users most followed
 */
exports.indexFollowed = function (req, res) {
  co(function*() {
    let _users;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, picture: false, __v: false };
    }

    try {
      _users = yield User.aggregate()
        .match({'$or': [{banned: false},{banned: null}]})
        .unwind('followed')
        .group({ _id: '$followed', count: { $sum: 1 } })
        .sort({ 'count': -1 })
        .skip(req.paging.skip)
        .limit(req.paging.limit)
        .exec();
      _users = yield User.populate(_users, { path: '_id', select: req.fields, match: {'$or': [{banned: false},{banned: null}]} });

      // remove void element
      _.remove(_users, user => !user._id);

      return res.status(200).json({ 'users': _users.map(user => user._id) });
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Creates a new user
 */
exports.create = function (req, res) {
  co(function*() {
    let _emailTemplate, _emailTemplatePath, newUser;

    switch (req.body.role) {
      case 'editor':
      case 'admin':
        if (!req.user || 'admin' !== req.user.role) {
          return res.status(403).type('text').send("Don't have enough privileges to create this type of user");
        }
        _emailTemplatePath = 'server/templates/confirmation_email_editor.html';
        break;
      default:
        _emailTemplatePath = 'server/templates/confirmation_email.html';
    }

    try {
      newUser = new User(req.body);
      if (!newUser.firstname) {
        newUser.firstname = newUser.email.substring(0, newUser.email.indexOf('@'));
      }
      newUser.provider = 'local';
      newUser.reg_date = new Date();

      newUser = yield newUser.save();
    }
    catch (err) {
      if (err.errors.email && 'email_duplicate' === err.errors.email.kind) {
        newUser = yield User.findOne({email: req.body.email});
        if (!newUser.enablingToken) {
          return validationError(res, err);
        }
        yield newUser.update(req.body);
      }
      else {
        return validationError(res, err);
      }
    }

    try {
      if ('production' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV || 'heroku-dev' === process.env.NODE_ENV) {
        _emailTemplate = _.template(fs.readFileSync(_emailTemplatePath, 'utf-8'));

        transport.sendMail({
          from: config.email.registrationEmailSender,
          to: newUser.email,
          subject: 'Conferma di registrazione a TiSOStengo',
          html: _emailTemplate(_.merge({}, newUser.toObject(), {domain: config.domain, password: req.body.password}))
        }, err => {
          if (err) {
            User.findByIdAndRemove(newUser._id, function(err) {console.log(err);});
            return handleError(res, err);
          }
          return res.status(201).json({ token: auth.signToken(newUser._id, newUser.role) });
        });
      }
      else {
        return res.status(201).json({ token: auth.signToken(newUser._id, newUser.role) });
      }
    }
    catch(err) {
      User.findByIdAndRemove(newUser._id, function(err) {console.log(err);});
      return handleError(res, err);
    }

  });
};

/**
 * Edit an user
 */
exports.edit = function (req, res) {
  co(function*() {
    let _email, _user, _emailNewTemplate, _emailOldTemplate;

    try {
      _user = yield User.findById(req.params.id).exec();

      if(typeof req.body.carepaths !== 'undefined') {
        req.body.carepaths.forEach(function(item,index,array){
          item.carepath = mongoose.Types.ObjectId(item.carepath);
          item.answers.forEach(function(item,index,array){
            item.step = mongoose.Types.ObjectId(item.step);
          });
        });
        _user.carepaths = req.body.carepaths;
      }
      if (req.body.oldPassword && !_user.authenticate(req.body.oldPassword)) {
        return res.status(403).send();
      }

      // check if there is an email to change
      if (req.body.email && req.body.email !== _user.email) {
        _email = _user.email;
      }
      _.merge(_user, req.body);

      // mark all PUTted fields as changed, so Mongoose can save them in DB
      Object.keys(req.body).forEach(prop => _user.markModified(prop));
      yield _user.save();

      // validate user access that was blocked instead after a password generation by the model
      if (req.body.password) {
        _user.enablingToken = '';
        yield _user.save();
      }

      if (_email) {
        if ('production' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV || 'heroku-dev' === process.env.NODE_ENV) {
          _emailNewTemplate = yield new Promise((resolve, reject) => {
            fs.readFile('server/templates/changeemail_new_email.html', 'utf-8', (err, data) => {
              if (err) {
                reject(err);
              }
              else {
                resolve(_.template(data));
              }
            });
          });
          _emailOldTemplate = yield new Promise((resolve, reject) => {
            fs.readFile('server/templates/changeemail_old_email.html', 'utf-8', (err, data) => {
              if (err) {
                reject(err);
              }
              else {
                resolve(_.template(data));
              }
            });
          });
          transport.sendMail({
            from: config.email.registrationEmailSender,
            to: _user.email,
            subject: 'Indirizzo email modificato su tiSOStengo',
            html: _emailNewTemplate(_user)
          }, err => {
            if (err) {
              return handleError(res, err);
            }
            return res.status(204).end();
          });
          transport.sendMail({
            from: config.email.registrationEmailSender,
            to: _email,
            subject: 'Indirizzo email modificato su tiSOStengo',
            html: _emailOldTemplate(_user)
          }, err => {
            if (err) {
              return handleError(res, err);
            }
            return res.status(204).end();
          });
        }
        else {
          return res.status(204).end();
        }
      }
      else {
        return res.status(204).end();
      }
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Add a followed
 */
exports.addFollowed = function (req, res) {
  if (!req.body.id) {
    return handleError(res, "Utente non presente");
  }

  co(function*() {
    try {
      var _me = yield User.findById(req.user._id);

      let added = _me.followed.addToSet(req.body.id);

      if (added.length) {
        _me.markModified('followed');
        yield _me.save();
      }

      res.sendStatus(200);
    }
    catch (err) {
      handleError(res, err);
    }
  });
};

/**
 * Remove a followed
 */
exports.removeFollowed = function (req, res) {
  if (!req.body.id) {
    return handleError(res, "Utente non presente");
  }

  co(function*() {
    try {
      var _me = yield User.findById(req.user._id);

      _me.followed.remove(req.body.id);
      _me.markModified('followed');
      yield _me.save();

      res.sendStatus(200);
    }
    catch (err) {
      handleError(res, err);
    }
  });
};

/**
 * Get a single user
 */
exports.show = function (req, res) {
  co(function*() {
    let _user, _statistics;

    if (Object.keys(req.fields).length <= 0) {
      req.fields = { salt: false, hashedPassword: false, payment: false };
    }

    try {
      _user = yield User.findOne({_id: req.params.id}, req.fields);

      if (!_user) {
        return res.status(403).end();
      }
      if (_user.role !== 'editor' && _user.banned === true) {
        if(!req.user || req.user.role !== 'admin') {
          return res.status(403).end();
        }
      }

      if (_user.role !== 'editor' && _user.banned === true) {
        if(!req.user || req.user.role !== 'admin') {
          return res.status(403).end();
        }
      }

      if (req.query.statistics) {
        _statistics = {};
        if (req.query.statistics.includes('followed')) {
          _statistics.followed = _user.followed.length;
        }
        if (req.query.statistics.includes('follower')) {
          _statistics.follower = yield User.count({ 'followed': { '$elemMatch': { '$eq': _user._id } } });
        }
        if (req.query.statistics.includes('articles')) {
          _statistics.articles = yield Article.count({ 'author': _user._id });
        }
        if (req.query.statistics.includes('questions')) {
          _statistics.questions = {};
          if (req.query.statistics.includes('questions.sent')) {
            _statistics.questions.sent = yield Question.count({ 'author': _user._id });
          }
          if (req.query.statistics.includes('questions.received')) {
            _statistics.questions.received = yield Question.count({ 'target_user': _user._id });
          }
        }
        if (req.query.statistics.includes('answers')) {
          _statistics.answers = {};
          if (req.query.statistics.includes('answers.sent')) {
            _statistics.answers.sent = yield Question.count({
              'target_user': _user._id,
              'answer': { '$not': { '$eq': null } }
            });
          }
          if (req.query.statistics.includes('answers.received')) {
            _statistics.answers.received = yield Question.count({
              'author': _user._id,
              'answer': { '$not': { '$eq': null } }
            });
          }
        }
      }

      return res.status(200).json(_.merge(_user.toObject(), { statistics: _statistics }));
    }
    catch (err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

/**
 * Deletes a user
 * restriction: 'admin'
 */
exports.destroy = function (req, res) {
  let user;

  co(function*() {
    try {
      user = yield User.findById(req.params.id, {subscriptions: true});

      // cancel all active user subscriptions from Braintree
      user.subscriptions.forEach(subscription => {
        if (subscription.subscriptionId) {
          gateway.subscription.cancel(subscription.subscriptionId, function() {});
        }
      });

      yield user.remove();
      yield Article.remove({author: req.params.id});
      yield Question.remove({'$or': [{author: req.params.id}, {target_user: req.params.id}]});

      yield User.update({'followed': req.params.id}, {'$pull': {followed: req.params.id}}, {multi: true});
      yield Article.update({'comments.author': req.params.id}, {'$pull': {comments: {author: req.params.id}}}, {multi: true});
      yield Question.update({'comments.author': req.params.id}, {'$pull': {comments: {author: req.params.id}}}, {multi: true});

      res.status(204).end();
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.validateUQRegistration = function (req, res) {
  co(function*() {
    try {
      let _user = yield User.findById(req.params.id);

      if (_user.registrationPending === false) {
        return res.status(404).json({message: "Utente già registrato"});
      }
      _user.role = 'qualified';
      _user.registrationPending = false;
      yield _user.save();

      res.status(204).end();
    }
    catch (err) {
      return handleError(res, err);
    }
  });
};

exports.confirmRegistration = function(req, res) {
  co(function*() {
    let _updated, _token;

    try {
      _updated = yield User.findOneAndUpdate({enablingToken: encodeURIComponent(req.params.enablingToken)}, {enablingToken: '', reg_date: null, val_date: Date.now()}, {new: true});

      if (!_updated) {
        return res.redirect('/registrazione-avvenuta');
      }

      _token = auth.signToken(_updated._id, _updated.role);
      res.cookie('token', JSON.stringify(_token));
      res.redirect('/');
    }
    catch (err) {
      return handleError(res, err);
    }
  });
};

exports.resetPassword = function(req, res) {
  if (!req.query.email || !req.query.province) {
    return res.status(400).type('text').send("Missing email or province parameters in query string");
  }
  co(function*() {
    try {
      let _user = yield User.findOne({email: req.query.email, province: req.query.province}),
          _newPassword = generatePassword(8),
          _emailTemplate;

      if (!_user) {
        return res.status(404).json({message: "Utente non presente"});
      }
      _user.password = _newPassword;
      yield _user.save();

      if ('production' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV || 'heroku-dev' === process.env.NODE_ENV) {
        _emailTemplate = yield new Promise((resolve, reject) => {
          fs.readFile('server/templates/resetpassword_email.html', 'utf-8', (err, data) => {
            if (err) {
              reject(err);
            }
            else {
              resolve(_.template(data));
            }
          });
        });
        transport.sendMail({
          from: config.email.registrationEmailSender,
          to: _user.email,
          subject: 'Password dimenticata di TiSOStengo',
          html: _emailTemplate(_.merge({}, _user.toObject(), {domain: config.domain, newPassword: _newPassword}))
        }, err => {
          if (err) {
            return handleError(res, err);
          }
          return res.status(204).end();
        });
      }
      else {
        return res.status(204).end();
      }
    }
    catch (err) {
      return handleError(res, err);
    }
  });

};

exports.banUser = function(req, res) {
  if (!req.query.hasOwnProperty('active')) {
    return res.status(400).type('text').send("'active' parameter not found");
  }
  co(function*() {
    let user = yield User.findById(req.params.id, {banned:true, subscriptions: true}),
        operation;

    try {
      user.banned = req.query.active;
      yield user.save();
      // cancel all active user subscriptions from Braintree
      user.subscriptions.forEach(subscription => {
        co(function*() {
          if (subscription.subscriptionId) {
            operation = yield new Promise((resolve, reject) => {
              gateway.subscription.cancel(subscription.subscriptionId, function (err, result) {
                if (err) {
                  return reject(err);
                }
                resolve(result);
              });
            });
            if (operation.success === true) {
              subscription.deactivate();
              user.markModified('subscriptions');
              yield user.save();
            }
          }
        });
      });
      res.status(200).end();
    }
    catch (err) {
      return handleError(res, err);
    }
  });
};

/**
 * Import new users
 */
exports.import = function (req, res) {
  try {
    var users = req.body.params.users.users;
    elaborateUsers(users,function(subject,message){
      console.log("sending email...");
      var _emailTemplate = _.template(fs.readFileSync('server/templates/import_users_error.html', 'utf-8'));
      transport.sendMail({
        from: config.email.registrationEmailSender,
        to: config.email.messagesEmailReceip,
        subject: subject,
        html: _emailTemplate(_.merge({}, null, {message: message})),
        attachments: [{ path: 'server/api/user/utenti-non-importati.xlsx' }]
      }, err => {
        if (err) console.log(err);
        else console.log("email sent!");
      });
    });
    return res.status(200).end();
  } catch(err) {
    return handleError(res, err);
  }
};

function handleError(res, err) {
  console.log(err);
  if (err.errors && _.isArray(err.errors)) {
    return res.status(500).json({message: "Errore nell\'invio della email. Verificare l\'indirizzo."});
  }
  return res.status(500).send(err.message);
}

function validationError(res, err) {
  //console.log(err);
  if (err.name && err.name === 'ValidationError') {
    // strip only first mongoose erros (if more than one)
    return res.status(422).json({message: err.errors[Object.keys(err.errors)[0]].message});
  }
  return res.status(422).json({message: err.message});
}

function elaborateUsers(users, callback) {
  var usersFailed = [];
  async.waterfall([
    function(cb){
      var chunks = [];
      while(users.length)
        chunks.push(users.splice(0,50));
      cb(null,chunks);
    },
    function(chunks,cb){
      var fs = [];
      chunks.forEach(function(chunk,chunkIndex){
        var fsc = [];
        chunk.forEach(function(user,userIndex){
          fsc.push(function(cb){
            if (isSpecializationValid(user.specialization)){
              googleMapsClient.geocode( {address:user.address + ' ' + user.city + ' ' + user.zipCode}, function(err, response){
                if (!err && response.json.status == 'OK') {
                  var validResults = [];
                  response.json.results.forEach(function(currentResult){
                    currentResult.types.forEach(function(type){
                      if (type === 'street_address')
                        validResults.push(currentResult);
                    });
                  });
                  var formattedResults = [];
                  validResults.forEach(function(currentResult){
                    var number, route, zipCode, city, province;
                    currentResult.address_components.forEach(function(addressComponent){
                      addressComponent.types.forEach(function(type){
                        if (type === 'street_number')
                          number = addressComponent.long_name;
                        else if (type === 'route')
                          route = addressComponent.long_name;
                        else if (type === 'postal_code')
                          zipCode = addressComponent.long_name;
                        else if (type === 'locality')
                          city = addressComponent.long_name;
                        else if (type === 'administrative_area_level_3')
                          province = addressComponent.long_name;
                      });
                    });
                    formattedResults.push({
                      formattedAddress: currentResult.formatted_address,
                      province: province,
                      city: city,
                      zipCode: zipCode,
                      route: route,
                      number: number,
                      placeId: currentResult.place_id,
                      lat: currentResult.geometry.location.lat,
                      lng: currentResult.geometry.location.lng
                    });
                  });
                  if (validResults.length === 1) {
                    user.email = 'tisostengo_'+mongoose.Types.ObjectId()+'@tsos.com';
                    user.password = 'tisostengo';
                    user.address = formattedResults[0].route;
                    user.addressNumber = formattedResults[0].number;
                    user.city = formattedResults[0].city;
                    user.zipCode = formattedResults[0].zipCode;
                    user.province = formattedResults[0].province;
                    user.geocode = {
                      placeId: formattedResults[0].placeId,
                      lat: formattedResults[0].lat,
                      lng: formattedResults[0].lng,
                      formattedAddress: formattedResults[0].formattedAddress
                    };
                    user.agreement = true;
                    user.val_date = new Date();
                    user.enablingToken = '';
                    user.role = 'qualified';
                    user.registrationPending = false;
                    console.log("processed "+userIndex+"...");
                    //console.log("success: "+userIndex);
                    User.create(user, function(err) {
                      if(err) {
                        user.address = user.address + ", " + user.addressNumber;
                        delete user.email;
                        delete user.password;
                        delete user.addressNumber;
                        delete user.province;
                        delete user.agreement;
                        delete user.val_date;
                        delete user.enablingToken;
                        delete user.role;
                        delete user.registrationPending;
                        user.SUGGESTION = "";
                        user.ERROR = "Si è verificato un problema durante l'inserimento nel database, l'errore è il seguente: " + JSON.stringify(err);
                        usersFailed.push(user);
                        //console.log(err);
                      }
                      cb();
                    });
                  } else {
                    if(formattedResults.length > 0) {
                      user.SUGGESTION = formattedResults[0].formattedAddress;
                      user.ERROR = "Sono state trovate diverse corrispondenze per l'indirizzo indicato, ti abbiamo indicato un suggerimento";
                    } else {
                      user.SUGGESTION = "";
                      user.ERROR = "Non sono state trovate corrispondenze per l'indirizzo indicato";
                    }
                    usersFailed.push(user);
                    console.log("processed "+userIndex+"...");
                    //console.log("error: "+userIndex);
                    cb();
                  }
                } else {
                  user.SUGGESTION = "";
                  user.ERROR = "Si è verificato un problema durante il geocode dell'indirizzo, l'errore è il seguente: " + JSON.stringify(err);
                  usersFailed.push(user);
                  console.log("processed "+userIndex+"...");
                  //console.log("error: "+userIndex);
                  cb();
                }
              });
            } else {
              user.SUGGESTION = "";
              user.ERROR = 'La specialità inserita non è valida';
              usersFailed.push(user);
              console.log("processed "+userIndex+"...");
              //console.log("error: "+userIndex);
              cb();
            }
          });
        });
        fs.push(fsc);
        if(chunkIndex==chunks.length-1){
          cb(null, fs);
        }
      });
    },
    function(fs, cb){
      console.log("creating waterfall functions...");
      var fsn = [];
      fs.forEach(function(fsc,fscIndex){
        fsn.push(function(cb){
          console.log("chunking "+fscIndex+"...");
          async.parallel(fsc, function(err){
            if (err) {
              console.log(err);
              callback("Errore durante l'importazione degli utenti","si è verificato il seguente errore: "+JSON.stringify(err));
            } else {
              cb();
            }
          });
        });
        if(fscIndex==fs.length-1){
          cb(null, fsn);
        }
      });
    },
    function(fsn, cb){
      console.log("starting...");
      async.waterfall(fsn,cb);
    },
    function(cb){
      console.log("saving...");
      var xls = json2xls(usersFailed);
      fs.writeFileSync('server/api/user/utenti-non-importati.xlsx', xls, 'binary');
      cb();
    }
  ], function(err) {
    console.log("finish!");
    if (err) {
      console.log(err);
      callback("Errore durante l'importazione degli utenti","si è verificato il seguente errore: "+JSON.stringify(err));
    } else {
      //console.log(usersFailed);
      if (usersFailed.length > 0)
        callback("Errore durante l'importazione di alcuni utenti", "in allegato puoi trovare tutti gli utenti che non siamo riusciti ad importare ed i relativi errori.");
      else
        callback("Importazione degli utenti avvenuta con successo!","l'importazione degli utenti è andata a buon fine.");
    }
  });
}

function isSpecializationValid(specialization) {
  var specializations = ['Allergologia','Anatomia patologica','Andrologia','Anestesia e rianimazione','Angiologia','Cardiochirurgia','Cardiologia','Cardiologia - Aritmologia','Cardiologia pediatrica','Chirurgia dell\'apparato digerente','Chirurgia estetica','Chirurgia generale','Chirurgia pediatrica','Chirurgia toracica','Chirurgia vascolare','Cure sperimentali','Dermatologia','Diabetologia','Dietetica','Ecografia','Ecografia ostetrica','Elettrofisiologia','Elettrofisiologia - Aritmologia','Ematologia','Embriologia','Endocrinologia','Epatologia','Epidemiologia','Fisiatria','Gastroenterologia','Genetica','Geriatria','Ginecologia e ostetricia','Igiene e medicina preventiva','Immunologia','Infettivologia','Istologia','Logopedia','Medicina aeronautica','Medicina del lavoro','Medicina d\'urgenza','Medicina estetica','Medicina generale','Medicina interna','Medicina legale','Medicina nucleare','Medicina spaziale','Medicina sportiva','Medicina subacquea','Medico chirurgo','Nefrologia','Neonatologia','Neurochirurgia','Neurofisiologia','Neurologia','Neuropsichiatria','Neuropsichiatria Infantile','Neuroscienze','Odontoiatria','Oftalmologia','Oncologia','Ortopedia','Ossigeno-Ozonoterapia','Otorinolaringoiatria','Pediatria','Pneumologia','Proctologia','Professioni mediche','Psichiatria','Psicologia','Radiologia','Radioterapia','Reumatologia','Senologia','Sessuologia','Terapia del dolore / Cure Palliative','Traumatologia','Urologia','Urologia pediatrica','Urinoginecologia','Assistenti sociali','Avvocati','Biologo nutrizionista','Biologo','Chiropratico','Farmacisti','Fisioterapisti','Infermieri','Massofisioterapista - Scienze motorie','Odontotecnici','Omeopatia e Fitoterapia','Operatori socio - sanitari','Osteopati','Ostetrica','Podologo','Tecnico Ortopedico','Veterinari','ATS','Asl','Case di riposo / RSA','Centri radiologici','Centri riabilitativi','Centro podologico','Doppler','Ospedali','Punto prelievo','MOC','Risonanza magnetica','Studi dentistici','Studi medici','Studi medici/centri diagnostici','TAC','Altre residenze sanitarie','Altre Strutture','Apparecchi acustici','Articoli di ortopedia','Assistenza domiciliare','Ottica ed optometria','Palestre e piscine','Portali web salute','Prodotti per celiaci','Prodotti per la salute','Servizi trasporti','Studi legali','Altro','Farmacie','Parafarmacie','Cooperative sociali', 'Enti di Volontariato', 'Fondazioni'];
  var response = false;
  specializations.forEach(function(_specialization){
    if(_specialization === specialization) response = true;
  });
  return response;
}





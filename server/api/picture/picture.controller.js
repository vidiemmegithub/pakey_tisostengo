'use strict';

const _ = require('lodash'),
      User = require('../user/user.model'),
      Picture = require('./picture.model'),
      co = require('co');

exports.index = function(req, res) {
  co(function*() {
    let _pictures;
    try {
      _pictures = yield Picture
        .find({})
        .exec(function (err, items) {});
      return res.status(200).json({'pictures': _pictures});
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.indexName = function(req, res) {
  co(function*() {
    let _picture;
    try {
      _picture = yield Picture
        .findOne({name:req.body.name})
        .exec(function (err, items) {});
      if (!_picture) {
        return res.status(404).send("Picture not found");
      }
      return res.status(200).json({'picture': _picture});
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.moveImages = function(req, res) {
  co(function*() {
    let _users, _picture;
    try {
      _users = yield User.find({}, {email:true, picture:true}).exec(function(err,items){});
      _users.forEach(function(_user,index,array){
        if(_user.picture && _user.picture.includes('data:')){
          Picture.create({name:_user.email, picture: _user.picture}, function(err) {
            _user.picture = _user.email;
            _user.save();
          });
        }
        if(index == array.length-1) {
          return res.status(200).end();
        }
      });

    } catch(err){
      return handleError(res,err);
    }
  });
};

exports.create = function (req, res) {
  co(function*() {
    try {
      Picture.create(req.body, function(err) {
        if(err) {
          return handleError(res, err);
        }
        return res.status(204).end();
      });
    } catch(e) {
      return handleError(res, e);
    }
  });
};

exports.update = function (req, res) {
  let _picture;

  delete req.body._id;

  co(function*() {
    try {
      _picture = yield Picture.findOne({name: req.body.name});
      if (!_picture) {
        return res.status(404).send('Picture not Found');
      }
      _picture.picture = req.body.picture;
      yield _picture.save();
      return res.status(200).json(_picture);
    } catch(e) {
      return handleError(res, e);
    }
  });
};

exports.destroy = function(req, res) {
  let _picture;
  co(function*() {
    try {
      _picture = yield Picture.findOne({name: req.params.name});
      if (!_picture) {
        return res.status(404).send('Picture not Found');
      }
      yield _picture.remove();
      return res.status(204).end();
    } catch(e) {
      return handleError(res, e);
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

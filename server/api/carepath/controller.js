'use strict';

const _ = require('lodash'),
      Carepath = require('./model'),
      co = require('co');

exports.index = function(req, res) {
  co(function*() {
    let _carepaths;
    try {
      var filter = {};
      var score = {};
      var sort = { title: 1 };
      if (req.query.filter || req.query.filter == '') {
        // filter = { $text: { $search: req.query.filter } };
        // score = { score: { $meta: "textScore"} };
        // sort = score;
        filter = {
          $or: [
            {'title': { $regex: req.query.filter, $options: '$i'}},
            {'description': { $regex: req.query.filter, $options: '$i'}},
            {'tags': { $regex: req.query.filter, $options: '$i'}}
          ]
        }
      }
      _carepaths = yield Carepath
        .find(filter /*, score*/)
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .sort(sort)
        .exec(function (err, items) {});
      return res.status(200).json({'elements': _carepaths});
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.show = function(req, res) {
  co(function*() {
    let _carepath;
    try {
      _carepath = yield Carepath.findById(req.params.id, req.fields).populate({path: '', select: '', match:{'$or': ''}});
      if (!_carepath) {
        return res.status(400).send("Care path not found");
      }
      return res.status(200).json(_carepath);
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.create = function (req, res) {
  co(function*() {
    try {
      Carepath.create(req.body, function(err) {
        if(err) {
          return handleError(res, err);
        }
        return res.status(204).end();
      });
    }
    catch(e) {
      return handleError(res, e);
    }
  });
};

exports.update = function (req, res) {
  let _carepath;

  if (req.body._id) {
    delete req.body._id;
  }
  co(function*() {
    try {
      _carepath = yield Carepath.findById(req.params.id);
      if (!_carepath) {
        return res.status(404).send('Carepath not Found');
      }
      Object.assign(_carepath, req.body);
      yield _carepath.save();

      return res.status(200).json(_carepath);
    }
    catch(e) {
      return handleError(res, e);
    }
  });
};

exports.destroy = function(req, res) {
  Carepath.findByIdAndRemove(req.params.id, function (err) {
    if(err) {
      return handleError(res, err);
    }
    res.status(204).end();
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

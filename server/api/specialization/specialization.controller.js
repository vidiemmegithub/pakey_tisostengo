'use strict';

const _ = require('lodash'),
      Specialization = require('./specialization.model'),
      co = require('co');

exports.indexAll = function(req, res) {
  co(function*() {
    let _specializations, _specializationsGrouped;
    try {
      var filter = {};
      if (req.query.keysearch) {
        filter={'name': { $regex: req.query.keysearch, $options: '$i'}};
      }
      _specializations = yield Specialization
        .find(filter)
        .limit(req.paging.limit)
        .skip(req.paging.skip)
        .sort({name:'asc'})
        .exec(function (err, items) {});
      return res.status(200).json({'specializations': _specializations});
    } catch(err) {
      return handleError(res, err);
    }
  });
};

exports.indexAllByCategories = function(req, res) {
  co(function*() {
    let _specializations, _specializationsGrouped;
    try {
      _specializations = yield Specialization
        .find({})
        .sort({name:'asc'})
        .exec(function (err, items) {});

      _specializationsGrouped = [];
      _specializations.forEach(function(specialization){
        var newInsert = true;
        var toInsert = { name: specialization.category, value: [specialization.name] };
        var toUpdate;
        _specializationsGrouped.forEach(function(specializationGrouped){
          if(specializationGrouped.name == specialization.category){
            newInsert = false;
            toUpdate = specializationGrouped.value;
          }
        });
        if(newInsert) _specializationsGrouped.push(toInsert);
        else toUpdate.push(specialization.name);
      });

      var _array = req.query.item ? [] : [{ value: 'Tutte le specializzazioni', item: true }];
      for (var i = 0; i < _specializationsGrouped.length; i++) {
        _array.push({ value: _specializationsGrouped[i].name, item: false });
        _array = _array.concat(_specializationsGrouped[i].value.map(function (val) {
          return { value: val, item: true };
        }));
      }
      return res.status(200).json({'specializations': _array});
    }
    catch(err) {
      console.log(err);
      return handleError(res, err);
    }
  });
};

exports.indexByCategory = function(req, res) {
  co(function*() {
    let _specializations;
    try {
      _specializations = yield Specialization
        .find({category:req.params.category})
        .exec(function (err, items) {});
      if (!_specializations) {
        return res.status(404).send("Category not found");
      }
      return res.status(200).json({'specializations': _specializations});
    }
    catch(err) {
      return handleError(res, err);
    }
  });
};

exports.create = function (req, res) {
  let _specialization;
  co(function*() {
    try {
      _specialization = yield Specialization.findOne({name: req.body.name});
      if (_specialization) {
        return handleError(res, 'Specializzazione già esistente');
      } else {
        Specialization.create(req.body, function(err) {
          if(err) {
            return handleError(res, err);
          }
          return res.status(204).end();
        });
      }
    } catch(e) {
      console.log(e);
      return handleError(res, e);
    }
  });
};

exports.update = function (req, res) {
  let _specialization;
  co(function*() {
    try {
      _specialization = yield Specialization.findOne({name: req.body.name});
      if (!_specialization) {
        return res.status(404).send('Specialization not Found');
      }
      _specialization.category = req.body.category;
      yield _specialization.save();
      return res.status(204).end();
    } catch(e) {
      return handleError(res, e);
    }
  });
};

exports.destroy = function(req, res) {
  let _specialization;
  co(function*() {
    try {
      _specialization = yield Specialization.findOne({name: req.params.name});
      if (!_specialization) {
        return res.status(404).send('Specialization not Found');
      }
      yield _specialization.remove();
      return res.status(204).end();
    } catch(e) {
      return handleError(res, e);
    }
  });
};

function handleError(res, err) {
  return res.status(500).send(err);
}

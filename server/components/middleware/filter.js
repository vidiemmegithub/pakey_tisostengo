'use strict';

/** MongoDB query parser
 *
 *  this middleware intercepts URL query parameters and when found
 *  translate in MongoDB query filter syntax and put object into req
 *
 *  module manages syntax like:
 *    - key:value => {'key': 'value'}
 *    - key:!value => {'key': '$not': {'$eq': 'value'}}
 *    - key:value1|value2 => {'key': { '$in': [ 'value1', 'value2' ] }}
 *    - key:!value1|value2 => {'key': { '$nin': [ 'value1', 'value2' ] }}
 *
 *  and automatically replaces 'null' string with null object in response
 */
const QUERY_PARAMETER = 'q',
      QUERY_FILTER_SEPARATOR = ';',
      QUERY_PROPERTY_SEPARATOR = ':',
      QUERY_VALUE_OR_SEPARATOR = '|',
      REQUEST_FIELD_NAME = 'filter',

      mongoose = require('mongoose');

module.exports = function(req, res, next) {
    var _query = {},
        _queryProperties;

    if (req.query.hasOwnProperty(QUERY_PARAMETER) && req.query[QUERY_PARAMETER] !== '') {
      _queryProperties = req.query[QUERY_PARAMETER].split(QUERY_FILTER_SEPARATOR);
      _queryProperties.forEach(filterPair => {
        if (filterPair.indexOf(QUERY_PROPERTY_SEPARATOR) >= 0) {
          let filterArr = filterPair.split(QUERY_PROPERTY_SEPARATOR),
              filterParam = filterArr[0],
              filterValue = (filterArr[1].indexOf(QUERY_VALUE_OR_SEPARATOR)===-1) ?
                ((filterArr[1].charAt(0) === '!') ?
                  {'$not': {'$eq': (filterArr[1].substr(1)==='null') ?
                    null :
                    ('true'===filterArr[1].substr(1) || 'false'===filterArr[1].substr(1)) ? JSON.parse(filterArr[1].substr(1)) : filterArr[1].substr(1)}}
                  : (filterArr[1]==='null') ?
                    null :
                    ('true'===filterArr[1] || 'false'===filterArr[1]) ? JSON.parse(filterArr[1]) : filterArr[1])
                : ((filterArr[1].charAt(0) === '!') ?
                   {'$nin':filterArr[1].substr(1).split(QUERY_VALUE_OR_SEPARATOR)} :
                   {'$in':filterArr[1].split(QUERY_VALUE_OR_SEPARATOR)});

          _query[filterParam] = filterValue;
        }
      });
    }

    // model specific transformations
    if (_query._id) {
      if (_query._id['$not']) {
        if (_query._id['$not']['$in']) {
          _query._id['$not']['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query._id['$not']['$eq'] = mongoose.Types.ObjectId(_query._id['$not']['$eq']);
        }
      }
      else {
        if (_query._id['$in']) {
          _query._id['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query._id = mongoose.Types.ObjectId(_query._id);
        }
      }
    }
    if (_query.author) {
      if (_query.author['$not']) {
        if (_query.author['$not']['$in']) {
          _query.author['$not']['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query.author['$not']['$eq'] = mongoose.Types.ObjectId(_query.author['$not']['$eq']);
        }
      }
      else {
        if (_query.author['$in']) {
          _query.author['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query.author = mongoose.Types.ObjectId(_query.author);
        }
      }
    }
    if (_query.target_user) {
      if (_query.target_user['$not']) {
        if (_query.target_user['$not']['$in']) {
          _query.target_user['$not']['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query.target_user['$not']['$eq'] = mongoose.Types.ObjectId(_query.target_user['$not']['$eq']);
        }
      }
      else {
        if (_query.target_user['$in']) {
          _query.target_user['$in'].map(id => mongoose.Types.ObjectId(id));
        }
        else {
          _query.target_user = mongoose.Types.ObjectId(_query.target_user);
        }
      }
    }

    req[REQUEST_FIELD_NAME] = _query;
    next();
};

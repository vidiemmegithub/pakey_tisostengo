'use strict';

/**
 * remove all fields marked as 'immutables' in a mongoose Schema,
 * from the request body
 *
 * use it as middleware in PUT routes when use MondoDB directive in mongoose
 */

const _ = require('lodash');

module.exports = function(model) {
    return function(req, res, next) {
        Object.keys(model.schema.tree).forEach(field => {
          if (model.schema.tree[field].hasOwnProperty('immutable')) {
            if (_.isBoolean(model.schema.tree[field].immutable) && true === model.schema.tree[field].immutable) {
              delete req.body[field];
            }
            else if (_.isString(model.schema.tree[field].immutable) && req.user.role === model.schema.tree[field].immutable) {
              delete req.body[field];
            }
            else if (_.isArray(model.schema.tree[field].immutable)) {
              if (_.some(model.schema.tree[field].immutable, role => role === req.user.role)) {
                delete req.body[field];
              }
            }
          }
        });
        next();
    }
};

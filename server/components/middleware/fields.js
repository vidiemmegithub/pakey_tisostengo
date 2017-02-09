'use strict';

const FIELDS_PARAMETER = 'f',
      FIELDS_SEPARATOR = ';',
      REQUEST_FIELD_NAME = 'fields';
    
module.exports = function(req, res, next) {
    var _fields = {};
    
    if (req.query.hasOwnProperty(FIELDS_PARAMETER) && req.query[FIELDS_PARAMETER] !== '') {
        _fields = req.query[FIELDS_PARAMETER].split(FIELDS_SEPARATOR).reduce((fields, field) => {fields[field] = true;return fields;}, _fields);
    }

    req[REQUEST_FIELD_NAME] = _fields;
    next();
};

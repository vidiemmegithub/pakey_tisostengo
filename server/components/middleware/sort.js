'use strict';

const SORT_PARAMETER = 's',
      ORDER_SEPARATOR = '|',
      FIELDS_SEPARATOR = ';',
      REQUEST_FIELD_NAME = 'sort';
    
module.exports = function(req, res, next) {
    var _sort = {},
        _sortFields;
    
    if (req.query.hasOwnProperty(SORT_PARAMETER) && req.query[SORT_PARAMETER] !== '') {
        _sortFields = req.query[SORT_PARAMETER].split(FIELDS_SEPARATOR);
        _sortFields.forEach(sortField => {
            let _sortPair = sortField.split(ORDER_SEPARATOR);
            
            _sort[_sortPair[0]] = (_sortPair[1] === 'ASC') ? 1 : -1;
        });
    }

    req[REQUEST_FIELD_NAME] = _sort;
    next();
};

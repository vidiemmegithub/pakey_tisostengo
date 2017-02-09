'use strict';

const PAGE_PARAMETER = 'page',
      ITEM_PER_PAGE_PARAMETER = 'per_page',
      REQUEST_FIELD_NAME = 'paging';
    
module.exports = function(req, res, next) {
    var _paging = {limit: Number.MAX_SAFE_INTEGER, skip: 0};
    
    if (req.query[ITEM_PER_PAGE_PARAMETER]) {
        _paging.limit = parseInt(req.query[ITEM_PER_PAGE_PARAMETER], 10);
    }
    if (req.query[PAGE_PARAMETER]) {
        _paging.skip = _paging.limit*parseInt(req.query[PAGE_PARAMETER], 10);
    }
    req[REQUEST_FIELD_NAME] = _paging;
    next();
};

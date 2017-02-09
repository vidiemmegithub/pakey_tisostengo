'use strict';

angular.module('tisostengoApp')
  .filter('htmlToPlainText', function () {
    return function (text) {
    	return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
  });

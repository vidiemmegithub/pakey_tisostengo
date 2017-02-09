'use strict';

angular.module('tisostengoApp')
  .filter('filterFromList', function($filter) {
  	return function(items, strings) {
  		var filtered = items;
	  	if (strings) {
	  		for (var i in strings) {
					filtered = $filter('filter')(filtered, strings[i]);
	  		}
	  	}
	  	return (filtered);
  	}
  });
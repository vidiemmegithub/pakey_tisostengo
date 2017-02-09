'use strict';

angular.module('tisostengoApp')
  .directive('adminPremium', function () {
    return {
      templateUrl: 'app/directives/adminPremium/adminPremium.html',
      restrict: 'EA',
      scope: {
        users: '=',
        service: '@',
        onRemoveService: '&'
      },
      link: function (scope, element, attrs) {
      	scope.filter = function (user) {
      		var result = false;
	        angular.forEach((user.subscriptions || []), function(value, key) {
	          if (value.name === scope.service)
	            return result = true;
	        });
		      return result;
        };
        
        scope.getActivationData = function (user) {
        	return getSubscription(user).sold_date;
        };
        
        scope.getDeactivationDate = function (user) {
        	return getSubscription(user).deactivation_date;
        };

        scope.getDeactivationData = function (user) {
          return getSubscription(user).deactivation_date;
        };

        scope.getPrice = function (user) {
        	return getSubscription(user).sold_price;
        };

        scope.getCoupon = function (user) {
          var coupon = getSubscription(user).coupon;
        	return (coupon) ? coupon.text : '';
        };

        scope.getStatus = function (user) {
        	return getSubscription(user).active;
        };

        function getSubscription (user) {
        	return _.findLast(user.subscriptions, {'name': scope.service});
        }
      }
    };
  });

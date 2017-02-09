'use strict';

angular.module('tisostengoApp')
  .directive('adminCoupon', function () {
    return {
      templateUrl: 'app/directives/adminCoupon/adminCoupon.html',
      restrict: 'EA',
      scope: {
        coupons: '=',
        editable: '=',
        customFilter: '&',
        onDeleteCoupon: '&',
      },
      link: function (scope, element, attrs) {
        scope.filter = function (coupon) {
          return scope.customFilter({thisCoupon: coupon});
        };
      	
      	scope.describeService = function(service) {
		      return {
		        'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
		        'ranking': 'INDICIZZAZIONE',
		        'private-channel-unq': 'CANALE PRIVATO UNQ',
		        'private-channel-uq': 'CANALE PRIVATO UQ'
		      }[service];
		    }
      }
    };
  });

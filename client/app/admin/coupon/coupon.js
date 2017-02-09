'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin.coupon', {
        url: '/coupon',
        templateUrl: 'app/admin/coupon/coupon.html',
        controller: 'CouponCtrl',
        controllerAs: 'coupon',
        requiredRole: 'admin'
      });
  });

'use strict';

angular.module('tisostengoApp')
  .controller('CouponCtrl', function ($scope, apiClient, $uibModal, toastr, sharedData) {
  	var coupon = this;

  	coupon.coupons = [];
  	coupon.createCoupon = createCoupon;
  	coupon.deleteCoupon = deleteCoupon;
    coupon.isDisabled = isDisabled;
    coupon.isValid = isValid;
    coupon.isExpired = isExpired;
    coupon.isService = isService;
    coupon.openSearchCalendar = openSearchCalendar;
    coupon.validInDate = validInDate;
    coupon.services = sharedData.service.all();

  	initialize();
    
    $scope.$watch("coupon.coupons | filter:{'text':  coupon.searchCode} | filter:{'amount': coupon.searchSconto} | filter:coupon.validInDate | filter:coupon.isService", function(newVal) {
      coupon.filteredCoupons = newVal;
    }, true);

    function initialize() {
      loadCoupons();
    }

    function loadCoupons() {
      apiClient.coupons.list().then(function (res) {
        coupon.coupons = res.data.coupons;
      });
    }

    function validInDate(thisCoupon) {
      var _validity = new Date(thisCoupon.validity);
      var _create = new Date(thisCoupon.createdAt);
      return (!coupon.searchDate || (coupon.searchDate >= _create &&  coupon.searchDate <= _validity));
    }

    function isService(thisCoupon) {
      return (!coupon.searchService || coupon.searchService === thisCoupon.service);
    }

    function openSearchCalendar () { 
      coupon.opened = true; 
    };

    function isValid(thisCoupon) {
      var _validity = new Date(thisCoupon.validity);
      var _now = new Date();
      return (thisCoupon.enabled && _validity > _now);
    }

    function isExpired(thisCoupon) {
      var _validity = new Date(thisCoupon.validity);
      var _now = new Date();
      return (thisCoupon.enabled && _validity < _now);
    }

    function isDisabled(thisCoupon) {
      return !thisCoupon.enabled;
    }

    function deleteCoupon(couponID) {
			$uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Elimina coupon',
          content: 'Sei sicuro di voler eliminare il coupon? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        return apiClient.coupons.delete(couponID)
          .then(function () {
            toastr.success('Coupon eliminato!');
            loadCoupons();
          });
      });
    };

    function createCoupon() {
      $uibModal.open({
        templateUrl: 'createCoupon.html',
        controller: function ($scope, apiClient, sharedData, services) {
          // ng-annotate does not recognize $uibModal yet
          // see https://github.com/olov/ng-annotate/issues/200
          "ngInject";

          $scope.create = create;
          $scope.errors = {};
          $scope.services = services;
          $scope.calendar = { opened: false };
          $scope.minDate = new Date();
          $scope.openCalendar = openCalendar;

					$scope.coupon = {};
          $scope.coupon.findMaxValue = findMaxValue;
          $scope.coupon.service = $scope.services[0].name;
          $scope.coupon.validity = new Date();
          $scope.coupon.validity.setDate($scope.coupon.validity.getDate() + 1);
          $scope.coupon.amount = 0.10;
          $scope.coupon.neverExpires = false;
          $scope.coupon.numberOfBillingCycles = 1;

          function openCalendar () { 
          	$scope.calendar.opened = true; 
          };

          function create() {
            apiClient.coupons.create($scope.coupon)
              .then(function () {
                $scope.$close();
                toastr.success('Coupon creato con successo');
                loadCoupons();
              })
              .catch(function (err) {
                $scope.errors.other = err.data.message;
                toastr.error('Si è verificato un problema, coupon non creato');
              });
          };
          
          function findMaxValue(serviceName) {
            $scope.coupon.maxValue = _.find($scope.services, {name: serviceName}).price;
          }
        },
        resolve: {
          services: function(sharedData, apiClient) {
            "ngInject";
            return apiClient.payments.plans()
              .then(function(plans) {
                return sharedData.service.all().map(function(plan) {
                  plan.price = plans.data[plan.name].price;
                  return plan;
                });
              });
          }
        }
      });
    };
  });

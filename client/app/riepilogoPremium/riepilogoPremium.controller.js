'use strict';

angular.module('tisostengoApp')
  .controller('RiepilogoPremiumCtrl', function ($scope, $http, service, apiClient, sharedData, toastr, $location, currentUser, Auth, $state) {
  	var riepilogo = this,
        originalAddress = {},
        options = {
          container: "dropin-container",
          onPaymentMethodReceived: function (response) {
            subscribe(response);
          },
          onReady: function () {
            //console.log('braintree ready');
          },
          onError : function(response) {
            //console.log("in onError");
            //console.log(response);
          }							
        };

    riepilogo.service = service;
  	riepilogo.address = {};
    riepilogo.discount = null;
    riepilogo.checkCoupon = checkCoupon;
    riepilogo.describeService = describeService;
    
		initialize();
    
    function describeService(service) {
      return {
        'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
        'ranking': 'INDICIZZAZIONE',
        'private-channel-unq': 'CANALE PRIVATO',
        'private-channel-uq': 'CANALE PRIVATO'
      }[service];
    }

		function initialize() {
			riepilogo.countries = sharedData.countries.all();
			riepilogo.address.countryName = 'Italy';

      /*
			apiClient.payments.addresses()
				.then(function (res) {
					angular.copy(res.data.addresses[0], originalAddress);
					riepilogo.address = res.data.addresses[0];
					if (!riepilogo.address.countryCodeAlpha3)
						riepilogo.address.countryCodeAlpha3 = 'ITA';
				}, function (fail) {
        	console.error('error fetching addresses', fail);
        });
      */
      
			apiClient.payments.token().then(function (res) {
        apiClient.payments.addresses().then(function (res) {
          if (res.data.addresses.length > 0) {
            var _address = _.last(res.data.addresses);
            riepilogo.address.firstName = _address.firstName;
            riepilogo.address.lastName = _address.lastName;
            riepilogo.address.company = _address.company;
            riepilogo.address.piva = _address.piva;
            riepilogo.address.streetAddress = _address.streetAddress;
            riepilogo.address.locality = _address.locality;
            riepilogo.address.postalCode = _address.postalCode;
            riepilogo.address.region = _address.region;
            riepilogo.address.countryName = _address.countryName;
          } else {
            riepilogo.address.firstName = currentUser.firstname;
            riepilogo.address.lastName = currentUser.lastname;
            riepilogo.address.company = currentUser.firstname + ' ' + currentUser.lastname;
            riepilogo.address.piva = currentUser.piva;
            riepilogo.address.streetAddress = currentUser.address;
            riepilogo.address.locality = currentUser.city;
            riepilogo.address.postalCode = currentUser.zipCode;
            riepilogo.address.region = currentUser.province;
          }

          //if (!riepilogo.address.countryCodeAlpha3)
            //riepilogo.address.countryCodeAlpha3 = 'ITA';
        }, function (fail) {
          console.error('error fetching addresses', fail);
        });
				braintree.setup(res.data.token, 'dropin', options);
      }, function (fail) {
      	console.error('error fetching client token', fail);
      });
		}
    
    function checkCoupon(discount) {
			apiClient.coupons.verify(discount, service.serviceType)
				.then(function (res) {
					riepilogo.discount = res.data;
        }, function (fail) {
          riepilogo.discount = {
            verifyError: fail.data
          };
        });
    }

    function subscribe(data) {
      apiClient.payments.subscribe(service.serviceType, data.nonce, riepilogo.address, riepilogo.discount)
        .then(function (res) {
          Auth.reloadUser().then(function () {
            toastr.success('Il servizio premium è stato attivato');
            $location.path('/servizi-premium');
          }, function (fail) {
            $state.reload();
          });
        }, function (fail) {
          console.error('error in payment', fail);
          toastr.error('Ci dispiace, si è verificato un errore durante la sottoscrizione al servizio');
        });
    }
    
    $scope.$on('$destroy', function iVeBeenDismissed() {
      sharedData.setService(null);
    })
  });

'use strict';

angular.module('tisostengoApp')
  .controller('ServiziPremiumCtrl', function ($cookies, $location, Auth, apiClient, plans, sharedData, currentUser) {
  	var premium = this;

  	premium.isLoggedIn = Auth.isLoggedIn;
  	premium.currentUser = currentUser;
  	premium.isPrivateChannel = isPrivateChannel;
  	premium.isProfilePro = isProfilePro;
  	premium.isRanking = isRanking;
  	premium.attiva = attiva;
  	premium.url = '/api/payments/braintree/subscription/profile-pro?access_token=' + $cookies.get('token');
  	premium.plans = plans;

  	function isPrivateChannel () {
      var result = false;
      if (premium.currentUser) {
        angular.forEach((premium.currentUser.subscriptions || []), function(value, key) {
          if (/^private-channel-(?=uq|unq)/.test(value.name))
            return result = value.active;
        });
      }
      return result;
    }

    function isProfilePro () {
      var result = false;
      if (premium.currentUser) {
        angular.forEach((premium.currentUser.subscriptions || []), function(value, key) {
          if (value.name === 'profile-pro')
            return result = value.active;
        });
      }
      return result;
    }

    function isRanking () {
      var result = false;
      if (premium.currentUser) {
        angular.forEach((premium.currentUser.subscriptions || []), function(value, key) {
          if (value.name === 'ranking')
            return result = value.active;
        });
      }
      return result;
    }

    function attiva (serviceType) {
      sharedData.setService(plans[serviceType]);
    	$location.path('/riepilogo-premium');
    }

/*
    $http.get(apiBaseUrl + '/payment/braintree/token').then(function (res) {
    	premium.clientToken = res.data;
    	$scope.CCType = "Images/pixel.gif";
      braintree.setup(clientToken, "custom", {
	      displayName : "Test Hosted Fields - Sandbox Enviro",
	      id: 'paymentForm',
	      hostedFields: {
	          styles: {
	            "input": {
	              "font-size": "12pt",
	              "color": "#3A3A3A",
	              "width":"50%",
	              "padding":"3px",
	              "margin":"3px"
	            },
	            ".number": {
	              "font-family": "inherit"
	            },
	            ":focus": {
	              "color": "blue"
	            },
	            ".valid": {
	              "color": "green"
	            },
	            ".invalid": {
	              "color": "red"
	            },
	            "@media screen and (max-width: 700px)": {
	              "input": {
	                "font-size": "14pt"
	              }
	            }
	          },
	          number: {
	            selector: "#card-number"
	          },
	          cvv: {
	            selector: "#cvv"
	          },
	          expirationDate: {
	            selector: "#expiration-date",
	            placeholder: "mm/yyyy"
	          },
	          postalcode: {
	            selector: "#postal-code"
	          },
	          onFieldEvent: function (event) {
				        console.log(event);
				        if (event.card) {
				            console.log(event.card.type);
				            switch(event.card.type) {
				                case  'master-card':
				                        $scope.CCType = "Images/mastercard.png";
				                        break;
				                case  'american-express':
				                        $scope.CCType = "Images/american_express.png";
				                        break;
				                case  'discover':
				                        $scope.CCType = "Images/discover.png";
				                        break;
				                case  'jcb':
				                        $scope.CCType = "Images/jcb.png";
				                        break;
				                case  'visa':
				                        $scope.CCType = "Images/visa.png";
				                        break;
				                case  'diners-club':
				                case  'unionpay':
				                case  'maestro':
				                default:
				                        $scope.CCType = "Images/pixel.gif";
				            }

				        }
	      }
	      },
	      paymentMethodNonceInputField: "payment_method_nonce",
	      amount: 0.99,
	      currency: 'EUR',
	      onReady : function(response) {
	            console.log("in OnReady");
	            console.log(response);
	            $scope.PaymentProcessing = true;
	      },
	      onPaymentMethodReceived : function(response) {
	            console.log("in onPaymentMethodReceived");
	            console.log(response);
	            console.log($scope.holdTransVars);

	            $scope.userPaymentMethod = response;
	            $scope.PaymentMethod = true;
	            $scope.PaymentProcessing = "";
	            $scope.BraintreeSale().then( function(result) {
	                $scope.PaymentProcessing = "complete";
	            },
	            function(result) {
	                console.log(result);
	                $scope.PaymentProcessing = "error";
	            });
	      },
	      onError : function(response) {
	          console.log("in onError");
	          console.log(response);
	          $scope.processingerrormsg = response.message;
	      }
	    });
		});
*/
  });

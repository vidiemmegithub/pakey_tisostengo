'use strict';

angular.module('tisostengoApp')
  .controller('RegistrazioneAvvenutaCtrl', function ($scope, Auth, $state) {
    var scope = this;

    scope.isLoggedIn = Auth.isLoggedIn;

    scope.goToHome = function () {
    	$state.go('home', { reload: true });
  	}
  });

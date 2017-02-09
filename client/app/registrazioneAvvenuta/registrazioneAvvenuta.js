'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('registrazioneAvvenuta', {
        url: '/registrazione-avvenuta',
        templateUrl: 'app/registrazioneAvvenuta/registrazione-avvenuta.html',
        controller: 'RegistrazioneAvvenutaCtrl',
        controllerAs: 'registrazioneAvvenuta'
      });
  });

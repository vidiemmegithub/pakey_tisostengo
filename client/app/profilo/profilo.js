'use strict';

angular.module('tisostengoApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('profilo', {
        url: '/profilo',
        templateProvider: function (Auth, $templateFactory) {
          return Auth.getCurrentUser().$promise.then(function (user) {
            if (user.registrationPending || user.role === 'editor') return $templateFactory.fromUrl('app/profilo/profilo-qualified.html');
            return $templateFactory.fromUrl('app/profilo/profilo-' + user.role + '.html');
          });
        },
        controller: 'ProfiloCtrl',
        controllerAs: 'profilo',
        resolve: {
          currentUser: function (User) {
            return User.get();
          }
        },
        authenticate: true
      })
      .state('profilo-for-admin', {
        url: '/profilo/:id',
        templateProvider: function (User, $templateFactory, $stateParams) {
          return User.get({ id: $stateParams.id }).$promise.then(function (user) {
            if (user.registrationPending || user.role === 'editor') return $templateFactory.fromUrl('app/profilo/profilo-qualified.html');
            return $templateFactory.fromUrl('app/profilo/profilo-' + user.role + '.html');
          });
        },
        controller: 'ProfiloCtrl',
        controllerAs: 'profilo',
        resolve: {
          currentUser: function (User, $stateParams) {
            return User.get({ id: $stateParams.id });
          }
        },
        requiredRole: 'admin',
        data: {
          isAdminEditing: true
        }
      })
      .state('registerQualified', {
        url: '/registra-professionista',
        templateUrl: 'app/profilo/profilo-qualified.html',
        controller: 'ProfiloCtrl',
        controllerAs: 'profilo',
        resolve: {
          currentUser: function (User, $state) {
            return User.get().$promise
              .then(function(user) {
                $state.go('home');
              }, function() {
                angular.noop;
              });
          }
        }
      });
  });

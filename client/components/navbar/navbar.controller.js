'use strict';

angular.module('tisostengoApp')
  .controller('NavbarCtrl', function ($scope, $location, $state, $uibModal, Auth) {
    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isQualified = Auth.isQualified;
    $scope.isUnqualified = Auth.isUnqualified;
    $scope.isEditor = Auth.isEditor;
    $scope.getCurrentUser = Auth.getCurrentUser;
    $scope.isContenuti = true;

    $scope.menu = [{
      title: 'Motore di ricerca',
      link: '/percorsiCura'
    }, {
      title: 'Professionisti',
      link: '/professionisti'
    }, {
      title: 'Notizie',
      link: '/articoli'
    }, {
      title: 'Domande e risposte',
      link: '/domande'
    }];


    $scope.logout = function () {
      Auth.logout();
      $state.reload();
    };

    $scope.search = function (text) {
      if (text && text !== '') {
        if ($scope.isContenuti) {
          $location.path('/cerca-contenuti/' + text);
        } else {
          $location.path('/cerca-professionisti/' + text);
        }
      }
    };
  });

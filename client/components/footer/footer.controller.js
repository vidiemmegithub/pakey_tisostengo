'use strict';

angular.module('tisostengoApp')
  .controller('FooterCtrl', function ($scope, $location, Auth) {
    /*$scope.menu = [{
      title: 'Professionisti',
      link: '/professionisti'
    }, {
      title: 'Articoli',
      link: '/articoli'
    }, {
      title: 'Domande e risposte',
      link: '/domande'
    }];*/

    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.isQualified = Auth.isQualified;
    $scope.isUnqualified = Auth.isUnqualified;
    $scope.isEditor = Auth.isEditor;
  });

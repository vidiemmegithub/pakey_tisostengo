'use strict';

angular.module('tisostengoApp')
.config(function ($stateProvider) {
  $stateProvider
  .state('home', {
    url: '/home',
    templateUrl: 'app/home/home.html',
    controller: 'HomeCtrl',
    controllerAs: 'home',
    authenticate: true,
    resolve: {
      user: function (apiClient) {
      	var statistics = "followed,follower,articles,questions.received,questions.sent,answers.received,answers.sent";
	      return apiClient.users.me(statistics, {}, [])
	      .then(function (res) {
	        return res.data;
	      });
      }
    },
  });
});

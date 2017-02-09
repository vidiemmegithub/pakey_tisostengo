'use strict';

angular
  .module('tisostengoApp')
  .controller('AdminSpecializationsController', function ($state, apiClient, $uibModal, $scope, toastr) {
    var scope = this;

    scope.keysearch = function(filter) {
      scope.filter = filter;
      initialize();
    };

    scope.create = function() {
      var specialization = { name: '', category: '', newCategory:'' };
      getCategories(function(categories){
        $uibModal.open({
          templateUrl: 'app/admin/specializations/specialization.html',
          scope: angular.extend($scope.$new(), {
            new:true,
            specialization:specialization,
            categories:categories
          })
        }).result.then(function () {
          if(specialization.category === '') specialization.category = specialization.newCategory;
          delete specialization.newCategory;
          apiClient.specializations.create(specialization).then(function(res){
            $state.reload();
          },function(err){
            toastr.error(err.data);
          });
        });
      });
    };

    scope.update = function(specialization) {
      specialization.newCategory = '';
      getCategories(function(categories){
        $uibModal.open({
          templateUrl: 'app/admin/specializations/specialization.html',
          scope: angular.extend($scope.$new(), {
            new:false,
            specialization:specialization,
            categories:categories
          })
        }).result.then(function () {
          if(specialization.category === '') specialization.category = specialization.newCategory;
          delete specialization.newCategory;
          apiClient.specializations.update(specialization).then(function(res){
            $state.reload();
          });
        });
      });
    };

    scope.remove = function(specialization) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Attenzione',
          content: "Sei sicuro di voler rimuovere la specializzazione?"
        })
      }).result.then(function () {
        apiClient.specializations.remove(specialization).then(function (res) {
          $state.reload();
        });
      });
    };

    scope.loadMore = function () {
      scope.currentPage++;
      load();
    };

    initialize();

    function initialize() {
      scope.currentPage = 0;
      scope.pageSize = 10;
      scope.specializations = [];
      load();
    }

    function load() {
      scope.isLoading = true;

      apiClient.specializations.all(scope.filter, scope.pageSize, scope.currentPage).then(function (res) {
          if (res.data.specializations && res.data.specializations.length > 0) {
            scope.specializations.push.apply(scope.specializations, res.data.specializations);
            scope.noMore = false;
          } else {
            scope.noMore = true;
          }
        })
        .finally(function () {
          scope.isLoading = false;
        });
    }

    function getCategories(cb) {
      apiClient.specializations.allByCategories().then(function (res) {
        var specializations = res.data.specializations, type;
        specializations.splice(0,1);
        var categories = [];
        categories.push('');
        specializations.forEach(function(item,index,array){
          if(!item.item) {
            categories.push(item.value);
          }
        });
        cb(categories);
      });
    }

  });

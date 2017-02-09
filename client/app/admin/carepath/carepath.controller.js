'use strict';

angular.module('tisostengoApp')
  .directive('onLastRepeat', function() {
    return function(scope, element, attrs) {
      if (scope.$last) setTimeout(function(){
        scope.$emit('onRepeatLast', element, attrs);
      }, 1);
    };
  })
  .controller('AdminCarepathCtrl', function ($scope, $state, $window, $uibModal, Auth, apiClient, sharedData, carepath) {
    var scope = this;

    $scope.$on('onRepeatLast', function(scope, element, attrs){});

    function initialize() {
      scope.carepath = carepath;
      scope.carepath.selected = null;
    }

    scope.save = function () {
      delete scope.carepath.selected;
      if (scope.carepath._id) {
        apiClient.carepaths
        .update(scope.carepath._id, scope.carepath)
        .then(function (res) {
          $state.go('admin.carepaths');
        }).catch(function(){
          scope.carepath.selected = null;
          $uibModal.open({
            templateUrl: 'components/promptModal/promptModal.html',
            scope: angular.extend($scope.$new(), {
              title: 'Attenzione',
              content: "Si è verificato un problema durante la modifica del percorso di cura"
            })
          });
        });
      } else {
        apiClient.carepaths
        .create(scope.carepath)
        .then(function (res) {
          console.log(res);
          $state.go('admin.carepaths');
        }).catch(function(err){
          console.log(err);
          scope.carepath.selected = null;
          $uibModal.open({
            templateUrl: 'components/promptModal/promptModal.html',
            scope: angular.extend($scope.$new(), {
              title: 'Attenzione',
              content: "Si è verificato un problema durante la creazione del percorso di cura"
            })
          });
        }).finally(function(bo){
          console.log(bo);
        });
      }
    };

    scope.openStepEditor = function (step) {
      var currentStep = {
        specializations: [],
        specialists: []
      }
      if (step) {
        currentStep = step;
      }
      getAllSpecializations(function(allSpecializations){
        $uibModal.open({
          templateUrl: 'app/admin/carepath/step.html',
          scope: angular.extend($scope.$new(), {
            step: stepListToObj(currentStep),
            specializationsDropdown: {
              list: allSpecializations,
              settings: {
                groupByTextProvider: function(groupValue) {
                  return groupValue;
                },
                displayProp: 'id' ,
                enableSearch: true,
              },
              events: {
                onInitDone: function(){},
                onItemSelect: function(item){},
                onItemDeselect: function(item){}
              },
              filter: ''
            }
          })
        }).result.then(function () {
          currentStep = stepObjToList(currentStep);
          currentStep.specialists = [];
          if (!step) {
            scope.carepath.steps.push(currentStep);
          }
        });
      });
    };

    scope.removeStep = function (index) {
      scope.carepath.steps.splice(index,1);
    };

    scope.remove = function(id) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Attenzione',
          content: "Sei sicuro di voler rimuovere il percorso di cura?"
        })
      }).result.then(function () {
        apiClient.carepaths
        .delete(id)
        .then(function (res) {
          $state.reload();
        });
      });
    };

    function stepListToObj(step) {
      step.specializations.forEach(function(item,index,array){
        array.splice(index,1,{id:item});
      });
      return step;
    }

    function stepObjToList(step) {
      step.specializations.forEach(function(item,index,array){
        array.splice(index,1,item.id);
      });
      return step;
    }

    function getAllSpecializations(cb) {
      apiClient.specializations.allByCategories().then(function (res) {
        var specializations = res.data.specializations, type;
        specializations.splice(0,1);
        specializations.forEach(function(item,index,array){
          if(!item.item) {
            type = item.value;
          } else {
            item.id = item.value;
            item.type = type;
            delete item.value;
            delete item.item;
          }
        });
        specializations.forEach(function(item,index,array){
          if(!item.id) {
            array.splice(index,1);
          }
        });
        cb(specializations);
      });
    }

    initialize();
  });

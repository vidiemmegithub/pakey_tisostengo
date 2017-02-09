'use strict';

angular.module('tisostengoApp')
  .directive('adminQuestions', function () {
    return {
      templateUrl: 'app/directives/adminQuestions/adminQuestions.html',
      restrict: 'EA',
      scope: {
        questions: '=',
        answered: '=',
        onDeleteQuestion: '&'
      },
      link: function (scope, element, attrs) {
      	scope.filter = function (question) {
          return scope.answered ? !!question.answer : !question.answer;
        };

        scope.delete = 'onDeleteQuestion' in attrs;
      }
    };
  });

'use strict';

angular.module('tisostengoApp')
  .directive('comments', function () {
    return {
      templateUrl: 'app/directives/comments/comments.html',
      restrict: 'EA',
      scope: {
        article: '=',
        question: '='
      },
      link: function (scope, element, attrs) {

      },
      controller: function($scope, Auth, apiClient, toastr, $uibModal) {
        $scope.getCurrentUser = Auth.getCurrentUser;

        $scope.$watch('article', function(article){
          if(!article) return;
          
          $scope.addComment = commentArticle;
          $scope.comments = article.comments;
          
          $scope.isSelf = function () {
            return (Auth.getCurrentUser()._id === $scope.article.author._id);
          }

          $scope.deleteComment = function (comment) {
            $uibModal.open({
              templateUrl: 'components/promptModal/promptModal.html',
              scope: angular.extend($scope.$new(), {
                title: 'Rimuovi commento',
                content: 'Sei sicuro di voler cancellare il commento? L\'operazione non è reversibile.'
              })
            }).result.then(function () {
              apiClient.articles.removeComment(comment._id)
                .then(function(){
                  toastr.success('Commento eliminato');
                  $scope.comments.splice($scope.comments.indexOf(comment), 1);
              });
            });
          }
        });

        $scope.$watch('question', function(question){
          if(!question) return;

          $scope.addComment = commentQuestion;
          $scope.comments = question.comments;

          $scope.isSelf = function () {
            return (Auth.getCurrentUser()._id === $scope.question.author._id);
          }

          $scope.deleteComment = function (comment) {
            $uibModal.open({
              templateUrl: 'components/promptModal/promptModal.html',
              scope: angular.extend($scope.$new(), {
                title: 'Rimuovi commento',
                content: 'Sei sicuro di voler cancellare il commento? L\'operazione non è reversibile.'
              })
            }).result.then(function () {
               apiClient.questions.removeComment(comment._id)
                .then(function(){
                  toastr.success('Commento eliminato');
                  $scope.comments.splice($scope.comments.indexOf(comment), 1);
              });
            });
          }
        });

        $scope.isAdmin = function () {
          return (Auth.getCurrentUser().role === 'admin');
        }

        function addClientSideComment(comment) {
          $scope.comments.unshift(comment);
          $scope.comment.text = '';
        }

        function commentArticle(text){
          apiClient.articles.addComment($scope.article._id, text).then(function(res){
            addClientSideComment(res.data);
          });
        }

        function commentQuestion(text) {
          apiClient.questions.addComment($scope.question._id, text).then(function(res){
            addClientSideComment(res.data);
          });
        }
      }
    };
  });

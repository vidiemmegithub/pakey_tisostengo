'use strict';

angular.module('tisostengoApp')
  .controller('AdminAdvertisingCtrl', function ($scope, apiClient, $uibModal, toastr) {
    var advertising = this;

    advertising.create = create;
    advertising.enable = enable;
    advertising.disable = disable;
    advertising.edit = edit;
    advertising.remove = remove;

    activate();

    function activate() {
      loadAdvertisements();
    }

    function loadAdvertisements() {
      apiClient.advertisements.list().then(function (res) {
        advertising.ads = res.data.advertisements;
      });
    }

    function create() {
      showEditDialog().result
        .then(loadAdvertisements)
          .then(function () {
            toastr.success('Banner creato');
          });
    }

    function showEditDialog(ad) {
      return $uibModal.open({
        templateUrl: 'edit-banner.html',
        scope: angular.extend($scope.$new(), { ad: angular.copy(ad) }),
        controller: function ($scope, apiClient, Upload) {
          
          "ngInject";

          $scope.isNew = !$scope.ad;

          if($scope.isNew) {
            $scope.ad = {
              validSince: new Date(),
              validUntil: new Date()
            };
            $scope.ad.validSince.setMinutes(0);
            $scope.ad.validSince.setSeconds(0);
            $scope.ad.validSince.setMilliseconds(0);

            $scope.ad.validUntil.setHours($scope.ad.validSince.getHours() + 1);
            $scope.ad.validUntil.setMinutes(0);
            $scope.ad.validUntil.setSeconds(0);
            $scope.ad.validUntil.setMilliseconds(0);

            $scope.ad.link = "http://";
            $scope.ad.visibility = "home";
          }

          $scope.selectPicture = function(file) {
            Upload.base64DataUrl(file).then(function(url) {
              $scope.ad.picture = url;
            });
          };

          $scope.save = function () {
            if ($scope.isNew) {
              apiClient.advertisements.create($scope.ad)
                .then($scope.$close);
            } else {
              apiClient.advertisements.update($scope.ad)
                .then($scope.$close);
            }
          }
        }
      });
    }

    function enable(ad) {
      apiClient.advertisements.enable(ad._id).then(loadAdvertisements);
    }

    function disable(ad) {
      apiClient.advertisements.disable(ad._id).then(loadAdvertisements);
    }

    function edit(ad) {
      showEditDialog(ad).result
        .then(loadAdvertisements)
        .then(function () {
          toastr.success('Banner aggiornato');
        });
    }

    function remove(ad) {
      $uibModal.open({
        templateUrl: 'components/promptModal/promptModal.html',
        scope: angular.extend($scope.$new(), {
          title: 'Rimuovi banner pubblicitario',
          content: 'Sei sicuro di voler cancellare il banner? L\'operazione non è reversibile'
        })
      }).result.then(function () {
        apiClient.advertisements.remove(ad._id)
          .then(loadAdvertisements)
          .then(function () {
            toastr.success('Banner eliminato');
          });
      });
    }
  });

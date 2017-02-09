'use strict';

angular.module('tisostengoApp')
  .controller('ProfiloCtrl', function ($scope, $state, currentUser, sharedData, apiClient, Upload, Auth, $uibModal, $location, angularLoad) {
    var profilo = this;

    profilo.isNewUser = !currentUser;
    profilo.isAdmin = Auth.isAdmin;
    profilo.isPremium = isPremium;
    profilo.user = currentUser || {};
    profilo.cities = sharedData.cities.all();
    profilo.professionalTitles = sharedData.professionalTitles;
    profilo.describeService = describeService;
    profilo.save = save;
    profilo.calendar = { opened: false };
    profilo.openCalendar = openCalendar;

    profilo.alerts = [];
    profilo.errors = {};

    function getProfilePicture(){
      if (typeof profilo.user.picture != 'undefined' && !profilo.user.picture.includes('data:')) {
        apiClient.images.image('users', profilo.user._id, 150, 105, 'resize')
          .then(function (res) {
            profilo.user.picture = res.data;
          });
      }
    }
    getProfilePicture();

    $scope.$watch(angular.bind(profilo, function () {
      return profilo.user.registrationPending;
    }), function (registrationPending) {
      if (registrationPending && $location.path() == '/profilo') {
        profilo.alerts.push({
          type: 'warning',
          msg: 'In attesa della certificazione di tiSOStengo',
          close: function () {
            return closeAlert(this);
          }
        });
      }
    });

    function isPremium() {
      var result = false;
      if (profilo.user) {
        angular.forEach((profilo.user.subscriptions || []), function(value, key) {
          if (value.name === 'profile-pro')
            return result = value.active;
        });
      }
      return result;
    }

    function closeAlert(alert) {
      return closeAlertIdx(profilo.alerts.indexOf(alert));
    }

    function closeAlertIdx(index) {
      return profilo.alerts.splice(index, 1);
    }

    function openCalendar () {
      profilo.calendar.opened = true;
    };

    function save(userType) {
      geocodeGA(processAddresses(), function(res){
        var allValid = true;
        var validationFailed = false;
        $scope.addresses = res;
        $scope.addresses.forEach(function(address){
          if(!address.success) allValid = false;
          if(!address.success && address.suggestions.length == 0) validationFailed = true;
        });
        if (allValid) {
          $scope.addresses.forEach(function(address){
            populateAddressesValidated(address);
          });
          saveNext(userType);
        }
        else {
          $uibModal.open({
            templateUrl: 'app/profilo/addresses-confirmation.html',
            scope: angular.extend($scope.$new(), {
              addresses: $scope.addresses,
              validationFailed: validationFailed
            })
          }).result.then(function () {
            var next = true;
            $scope.addresses.forEach(function(address){
              if(address.success === false && !address.selected)
                next = false;
              else
                populateAddressesValidated(address);
            });
            if(next) saveNext(userType);
          });
        }
      });
    }

    function saveNext(userType) {
      if (profilo.user.specialization && profilo.user.specialization.value)
        profilo.user.specialization = profilo.user.specialization.value;

      if (profilo.user.secondarySpecializations) {
        if (profilo.user.secondarySpecializations[0] && profilo.user.secondarySpecializations[0] === 'Scegli una specializzazione')
          profilo.user.secondarySpecializations[0] = undefined;
        if (profilo.user.secondarySpecializations[1] && profilo.user.secondarySpecializations[1] === 'Scegli una specializzazione')
          profilo.user.secondarySpecializations[1] = undefined;
        if (profilo.user.secondarySpecializations[2] && profilo.user.secondarySpecializations[2] === 'Scegli una specializzazione')
          profilo.user.secondarySpecializations[2] = undefined;
      }

      if (!profilo.user.pictureFile) return doSave(userType);

      Upload.base64DataUrl(profilo.user.pictureFile).then(function (url) {
        profilo.user.picture = url;
        doSave(userType);
      });
    }

    function doSave(userType) {
      if (profilo.isNewUser) {
        if (userType === 'uq') {
          profilo.user.registrationPending = true;
        }

        var next = true;
        if(profilo.user.picture) {
          apiClient.picture.create({name: profilo.user.email, picture: profilo.user.picture}).then(function(){
            profilo.user.picture = profilo.user.email;
          }, function(fail){
            next = false;
            profilo.errors.other = fail.data.message;
            showConfirmation(false);
          })
        }
        if(next) {
          Auth.createUser(profilo.user)
            .then(function () {
              $state.reload();
              showConfirmation(true);
            }, function (fail) {
              profilo.errors.other = fail.data.message;
              showConfirmation(false);
            });
        }
      } else if ($state.current.data && $state.current.data.isAdminEditing) {
        var next = true;
        if(profilo.user.picture) {
          apiClient.picture.update({name: profilo.user.email, picture: profilo.user.picture}).then(function(){
            profilo.user.picture = profilo.user.email;
          }, function(fail){
            next = false;
            profilo.errors.other = fail.data.message;
            showConfirmation(false);
          })
        }
        if(next) {
          apiClient.users.update(profilo.user)
            .then(function () {
              $state.reload();
              showConfirmation(true);
            }, function (fail) {
              showConfirmation(false);
            });
        }
      } else {
        if (profilo.user.email !== Auth.getCurrentUser().email) {
          $uibModal.open({
            templateUrl: 'components/promptModal/promptModal.html',
            scope: angular.extend($scope.$new(), {
              title: 'Modifica profilo',
              content: "Hai modificato l'indirizzo e-mail con cui accedere a tiSOStengo. Sei sicuro di voler procedere?"
            })
          }).result.then(function () {
            return updateProfile();
          });
        } else {
          updateProfile();
        }
      }
    }

    function updateProfile() {
      var next = true;
      if(profilo.user.picture) {
        apiClient.picture.update({name: profilo.user.email, picture: profilo.user.picture}).then(function(){
          profilo.user.picture = profilo.user.email;
        }, function(fail){
          next = false;
          profilo.errors.other = fail.data.message;
          showConfirmation(false);
        })
      }
      if(next) {
        apiClient.users.updateMe(profilo.user)
          .then(function () {
            Auth.reloadUser().then(function () {
              $state.reload();
              showConfirmation(true);
            });
          }, function (fail) {
            profilo.errors.other = fail.data.message;
            showConfirmation(false);
          });
      }
    }

    function showConfirmation(isOk) {
      if (profilo.isNewUser && isOk) {
        $uibModal.open({
          templateUrl: 'qualified-user-registration.html'
        });
      } else {
        $uibModal.open({
          templateUrl: 'components/actionResult/actionResult.html',
          controller: function ($scope, $modalInstance) {
            // ng-annotate does not recognize $uibModal yet
            // see https://github.com/olov/ng-annotate/issues/200
            "ngInject";

            $scope.isOk = isOk;
            $scope.cancel = function () {
              $modalInstance.dismiss('cancel');
            };
          },
          backdrop: 'static'
        });
      }
    }

    function describeService(service) {
      return {
        'profile-pro': 'PERSONALIZZAZIONE DEL PROFILO',
        'ranking': 'INDICIZZAZIONE',
        'private-channel-unq': 'CANALE PRIVATO',
        'private-channel-uq': 'CANALE PRIVATO'
      }[service];
    }

    function processAddresses() {
      var addresses = [];
      addresses.push((profilo.user.address + ' ' + profilo.user.addressNumber + ' ' + profilo.user.zipCode + ' ' + profilo.user.city + ' ' + profilo.user.province).trim());

      profilo.user.secondaryGeocode = {};
      if (typeof profilo.user.secondaryCity === 'undefined') profilo.user.secondaryCity = '';
      if (typeof profilo.user.secondaryAddress === 'undefined') profilo.user.secondaryAddress = '';
      if (typeof profilo.user.secondaryAddressNumber === 'undefined') profilo.user.secondaryAddressNumber = '';
      if (typeof profilo.user.secondaryZipCode === 'undefined') profilo.user.secondaryZipCode = '';
      if (typeof profilo.user.secondaryProvince === 'undefined') profilo.user.secondaryProvince = '';
      var addr2 = (profilo.user.secondaryAddress + ' ' + profilo.user.secondaryAddressNumber + ' ' + profilo.user.secondaryZipCode + ' ' + profilo.user.secondaryCity + ' ' + profilo.user.secondaryProvince).trim();
      if (addr2 !== '' && addr2 !== 'null') addresses.push(addr2);

      if (typeof profilo.user.operationalAddresses !== 'undefined' && profilo.user.operationalAddresses.length>0) {
        profilo.user.operationalAddresses[0].geocode = {};
        if (typeof profilo.user.operationalAddresses[0].city === 'undefined') profilo.user.operationalAddresses[0].city = '';
        if (typeof profilo.user.operationalAddresses[0].address === 'undefined') profilo.user.operationalAddresses[0].address = '';
        if (typeof profilo.user.operationalAddresses[0].addressNumber === 'undefined') profilo.user.operationalAddresses[0].addressNumber = '';
        if (typeof profilo.user.operationalAddresses[0].zipCode === 'undefined') profilo.user.operationalAddresses[0].zipCode = '';
        if (typeof profilo.user.operationalAddresses[0].province === 'undefined') profilo.user.operationalAddresses[0].province = '';
        var addr3 = (profilo.user.operationalAddresses[0].address + ' ' + profilo.user.operationalAddresses[0].addressNumber + ' ' + profilo.user.operationalAddresses[0].zipCode + ' ' + profilo.user.operationalAddresses[0].city + ' ' + profilo.user.operationalAddresses[0].province).trim();
        if (addr3 !== '' && addr3 !== 'null') addresses.push(addr3);
      }

      if (typeof profilo.user.operationalAddresses !== 'undefined' && profilo.user.operationalAddresses.length>1) {
        profilo.user.operationalAddresses[1].geocode = {};
        if (typeof profilo.user.operationalAddresses[1].city === 'undefined') profilo.user.operationalAddresses[1].city = '';
        if (typeof profilo.user.operationalAddresses[1].address === 'undefined') profilo.user.operationalAddresses[1].address = '';
        if (typeof profilo.user.operationalAddresses[1].addressNumber === 'undefined') profilo.user.operationalAddresses[1].addressNumber = '';
        if (typeof profilo.user.operationalAddresses[1].zipCode === 'undefined') profilo.user.operationalAddresses[1].zipCode = '';
        if (typeof profilo.user.operationalAddresses[1].province === 'undefined') profilo.user.operationalAddresses[1].province = '';
        var addr4 = (profilo.user.operationalAddresses[1].address + ' ' + profilo.user.operationalAddresses[1].addressNumber + ' ' + profilo.user.operationalAddresses[1].zipCode + ' ' + profilo.user.operationalAddresses[1].city + ' ' + profilo.user.operationalAddresses[1].province).trim();
        if (addr4 !== '' && addr4 !== 'null') addresses.push(addr4);
      }

      return addresses;
    }

    function populateAddressesValidated(address) {
      var info;
      if(address.selected)
        info = address.suggestions[address.selected];
      else
        info = address.info;

      switch(address.id) {
        case 0:
          profilo.user.address = info.route;
          profilo.user.addressNumber = info.number;
          profilo.user.city = info.city;
          profilo.user.zipCode = info.zipCode;
          profilo.user.province = info.province;
          profilo.user.geocode = {
            placeId: info.placeId,
            lat: info.lat,
            lng: info.lng,
            formattedAddress: info.formattedAddress
          };
          break;
        case 1:
          profilo.user.secondaryAddress = info.route;
          profilo.user.secondaryAddressNumber = info.number;
          profilo.user.secondaryCity = info.city;
          profilo.user.secondaryZipCode = info.zipCode;
          profilo.user.secondaryProvince = info.province;
          profilo.user.secondaryGeocode = {
            placeId: info.placeId,
            lat: info.lat,
            lng: info.lng,
            formattedAddress: info.formattedAddress
          };
          break;
        case 2:
          profilo.user.operationalAddresses[0].address = info.route;
          profilo.user.operationalAddresses[0].addressNumber = info.number;
          profilo.user.operationalAddresses[0].city = info.city;
          profilo.user.operationalAddresses[0].zipCode = info.zipCode;
          profilo.user.operationalAddresses[0].province = info.province;
          profilo.user.operationalAddresses[0].geocode = {
            placeId: info.placeId,
            lat: info.lat,
            lng: info.lng,
            formattedAddress: info.formattedAddress
          };
          break;
        case 3:
          profilo.user.operationalAddresses[1].address = info.route;
          profilo.user.operationalAddresses[1].addressNumber = info.number;
          profilo.user.operationalAddresses[1].city = info.city;
          profilo.user.operationalAddresses[1].zipCode = info.zipCode;
          profilo.user.operationalAddresses[1].province = info.province;
          profilo.user.operationalAddresses[1].geocode = {
            placeId: info.placeId,
            lat: info.lat,
            lng: info.lng,
            formattedAddress: info.formattedAddress
          };
          break;
        default:
          break;
      }
    }

    function loadGA() {
      angularLoad.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAgx0LM8sb83VfUbepcbU8_iCfUaD6f8vQ').then(function() {
        $scope.GALoaded = true;
        $scope.GAGeocode = new google.maps.Geocoder();
      }).catch(function() {
        $scope.GALoaded = false;
      });
    }
    loadGA();

    function geocodeGA(addresses, success, error) {
      var geosuggestions = [];
      if($scope.GALoaded) {
        async.waterfall([
          function(cb){
            var fs = [];
            addresses.forEach(function(address,addressIndex){
              fs.push(function(cb){
                $scope.GAGeocode.geocode( {address:address}, function(results, status){
                  if (status == google.maps.GeocoderStatus.OK){
                    var validResults = [];
                    results.forEach(function(currentResult){
                      currentResult.types.forEach(function(type){
                        if (type === 'street_address')
                          validResults.push(currentResult);
                      });
                    });
                    var formattedResults = [];
                    validResults.forEach(function(currentResult){
                      var number, route, zipCode, city, province;
                      currentResult.address_components.forEach(function(addressComponent){
                        addressComponent.types.forEach(function(type){
                          if (type === 'street_number')
                            number = addressComponent.long_name;
                          else if (type === 'route')
                            route = addressComponent.long_name;
                          else if (type === 'postal_code')
                            zipCode = addressComponent.long_name;
                          else if (type === 'locality')
                            city = addressComponent.long_name;
                          else if (type === 'administrative_area_level_3')
                            province = addressComponent.long_name;
                        });
                      });
                      formattedResults.push({
                        formattedAddress: currentResult.formatted_address,
                        province: province,
                        city: city,
                        zipCode: zipCode,
                        route: route,
                        number: number,
                        placeId: currentResult.place_id,
                        lat: currentResult.geometry.location.lat().toString(),
                        lng: currentResult.geometry.location.lng().toString()
                      });
                    });
                    if(validResults.length > 0) {
                      if (validResults.length === 1 && !validResults[0].partial_match)
                        geosuggestions.push({ id: addressIndex, success: true, info: formattedResults[0] });
                      else
                        geosuggestions.push({ id: addressIndex, success: false, suggestions: formattedResults });
                    } else {
                      geosuggestions.push({ id: addressIndex, success: false, suggestions:[] });
                    }
                  } else {
                    geosuggestions.push({ id: addressIndex, success: false, suggestions:[] });
                  }
                  cb();
                });
              });
              if(addressIndex==addresses.length-1){
                cb(null, fs);
              }
            });
          },
          function(fs, cb){;
            async.waterfall(fs, cb);
          }
        ], function (err) {
          if (err) {
            console.log('There was an error with Google Apis geocode');
            error();
          } else {
            success(geosuggestions);
          }
        });
      } else {
        console.log('There was an error with Google Apis');
        error();
      }
    }

  });

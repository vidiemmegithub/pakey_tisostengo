'use strict';

angular
  .module('tisostengoApp')
  .controller('CarepathController', function ($state, $scope, $stateParams, apiClient, $uibModal, carepath, Auth, angularLoad) {
    var scope = this;

    var locations = [];
    var markerToAddMap = [];
    var markerList = [];
    var listaSteps = [];

    var labels = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    var countLabels = 0;
    var rangeMetersRankati = 4000;
    var rangeMetersOthers = 3000;
    var placeholderPicUQ = 'assets/images/uqplaceholder.jpg'

    function initialize() {
      if (Auth.isLoggedIn() && !Auth.getCurrentUser().geocode && !Auth.isAdmin()) {
        $uibModal.open({
          templateUrl: 'components/promptModal/promptModal.html',
          scope: angular.extend($scope.$new(), {
            title: 'Attenzione',
            content: "Hai un indirizzo non valido, verrai reindirizzato al tuo profilo personale dove potrai modificarlo."
          })
        }).result.then(function () {
          $state.go('profilo');
        });
      } else {
        scope.currentUser = Auth.getCurrentUser();
        apiClient.articles.listMostFollowed({}, [], 4, 0).then(function (res) {
          scope.articles = res.data.articles;
        });
        apiClient.tags.list().then(function (res) {
          scope.tags = res.data.tags;
        });
        loadGA(function(){
          scope.carepath = carepath;
          if (!Auth.isLoggedIn()) {
            if (typeof window.sessionStorage.carepaths !== 'undefined')
              scope.currentUser.carepaths = angular.fromJson(window.sessionStorage.carepaths);
            else
              scope.currentUser.carepaths = [];
            scope.myaddress = { suggestions: [] };
          } else {
            scope.myaddress = { suggestions:[scope.currentUser.geocode] };
          }
          arrangeCarepaths();
          scope.isQuestionnaireEnded = isQuestionnaireEnded();
          if (!scope.isQuestionnaireEnded) {
            initializeQuestionnaire();
          } else {
            //if (typeof window.sessionStorage.mygeocode === 'undefined') {
              scope.myaddress.originalSuggestions = [];
              scope.myaddress.originalSuggestions = scope.myaddress.originalSuggestions.concat(scope.myaddress.suggestions);
              $uibModal.open({
                templateUrl: 'app/carepath/mycenter-confirmation.html',
                scope: angular.extend($scope, {})
              }).result.then(function () {
                if(scope.myaddress.selected) {
                  var geocode = scope.myaddress.suggestions[scope.myaddress.selected];
                  //window.sessionStorage.mygeocode = angular.toJson(geocode);
                  scope.myCenter=new google.maps.LatLng(geocode.lat,geocode.lng);
                  initializeMap();
                }
              });
            // } else {
            //   var geocode = angular.fromJson(window.sessionStorage.mygeocode);
            //   scope.myCenter=new google.maps.LatLng(geocode.lat,geocode.lng);
            //   initializeMap();
            // }
          }
        });
      }
    }

    function initializeQuestionnaire() {
      scope.formError = false;
      scope.currentStep = 0;
    }

    function isQuestionnaireEnded() {
      var ended = true;
      scope.carepath.steps.forEach(function(item, index, array){
        if(typeof item.question !== 'undefined') {
          if((typeof item.question.answer === 'undefined' || item.question.answer === '') && item.question.text !== '') {
            ended = false;
          }
        }
      });
      return ended;
    }

    function arrangeCarepaths() {
      scope.currentUser.carepaths.forEach(function(item,index,array){
        if(item.carepath === scope.carepath._id){
          scope.carepath.steps.forEach(function(step,ind,arr){
            item.answers.forEach(function(answer,i,a){
              if(answer.step === step._id) {
                if(typeof step.question !== 'undefined') {
                  step.question.answer = answer.text;
                }
              }
            });
          });
          scope.isQuestionnaireEnded = true;
        }
      });
    }

    function initializeMap() {
      scope.currentTab = 'path';
      scope.specialistsOrder = [];
      scope.map=new google.maps.Map(document.getElementById("tisosMap"),{
        center:scope.myCenter,
        zoom:5,
        mapTypeId:google.maps.MapTypeId.ROADMAP
      });
      getSpecialistsBySpecializations(function(){
        populateSpecialists(function(res){
          scope.fullContentLoaded = false;
          scope.mapLoaded = false;
          scope.mapError = false;
          if(res) {
            sortSpecialistsByRanking(function(){
              scope.mapLoaded = true;
              putMarkersOnMap();
              scope.fullContentLoaded = true;
              $scope.$apply();
              google.maps.event.trigger(scope.map, "resize");
              scope.map.setCenter(scope.myCenter);
              fitBoundsToSpecialists();
            });
          }
        });
      });
    }

    scope.filterStepsByYes = function (item) {
      return typeof item.question === 'undefined' || item.question.answer === 'yes';
    }

    scope.filterStepsByQuestion = function(item) {
      return typeof item.question !== 'undefined' && item.question.text !== '';
    }

    function getSpecialistsBySpecializations(callback) {
      async.waterfall([
        function(cb){
          var fs = [];
          scope.carepath.steps.forEach(function(step, index, array){
            fs.push(function(cb){
              apiClient.users.specialists(step.specializations)
              .then(function(res){
                res.data.users.forEach(function(item,index,array){
                  step.specialists.push(item);
                  if(index==array.length-1){
                    cb();
                  }
                });
              }).catch(function(){
                console.log('Errore durante il recupero degli specialisti per lo step: ' + step._id);
                cb();
              });
            });
            if(index==array.length-1){
              cb(null, fs);
            }
          });
        },
        function(fs, cb){;
          async.parallel(fs, cb);
        }
      ], function (err) {
        if (err) {
          console.log(err);
        }
        callback();
      });
    }

    function populateSpecialists(callback) {
      async.waterfall([
        function(cb){
          var fs = [];
          scope.carepath.steps.forEach(function(step, index, array){
            step.specialists.forEach(function(user, index, array){
              fs.push(function(cb){
                var displayName = user.firstname.toString().toUpperCase();
                if (typeof user.title !== 'undefined' && user.title != null) displayName = user.title + " " + displayName;
                if (typeof user.lastname !== 'undefined' && user.lastname != null) displayName = displayName + " " + user.lastname.toString().toUpperCase();
                user.displayName = displayName.trim();
                user.isRanked = false;
                user.isProfilePro = false;
                user.subscriptions.forEach(function(item, index, array){
                  if (item.name === 'ranking' && item.active === true) {
                    user.isRanked = true;
                  }else if(item.name === 'profile-pro' && item.active === true){
                    user.isProfilePro = true;
                  }
                });
                sortGeocodes(user,function(res){
                  user.geocodesSorted = res;
                  array.splice(index, 1, user);
                  cb();
                });
              });
            });
            if(index==array.length-1){
              cb(null, fs);
            }
          });
        },
        function(fs, cb){
          async.parallel(fs, cb);
        }
      ], function (err) {
        if (err) {
          console.log(err);
          callback(false);
        }
        else {
          callback(true);
        }
      });
    }

    function filterSteps () {
      var arrfilterSteps = [];
      scope.carepath.steps.forEach(function(step, index, array){
        if(typeof step.question === 'undefined' || (step.question !== 'undefined' && step.question.answer === 'yes')) {
          arrfilterSteps.push(step);
        }
      });
      return arrfilterSteps;
    }

    function sortSpecialistsByRanking(ret) {
      scope.arrstepfiltrati = filterSteps();
      scope.arrstepfiltrati.forEach(function(step, indice, vettore){
        var sorted = [];
        var unsorted = step.specialists;
        var unsortedpulito = [];
        var ranked = [];

        unsorted.sort(function(a,b) {
          if (a.geocodesSorted!=null && a.geocodesSorted.length>0
           && b.geocodesSorted!=null && b.geocodesSorted.length>0)
            return (a.geocodesSorted[0].distance > b.geocodesSorted[0].distance) ? 1 : ((b.geocodesSorted[0].distance > a.geocodesSorted[0].distance) ? -1 : 0);
          else return 0;
        });
        unsorted.forEach(function(item, index, array) {
          if(item.isRanked){
            if(item.geocodesSorted!=null && item.geocodesSorted.length>0 && item.geocodesSorted[0].distance<=rangeMetersRankati){
              var p = item.geocodesSorted.length - 1;
              while(p >= 0){
                if(item.geocodesSorted[p].distance>rangeMetersRankati){
                  item.geocodesSorted.splice(p,1);
                }
                p--;
              }
              ranked.push({'specialist':item,'index':index});
            }
          } else {
            if(item.geocodesSorted!=null && item.geocodesSorted.length>0 && item.geocodesSorted[0].distance<=rangeMetersOthers){
              var p = item.geocodesSorted.length - 1;
              while(p >= 0){
                if(item.geocodesSorted[p].distance>rangeMetersOthers){
                  item.geocodesSorted.splice(p,1);
                }
                p--;
              }
              unsortedpulito.push(item);
            }
          }
        });

        if (ranked.length>0) {
          var currentRanked = ranked[Math.floor(Math.random()*ranked.length)];
          sorted.push(currentRanked.specialist);
        }

        sorted = sorted.concat(unsortedpulito);
        var arrIndexMorePresence = [];
        var l = sorted.length;
        for(var i=0;i<l;i++){
          var id = sorted[i]._id;
          var counter = 0;
          for(var j=0;j<l;j++){
            if(id == sorted[j]._id)
              counter++;
            if(counter>1)
              arrIndexMorePresence.push(j);
          }
        }
        if(arrIndexMorePresence.length>0){
          for(var k=0;k<arrIndexMorePresence.length;k++){
            sorted.splice(arrIndexMorePresence[k],1);
          }
        }

        var lengthListaSteps = listaSteps.length;
        var lblFirst = labels[countLabels];
        if(sorted[0]) {
          countLabels++;
          for(var i=0;i<lengthListaSteps;i++){
            var lengthSpecialisti = listaSteps[i].specialisti.length;
            for(var k=0;k<lengthSpecialisti;k++){
              if(listaSteps[i].specialisti[k] && listaSteps[i].specialisti[k]._id == sorted[0]._id){
                  lblFirst = listaSteps[i].specialisti[k].geocodesSorted[0].label;
                  countLabels--;
              }
            }
          }
          var lengthCodeAddresses = sorted[0].geocodesSorted.length;
          for(var ir=0;ir<lengthCodeAddresses;ir++){
            sorted[0].geocodesSorted[ir].label = lblFirst;
          }
        }

        var lblSecond = labels[countLabels];
        if(sorted[1]) {
          countLabels++;
          for(var i=0;i<lengthListaSteps;i++){
            var lengthSpecialisti = listaSteps[i].specialisti.length;
            for(var k=0;k<lengthSpecialisti;k++){
              if(listaSteps[i].specialisti[k] && listaSteps[i].specialisti[k]._id == sorted[1]._id){
                  lblSecond = listaSteps[i].specialisti[k].geocodesSorted[0].label;
                  countLabels--;
              }
            }
          }
          var lengthCodeAddresses = sorted[1].geocodesSorted.length;
          for(var ir=0;ir<lengthCodeAddresses;ir++){
            sorted[1].geocodesSorted[ir].label = lblSecond;
          }
        }

        step.specialists = sorted;
        scope.specialistsOrder.push([lblFirst,lblSecond]);
        listaSteps.push({numstep:indice,specialisti:[sorted[0],sorted[1]]});
        function checkIfExistAnotherUser(userid, address){
          for (var k=0;k<markerToAddMap.length;k++) {
            if(markerToAddMap[k].location.lat() == address.lat && markerToAddMap[k].location.lng() == address.lng && markerToAddMap[k].userid == userid){
              return true;
            } else if(markerToAddMap[k].location.lat() == address.lat && markerToAddMap[k].location.lng() == address.lng && markerToAddMap[k].userid != userid){
              var R=6378137;
              var dn = 15;
              var de = 15;
              var dLat = dn/R;
              var dLon = de/(R*Math.cos(Math.PI*address.lat/180));
              address.lat = (Number(address.lat) + dLat * 180/Math.PI).toString();
              address.lng = (Number(address.lng) + dLon * 180/Math.PI).toString();
              return [address.lat,address.lng];
            }
          }
          return false;
        }

        var checkifexist;
        for(var i=0;i<sorted.length;i++){
          checkifexist = false;
          for(var j=0;j<sorted[i].geocodesSorted.length;j++){
            checkifexist = checkIfExistAnotherUser(sorted[i]._id,sorted[i].geocodesSorted[j]);
            while(Array.isArray(checkifexist)){
              var latlng = new google.maps.LatLng(checkifexist[0], checkifexist[1]);
              checkifexist = checkIfExistAnotherUser(sorted[i]._id,latlng);
              if(typeof checkifexist == "boolean"){
                if(!checkifexist){
                  sorted[i].geocodesSorted[j].location = latlng;
                }
              }
            }
            if(!checkifexist){
              if(sorted[i].geocodesSorted[j].label != null) {
                markerToAddMap.push({
                  agreement: sorted[i].agreement,
                  userid: sorted[i]._id,
                  titolo: (typeof sorted[i].title !== 'undefined') ? sorted[i].title : '',
                  firstname: sorted[i].firstname,
                  lastname: (typeof sorted[i].lastname !== 'undefined') ? sorted[i].lastname : '',
                  bio: (typeof sorted[i].bio !== 'undefined') ? sorted[i].bio : '',
                  picture: sorted[i].picture || placeholderPicUQ,
                  address:sorted[i].geocodesSorted[j].formattedAddress,
                  location:new google.maps.LatLng(sorted[i].geocodesSorted[j].lat,sorted[i].geocodesSorted[j].lng),
                  rankato: sorted[i].isRanked,
                  labelpin: sorted[i].geocodesSorted[j].label,
                });
              }
            }
          }
        }
      });
      ret();
    }

    scope.previous = function(index) {
      scope.currentStep = index-1;
    };

    scope.next = function(index) {
      scope.currentStep = index+1;
    };

    scope.confirm = function() {
      if(isQuestionnaireEnded()){
        var userCarepath = {
          carepath: scope.carepath._id,
          answers: []
        };
        scope.carepath.steps.forEach(function(item,index,array){
          if(typeof item.question !== 'undefined') {
            userCarepath.answers.push({
              step: item._id,
              text: item.question.answer
            });
          }
        });
        scope.currentUser.carepaths.push(userCarepath);
        if(Auth.isLoggedIn()) {
          apiClient.users.updateMe({
            _id: scope.currentUser._id,
            carepaths: scope.currentUser.carepaths
          }).then(function(res){
              Auth.reloadUser().then(function () {
                $state.reload();
              });
            })
            .catch(function(err){
              console.log(err);
              scope.formError = true;
            });
        } else {
          window.sessionStorage.carepaths = angular.toJson(scope.currentUser.carepaths);
          $state.reload();
        }
      } else {
        scope.formError = true;
      }
    };

    scope.resetQuestionnaire = function() {
      scope.currentUser.carepaths.forEach(function(item,index,array){
        if (item.carepath == scope.carepath._id) {
          array.splice(index,1);
        }
      });
      if(Auth.isLoggedIn()) {
        apiClient.users.updateMe({
          _id: scope.currentUser._id,
          carepaths: scope.currentUser.carepaths
        }).then(function(res){
            Auth.reloadUser().then(function () {
              $state.reload();
            });
          });
      } else {
        window.sessionStorage.carepaths = angular.toJson(scope.currentUser.carepaths);
        $state.reload();
      }
    };

    function hasNumber(myString) {
      return (/\d/.test(myString));
    }

    scope.searchAddress = function(address) {
      if(address === '' || hasNumber(address)) {
        scope.searchAddressError = false;
        scope.myaddress.suggestions = [];
        scope.myaddress.suggestions = scope.myaddress.suggestions.concat(scope.myaddress.originalSuggestions);
        geocodeAddresses([address], function(res){
          if(res[0].success)
            scope.myaddress.suggestions.push(res[0].info);
          else
            scope.myaddress.suggestions = scope.myaddress.suggestions.concat(res[0].suggestions);
          $scope.$apply();
        });
      } else {
        scope.searchAddressError = true;
      }
    };

    scope.emptySearchAddress = function(address) {
      if(address === '') {
        scope.searchAddress(address);
      }
    };

    function putMarkersOnMap(){
      var lm = markerToAddMap.length;
      var latitude,
          longitude,
          infowindow,
          marker,
          cont;
      var zIndex = 1;
      for(var i=0;i<lm;i++) markerToAddMap[i].zindexDefault = zIndex++;
      for(var i=0;i<lm;i++){
          latitude = markerToAddMap[i].location.lat();
          longitude = markerToAddMap[i].location.lng();
          infowindow = new google.maps.InfoWindow();
          if(markerToAddMap[i].rankato){
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(latitude, longitude),
              map: scope.map,
              icon: {
                url:'../../assets/images/carepaths/pin_giallo.png',
                scaledSize: new google.maps.Size(39, 38)
              },
              zIndex: markerToAddMap[i].zindexDefault,
              label: markerToAddMap[i].labelpin,
              labelStyle:{zIndex:markerToAddMap[i].zindexDefault},
              draggable: false,
              optimized: false,
            });
          }else{
            marker = new google.maps.Marker({
              position: new google.maps.LatLng(latitude, longitude),
              map: scope.map,
              icon: {
                url:'../../assets/images/carepaths/pin_azzurro.png',
                scaledSize: new google.maps.Size(39, 38)
              },
              zIndex: markerToAddMap[i].zindexDefault,
              label: markerToAddMap[i].labelpin,
              labelStyle:{zIndex:markerToAddMap[i].zindexDefault},
              optimized: false,
              draggable: false,
            });
          }

          markerList.push( {markerObj:marker, userId:markerToAddMap[i].userid} );

          google.maps.event.addListener(marker, 'click', (function(marker, cont, obj) {
            return function() {
              obj.specialistName = obj.titolo + " " + obj.firstname + " " + obj.lastname;
              if(obj.bio.length>142)
                obj.bio = obj.bio.substring(0,142) + "...";
              if(obj.rankato){
                infowindow.setContent(
                  '<div class="container-info">'+
                    '<a href="/professionista/'+obj.userid+'" target="_blank"><div class="content-title">'+
                        '<img src="'+obj.picture+'" class="img-box" width="auto" height="57"/>'+
                        '<div class="text-box yellow-font">'+obj.specialistName+'</div>'+
                    '</div></a>'+
                    '<div class="content">'+
                      '<div class="bio">'+obj.bio+'</div>'+
                      '<div class="address shift-frombottom">'+obj.address+'</div>'+
                      '<div class="sponsored yellow-font">Contenuto sponsorizzato</div>'+
                    '</div>'+
                  '</div>');
              }else{
                var contentUQEM = "";
                if(obj.agreement == true)
                  contentUQEM = '<div class="sponsored"><i class="fa fa-certificate" style="color: #FFB319"></i>&nbsp;Ente Mutuo</div>';
                infowindow.setContent(
                  '<div class="container-info">'+
                    '<a href="/professionista/'+obj.userid+'" target="_blank"><div class="content-title">'+
                        '<img src="'+obj.picture+'" class="img-box" width="auto" height="57"/>'+
                        '<div class="text-box blue-font">'+obj.specialistName+'</div>'+
                    '</div></a>'+
                    '<div class="content">'+
                      '<div class="bio">'+obj.bio+'</div>'+
                      '<div class="address">'+obj.address+'</div>'+
                      contentUQEM +
                    '</div>'+
                  '</div>');
              }
              infowindow.open(scope.map, marker);
            }
          })(marker, cont, markerToAddMap[i]));

      }
      fitBoundsToSpecialists();
    }

    function fitBoundsToSpecialists() {
      /* Riadatto lo zoom della mappa per ogni marker aggiunto */
      var bounds = new google.maps.LatLngBounds();
      var leng = markerList.length;
      if(leng > 0){
        /* Considero anche la mia posizione per lo zoom */
        bounds.extend(scope.myCenter);
        for (var j=0; j<leng; j++) {
          bounds.extend(markerList[j].markerObj.getPosition());
        }
        scope.map.fitBounds(bounds);
      }
    }

    scope.onClickMarker = function(userid){
      var lm = markerList.length;
      for(var i=0;i<lm;i++){
        if(userid == markerList[i].userId){
          google.maps.event.trigger(markerList[i].markerObj, 'click');
        }
      }
    }

    function sortGeocodes(user, res) {
      var geocodes = [];
      geocodes.push(user.geocode);
      if (user.secondaryGeocode) geocodes.push(user.secondaryGeocode);
      if (user.operationalAddresses && user.operationalAddresses>0 && user.operationalAddresses[0].geocode) geocodes.push(user.operationalAddresses[0].geocode);
      if (user.operationalAddresses && user.operationalAddresses>1 && user.operationalAddresses[1].geocode) geocodes.push(user.operationalAddresses[1].geocode);
      async.waterfall([
        function(cb){
          var fs = [];
          geocodes.forEach(function(geocode,index,array){
            if(typeof geocode !== 'undefined' && geocode != null) {
              fs.push(function(cb){
                if (typeof user.geocode !== 'undefined') {
                  geocode.distance = getDistanceFromLatLonInKm(scope.myCenter.lat(),scope.myCenter.lng(),geocode.lat,geocode.lng);
                  geocode.label = null;
                  cb();
                  // scope.GAService.getDistanceMatrix({
                  //     origins: [scope.myCenter],
                  //     destinations: [new google.maps.LatLng(geocode.lat,geocode.lng)],
                  //     travelMode: google.maps.TravelMode.DRIVING
                  //   },
                  //   function callback(response, status) {
                  //     if (status == google.maps.DistanceMatrixStatus.OK) {
                  //       geocode.distance = response.rows[0].elements[0].distance.value;
                  //       geocode.label = null;
                  //       cb();
                  //     }else{
                  //       array.splice(index, 1, undefined);
                  //       cb();
                  //     }
                  // });
                }
              });
            }
            if(index==array.length-1){
              cb(null, fs);
            }
          });
        },
        function(fs, cb){
          async.parallel(fs, cb);
        }
      ], function (err) {
        if (err) {
          console.log('There was an error with Google Apis geocoding');
          res([]);
        } else {
          var l = geocodes.length - 1;
          while(l >= 0) {
            if(!geocodes[l]) geocodes.splice(l, 1);
            l--;
          }
          geocodes.sort(function(a,b) {return (a.distance > b.distance) ? 1 : ((b.distance > a.distance) ? -1 : 0);} );
          res(geocodes);
        }
      });
    }

    function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
      var R = 6371; // Radius of the earth in km
      var dLat = deg2rad(lat2-lat1);  // deg2rad below
      var dLon = deg2rad(lon2-lon1);
      var a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      var d = R * c; // Distance in km
      return d;
    }

    function deg2rad(deg) {
      return deg * (Math.PI/180)
    }

    //https://developers.google.com/maps/documentation/geocoding/intro
    function geocodeAddresses(addresses, success, error) {
      var geosuggestions = [];
      var geocode = new google.maps.Geocoder();
      async.waterfall([
        function(cb){
          var fs = [];
          addresses.forEach(function(address,addressIndex){
            fs.push(function(cb){
              geocode.geocode( {address:address}, function(results, status){
                if (status == google.maps.GeocoderStatus.OK){
                  var validResults = [];
                  results.forEach(function(currentResult){
                    currentResult.types.forEach(function(type){
                      if (type === 'street_address' || type === 'route')
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
          error(err);
        } else {
          success(geosuggestions);
        }
      });
    }

    function loadGA(cb) {
      angularLoad.loadScript('https://maps.googleapis.com/maps/api/js?key=AIzaSyAgx0LM8sb83VfUbepcbU8_iCfUaD6f8vQ').then(function() {
        scope.GAService = new google.maps.DistanceMatrixService();
        cb();
      }).catch(function(err) {});
    }
    initialize();

  });

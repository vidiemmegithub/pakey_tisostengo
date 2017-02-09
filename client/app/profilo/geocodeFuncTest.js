//README FIRST
//
//Load GoogleMap Web API: https://developers.google.com/maps/documentation/geocoding/start
//Load Async: https://github.com/caolan/async
//
//CALL: geocode(["indirizzo 1","indirizzo 2"]);
//
//https://developers.google.com/maps/documentation/geocoding/intro

var geocode = function geocodeAddresses(addresses) {
  var geosuggestions = [];
  var geocode = new google.maps.Geocoder();
  console.log(addresses);
  async.waterfall([
    function(cb){
      var fs = [];
      addresses.forEach(function(address,addressIndex){
        fs.push(function(cb){
          geocode.geocode( {address:address}, function(results, status){
            if (status == google.maps.GeocoderStatus.OK){
              console.log(results);
              var validResults = [];
              results.forEach(function(currentResult){
                currentResult.types.forEach(function(type){
                  if (type === 'street_address')
                    validResults.push(currentResult);
                });
              });
              console.log(validResults);
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
    } else {
      console.log(geosuggestions);
    }
  });
}

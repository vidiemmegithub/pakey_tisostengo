'use strict';

angular.module('tisostengoApp')
  .controller('AdminUtentiImportCtrl', function ($scope, toastr, apiClient, Upload) {

    $scope.xlsfilename = "Seleziona un documento";
    $scope.imagefilename = "Seleziona un'immagine";
    $scope.setXLSFile = function(element) {
      if(typeof element != 'undefined') {
        $scope.$apply(function($scope) {
          var xlsfile = element.files[0];
          if(typeof xlsfile.name !== 'undefined') {
            $scope.xlsfilename = xlsfile.name;
            angular.element("input[type='file']").val(null);
            xlsToJSON(xlsfile,function(jsonfile){
              $scope.xlsfilename = "Seleziona un documento";
              if(!JSON.stringify(jsonfile)) {
                toastr.error('Il formato del documento non è valido');
              } else {
                apiClient.users.import(jsonfile)
                  .then(function(resp){
                    toastr.success("Documento in elaborazione, verrai notificato via email una volta che la procedura sarà conclusa");
                  },function(error){
                    toastr.error('Si è verificato un problema durante l\'elaborazione della richiesta');
                  });
              }
            });
          }
        });
      }
    };

    $scope.setImageFile = function(element) {
      if(typeof element != 'undefined') {
        $scope.$apply(function($scope) {
          var imagefile = element.files[0];
          if(typeof imagefile.name !== 'undefined') {
            $scope.imagefilename = imagefile.name;
            angular.element("input[type='file']").val(null);
            $scope.imagefilename = "Seleziona un'immagine";
            Upload.base64DataUrl(imagefile)
              .then(function(url){
                var picture = { name: imagefile.name.split(".")[0].replace(/[`~@#$%^&*|=?;:'",.<>\{\}\[\]\\\/ ]/gi, ''), picture: url };
                apiClient.pictures.create(picture)
                  .then(function(resp){
                    toastr.success("Immagine caricata con successo");
                  },function(error){
                    toastr.error('Si è verificato un problema durante l\'upload dell\'immagine');
                  });
              }).catch(function(){
                toastr.error('Si è verificato un problema durante l\'upload dell\'immagine');
              });
          }
        });
      }
    };

    function xlsToJSON(xlsfile,cb) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var data = e.target.result;
        var arr = String.fromCharCode.apply(null, new Uint8Array(data));
        var wb = XLSX.read(btoa(arr), {type: 'base64'});
        var jsonfile = {};
        wb.SheetNames.forEach(function(sheetName) {
          var roa = XLSX.utils.sheet_to_row_object_array(wb.Sheets[sheetName]);
          if(roa.length > 0)jsonfile[sheetName] = roa;
        });
        cb(jsonfile);
      };
      reader.readAsArrayBuffer(xlsfile);
    }

    $scope.moveUsersImages = function(){
      apiClient.pictures.move().then(function(resp){
        console.log(resp);
      },function(fail){
        console.log(fail);
      });
    }
  });

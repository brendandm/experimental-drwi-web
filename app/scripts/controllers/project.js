(function () {

  'use strict';
  angular.module('app')

  .controller('ProjectCtrl', function($scope, $http, $log, $materialSidenav){
    $scope.templateUrl = '/partials/project.html';
    $scope.image = 'assets/wetlands.jpg';
    $scope.goBack = true;

    $scope.page = {
      name: "BMP Monitoring and Assessment Collection"
    };

    $scope.back = function(){
      window.history.back();
    };

    $scope.edit = function(){
      $scope.showKeys = true;
    };

    $scope.toggleMenu = function() {
        $materialSidenav('left').toggle();
        $log.log("$materialSidenav('left').toggle()");
    };

       var getListData = function(){
      $http.get('/data/project.json')
        .success(function(data){
          $scope.project = data.response.features[0];
        })
        .error(function(e){
          $log.log('error: ', e);
        });
    };

    getListData();
  });
}());
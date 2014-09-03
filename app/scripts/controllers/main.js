(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('MainCtrl', function($scope, $http, $location, $log, $materialSidenav){
    $scope.templateUrl = '/partials/front.html';
    $scope.gravatar = 'http://www.gravatar.com/avatar/11800567938b3ec912c283bbc9c23938?s=80';

    $scope.page = {
      name: "Monitoring and Assessment"
    };

    $scope.getProject = function(){
      $location.url('/project');
    };

    var getListData = function(){
      $http.get('/data/project.json')
        .success(function(data){
          $scope.projects = data.response.features;
        })
        .error(function(e){
          $log.log('error: ', e);
        });
    };

    $scope.toggleMenu = function() {
        $materialSidenav('left').toggle();
        $log.log("$materialSidenav('left').toggle()");
    };

    getListData();
  });
}());
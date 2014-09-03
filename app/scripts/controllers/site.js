(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('SiteCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/site.html';

    $scope.page = {
      name: "Sites"
    };

  });
}());
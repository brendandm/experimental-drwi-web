(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('LoginCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/login.html';

    $scope.page = {
      name: "Login"
    };

  });
}());
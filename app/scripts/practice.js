(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('PracticeCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/practice.html';

    $scope.page = {
      name: "Practices"
    };

  });
}());
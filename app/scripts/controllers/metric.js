(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('MetricCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/metric.html';

    $scope.page = {
      name: "Metrics"
    };

  });
}());
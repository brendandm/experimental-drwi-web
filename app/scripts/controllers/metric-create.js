(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('MetricCreateCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/metric-create.html';
    $scope.goBack = true;

    $scope.page = {
      name: "Metrics"
    };

    $scope.getMetric = function(practice_id) {
      $location.url('/projects/' + $routeParams.projectId + '/sites/' + $routeParams.siteId + '/practices/' + $routeParams.practiceId);
    };

    $scope.back = function(){
      window.history.back();
    };

    $scope.edit = function(){
      $scope.showFields = true;
    };

  });
}());
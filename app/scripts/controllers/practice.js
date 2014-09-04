(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('PracticeCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/practice.html';
    $scope.goBack = true;

    $scope.page = {
      name: "Practices"
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
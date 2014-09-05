(function () {

  'use strict';

  angular.module('app')

  .controller('PracticeCtrl', function($scope, $http, $location, $log, $routeParams){

    $scope.templateUrl = '/partials/practice.html';
    $scope.goBack = true;
    $scope.showEdit = false;

    $scope.page = {
      name: "Practices"
    };

    $scope.bmp = {
      site: 'Habitat Restoration, Harrisonburg',
      type: 'In-stream Habitat',
      description: 'CBSF - Fish passage improvements - # passage barriers rectified, Enter the number of fish passage barriers rectified',
      installation: 'No photos',
      mature: 'No photos'
    };

    $scope.getMetric = function(metricId) {
      $location.url('/projects/' + $routeParams.projectId + '/sites/' + $routeParams.siteId + '/practices/' + $routeParams.practiceId + '/metrics/' + metricId);
    };

    $scope.back = function(){
      window.history.back();
    };

    $scope.edit = function(){
      $scope.showEdit = true;
    };

    $scope.save = function(){
      $scope.showEdit = false;
    };

  });
}());
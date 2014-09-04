(function () {

  'use strict';

  angular.module('app')

  .controller('MetricCtrl', function($scope, $http, $location, $log){

    $scope.templateUrl = '/partials/metric.html';
    $scope.goBack = true;
    $scope.showEdit = false;

    $scope.page = {
      name: "Metrics"
    };

    $scope.metric = {
      name: 'Habitat',
      period: '',
      date: '',
      stability: '',
      protection: '',
      alteration: '',
      flow: '',
      embed: '',
      epifaunal: '',
      width: '',
      sediment: '',
      combinations: '',
      macro: '',
      shelter: '',
      instream: '',
      floodplain: '',
      score: '',
      notes: ''
    };

    $scope.getMetric = function(practice_id) {
      $location.url('/projects/' + $routeParams.projectId + '/sites/' + $routeParams.siteId + '/practices/' + $routeParams.practiceId);
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
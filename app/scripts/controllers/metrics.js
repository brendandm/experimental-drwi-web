'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:MetricsCtrl
 * @description
 * # MetricsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('MetricsCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/views/metrics.html',
      title: 'Metrics',
      back: '/'
    };

  }]);

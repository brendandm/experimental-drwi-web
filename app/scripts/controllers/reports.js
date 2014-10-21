'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ReportsCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/views/reports.html',
      title: 'Reports',
      back: '/'
    };

  }]);

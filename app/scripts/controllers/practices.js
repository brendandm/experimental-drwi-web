'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticesCtrl
 * @description
 * # PracticesCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticesCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/views/practices.html',
      title: 'Practices',
      back: '/'
    };

  }]);

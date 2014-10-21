'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SitesCtrl
 * @description
 * # SitesCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SitesCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/views/sites.html',
      title: 'Sites',
      back: '/'
    };

  }]);

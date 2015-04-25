'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SecurityController
 * @description
 * # SecurityController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SecurityAuthorize', ['$location', 'token', function($location, token) {

    //
    // If we have an Access Token, forward the user to the Projects page
    //
    if (token.get()) {
      $location.path('/projects');
    } else {      
      token.save();
    }

  }]);

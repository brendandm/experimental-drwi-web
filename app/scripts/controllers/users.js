'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('UsersCtrl', ['$rootScope', '$scope', function ($rootScope, $scope) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/views/users.html',
      title: 'Users',
      back: '/'
    };

  }]);

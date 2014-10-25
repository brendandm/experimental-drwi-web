'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectcreateCtrl
 * @description
 * # ProjectcreateCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectCreateCtrl', ['$scope', '$route', function ($scope, $route) {


    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/project-create.html',
      title: 'Create a Project',
      back: '/',
      links: [     
      ],
      refresh: function() {
        $route.reload();
      }
    };


  }]);

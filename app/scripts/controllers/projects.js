'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', 'projects', function ($rootScope, $scope, $route, projects) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/projects.html',
      title: 'Projects',
      back: '/',
      refresh: function() {
        $route.reload();
      }
    };

    $scope.projects = projects;

    console.log('$scope.projects', $scope.projects);

  }]);

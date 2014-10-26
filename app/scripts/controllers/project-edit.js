'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjecteditCtrl
 * @description
 * # ProjecteditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectEditCtrl', ['$scope', '$route', 'project', function ($scope, $route, project) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.project_raw = JSON.stringify(project, null, ' ');

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/project-edit.html',
      title: $scope.project.project_title,
      display_title: false,
      editable: true,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
          type: 'active'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.project.save = function() {
      console.log('Project Editied', $scope.project);
    };

  }]);

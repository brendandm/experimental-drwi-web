'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectUsersCtrl
 * @description
 * # ProjectUsersCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectUsersCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/project-edit.html',
      title: $scope.project.project_title + ' > Users',
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
          url: '/projects/' + $scope.project.id
        },
        {
          text: 'Users',
          url: '/projects/' + $scope.project.id + '/users',
          type: 'active'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

  }]);

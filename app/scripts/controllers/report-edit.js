'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportEditCtrl
 * @description
 * # ReportEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ReportEditCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Feature', 'template', 'fields', 'project', 'site', 'practices', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Site, Template, Feature, template, fields, project, site, practices, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = {};
    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/report-edit.html',
      title: $scope.site.site_number,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: 'Sites',
          url: '/projects/' + $scope.project.id + '#sites',
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
          type: 'active'
        }
      ],
      actions: [],
      refresh: function() {
        $route.reload();
      }
    };

  }]);

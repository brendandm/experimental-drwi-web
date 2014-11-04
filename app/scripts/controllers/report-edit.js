'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportEditCtrl
 * @description
 * # ReportEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ReportEditCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Feature, template, fields, project, site, practice, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = practice;
    
    $scope.storage = {
      'Forest Buffers': {
        Planning: 'type_437194b965ea4c94b99aebe22399621f',
        Installation: 'type_437194b965ea4c94b99aebe22399621f',
        Monitoring: 'type_ed657deb908b483a9e96d3a05e420c50'
      }
    };

    Feature.GetFeature({
      storage: $scope.storage[$scope.practice.practice_type][$route.current.params.reportType],
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;

      //
      // Add the reading information to the breadcrumbs
      //
      $rootScope.page.links.push({
        text: $scope.report.measurement_period + ' Report from ' + moment($scope.report.report_date).format('MMM d, YYYY'),
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + $scope.report.id
      });

    });

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
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: 'Practices',
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices'
        },
        {
          text: $scope.practice.practice_type,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id
        }    
      ],
      actions: [],
      refresh: function() {
        $route.reload();
      }
    };

  }]);

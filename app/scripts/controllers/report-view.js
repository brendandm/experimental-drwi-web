'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportViewCtrl
 * @description
 * # ReportViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ReportViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Feature', 'Storage', 'template', 'fields', 'project', 'site', 'practice', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Feature, Storage, template, fields, project, site, practice, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = practice;

    Feature.GetFeature({
      storage: Storage[$scope.practice.practice_type][$route.current.params.reportType].storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;
      $scope.report.type = $route.current.params.reportType;

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = $scope.report.measurement_period + ' Report from ' + moment($scope.report.report_date).format('MMM d, YYYY');

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + $scope.report.id + '/' + $route.current.params.reportType,
        type: 'active'
      });

      $rootScope.page.title = page_title;
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
      template: 'views/report-view.html',
      title: null,
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
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
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

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }
    
  }]);

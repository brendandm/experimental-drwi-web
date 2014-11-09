'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportEditCtrl
 * @description
 * # ReportEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ReportEditCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Template, Field, Feature, Storage, template, project, site, practice, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};

    $scope.project = project;
    $scope.practice = practice;
    $scope.report_storage = Storage[$scope.practice.practice_type].storage;
    $scope.report_templateId = Storage[$scope.practice.practice_type].templateId;
    $scope.report_fields = Storage[$scope.practice.practice_type].fields[$route.current.params.reportType];

    Field.GetPreparedFields($scope.report_templateId).then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.report_storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;
      $scope.report.type = $route.current.params.reportType;

      $scope.report.save = function() {
        Feature.UpdateFeature({
          storage: $scope.report_storage,
          featureId: $scope.report.id,
          data: $scope.report
        }).then(function(response) {
          //
          // Refresh the page so that those things update appropriately.
          //
          $rootScope.page.refresh();

        }).then(function(error) {
          // Do something with the error
        });
      };

      $scope.report.delete = function() {

        //
        // Before we can remove the Practice we need to remove the relationship it has with the Site
        //
        //
        angular.forEach($scope.practice[$scope.report_storage], function(feature, $index) {
          if (feature.id === $scope.report.id) {
            $scope.practice[$scope.report_storage].splice($index, 1);
          }
        });

        Feature.UpdateFeature({
          storage: variables.practice.storage,
          featureId: $scope.practice.id,
          data: $scope.practice
        }).then(function(response) {
          
          //
          // Now that the Project <> Site relationship has been removed, we can remove the Site
          //
          Feature.DeleteFeature({
            storage: $scope.report_storage,
            featureId: $scope.report.id
          }).then(function(response) {
			$scope.practice_type = Feature.MachineReadable($scope.practice.practice_type);
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice_type);
          });

        });

      };

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report from ' + moment($scope.report.report_date).format('MMM d, YYYY');

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + $scope.report.id + '/' + $route.current.params.reportType
      });
      $rootScope.page.links.push({
        text: 'Edit',
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + $scope.report.id + '/' + $route.current.params.reportType + '/edit',
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
      template: 'views/report-edit.html',
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
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.report.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.report.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.in = function(search_value, list) {

      if (!list.length) {
        return true;
      }
        
      var $index;

      for ($index = 0; $index < list.length; $index++) {
        if (list[$index] === search_value) {
          return true;
        }
      }

      return false;
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
        storage: $scope.report_storage,
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
            storage: $scope.report_storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:BioretentionFormController
 * @description
 * # BioretentionFormController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('BioretentionFormController', ['$rootScope', '$scope', '$route', '$location', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, user, Template, Field, Feature, Storage, template, project, site, practice, commonscloud) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};
    
    $scope.save = function() {
      Feature.UpdateFeature({
        storage: $scope.storage.storage,
        featureId: $scope.report.id,
        data: $scope.report
      }).then(function(response) {
        $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
      }).then(function(error) {
        // Do something with the error
      });
    };

    $scope.delete = function() {

      //
      // Before we can remove the Practice we need to remove the relationship it has with the Site
      //
      //
      angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
        if (feature.id === $scope.report.id) {
          $scope.practice[$scope.storage.storage].splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: commonscloud.collections.practice.storage,
        featureId: $scope.practice.id,
        data: $scope.practice
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: $scope.storage.storage,
          featureId: $scope.report.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
        });

      });

    };

    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.practice_type = 'bioretention';

    $scope.storage = Storage[$scope.practice.practice_type];

    Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.storage.storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;

      $scope.report.template = $scope.storage.templates.form;

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report';

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + $scope.report.id + '/edit'
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
      template: '/modules/components/practices/views/practices--form.html',
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
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.save();
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

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: $scope.storage.storage,
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
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

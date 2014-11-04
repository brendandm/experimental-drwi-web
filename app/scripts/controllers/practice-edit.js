'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticeEditCtrl
 * @description
 * # PracticeEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticeEditCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Feature, template, fields, project, site, practice, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = practice;

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/practice-edit.html',
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
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.practice_type,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id
        },    
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/edit'
        }   
      ],
      actions: [
        {
          type: 'button-link new',
          action: function($index) {
            $scope.practice.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Practice'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.practice.save();
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


    $scope.practice.save = function() {
      Feature.UpdateFeature({
        storage: variables.practice.storage,
        featureId: $scope.practice.id,
        data: $scope.practice
      }).then(function(response) {
        //
        // Refresh the page so that those things update appropriately.
        //
        $rootScope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };

    $scope.practice.delete = function() {

      //
      // Before we can remove the Practice we need to remove the relationship it has with the Site
      //
      //
      // Drop the siteId from the list of 
      //
      angular.forEach($scope.site.type_77f5c44516674e8da2532939619759dd, function(feature, $index) {
        if (feature.id === $scope.practice.id) {
          $scope.site.type_77f5c44516674e8da2532939619759dd.splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: variables.site.storage,
        featureId: $scope.site.id,
        data: $scope.site
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: variables.practice.storage,
          featureId: $scope.practice.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id);
        });

      });

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
        storage: variables.project.storage,
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
            storage: variables.project.storage,
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

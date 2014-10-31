'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteViewCtrl', ['$rootScope', '$scope', '$route', 'user', 'template', 'fields', 'project', 'site', 'variables', function ($rootScope, $scope, $route, user, template, fields, project, site, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.site = site;

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/site-view.html',
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
      actions: [
        {
          type: 'button-link new',
          action: function() {
        //     $scope.sites.practice.create();
          },
          text: 'Create practice'
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

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectViewCtrl', ['$rootScope', '$scope', '$route', '$location', 'Template', 'Feature', 'project', 'storage', 'user', 'template', 'site', function ($rootScope, $scope, $route, $location, Template, Feature, project, storage, user, template, site) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.project.sites = {
      list: [],
      create: function() {
        console.log('Create site');
        Feature.CreateFeature({
          storage: site.storage,
          data: {
            site_number: 'Untitled Site',
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(site) {

          console.log('New Site', site);

          //
          // Forward the user along to the new project
          //
          $location.path('/projects/' + $scope.project.id + '/sites/' + site.id);
        });
      }
    }
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/project-view.html',
      title: $scope.project.project_title,
      display_title: false,
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
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.project.sites.create();
          },
          text: 'Create site'
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
            featureId: $scope.project.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $scope.project.id);
            }
          });
        }

      });
    }
    
  }]);




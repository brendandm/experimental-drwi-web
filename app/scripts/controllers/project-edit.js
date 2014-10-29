'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjecteditCtrl
 * @description
 * # ProjecteditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectEditCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user) {

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
          url: '/projects/' + $scope.project.id
        },
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/edit',
          type: 'active'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.project.save = function() {
      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {
        //
        // Refresh the page so that those things update appropriately.
        //
        $rootScope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };


    $scope.permissions = {};

    $scope.permissions.featureUser = function() {
      
      var promise = Feature.user({
        storage: storage,
        featureId: $scope.project.id,
        userId: $scope.user.id
      }).$promise.then(function(response) {
        return response.response;
      });

      return promise;
    };

    $scope.permissions.featureUsers = function() {
      
      var promise = Feature.users({
        storage: storage,
        featureId: $scope.project.id
      }).$promise.then(function(response) {
        return response.response;
      });

      return promise;
    };

    $scope.permissions.template = function() {
      
      var promise = Template.user({
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).$promise.then(function(response) {
        return response.response;
      });

      return promise;
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      $scope.permissions.template().then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          $scope.permissions.featureUser().then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              console.log('You don\'t have permission to edit this Feature');
              $location.path('/projects/' + $scope.project.id);
            }
          });
        }

      });
    }

  }]);

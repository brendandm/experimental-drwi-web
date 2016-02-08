'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldStack')
  .controller('ProjectEditCtrl', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user) {

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
      template: '/modules/components/projects/views/projects--edit.html',
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
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.project.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Project'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.project.save();
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

    $scope.project.save = function() {
      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {

        //
        // Refresh the page so that those things update appropriately.
        //
        $location.path('/projects/');

      }).then(function(error) {
        // Do something with the error
      });
    };


    $scope.project.delete = function() {
      Feature.DeleteFeature({
        storage: storage,
        featureId: $scope.project.id
      }).then(function(response) {
        $location.path('/projects');
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

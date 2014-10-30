'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectUsersCtrl
 * @description
 * # ProjectUsersCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectUsersCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', 'users', 'projectUsers', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user, users, projectUsers) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.project.users = projectUsers;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};
    $scope.users = users;

    $scope.search = {
      text: null
    };

    //
    //
    //
    $scope.modals = {
      open: function($index) {
        console.log('open modal', $scope.modals.windows[$index]);
        $scope.modals.windows[$index].visible = true;
      },
      close: function($index) {
        $scope.modals.windows[$index].visible = false;
      },
      windows: {
        inviteUser: {
          title: 'Invite a User',
          body: '',
          visible: true
        }
      }
    };

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/project-users.html',
      title: $scope.project.project_title + ' Users',
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
          text: 'Users',
          url: '/projects/' + $scope.project.id + '/users',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          // url: '/projects/' + $scope.project.id + '/users/invite',
          modal: function() {
            console.log('modal');
            $scope.modals.open('inviteUser');
          },
          text: 'Invite User'
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

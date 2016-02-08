'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:ProjectUsersCtrl
 * @description
 * # ProjectUsersCtrl
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('ProjectUsersCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', 'users', 'projectUsers', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user, users, projectUsers) {

    //
    // Setup necessary Template and Field lists
    //
    $scope.template = template;
    $scope.fields = fields;


    //
    // Setup the Project
    //
    $scope.project = project;
    $scope.project.users = projectUsers;
    $scope.project.users_edit = false;


    //
    // Modal Windows
    //
    $scope.modals = {
      open: function($index) {
        $scope.modals.windows[$index].visible = true;
      },
      close: function($index) {
        $scope.modals.windows[$index].visible = false;
      },
      windows: {
        inviteUser: {
          title: 'Add a collaborator',
          body: '',
          visible: false
        }
      }
    };


    //
    // Setup User information
    //
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.users = {
      list: users,
      search: null,
      invite: function(user) {
        $scope.invite.push(user); // Add selected User object to invitation list
        this.search = null; // Clear search text
      },
      add: function() {
        angular.forEach($scope.invite, function(user_, $index) {
          Feature.AddUser({
            storage: storage,
            featureId: $scope.project.id,
            userId: user_.id,
            data: {
              read: true,
              write: true,
              is_admin: false
            }
          }).then(function(response) {
            //
            // Once the users have been added to the project, close the modal
            // and refresh the page
            //
            $scope.modals.close('inviteUser');
            $scope.page.refresh();
          });
        });
      },
      remove: function(user) {
        var index = $scope.project.users.indexOf(user);
        
        Feature.RemoveUser({
            storage: storage,
            featureId: $scope.project.id,
            userId: user.id
          }).then(function(response) {
            //
            // Once the users have been added to the project, close the modal
            // and refresh the page
            //
            $scope.project.users.splice(index, 1);
          });
      },
      remove_confirm: false
    };


    $scope.invite = [];


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--users.html',
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
          text: 'Collaborators',
          url: '/projects/' + $scope.project.id + '/users',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          // url: '/projects/' + $scope.project.id + '/users/invite',
          action: function($index) {
            $scope.project.users_edit = ! $scope.project.users_edit;
            $scope.page.actions[$index].visible = ! $scope.page.actions[$index].visible;
          },
          visible: false,
          text: 'Edit collaborators',
          alt: 'Done Editing'
        },
        {
          type: 'button-link new',
          // url: '/projects/' + $scope.project.id + '/users/invite',
          action: function() {
            console.log('modal');
            $scope.modals.open('inviteUser');
          },
          text: 'Add a collaborator'
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

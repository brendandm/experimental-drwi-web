(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldStack.controller:ProjectUsersCtrl
   * @description
   * # ProjectUsersCtrl
   * Controller of the FieldStack
   */
  angular.module('FieldStack')
    .controller('ProjectUsersCtrl', function (Account, $rootScope, $scope, $route, $location, project, user, members) {

      var self = this;
      $rootScope.page = {};

      //
      // Assign project to a scoped variable
      //
      project.$promise.then(function(successResponse) {
          self.project = successResponse;

          $rootScope.page.title = self.project.properties.name;
          $rootScope.page.links = [
              {
                text: 'Projects',
                url: '/projects'
              },
              {
                text: self.project.properties.name,
                url: '/projects/' + self.project.id
              },
              {
                text: 'Edit',
                url: '/projects/' + self.project.id + '/edit',
                type: 'active'
              },
              {
                text: 'Collaborators',
                url: '/projects/' + self.project.id + '/users'
              }
          ];
          $rootScope.page.actions = [
              {
                type: 'button-link',
                action: function($index) {
                  self.project.users_edit = ! self.project.users_edit;
                  $rootScope.page.actions[$index].visible = ! $rootScope.page.actions[$index].visible;
                },
                visible: false,
                text: 'Edit collaborators',
                alt: 'Done Editing'
              },
              {
                type: 'button-link new',
                action: function() {
                  console.log('modal');
                  self.modals.open('inviteUser');
                },
                text: 'Add a collaborator'
              }
          ];

          self.project.users = members;
          self.project.users_edit = false;

          //
          // Verify Account information for proper UI element display
          //
          if (Account.userObject && user) {
              user.$promise.then(function(userResponse) {
                  $rootScope.user = Account.userObject = userResponse;

                  self.permissions = {
                      isLoggedIn: Account.hasToken(),
                      role: $rootScope.user.properties.roles[0].properties.name,
                      account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                      can_edit: Account.canEdit(project)
                  };
              });
          }

      }, function(errorResponse) {
          $log.error('Unable to load request project');
      });

      //
      // Setup the Project
      //
      // $scope.project.users = projectUsers;
      // $scope.project.users_edit = false;


      //
      // Modal Windows
      //
      self.modals = {
        open: function($index) {
          self.modals.windows[$index].visible = true;
        },
        close: function($index) {
          self.modals.windows[$index].visible = false;
        },
        windows: {
          inviteUser: {
            title: 'Add a collaborator',
            body: '',
            visible: false
          }
        }
      };


      self.users = {
        list: members,
        search: null,
        invite: function(user) {
          self.invite.push(user); // Add selected User object to invitation list
          this.search = null; // Clear search text
        },
        add: function() {
          angular.forEach(self.invite, function(user_, $index) {
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
              self.modals.close('inviteUser');
              self.page.refresh();
            });
          });
        },
        remove: function(user) {
          var index = self.project.users.features.indexOf(user);

          Feature.RemoveUser({
              storage: storage,
              featureId: self.project.id,
              userId: user.id
            }).then(function(response) {
              //
              // Once the users have been added to the project, close the modal
              // and refresh the page
              //
              self.project.users.features.splice(index, 1);
            });
        },
        remove_confirm: false
      };


      $scope.invite = [];


      // //
      // // Setup basic page variables
      // //
      // $rootScope.page = {
      //   template: '/modules/components/projects/views/projects--users.html',
      //   title: $scope.project.project_title + ' Users',
      //   display_title: false,
      //   editable: true,
      //   back: '/',
      //   links: [
      //     {
      //       text: 'Projects',
      //       url: '/projects'
      //     },
      //     {
      //       text: $scope.project.project_title,
      //       url: '/projects/' + $scope.project.id
      //     },
      //     {
      //       text: 'Collaborators',
      //       url: '/projects/' + $scope.project.id + '/users',
      //       type: 'active'
      //     }
      //   ],
      //   actions: [
      //     {
      //       type: 'button-link',
      //       // url: '/projects/' + $scope.project.id + '/users/invite',
      //       action: function($index) {
      //         $scope.project.users_edit = ! $scope.project.users_edit;
      //         $scope.page.actions[$index].visible = ! $scope.page.actions[$index].visible;
      //       },
      //       visible: false,
      //       text: 'Edit collaborators',
      //       alt: 'Done Editing'
      //     },
      //     {
      //       type: 'button-link new',
      //       // url: '/projects/' + $scope.project.id + '/users/invite',
      //       action: function() {
      //         console.log('modal');
      //         $scope.modals.open('inviteUser');
      //       },
      //       text: 'Add a collaborator'
      //     }
      //   ],
      //   refresh: function() {
      //     $route.reload();
      //   }
      // };

    });

}());

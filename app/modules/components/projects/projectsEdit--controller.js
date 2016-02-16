'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldStack')
  .controller('ProjectEditCtrl', function (Account, $location, $log, Project, project, $rootScope, $route, user) {

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
            }
        ];
        $rootScope.page.actions = [];

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
    //
    //
    self.saveProject = function() {
      self.project.$update().then(function(response) {

        $location.path('/projects/' + self.project.id);

      }).then(function(error) {
        // Do something with the error
      });

    };

    self.deleteProject = function() {
      self.project.$delete().then(function(response) {

        $location.path('/projects/');

      }).then(function(error) {
        // Do something with the error
      });
    };

  });
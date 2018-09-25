'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectCreateCtrl',
        function(Account, $location, $log, Project, $rootScope, $route, user) {

        var self = this;

        $rootScope.page = {};

        self.project = {};

        $rootScope.page.title = 'Create Project';

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

            });

        }

        self.saveProject = function() {

            var project = new Project(self.project);

            project.workflow_state = 'Draft';

            project.$save().then(function(response) {

                $location.path('/projects');

            }).then(function(error) {

                $log.error('Unable to create Project object');

            });

        };

    });
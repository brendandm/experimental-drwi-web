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

        self.funders = [{
            id: 1,
            name: 'Maryland Department of Natural Resources'
        }, {
            id: 2,
            name: 'National Fish and Wildlife Foundation'
        }];

        self.programs = [{
            id: 1,
            name: 'Chesapeake Bay Conservation Innovation Grant'
        }, {
            id: 2,
            name: 'Chesapeake Bay Innovative Sediment and Nutrient Reduction'
        }, {
            id: 3,
            name: 'Chesapeake Bay Small Watershed Grant'
        }, {
            id: 4,
            name: 'Delaware River Restoration Fund'
        }, {
            id: 5,
            name: 'Maryland Trust Fund'
        }];

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
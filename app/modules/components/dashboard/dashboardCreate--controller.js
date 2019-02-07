'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardCreateController',
        function(Account, $location, $log, Dashboard, $rootScope, $route, user) {

        var self = this;

        $rootScope.viewState = {
            'dashboard': true
        };

        $rootScope.page = {};

        self.dashboard = {};

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0],
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Create Dashboard'
                };

            });

        }

        self.saveDashboard = function() {

            var newFeature = new Dashboard(self.dashboard)

            newFeature.$save().then(function(response) {

                $location.path('/dashboards/' + self.dashboard.id + '/edit');

            }).then(function(error) {

                $log.error('Unable to create dashboard.');

            });

        };

    });
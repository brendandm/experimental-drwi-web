'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardCreateCtrl', function(Account, $location, $log, Dashboard, $rootScope, $route, user) {

        var self = this;

        $rootScope.viewState = {
            'dashboard': true
        };

        $rootScope.page = {};

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

                self.dashboard = new Dashboard();

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Create Dashboard'
                };

            });

        }

        self.saveDashboard = function() {

            self.dashboard.$save().then(function(response) {

                self.dashboard = response;

                $location.path('/dashboards/' + self.dashboard.id + '/edit');

            }).then(function(error) {
                // Do something with the error
            });

        };

    });
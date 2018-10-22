'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotCreateCtrl', function(Account, $location, $log, Snapshot, $rootScope, $route, user) {

        var self = this;

        $rootScope.viewState = {
            'snapshot': true
        };

        $rootScope.page = {};

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
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };

                self.snapshot = new Snapshot();

                //
                // Setup page meta data
                //
                $rootScope.page = {
                    'title': 'Create Snapshot'
                };

            });

        }

        self.saveSnapshot = function() {

            self.snapshot.$save().then(function(response) {

                self.snapshot = response;

                $location.path('/dashboards/' + self.snapshot.id + '/edit');

            }).then(function(error) {
                // Do something with the error
            });

        };

    });
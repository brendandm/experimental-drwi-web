'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotEditCtrl', function(Account, $location, $log, Snapshot, snapshot, $rootScope, $route, user) {

        var self = this;

        $rootScope.page = {};

        //
        // Assign project to a scoped variable
        //
        snapshot.$promise.then(function(successResponse) {

            self.snapshot = successResponse;

            $rootScope.page.title = self.snapshot.name;

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

                });

            }

        }, function(errorResponse) {

            $log.error('Unable to load snapshot');

        });

        self.saveSnapshot = function() {

            self.snapshot.$update().then(function(response) {

                self.snapshot = response.properties;

            }).then(function(error) {
                // Do something with the error
            });

        };

        self.deleteSnapshot = function() {

            self.snapshot.$delete().then(function(response) {

                $location.path('/account');

            }).then(function(error) {
                // Do something with the error
            });
        };

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotListCtrl',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, snapshots, $interval, $timeout, Snapshot) {

            var self = this;

            $rootScope.viewState = {
                'snapshot': true
            };

            self.status = {
                loading: true
            };

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                }, 1000);

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(obj, index) {

                Snapshot.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this dashboard.',
                        'prompt': 'OK'
                    }];

                    $timeout(function() {

                        self.alerts = [];

                    }, 2000);

                    self.snapshots.splice(index, 1);

                });

            };

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Snapshots'
                    };

                    //
                    // Load snapshot data
                    //

                    self.actions.snapshots();

                });


            } else {

                $location.path('/account/login');

            }

            self.createSnapshot = function() {

                $location.path('/dashboards/collection/new');

            };

            self.actions = {
                snapshots: function() {

                    snapshots.$promise.then(function(snapshotResponse) {

                        self.snapshots = snapshotResponse.features;

                        self.showElements();

                    });

                }
            };

        });
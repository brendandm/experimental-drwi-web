'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeTypeEditController', function(Account, $location, $log,
        PracticeType, practiceType, $q, $rootScope, $route, $timeout, $interval, user, Utility) {

        var self = this;

        $rootScope.toolbarState = {
            'edit': true
        };

        $rootScope.page = {};

        self.status = {
            loading: true,
            processing: true
        };

        self.alerts = [];

        function closeAlerts() {

            self.alerts = [];

        }

        function closeRoute() {

            $location.path('/programs/' + self.programId + '/practice-types');

        }

        self.confirmDelete = function(obj) {

            console.log('self.confirmDelete', obj);

            self.deletionTarget = self.deletionTarget ? null : obj;

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        self.showElements = function() {

            $timeout(function() {

                self.status.loading = false;

                self.status.processing = false;

            }, 1000);

        };

        self.loadPracticeType = function() {

            practiceType.$promise.then(function(successResponse) {

                console.log('self.practiceType', successResponse);

                self.practiceType = successResponse;

                self.programId = self.practiceType.properties.program_id;

                if (!successResponse.permissions.read &&
                    !successResponse.permissions.write) {

                    self.makePrivate = true;

                    return;

                }

                self.permissions.can_edit = successResponse.permissions.write;
                self.permissions.can_delete = successResponse.permissions.write;

                $rootScope.page.title = self.practiceType.properties.name ? self.practiceType.properties.name : 'Un-named Practice Type';

                self.scrubFeature();

                self.showElements();

            }, function(errorResponse) {

                self.showElements();

            });

        };

        self.scrubFeature = function() {

            delete self.practiceType.geometry;
            delete self.practiceType.properties.organization;
            delete self.practiceType.properties.creator;
            delete self.practiceType.properties.last_modified_by;
            delete self.practiceType.properties.program;

        };

        self.savePracticeType = function() {

            self.status.processing = true;

            self.scrubFeature();

            self.practiceType.$update().then(function(successResponse) {

                self.practiceType = successResponse;

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice type changes saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            }, function(errorResponse) {

                // Error message

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice type changes could not be saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            });

        };

        self.deleteFeature = function() {

            PracticeType.delete({
                id: +self.deletionTarget.id
            }).$promise.then(function(data) {

                self.alerts.push({
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this practice type.',
                    'prompt': 'OK'
                });

                $timeout(closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this practice type.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this practice type.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this practice type.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(closeAlerts, 2000);

            });

        };

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0],
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: false
                };

                self.loadPracticeType();

            });

        } else {

            $location.path('/login');

        }

    });
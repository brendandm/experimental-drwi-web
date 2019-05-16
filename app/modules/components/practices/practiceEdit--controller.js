 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeEditController', function(Account, Image,$location,
        $log, Media, Practice, PracticeType, practice, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user, Utility) {

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

            $location.path(self.practice.links.site.html);

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

        self.loadSite = function() {

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                self.loadPractice();

            }, function(errorResponse) {

                //

            });

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.practice = successResponse;

                if (!successResponse.permissions.read &&
                    !successResponse.permissions.write) {

                    self.makePrivate = true;

                    return;

                }

                self.permissions.can_edit = successResponse.permissions.write;
                self.permissions.can_delete = successResponse.permissions.write;

                if (successResponse.category) {

                    self.practiceType = successResponse.category;

                }

                $rootScope.page.title = self.practice.name ? self.practice.name : 'Un-named Practice';

                //
                // Load practice types
                //

                PracticeType.collection({
                    program: self.practice.project.program_id,
                    limit: 500,
                    simple_bool: 'true',
                    minimal: 'true'
                }).$promise.then(function(successResponse) {

                    console.log('self.practiceTypes', successResponse);

                    successResponse.features.forEach(function(item) {

                        item.category = item.group;

                    });

                    self.practiceTypes = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    //

                    self.showElements();

                });

            }, function(errorResponse) {

                //

            });

        };

        self.scrubFeature = function(feature) {

            var excludedKeys = [
                'allocations',
                'creator',
                'dashboards',
                'geographies',
                'geometry',
                'last_modified_by',
                'members',
                'metrics',
                'metric_types',
                'organization',
                'partners',
                'partnerships',
                'practices',
                'practice_types',
                'program',
                'project',
                'reports',
                'sites',
                'status',
                'tags',
                'tasks',
                'users'
            ];

            var reservedProperties = [
                'links',
                'map_options',
                'permissions',
                '$promise',
                '$resolved'
            ];

            excludedKeys.forEach(function(key) {

                if (feature.properties) {

                    delete feature.properties[key];

                } else {

                    delete feature[key];

                }

            });

            reservedProperties.forEach(function(key) {

                delete feature[key];

            });

        };

        self.savePractice = function() {

            self.status.processing = true;

            self.scrubFeature(self.practice);

            if (self.practiceType) {

                self.practice.category_id = self.practiceType.id;

            }

            Practice.update({
                id: self.practice.id
            }, self.practice).then(function(successResponse) {

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice changes saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            }).catch(function(errorResponse) {

                // Error message

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice changes could not be saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            });

        };

        self.deleteFeature = function() {

            Practice.delete({
                id: +self.deletionTarget.id
            }).$promise.then(function(data) {

                self.alerts.push({
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this practice.',
                    'prompt': 'OK'
                });

                $timeout(closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete “' + self.deletionTarget.name + '”. There are pending tasks affecting this practice.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this practice.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this practice.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(closeAlerts, 2000);

            });

        };

        self.setPracticeType = function($item, $model, $label) {

            console.log('self.practiceType', $item);

            self.practiceType = $item;

            self.practice.category_id = $item.id;

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

                self.loadSite();

            });

        } else {

            $location.path('/logout');

        }

    });
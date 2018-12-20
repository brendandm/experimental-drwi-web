'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticePhotoController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, practiceTypes, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user, Utility) {

        var self = this;

        $rootScope.toolbarState = {
            'editPhotos': true
        };

        self.files = Media;
        self.files.images = [];

        $rootScope.page = {};

        self.status = {
            loading: true,
            processing: false
        };

        self.showElements = function(delay) {

            var ms = delay || 1000;

            $timeout(function() {

                self.status.loading = false;

                self.status.processing = false;

            }, ms);

        };

        self.alerts = [];

        self.closeAlerts = function() {

            self.alerts = [];

        };

        self.closeRoute = function() {

            $location.path(self.practice.links.site.html);

        };

        self.processPractice = function(data) {

            self.practice = data;

            if (data.permissions) {

                if (!data.permissions.read &&
                    !data.permissions.write) {

                    self.makePrivate = true;

                }

                self.permissions.can_edit = data.permissions.write;
                self.permissions.can_delete = data.permissions.write;

            }

            delete self.practice.properties.organization;
            delete self.practice.properties.project;
            delete self.practice.properties.site;

            self.practiceType = data.properties.category;

            $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

            self.practice.properties.images.sort(function(a, b) {

                return a.id < b.id;

            });

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.processPractice(successResponse);

                self.showElements();

            }, function(errorResponse) {

                self.showElements();

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

                self.loadPractice();

            });

        } else {

            $location.path('/login');

        }

        self.savePractice = function() {

            self.status.processing = true;

            var _images = [];

            self.practice.properties.images.forEach(function(image) {

                _images.push({
                    id: image.id
                });

            });

            self.practice.properties = {
                'images': _images
            };

            if (self.files.images.length) {

                var savedQueries = self.files.preupload(self.files.images);

                $q.all(savedQueries).then(function(successResponse) {

                    $log.log('Images::successResponse', successResponse);

                    angular.forEach(successResponse, function(image) {

                        self.practice.properties.images.push({

                            id: image.id

                        });

                    });

                    self.practice.$update().then(function(successResponse) {

                        self.processPractice(successResponse);

                        self.files.images = [];

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Photo library updated.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.showElements(0);

                    }, function(errorResponse) {

                        self.showElements(0);

                    });

                }, function(errorResponse) {

                    $log.log('errorResponse', errorResponse);

                    self.showElements();

                });

            } else {

                self.practice.$update().then(function(successResponse) {

                    self.processPractice(successResponse);

                    self.files.images = [];

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Photo library updated.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.showElements();

                }, function(errorResponse) {

                    self.showElements();

                });

            }

        };

        self.confirmDelete = function(obj, targetCollection) {

            console.log('self.confirmDelete', obj, targetCollection);

            if (self.deletionTarget &&
                self.deletionTarget.collection === 'practice') {

                self.cancelDelete();

            } else {

                self.deletionTarget = {
                    'collection': targetCollection,
                    'feature': obj
                };

            }

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        self.deleteFeature = function(featureType, index) {

            console.log('self.deleteFeature', featureType, index);

            var targetCollection;

            if (featureType === 'image') {

                self.practice.properties.images.splice(index, 1);

                self.cancelDelete();

                self.savePractice();

                return;

            }

            switch (featureType) {

                case 'image':

                    targetCollection = Image;

                    break;

                default:

                    targetCollection = Practice;

                    break;

            }

            targetCollection.delete({
                id: +self.deletionTarget.feature.id
            }).$promise.then(function(data) {

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this ' + featureType + '.',
                    'prompt': 'OK'
                }];

                $timeout(self.closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete this ' + featureType + '. There are pending tasks affecting this feature.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this ' + featureType + '.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(self.closeAlerts, 2000);

            });

        };

    });
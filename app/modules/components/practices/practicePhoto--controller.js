'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticePhotoController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, practice_types, $q, $rootScope, $route,
        $scope, $timeout, $interval, site, user) {

        var self = this;

        $rootScope.toolbarState = {
            'editPhotos': true
        };

        self.files = Media;
        self.files.images = [];

        $rootScope.page = {};

        self.alerts = [];

        self.closeAlerts = function() {

            self.alerts = [];

        };

        self.closeRoute = function() {

            $location.path(self.practice.links.site.html);

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

                delete self.practice.properties.organization;
                delete self.practice.properties.project;
                delete self.practice.properties.site;

                self.practiceType = successResponse.properties.category;

                $rootScope.page.title = self.practice.properties.name ? self.practice.properties.name : 'Un-named Practice';

            }, function(errorResponse) {

                //

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
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: false
                };

                self.loadPractice();

            });

        }

        self.savePractice = function() {

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

                        self.practice = successResponse;

                        self.files.images = [];

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Photo library updated.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                    }, function(errorResponse) {

                        // Error message

                    });

                }, function(errorResponse) {

                    $log.log('errorResponse', errorResponse);

                });

            } else {

                self.practice.$update().then(function(successResponse) {

                    self.practice = successResponse;

                    self.files.images = [];

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Photo library updated.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                }, function(errorResponse) {

                    // Error message

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

                if (index !== null &&
                    typeof index === 'number' &&
                    featureType === 'image') {

                    self.practice.properties.images.splice(index, 1);

                    self.cancelDelete();

                    $timeout(self.closeAlerts, 2000);

                    if (index === 0) {

                        $route.reload();

                    }

                } else {

                    $timeout(self.closeRoute, 2000);

                }

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
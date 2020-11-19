'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectPhotoController', function(
        Account, Image, $location, $log, Media, Project,
        project, $q, $rootScope, $route, $scope, $timeout,
        $interval, user, Utility) {

        var self = this;

        $rootScope.toolbarState = {
            'editPhotos': true
        };

        self.mediaManager = Media;

        self.mediaManager.images = [];

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

        self.closeRoute = function () {

            $location.path('projects');

        };

        self.processProject = function(data) {

            self.project = data;

            if (data.permissions) {

                if (!data.permissions.read &&
                    !data.permissions.write) {

                    self.makePrivate = true;

                }

                self.permissions.can_edit = data.permissions.write;
                self.permissions.can_delete = data.permissions.write;

            }

            delete self.project.organization;

            self.projectType = data.category;

            $rootScope.page.title = self.project.name ? self.project.name : 'Un-named Project';

            if (Array.isArray(self.project.images)) {

                self.project.images.sort(function (a, b) {

                    return a.id < b.id;

                });

            }

        };

        self.loadProject = function() {

            project.$promise.then(function(successResponse) {

                console.log('self.project', successResponse);

                self.processProject(successResponse);

                self.showElements();

            }, function(errorResponse) {

                self.showElements();

            });

        };

        self.saveImage = function() {

            console.log(
                'ProjectPhotoController:saveImage:self.mediaManager.images:',
                self.mediaManager.images
            );

            self.status.processing = true;

            var imageCollection = {
                images: []
            };

            self.project.images.forEach(function(image) {

                imageCollection.images.push({
                    id: image.id
                });

            });

            if (self.mediaManager.images) {

                var savedQueries = self.mediaManager.preupload(
                    self.mediaManager.images,
                    'image',
                    'project',
                    self.project.id);

                console.log(
                    'ProjectPhotoController:saveImage:savedQueries:',
                    savedQueries
                );

                $q.all(savedQueries).then(function(successResponse) {

                    $log.log('Images::successResponse', successResponse);

                    angular.forEach(successResponse, function(image) {

                        imageCollection.images.push({

                            id: image.id

                        });

                    });

                    Project.update({
                        id: self.project.id
                    }, imageCollection).$promise.then(function(successResponse) {

                        self.processProject(successResponse);

                        self.mediaManager.images = [];

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

                Project.update({
                    id: self.project.id
                }, imageCollection).$promise.then(function(successResponse) {

                    self.processProject(successResponse);

                    self.mediaManager.images = [];

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
                self.deletionTarget.collection === 'project') {

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

            switch (featureType) {

                case 'image':

                    targetCollection = Image;

                    break;

                default:

                    targetCollection = Project;

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

                if (featureType === 'image') {

                    self.project.images.splice(index, 1);

                    self.cancelDelete();

                    self.saveImage();

                } else {

                    $timeout(self.closeRoute, 1500);

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

                self.loadProject();

            });

        } else {

            $location.path('/logout');

        }

    });
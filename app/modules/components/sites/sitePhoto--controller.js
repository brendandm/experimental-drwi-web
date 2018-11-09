(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditCtrl
     * @description
     * # SiteEditCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('SitePhotoCtrl',
            function(Account, environment, $http, $location, Notifications, 
                Site, site, $rootScope, $route, $scope, Segment,
                $timeout, $interval, user, Shapefile) {

                var self = this,
                    timeout;

                $rootScope.toolbarState = {
                    'editPhotos': true
                };

                $rootScope.page = {};

                site.$promise.then(function(successResponse) {

                    console.log('self.site', successResponse);

                    self.site = successResponse;

                    if (successResponse.permissions.read &&
                        successResponse.permissions.write) {

                        self.makePrivate = false;

                    } else {

                        self.makePrivate = true;

                    }

                    self.permissions.can_edit = successResponse.permissions.write;
                    self.permissions.can_delete = successResponse.permissions.write;

                    $rootScope.page.title = self.site.properties.name;

                    //
                    // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
                    // selected their property, so we just need to display it on the map for them again.
                    //
                    // if (self.site && self.site.properties && self.site.properties.segment) {
                    //     self.geolocation.drawSegment(self.site.properties.segment);
                    // }

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

                        });

                    }

                }, function(errorResponse) {

                });

                self.uploadShapefile = function() {

                    if (!self.shapefile ||
                        !self.shapefile.length) {

                        $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 1200);

                        return false;

                    }

                    // self.status.saving.action = true;

                    if (self.shapefile) {

                        self.progressMessage = 'Uploading your file...';

                        var fileData = new FormData();

                        fileData.append('file', self.shapefile[0]);

                        console.log('fileData', fileData);

                        self.fillMeter = $interval(function() {

                            var tempValue = (self.progressValue || 10) * 0.50;

                            if (!self.progressValue) {

                                self.progressValue = tempValue;

                            } else if ((100 - tempValue) > self.progressValue) {

                                self.progressValue += tempValue;

                            }

                            console.log('progressValue', self.progressValue);

                            if (self.progressValue > 75) {

                                self.progressMessage = 'Analyzing data...';

                            }

                        }, 100);

                        console.log('Shapefile', Shapefile);

                        try {

                            Shapefile.upload({}, fileData, function(shapefileResponse) {

                                console.log('shapefileResponse', shapefileResponse);

                                self.progressValue = 100;

                                self.progressMessage = 'Upload successful, rendering shape...';

                                $interval.cancel(self.fillMeter);

                                $timeout(function() {

                                    self.progressValue = null;

                                    if (shapefileResponse.msg.length) {

                                        console.log('Shapefile --> GeoJSON', shapefileResponse.msg[0]);

                                        if (shapefileResponse.msg[0] !== null &&
                                            typeof shapefileResponse.msg[0].geometry !== 'undefined') {

                                            self.setGeoJsonLayer(shapefileResponse.msg[0]);

                                        }

                                    }

                                }, 1600);

                                self.error = null;

                            }, function(errorResponse) {

                                console.log(errorResponse);

                                $interval.cancel(self.fillMeter);

                                self.progressValue = null;

                                $rootScope.notifications.error('', 'An error occurred and we couldn\'t process your file.');

                                $timeout(function() {
                                    $rootScope.notifications.objects = [];
                                }, 2000);

                                return;

                            });

                        } catch (error) {

                            console.log('Shapefile upload error', error);

                        }

                    }

                };

                self.saveSite = function() {

                    self.site.$update().then(function(successResponse) {

                        $location.path('/sites/' + $route.current.params.siteId);

                    }, function(errorResponse) {

                    });

                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.site.links.project.html);

                }

                self.confirmDelete = function(obj) {

                    console.log('self.confirmDelete', obj);

                    self.deletionTarget = self.deletionTarget ? null : obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function() {

                    Site.delete({
                        id: +self.deletionTarget.id
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this site.',
                            'prompt': 'OK'
                        });

                        $timeout(closeRoute, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this site.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this site.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this site.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

                };

            });

}());
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
        .controller('SiteEditCtrl',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
                Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, Segment,
                $timeout, $interval, user, Shapefile, Utility) {

                var self = this;

                $rootScope.toolbarState = {
                    'edit': true
                };

                $rootScope.page = {};

                self.status = {
                    loading: true
                };

                self.fillMeter = undefined;

                self.showProgress = function() {

                    self.fillMeter = $interval(function() {

                        var tempValue = (self.progressValue || 10) * Utility.meterCoefficient();

                        if (!self.progressValue) {

                            self.progressValue = tempValue;

                        } else if ((100 - tempValue) > self.progressValue) {

                            self.progressValue += tempValue;

                        } else {

                            $interval.cancel(self.fillMeter);

                            self.fillMeter = undefined;

                            self.progressValue = 100;

                            self.showElements(1000, self.site, self.progressValue);

                        }

                        console.log('progressValue', self.progressValue);

                    }, 50);

                };

                self.showElements = function(delay, object, progressValue) {

                    if (object && progressValue > 75) {

                        $timeout(function() {

                            self.status.loading = false;

                            self.progressValue = 0;

                        }, delay);

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

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    self.showProgress();

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: false
                        };

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

                            self.showElements(1000, self.site, self.progressValue);

                        }, function(errorResponse) {

                            self.showElements(1000, self.site, self.progressValue);

                        });

                    });

                } else {

                    $location.path('/account/login');

                }

            });

}());
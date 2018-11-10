(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteSummaryCtrl
     * @description
     */
    angular.module('FieldDoc')
        .controller('SiteGeographyCtrl',
            function(Account, $location, $window, $timeout, $rootScope, $scope,
                $route, nodes, user, Utility, site, Site, Practice, MapPreview,
                leafletBoundsHelpers, $interval) {

                var self = this;

                $rootScope.toolbarState = {
                    'viewGeographies': true
                };

                $rootScope.page = {};

                self.map = MapPreview;

                console.log('self.map', self.map);

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

                            self.showElements(1000, self.nodes, self.progressValue);

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

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.site.links.project.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'site') {

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

                    var targetCollection,
                        targetId;

                    switch (featureType) {

                        case 'practice':

                            targetCollection = Practice;

                            break;

                        default:

                            targetCollection = Site;

                            break;

                    }

                    if (self.deletionTarget.feature.properties) {

                        targetId = self.deletionTarget.feature.properties.id;

                    } else {

                        targetId = self.deletionTarget.feature.id;

                    }

                    targetCollection.delete({
                        id: +targetId
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        });

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'practice') {

                            self.practices.splice(index, 1);

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.feature.properties.name + '”. There are pending tasks affecting this ' + featureType + '.',
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

                        $timeout(closeAlerts, 2000);

                    });

                };

                self.buildStaticMapURL = function(geometry) {

                    var styledFeature = {
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": {
                            "marker-size": "small",
                            "marker-color": "#2196F3",
                            "stroke": "#2196F3",
                            "stroke-opacity": 1.0,
                            "stroke-width": 2,
                            "fill": "#2196F3",
                            "fill-opacity": 0.5
                        }
                    };

                    // Build static map URL for Mapbox API

                    return 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                };

                self.buildFeature = function(geometry) {

                    var styleProperties = {
                        color: "#2196F3",
                        opacity: 1.0,
                        weight: 2,
                        fillColor: "#2196F3",
                        fillOpacity: 0.5
                    };

                    return {
                        data: {
                            "type": "Feature",
                            "geometry": geometry,
                            "properties": {
                                "marker-size": "small",
                                "marker-color": "#2196F3",
                                "stroke": "#2196F3",
                                "stroke-opacity": 1.0,
                                "stroke-width": 2,
                                "fill": "#2196F3",
                                "fill-opacity": 0.5
                            }
                        },
                        style: styleProperties
                    };

                };

                //             var southWest = L.latLng(40.712, -74.227),
                // northEast = L.latLng(40.774, -74.125),
                // bounds = L.latLngBounds(southWest, northEast);

                // Math.max.apply(null, numbers)

                self.transformBounds = function(obj) {

                    var xRange = [],
                        yRange = [],
                        southWest,
                        northEast,
                        bounds;

                    obj.bounds.coordinates[0].forEach(function(coords) {

                        xRange.push(coords[0]);

                        yRange.push(coords[1]);

                    });

                    southWest = [
                        Math.min.apply(null, yRange),
                        Math.min.apply(null, xRange)
                    ];

                    northEast = [
                        Math.max.apply(null, yRange),
                        Math.max.apply(null, xRange)
                    ];

                    bounds = leafletBoundsHelpers.createBoundsFromArray([
                        southWest,
                        northEast
                    ]);

                    return bounds;

                    //         var bounds = leafletBoundsHelpers.createBoundsFromArray([
                    //     [ 51.508742458803326, -0.087890625 ],
                    //     [ 51.508742458803326, -0.087890625 ]
                    // ]);

                };

                self.processCollection = function(arr) {

                    arr.forEach(function(feature) {

                        if (feature.geometry !== null) {

                            feature.staticURL = self.buildStaticMapURL(feature.geometry);

                            feature.geojson = self.buildFeature(feature.geometry);

                            feature.bounds = self.transformBounds(feature);

                        }

                        if (feature.code !== null &&
                            typeof feature.code === 'string') {

                            feature.classification = feature.code.length;

                        }

                    });

                };

                self.loadSite = function() {

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

                        if (self.site.geometry !== null) {

                            self.site.staticURL = self.buildStaticMapURL(self.site.geometry);

                        }

                        $rootScope.page.title = self.site.properties.name;

                        self.project = successResponse.properties.project;

                        console.log('self.project', self.project);

                        //
                        // Load spatial nodes
                        //

                        nodes.$promise.then(function(successResponse) {

                            for (var collection in successResponse) {

                                if (successResponse.hasOwnProperty(collection) &&
                                    Array.isArray(successResponse[collection])) {

                                    self.processCollection(successResponse[collection]);

                                }

                            }

                            self.nodes = successResponse;

                            console.log('self.nodes', self.nodes);

                            self.showElements(1000, self.nodes, self.progressValue);

                        }, function(errorResponse) {

                            self.showElements(1000, self.nodes, self.progressValue);

                        });

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
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        self.loadSite();

                    });

                }

            });

})();
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:GeographyListController
     * @description
     */
    angular.module('FieldDoc')
        .controller('GeographyListController',
            function(Account, $location, $window, $timeout, $rootScope, $scope,
                $route, geographies, user, Utility, GeographyService,
                MapPreview, leafletBoundsHelpers, $interval) {

                var self = this;

                self.programId = $route.current.params.programId;

                $rootScope.viewState = {
                    'geography': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(MapPreview));

                console.log('self.map', self.map);

                self.status = {
                    loading: true,
                    processing: false
                };

                self.showElements = function() {

                    $timeout(function() {

                        self.status.loading = false;

                        self.status.processing = false;

                    }, 1000);

                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.site.links.project.html);

                }

                self.confirmDelete = function(obj) {

                    self.deletionTarget = obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(obj, index) {

                    GeographyService.delete({
                        id: obj.id
                    }).$promise.then(function(data) {

                        self.deletionTarget = null;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this geography.',
                            'prompt': 'OK'
                        }];

                        self.geographies.splice(index, 1);

                        $timeout(closeAlerts, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this geography.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this geography.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this geography.',
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

                self.loadGeographies = function() {

                    //
                    // Load spatial geographies
                    //

                    geographies.$promise.then(function(successResponse) {

                        for (var collection in successResponse) {

                            if (successResponse.hasOwnProperty(collection) &&
                                Array.isArray(successResponse[collection])) {

                                self.processCollection(successResponse[collection]);

                            }

                        }

                        self.geographies = successResponse.features;

                        console.log('self.geographies', self.geographies);

                        self.showElements();

                    }, function(errorResponse) {

                        self.showElements();

                    });

                };

                self.createGeography = function() {

                    self.geography = new GeographyService({
                        'program_id': self.programId,
                        'organization_id': $rootScope.user.properties.organization_id
                    });

                    self.geography.$save(function(successResponse) {

                        $location.path('/geographies/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('Unable to create a new geography, please try again later.');

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
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        self.loadGeographies();

                    });

                }

            });

})();
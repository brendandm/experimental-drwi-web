(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:GeographySummaryController
     * @description
     */
    angular.module('FieldDoc')
        .controller('GeographySummaryController',
            function(Account, $location, $window, $timeout, $rootScope, $scope, $route,
                user, Utility, geography, Map, mapbox, leafletData,
                leafletBoundsHelpers, GeographyService, $interval) {

                var self = this;

                $rootScope.viewState = {
                    'geography': true
                };

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.map.layers = {
                    baselayers: {
                        streets: {
                            name: 'Streets',
                            type: 'xyz',
                            url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                            layerOptions: {
                                apikey: mapbox.access_token,
                                mapid: 'mapbox.streets',
                                attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>',
                                showOnSelector: false
                            }
                        }
                    }
                };

                self.map.defaults = {
                    doubleClickZoom: false,
                    dragging: false,
                    keyboard: false,
                    scrollWheelZoom: false,
                    tap: false,
                    touchZoom: false,
                    maxZoom: 19,
                    zoomControl: false
                };

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

                    $location.path('/geographies');

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'geography') {

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

                self.deleteFeature = function() {

                    console.log('self.deleteFeature');

                    var targetId;

                    if (self.deletionTarget.feature.properties) {

                        targetId = self.deletionTarget.feature.properties.id;

                    } else {

                        targetId = self.deletionTarget.feature.id;

                    }

                    GeographyService.delete({
                        id: +targetId
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this geography.',
                            'prompt': 'OK'
                        });

                        $timeout(closeRoute, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.feature.properties.name + '”. There are pending tasks affecting this geography.',
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

                function addNonGroupLayers(sourceLayer, targetGroup) {

                    if (sourceLayer instanceof L.LayerGroup) {

                        sourceLayer.eachLayer(function(layer) {

                            addNonGroupLayers(layer, targetGroup);

                        });

                    } else {

                        targetGroup.addLayer(sourceLayer);

                    }

                }

                self.setGeoJsonLayer = function(data, layerGroup, clearLayers) {

                    if (clearLayers) {

                        layerGroup.clearLayers();

                    }

                    var featureGeometry = L.geoJson(data, {});

                    addNonGroupLayers(featureGeometry, layerGroup);

                };

                self.cleanName = function(string_) {
                    return Utility.machineName(string_);
                };

                self.loadGeography = function() {

                    geography.$promise.then(function(successResponse) {

                        console.log('self.geography', successResponse);

                        self.geography = successResponse;

                        if (successResponse.permissions.read &&
                            successResponse.permissions.write) {

                            self.makePrivate = false;

                        } else {

                            self.makePrivate = true;

                        }

                        self.permissions.can_edit = successResponse.permissions.write;
                        self.permissions.can_delete = successResponse.permissions.write;

                        $rootScope.page.title = self.geography.name;

                        //
                        // If a valid geography geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.geography.geometry !== null &&
                            typeof self.geography.geometry !== 'undefined') {

                            leafletData.getMap('geography--map').then(function(map) {

                                self.geographyExtent = new L.FeatureGroup();

                                self.setGeoJsonLayer(self.geography.geometry, self.geographyExtent);

                                self.map.bounds = Utility.transformBounds(self.geography.extent);

                            });

                            self.map.geojson = {
                                data: self.geography.geometry
                            };

                        }

                        self.loadMetrics();

                        self.showElements();

                    });

                };

                self.loadMetrics = function() {

                    GeographyService.progress({
                        id: self.geography.id
                    }).$promise.then(function(successResponse) {

                        console.log('Project metrics', successResponse);

                        self.processMetrics(successResponse.features);

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

                self.processMetrics = function(arr) {

                    arr.forEach(function(datum) {

                        var contextProgress,
                            selfProgress;

                        if (datum.context_target) {

                            contextProgress = datum.current_value / datum.context_target;

                        } else {

                            contextProgress = datum.current_value / datum.target;

                        }

                        if (datum.self_target) {

                            selfProgress = datum.current_value / datum.self_target;

                        }

                        datum.contextProgress = contextProgress > 1 ? 1 : contextProgress;

                        datum.selfProgress = selfProgress > 1 ? 1 : selfProgress;

                    });

                    return arr;

                };

                self.showMetricModal = function(metric) {

                    console.log('self.showMetricModal', metric);

                    self.selectedMetric = metric;

                    self.displayModal = true;

                };

                self.closeMetricModal = function() {

                    self.selectedMetric = null;

                    self.displayModal = false;

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

                        self.loadGeography();

                    });

                }

            });

})();
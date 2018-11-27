'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('GeographyEditController',
        function(Account, leafletData, $location, $log, Map,
            mapbox, GeographyService, geography, $q, $rootScope, $route,
            $scope, $timeout, $interval, user, Shapefile,
            leafletBoundsHelpers) {

            var self = this;

            $rootScope.toolbarState = {
                'edit': true
            };

            self.map = JSON.parse(JSON.stringify(Map));

            self.savedObjects = [];

            self.editableLayers = new L.FeatureGroup();

            //
            // Set default image path for Leaflet iconography
            //

            L.Icon.Default.imagePath = '/images/leaflet';

            function addNonGroupLayers(sourceLayer, targetGroup) {
                if (sourceLayer instanceof L.LayerGroup) {
                    sourceLayer.eachLayer(function(layer) {
                        addNonGroupLayers(layer, targetGroup);
                    });
                } else {
                    targetGroup.addLayer(sourceLayer);
                }
            }

            self.setGeoJsonLayer = function(data) {

                self.editableLayers.clearLayers();

                var siteGeometry = L.geoJson(data, {});

                addNonGroupLayers(siteGeometry, self.editableLayers);

                self.savedObjects = [{
                    id: self.editableLayers._leaflet_id,
                    geoJson: data
                }];

                console.log('self.savedObjects', self.savedObjects);

            };

            $rootScope.page = {};

            self.loadGeography = function() {

                geography.$promise.then(function(successResponse) {

                    console.log('self.geography', successResponse);

                    self.geography = successResponse;

                    delete self.geography.properties.organization;
                    delete self.geography.properties.program;

                    $rootScope.page.title = self.geography.properties.name ? self.geography.properties.name : 'Un-named Geography';

                    //
                    // If a valid geography geometry is present, add it to the map
                    // and track the object in `self.savedObjects`.
                    //

                    if (self.geography.geometry !== null &&
                        typeof self.geography.geometry !== 'undefined') {

                        //Added by Lin 
                        leafletData.getMap('geography--map').then(function(map) {

                            self.geographyExtent = new L.FeatureGroup();

                            self.setGeoJsonLayer(self.geography.geometry);

                            map.fitBounds(self.editableLayers.getBounds(), {
                                // padding: [20, 20],
                                maxZoom: 18
                            });

                        });

                        self.map.geojson = {
                            data: self.geography.geometry
                        };
                        //existing
                        // var geographyGeometry = L.geoJson(self.geography.geometry, {});

                        // addNonGroupLayers(geographyGeometry, self.editableLayers);

                        self.savedObjects = [{
                            id: self.editableLayers._leaflet_id,
                            geoJson: self.geography.geometry
                        }];
                        console.log('self.geography.geometry', self.geography.geometry);

                        console.log('self.savedObjects', self.savedObjects);

                        var rawGeometry = self.geography.geometry;

                        console.log('rawGeometry', rawGeometry);

                    }

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
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: true
                    };

                    self.loadGeography();

                });

            }

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

            self.saveGeography = function() {

                if (self.savedObjects.length) {

                    self.savedObjects.forEach(function(object) {

                        console.log('Iterating self.savedObjects', object);

                        if (object.geoJson.geometry) {

                            self.geography.geometry = object.geoJson.geometry;

                        } else {

                            self.geography.geometry = object.geoJson;

                        }

                    });

                }

                self.geography.$update().then(function(successResponse) {

                    //

                }, function(errorResponse) {

                    // Error message

                });

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path('/geographies');

            }

            self.confirmDelete = function(obj) {

                console.log('self.confirmDelete', obj);

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function() {

                GeographyService.delete({
                    id: +self.deletionTarget.id
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
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this geography.',
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

            //
            // Define a layer to add geometries to later
            //
            var featureGroup = new L.FeatureGroup();

            //
            // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
            //
            self.geojsonToLayer = function(geojson, layer) {
                layer.clearLayers();

                function add(l) {
                    l.addTo(layer);
                }

                //
                // Make sure the GeoJSON object is added to the layer with appropriate styles
                //
                L.geoJson(geojson, {
                    style: {
                        stroke: true,
                        fill: false,
                        weight: 2,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    }
                }).eachLayer(add);

            };

        });
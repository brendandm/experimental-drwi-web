(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:GeographyEditController
     * @description
     * # GeographyEditController
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('GeographyLocationController',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
                Map, mapbox, Notifications, GeographyService, geography, $rootScope, $route,
                $scope, $timeout, $interval, user, Shapefile, Utility) {

                var self = this;

                $rootScope.toolbarState = {
                    'editLocation': true
                };

                $rootScope.page = {};

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

                //
                // We use this function for handle any type of geographic change, whether
                // through the map or through the fields
                //
                self.processPin = function(coordinates, zoom) {

                    if (coordinates.lat === null ||
                        coordinates.lat === undefined ||
                        coordinates.lng === null ||
                        coordinates.lng === undefined) {
                        return;
                    }

                    //
                    // Update the visible pin on the map
                    //

                    self.map.center = {
                        lat: coordinates.lat,
                        lng: coordinates.lng,
                        zoom: (zoom < 10) ? 10 : zoom
                    };

                    self.showGeocoder = false;

                };

                //
                // Empty Geocode object
                //
                // We need to have an empty geocode object so that we can fill it in later
                // in the address geocoding process. This allows us to pass the results along
                // to the Form Submit function we have in place below.
                //
                self.geocode = {};

                //
                // When the user has selected a response, we need to perform a few extra
                // tasks so that our scope is updated properly.
                //
                $scope.$watch(angular.bind(this, function() {
                    return this.geocode.response;
                }), function(response) {

                    //
                    // Only execute the following block of code if the user has geocoded an
                    // address. This block of code expects this to be a single feature from a
                    // Carmen GeoJSON object.
                    //
                    // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
                    //
                    if (response) {

                        self.processPin({
                            lat: response.geometry.coordinates[1],
                            lng: response.geometry.coordinates[0]
                        }, 16);

                        self.geocode = {
                            query: null,
                            response: null
                        };
                    }

                });

                self.setGeoJsonLayer = function(data) {

                    self.editableLayers.clearLayers();

                    var geographyGeometry = L.geoJson(data, {});

                    addNonGroupLayers(geographyGeometry, self.editableLayers);

                    self.savedObjects = [{
                        id: self.editableLayers._leaflet_id,
                        geoJson: data
                    }];

                    console.log('self.savedObjects', self.savedObjects);

                };

                self.uploadShapefile = function() {

                    if (!self.shapefile ||
                        !self.shapefile.length) {

                        $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 1200);

                        return false;

                    }

                    if (self.shapefile) {

                        self.progressMessage = 'Uploading your file...';

                        var fileData = new FormData();

                        fileData.append('file', self.shapefile[0]);

                        console.log('fileData', fileData);

                        self.fillMeter = $interval(function() {

                            var tempValue = (self.progressValue || 10) * 0.20;

                            if (!self.progressValue) {

                                self.progressValue = tempValue;

                            } else if ((100 - tempValue) > self.progressValue) {

                                self.progressValue += tempValue;

                            }

                            console.log('progressValue', self.progressValue);

                            if (self.progressValue > 75) {

                                self.progressMessage = 'Analyzing data...';

                            }

                        }, 50);

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

                                self.alerts = [{
                                    'type': 'error',
                                    'flag': 'Error!',
                                    'msg': 'The file could not be processed.',
                                    'prompt': 'OK'
                                }];

                                $timeout(closeAlerts, 2000);

                                return;

                            });

                        } catch (error) {

                            console.log('Shapefile upload error', error);

                        }

                    }

                };

                self.saveGeography = function() {

                    delete self.geography.properties.counties;
                    delete self.geography.properties.geographies;
                    delete self.geography.properties.watersheds;

                    if (self.savedObjects.length) {

                        self.savedObjects.forEach(function(object) {

                            console.log('Iterating self.savedObjects', object);

                            if (object.geoJson.geometry &&
                                typeof object.geoJson.geometry !== 'undefined') {

                                self.geography.geometry = object.geoJson.geometry;

                            }

                        });

                    } else {

                        self.geography.geometry = {
                            type: 'Point',
                            coordinates: [-98.5795,
                                39.828175
                            ]
                        };

                    }

                    self.status.processing = true;

                    self.geography.$update().then(function(successResponse) {

                        self.status.processing = false;

                        self.geography = successResponse;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Geography location saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                    }, function(errorResponse) {

                        self.status.processing = false;

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong and the location could not be saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

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

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this geography.',
                            'prompt': 'OK'
                        }];

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

                /**
                 * Mapping functionality
                 *
                 *
                 *
                 *
                 *
                 *
                 */

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

                //
                // Define our map interactions via the Angular Leaflet Directive
                //
                leafletData.getMap('geography--map').then(function(map) {

                    //
                    // Add draw toolbar
                    //

                    var drawControls = new L.Control.Draw({
                        draw: {
                            circle: false,
                            circlemarker: false,
                            rectangle: false
                        },
                        edit: {
                            featureGroup: self.editableLayers
                        }
                    });

                    console.log('drawControls', drawControls);

                    // map.addControl(drawControls);

                    var drawnItems = drawControls.options.edit.featureGroup;

                    drawnItems.addTo(map);

                    map.on('draw:created', function(e) {

                        var layer = e.layer;

                        drawnItems.clearLayers();
                        drawnItems.addLayer(layer);
                        console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                        self.savedObjects = [{
                            id: layer._leaflet_id,
                            geoJson: layer.toGeoJSON()
                        }];

                    });

                    map.on('draw:edited', function(e) {

                        var layers = e.layers;

                        console.log('map.draw:edited', layers);

                        layers.eachLayer(function(layer) {

                            self.savedObjects = [{
                                id: layer._leaflet_id,
                                geoJson: layer.toGeoJSON()
                            }];

                            console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                        });

                    });

                    map.on('draw:deleted', function(e) {

                        var layers = e.layers;

                        layers.eachLayer(function(layer) {

                            for (var i = 0; i < self.savedObjects.length; i++) {
                                if (self.savedObjects[i].id == layer._leaflet_id) {
                                    self.savedObjects.splice(i, 1);
                                }
                            }

                            console.log('Layer removed', JSON.stringify(layer.toGeoJSON()));

                        });

                        self.savedObjects = [];

                        console.log('Saved objects', self.savedObjects);

                    });

                    map.on('layeradd', function(e) {

                        console.log('map:layeradd', e);

                        if (e.layer.getBounds) {

                            map.fitBounds(e.layer.getBounds(), {
                                padding: [20, 20],
                                maxZoom: 18
                            });

                        }

                    });

                    map.on('zoomend', function(e) {

                        console.log('map:zoomend', map.getZoom());

                    });

                    //
                    // Update the pin and segment information when the user clicks on the map
                    // or drags the pin to a new location
                    //

                    $scope.$on('leafletDirectiveMap.click', function(event, args) {
                        self.processPin(args.leafletEvent.latlng, map._zoom);
                    });

                    $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
                        self.processPin(args.leafletEvent.latlng, map._zoom + 1);
                    });

                    $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
                        self.processPin(args.leafletEvent.target._latlng, map._zoom);
                    });

                    $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
                        var zoom = map._zoom + 1;
                        map.setZoom(zoom);
                    });

                });

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

                            $rootScope.page.title = self.geography.properties.name;

                            //
                            // If a valid geography geometry is present, add it to the map
                            // and track the object in `self.savedObjects`.
                            //

                            if (self.geography.geometry !== null &&
                                typeof self.geography.geometry !== 'undefined') {

                                leafletData.getMap('geography--map').then(function(map) {

                                    var geographyExtent = new L.FeatureGroup();

                                    var geographyGeometry = L.geoJson(successResponse, {});

                                    geographyExtent.addLayer(geographyGeometry);

                                    map.fitBounds(geographyExtent.getBounds(), {
                                        maxZoom: 18
                                    });

                                    self.setGeoJsonLayer(self.geography.geometry);

                                });

                            }

                            self.showElements();

                        }, function(errorResponse) {

                            self.showElements();

                        });

                    });

                } else {

                    $location.path('/login');

                }

            });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditController
     * @description
     * # SiteEditController
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('SiteLocationController',
            function(Account, environment, $http, leafletData, leafletBoundsHelpers, $location,
                Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, $timeout,
                $interval, user, Shapefile, Utility, Task) {

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

                    var siteGeometry = L.geoJson(data, {});

                    addNonGroupLayers(siteGeometry, self.editableLayers);

                    self.savedObjects = [{
                        id: self.editableLayers._leaflet_id,
                        geoJson: data
                    }];

                    console.log('self.savedObjects', self.savedObjects);

                };

                self.fetchTasks = function(taskId) {

                    if (taskId &&
                        typeof taskId === 'number') {

                        return Task.get({
                            id: taskId
                        }).$promise.then(function(response) {

                            console.log('Task.get response', response);

                            if (response.status &&
                                response.status === 'complete') {

                                self.hideTasks();

                            }

                        });

                    } else {

                        return Site.tasks({
                            id: $route.current.params.siteId
                        }).$promise.then(function(response) {

                            console.log('Task.get response', response);

                            self.pendingTasks = response.features;

                            if (self.pendingTasks.length < 1) {

                                self.hideTasks();

                            }

                        });

                    }

                };

                self.hideTasks = function() {

                    self.pendingTasks = [];

                    if (typeof self.taskPoll !== 'undefined') {

                        $interval.cancel(self.taskPoll);

                    }

                    self.loadFeature();

                };

                self.uploadShapefile = function() {

                    if (!self.fileImport ||
                        !self.fileImport.length) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Please select a file.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        return false;

                    }

                    self.progressMessage = 'Uploading your file...';

                    var fileData = new FormData();

                    fileData.append('file', self.fileImport[0]);

                    fileData.append('feature_type', 'site');

                    fileData.append('feature_id', self.site.id);

                    console.log('fileData', fileData);

                    console.log('Shapefile', Shapefile);

                    try {

                        Shapefile.upload({}, fileData, function(successResponse) {

                            console.log('successResponse', successResponse);

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Upload complete. Processing data...',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                            if (successResponse.task) {

                                self.pendingTasks = [
                                    successResponse.task
                                ];

                            }

                            self.taskPoll = $interval(function() {

                                self.fetchTasks(successResponse.task.id);

                            }, 1000);

                        }, function(errorResponse) {

                            console.log('Upload error', errorResponse);

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'The file could not be processed.',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                        });

                    } catch (error) {

                        console.log('Shapefile upload error', error);

                    }

                };

                self.scrubFeature = function(feature) {

                    var excludedKeys = [
                        'allocations',
                        'creator',
                        'counties',
                        'dashboards',
                        'extent',
                        'geographies',
                        // 'geometry',
                        'last_modified_by',
                        'members',
                        'metrics',
                        'metric_types',
                        'organization',
                        'partners',
                        'partnerships',
                        'practices',
                        'practice_types',
                        'program',
                        'project',
                        'reports',
                        'sites',
                        'status',
                        'tags',
                        'tasks',
                        'watersheds',
                        'users'
                    ];

                    var reservedProperties = [
                        'links',
                        'permissions',
                        '$promise',
                        '$resolved'
                    ];

                    excludedKeys.forEach(function(key) {

                        if (feature.properties) {

                            delete feature.properties[key];

                        } else {

                            delete feature[key];

                        }

                    });

                    reservedProperties.forEach(function(key) {

                        delete feature[key];

                    });

                };

                self.saveSite = function() {

                    self.scrubFeature(self.site);

                    if (self.savedObjects.length) {

                        self.savedObjects.forEach(function(object) {

                            console.log('Iterating self.savedObjects', object);

                            if (object.geoJson.geometry &&
                                typeof object.geoJson.geometry !== 'undefined') {

                                self.site.geometry = object.geoJson.geometry;

                            }

                        });

                    } else {

                        self.site.geometry = {
                            type: 'Point',
                            coordinates: [-98.5795,
                                39.828175
                            ]
                        };

                    }

                    self.status.processing = true;

                    Site.update({
                        id: self.site.id
                    }, self.site).then(function(successResponse) {

                        self.status.processing = false;

                        self.site = successResponse;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Site location saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                    }).catch(function(errorResponse) {

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

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this site.',
                            'prompt': 'OK'
                        }];

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
                leafletData.getMap('site--map').then(function(map) {

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

                    map.addControl(drawControls);

                    var drawnItems = drawControls.options.edit.featureGroup;

                    // Init the map with the saved elements
                    var printLayers = function() {
                        // console.log("After: ");
                        map.eachLayer(function(layer) {
                            console.log('Existing layer', layer);
                        });
                    };

                    drawnItems.addTo(map);
                    printLayers();

                    map.on('draw:created', function(e) {

                        var layer = e.layer;

                        //
                        // Sites must only have one geometry feature
                        //

                        drawnItems.clearLayers();
                        drawnItems.addLayer(layer);
                        console.log('Layer added', JSON.stringify(layer.toGeoJSON()));

                        self.savedObjects = [{
                            id: layer._leaflet_id,
                            geoJson: layer.toGeoJSON()
                        }];

                        // map.fitBounds(drawnItems.getBounds(), {
                        //     padding: [20, 20],
                        //     maxZoom: 18
                        // });

                    });

                    map.on('draw:edited', function(e) {

                        var layers = e.layers;

                        console.log('map.draw:edited', layers);

                        // self.savedObjects = [{
                        //     id: layers[0]._leaflet_id,
                        //     geoJson: layers[0].toGeoJSON()
                        // }];

                        // console.log('Layer changed', JSON.stringify(layers[0].toGeoJSON()));

                        layers.eachLayer(function(layer) {

                            self.savedObjects = [{
                                id: layer._leaflet_id,
                                geoJson: layer.toGeoJSON()
                            }];

                            // for (var i = 0; i < self.savedObjects.length; i++) {
                            //     if (self.savedObjects[i].id == layer._leaflet_id) {
                            //         console.log('draw:edited layer match', self.savedObjects[i].id, layer._leaflet_id);
                            //         self.savedObjects[i].geoJson = layer.toGeoJSON();
                            //     }
                            // }

                            console.log('Layer changed', layer._leaflet_id, JSON.stringify(layer.toGeoJSON()));

                        });

                        // map.fitBounds(drawnItems.getBounds(), {
                        //     padding: [20, 20],
                        //     maxZoom: 18
                        // });

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

                self.loadFeature = function() {

                    Site.get({
                        id: $route.current.params.siteId,
                        format: 'geojson'
                    }).$promise.then(function(successResponse) {

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

                        $rootScope.page.title = self.site.name;

                        //
                        // If a valid site geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.site.geometry !== null &&
                            typeof self.site.geometry !== 'undefined') {

                            leafletData.getMap('site--map').then(function(map) {

                                var siteExtent = new L.FeatureGroup();

                                var siteGeometry = L.geoJson(successResponse, {});

                                siteExtent.addLayer(siteGeometry);

                                map.fitBounds(siteExtent.getBounds(), {
                                    maxZoom: 18
                                });

                                self.setGeoJsonLayer(self.site.geometry);

                            });

                        }

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

                        self.loadFeature();

                        self.fetchTasks();

                    });

                } else {

                    $location.path('/logout');

                }

            });

}());
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeEditController', function(Account, Image, leafletData, $location, $log, Map,
        mapbox, Media, Practice, practice, $q, $rootScope, $route, $scope, site, user) {

        var self = this,
            projectId = $route.current.params.projectId,
            siteId = $route.current.params.siteId;

        self.files = Media;
        self.files.images = [];

        self.map = Map;

        var southWest = L.latLng(25.837377, -124.211606),
            northEast = L.latLng(49.384359, -67.158958),
            bounds = L.latLngBounds(southWest, northEast);

        console.log('United States bounds', bounds);

        self.savedObjects = [];

        self.map.bounds = bounds;

        self.editableLayers = new L.FeatureGroup();

        function addNonGroupLayers(sourceLayer, targetGroup) {
            if (sourceLayer instanceof L.LayerGroup) {
                sourceLayer.eachLayer(function(layer) {
                    addNonGroupLayers(layer, targetGroup);
                });
            } else {
                targetGroup.addLayer(sourceLayer);
            }
        }

        // self.map = Map;

        // self.map.layers.overlays = {
        //     draw: {
        //         name: 'draw',
        //         type: 'group',
        //         visible: true,
        //         layerParams: {
        //             showOnSelector: false
        //         }
        //     }
        // };

        // self.controls = {
        //     draw: {}
        // };
        //
        // We use this function for handle any type of geographic change, whether
        // through the map or through the fields
        //
        self.processPin = function(coordinates, zoom) {

            if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
                return;
            }

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

        self.removeImage = function(image) {

            if (self.practice.properties.images.length !== 0) {
                var _image_index = self.practice.properties.images.indexOf(image);
                self.practice.properties.images.splice(_image_index, 1);
            }

            return;
        }

        $rootScope.page = {};

        practice.$promise.then(function(successResponse) {

            self.practice = successResponse;

            self.map = {
                defaults: {
                    scrollWheelZoom: false,
                    zoomControl: false,
                    maxZoom: 18
                },
                bounds: bounds,
                center: {
                    lat: 39.828175,
                    lng: -98.5795,
                    zoom: 4
                },
                layers: {
                    baselayers: {
                        basemap: {
                            name: 'Satellite Imagery',
                            url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.satellite + '/{z}/{x}/{y}.png',
                            type: 'xyz',
                            layerOptions: {
                                attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
                            }
                        }
                    }
                }
            };

            //
            // If a valid practice geometry is present, add it to the map
            // and track the object in `self.savedObjects`.
            //

            if (self.practice.geometry !== null &&
                typeof self.practice.geometry !== 'undefined') {

                var practiceGeometry = L.geoJson(self.practice.geometry, {});

                addNonGroupLayers(practiceGeometry, self.editableLayers);

                self.savedObjects = [{
                    id: self.editableLayers._leaflet_id,
                    geoJson: self.practice.geometry
                }];

                console.log('self.savedObjects', self.savedObjects);

                var rawGeometry = self.practice.geometry.geometries[0];

                console.log('rawGeometry', rawGeometry);

            }

            site.$promise.then(function(successResponse) {
                self.site = successResponse;

                $rootScope.page.title = self.practice.properties.practice_type;
                $rootScope.page.links = [{
                        text: 'Projects',
                        url: '/projects'
                    },
                    {
                        text: self.site.properties.project.properties.name,
                        url: '/projects/' + projectId
                    },
                    {
                        text: self.site.properties.name,
                        url: '/projects/' + projectId + '/sites/' + siteId
                    },
                    {
                        text: self.practice.properties.practice_type,
                        url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id
                    },
                    {
                        text: 'Edit',
                        url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id + '/edit',
                        type: 'active'
                    }
                ];
            }, function(errorResponse) {
                //
            });

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
                        can_edit: true
                    };
                });
            }
        });

        self.savePractice = function() {

            self.practice.geometry = {
                type: 'GeometryCollection',
                geometries: []
            };

            if (self.savedObjects.length) {

                self.savedObjects.forEach(function(object) {

                    console.log('Iterating self.savedObjects', object);

                    if (object.geoJson.geometry) {

                        self.practice.geometry.geometries.push(object.geoJson.geometry);

                    } else {

                        self.practice.geometry = object.geoJson;

                    }

                });

            } else {

                self.practice.geometry.geometries.push({
                    type: 'Point',
                    coordinates: [-98.5795,
                        39.828175
                    ]
                });

            }

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
                        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
                    }, function(errorResponse) {
                        // Error message
                    });

                }, function(errorResponse) {
                    $log.log('errorResponse', errorResponse);
                });

            } else {
                self.practice.$update().then(function(successResponse) {
                    $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
                }, function(errorResponse) {
                    // Error message
                });
            }
        };

        self.deletePractice = function() {
            self.practice.$delete().then(function(successResponse) {
                $location.path('/projects/' + projectId + '/sites/' + siteId);
            }, function(errorResponse) {
                // Error message
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

        //
        // Define our map interactions via the Angular Leaflet Directive
        //
        leafletData.getMap('practice--map').then(function(map) {

            //
            // Add draw toolbar
            //

            var drawControls = new L.Control.Draw({
                draw: {},
                edit: {
                    featureGroup: self.editableLayers
                }
            });

            console.log('drawControls', drawControls);

            map.addControl(drawControls);

            var drawnItems = drawControls.options.edit.featureGroup;

            // map.fitBounds(self.editableLayers.getBounds());

            // if (drawnItems.getLayers().length > 1) {

            //     map.fitBounds(drawnItems.getBounds());

            // }

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

            // leafletData.getLayers().then(function(baselayers) {
            //     var drawnItems = baselayers.overlays.draw;
            //     map.on('draw:created', function(e) {
            //         var layer = e.layer;
            //         drawnItems.addLayer(layer);
            //         console.log(JSON.stringify(layer.toGeoJSON()));
            //     });
            // });

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

    });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeEditController', function(Account, Image, leafletData, $location, $log, Map, mapbox, Media, Practice, practice, $q, $rootScope, $route, $scope, site, user) {

        var self = this,
            projectId = $route.current.params.projectId,
            siteId = $route.current.params.siteId;

        self.files = Media;
        self.files.images = [];

        self.map = Map;

        self.map.layers.overlays = {
            draw: {
                name: 'draw',
                type: 'group',
                visible: true,
                layerParams: {
                    showOnSelector: false
                }
            }
        };

        self.controls = {
            draw: {}
        };
        //
        // We use this function for handle any type of geographic change, whether
        // through the map or through the fields
        //
        self.processPin = function(coordinates, zoom) {

            if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
                return;
            }

            //
            // Move the map pin/marker and recenter the map on the new location
            //
            self.map.markers = {
                reportGeometry: {
                    lng: coordinates.lng,
                    lat: coordinates.lat,
                    focus: false,
                    draggable: true
                }
            };

            // //
            // // Update the coordinates for the Report
            // //
            self.practice.geometry = {
                type: 'GeometryCollection',
                geometries: []
            };
            self.practice.geometry.geometries.push({
                type: 'Point',
                coordinates: [
                    coordinates.lng,
                    coordinates.lat
                ]
            });

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
        // $scope.$watch(angular.bind(this, function() {
        //     return this.geocode.response;
        // }), function(response) {

        //     //
        //     // Only execute the following block of code if the user has geocoded an
        //     // address. This block of code expects this to be a single feature from a
        //     // Carmen GeoJSON object.
        //     //
        //     // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
        //     //
        //     if (response) {

        //         self.processPin({
        //             lat: response.geometry.coordinates[1],
        //             lng: response.geometry.coordinates[0]
        //         }, 16);

        //         self.geocode = {
        //             query: null,
        //             response: null
        //         };
        //     }

        // });


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
                    maxZoom: 19
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
                },
                center: {
                    lat: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[1] : 38.362,
                    lng: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[0] : -81.119,
                    zoom: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? 16 : 6
                },
                markers: {
                    LandRiverSegment: {
                        lat: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[1] : 38.362,
                        lng: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[0] : -81.119,
                        focus: false,
                        draggable: true
                    }
                }
            };

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
        leafletData.getMap().then(function(map) {

            leafletData.getLayers().then(function(baselayers) {
                var drawnItems = baselayers.overlays.draw;
                map.on('draw:created', function(e) {
                    var layer = e.layer;
                    drawnItems.addLayer(layer);
                    console.log(JSON.stringify(layer.toGeoJSON()));
                });
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

    });
'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewController
 * @description
 * # ProjectviewController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
    .controller('ProjectSummaryController',
        function(Account, Notifications, $rootScope, Project, $routeParams,
            $scope, $location, Map, MapPreview, mapbox, Site, user, $window,
            leafletData, leafletBoundsHelpers, $timeout, Practice, project,
            sites, Utility, $interval, LayerService) {

            var self = this;

            $rootScope.viewState = {
                'project': true
            };

            $rootScope.toolbarState = {
                'dashboard': true
            };

            $rootScope.page = {};

            self.map = {};

            self.previewMap = JSON.parse(JSON.stringify(MapPreview));

            console.log('self.map', self.map);

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path('/projects');

            }

            self.status = {
                loading: true
            };

            self.print = function() {

                $window.print();

            };

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                    $timeout(function() {

                        self.createMap();

                    }, 500);

                }, 1000);

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

            //
            // Assign project to a scoped variable
            //
            self.loadProject = function() {

                project.$promise.then(function(successResponse) {

                    console.log('self.project', successResponse);

                    var project_ = successResponse;

                    if (!successResponse.permissions.read &&
                        !successResponse.permissions.write) {

                        self.makePrivate = true;

                    } else {

                        self.permissions.can_edit = successResponse.permissions.write;
                        self.permissions.can_delete = successResponse.permissions.write;

                        if (project_.extent) {

                            project_.staticURL = self.buildStaticMapURL(project_.extent);

                        }

                        self.project = project_;

                        $rootScope.page.title = 'Project Summary';

                        // leafletData.getMap('project--map').then(function(map) {

                        //     var southWest = L.latLng(25.837377, -124.211606),
                        //         northEast = L.latLng(49.384359, -67.158958),
                        //         bounds = L.latLngBounds(southWest, northEast);

                        //     self.projectExtent = new L.FeatureGroup();

                        //     if (self.project.extent) {

                        //         self.setGeoJsonLayer(self.project.extent, self.projectExtent);

                        //         map.fitBounds(self.projectExtent.getBounds(), {
                        //             maxZoom: 18
                        //         });

                        //     } else {

                        //         map.fitBounds(bounds, {
                        //             maxZoom: 18
                        //         });

                        //     }

                        // });

                        self.loadMetrics();

                        self.loadSites();

                        self.loadTags();

                        self.loadArea();

                        // self.fetchLayers();

                    }

                    self.showElements();

                }).catch(function(errorResponse) {

                    console.log('loadProject.errorResponse', errorResponse);

                    self.showElements();

                });

            };

            self.createSite = function() {

                self.site = new Site({
                    'project_id': self.project.id,
                    'organization_id': self.project.organization_id
                });

                self.site.$save(function(successResponse) {

                    $location.path('/sites/' + successResponse.id + '/edit');

                }, function(errorResponse) {

                    console.error('Unable to create your site, please try again later');

                });

            };

            self.confirmDelete = function(obj, targetCollection) {

                console.log('self.confirmDelete', obj, targetCollection);

                if (self.deletionTarget &&
                    self.deletionTarget.collection === 'project') {

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

                var targetCollection,
                    targetId;

                switch (featureType) {

                    case 'practice':

                        targetCollection = Practice;

                        break;

                    case 'site':

                        targetCollection = Site;

                        break;

                    default:

                        targetCollection = Project;

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
                        featureType === 'site') {

                        self.sites.splice(index, 1);

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
                            'msg': 'Unable to delete “' + self.deletionTarget.feature.name + '”. There are pending tasks affecting this ' + featureType + '.',
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

            self.loadSites = function() {

                sites.$promise.then(function(successResponse) {

                    console.log('Project sites', successResponse);

                    successResponse.features.forEach(function(feature) {

                        if (feature.geometry) {

                            feature.staticURL = self.buildStaticMapURL(feature.geometry);

                            feature.geojson = self.buildFeature(feature.geometry);

                            feature.bounds = self.transformBounds(feature.properties);

                        }

                    });

                    self.sites = successResponse.features;

                    // 
                    // TODO: Add sites to GL map
                    // 

                    // leafletData.getMap('project--map').then(function(map) {

                    //     self.projectExtent.clearLayers();

                    //     self.sites.forEach(function(feature) {

                    //         if (feature.geometry) {

                    //             self.setGeoJsonLayer(feature.geometry, self.projectExtent);

                    //         }

                    //     });

                    //     map.fitBounds(self.projectExtent.getBounds(), {
                    //         maxZoom: 18
                    //     });

                    //     self.projectExtent.addTo(map);

                    // });

                }, function(errorResponse) {

                    console.log('loadSites.errorResponse', errorResponse);

                });

            };

            self.loadTags = function() {

                Project.tags({
                    id: self.project.id
                }).$promise.then(function(successResponse) {

                    console.log('Project.tags', successResponse);

                    successResponse.features.forEach(function(tag) {

                        if (tag.color &&
                            tag.color.length) {

                            tag.lightColor = tinycolor(tag.color).lighten(5).toString();

                        }

                    });

                    self.tags = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            self.loadArea = function() {

                Project.area({
                    id: self.project.id
                }).$promise.then(function(successResponse) {

                    console.log('Project.area', successResponse);

                    self.area = successResponse.area;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

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

                if (Array.isArray(obj.bounds.coordinates[0])) {

                    obj.bounds.coordinates[0].forEach(function(coords) {

                        xRange.push(coords[0]);

                        yRange.push(coords[1]);

                    });

                    // 
                    // Add padding to bounds coordinates
                    // 

                    southWest = [
                        Math.min.apply(null, yRange) - 0.001,
                        Math.min.apply(null, xRange) - 0.001
                    ];

                    northEast = [
                        Math.max.apply(null, yRange) + 0.001,
                        Math.max.apply(null, xRange) + 0.001
                    ];

                    bounds = leafletBoundsHelpers.createBoundsFromArray([
                        southWest,
                        northEast
                    ]);

                } else {

                    // 
                    // Add padding to bounds coordinates
                    // 

                    southWest = [
                        obj.bounds.coordinates[1] - 0.001,
                        obj.bounds.coordinates[0] - 0.001
                    ];

                    northEast = [
                        obj.bounds.coordinates[1] + 0.001,
                        obj.bounds.coordinates[0] + 0.001
                    ];

                    bounds = leafletBoundsHelpers.createBoundsFromArray([
                        southWest,
                        northEast
                    ]);

                }

                return bounds;

            };

            self.processCollection = function(arr) {

                arr.forEach(function(feature) {

                    if (feature.geometry !== null) {

                        feature.geojson = self.buildFeature(feature.geometry);

                        feature.bounds = self.transformBounds(feature);

                    }

                });

            };

            self.fetchLayers = function(taskId) {

                LayerService.collection({
                    program: self.project.program_id
                }).$promise.then(function(successResponse) {

                    console.log(
                        'self.fetchLayers --> successResponse',
                        successResponse);

                    // self.layers = successResponse.features;

                    if (successResponse.features.length) {

                        console.log('self.fetchLayers --> Sorting layers.');

                        successResponse.features.sort(function(a, b) {

                            return b.index < a.index;

                        });

                    }

                    successResponse.features.forEach(function(feature) {

                        console.log(
                            'self.fetchLayers --> feature',
                            feature);

                        var spec = feature.layer_spec || {};

                        console.log(
                            'self.fetchLayers --> spec',
                            spec);

                        feature.spec = JSON.parse(spec);

                        console.log(
                            'self.fetchLayers --> feature.spec',
                            feature.spec);

                        if (feature.spec.id) {

                            try {

                                self.map.addLayer(feature.spec);

                            } catch (error) {

                                console.log(
                                    'self.fetchLayers --> error',
                                    error);

                            }

                        }

                        feature.selected = false;

                    });

                    // if (successResponse.features.length) {

                    //     console.log('self.fetchLayers --> Sorting layers.');

                    //     successResponse.features.sort(function(a, b) {

                    //         return b.index < a.index;

                    //     });

                    // }

                    self.layers = successResponse.features;

                    console.log(
                        'self.fetchLayers --> self.layers',
                        self.layers);

                    // self.layers.forEach(function(feature) {

                    //     var spec = JSON.parse(feature.layer_spec);

                    //     self.map.addLayer(spec);

                        // self.map.addLayer({
                        //     'id': 'terrain-data', // layerId
                        //     'type': 'line', // layerType
                        //     'source': {
                        //         type: 'vector',
                        //         url: 'mapbox://mapbox.mapbox-terrain-v2'
                        //     }, // source
                        //     'source-layer': 'contour', // sourceLayer
                        //     'layout': {
                        //         'line-join': 'round',
                        //         'line-cap': 'round'
                        //     }, // layout
                        //     'paint': {
                        //         'line-color': '#ff69b4',
                        //         'line-width': 1
                        //     } // paint
                        // });

                    // });

                    // leafletData.getMap().then(function(map) {

                    //     var layerIndex = {};

                    //     L.mapbox.accessToken = 'pk.eyJ1IjoiZmllbGRkb2MiLCJhIjoiY2p1MW8zOHNyMDNwZTQ0bXlhMjNxaXVpMSJ9.0tUMQt2s0zd6DAthnmJItg';

                    //     self.layers.forEach(function(layer) {

                    //         console.log(
                    //             'self.fetchLayers --> Add layer:',
                    //             layer);

                    //         if (layer.tileset_url &&
                    //             layer.api_token) {

                    //             var layerId = 'layer-' + layer.id;

                    //             layerIndex[layer.name] = L.mapbox.styleLayer(layer.style_url);

                    //             console.log(
                    //                 'Practice.layers --> Added layer with id:',
                    //                 layerId);

                    //         }

                    //     });

                    //     L.control.layers({
                    //         'Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11').addTo(map),
                    //         'Satellite': L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11'),
                    //         'Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
                    //     }, layerIndex).addTo(map);

                    // });

                }, function(errorResponse) {

                    console.log(
                        'self.fetchLayers --> errorResponse',
                        errorResponse);

                });

            };

            self.loadMetrics = function() {

                Project.progress({
                    id: self.project.id
                }).$promise.then(function(successResponse) {

                    console.log('Project metrics', successResponse);

                    Utility.processMetrics(successResponse.features);

                    self.metrics = Utility.groupByModel(successResponse.features);

                    console.log('self.metrics', self.metrics);

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

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

            self.populateMap = function(map, feature) {

                console.log('self.populateMap --> feature', feature);

                if (feature.extent !== null &&
                    typeof feature.extent !== 'undefined') {

                    var bounds = turf.bbox(feature.extent);

                    map.fitBounds(bounds, {
                        padding: 40
                    });

                }

            };

            self.toggleLayer = function(layer) {

                console.log('self.toggleLayer --> layer', layer);

                var layerId = layer.spec.id;

                var visibility = self.map.getLayoutProperty(layerId, 'visibility');

                if (visibility === 'visible') {

                    self.map.setLayoutProperty(layerId, 'visibility', 'none');

                } else {

                    self.map.setLayoutProperty(layerId, 'visibility', 'visible');

                }

                // if (layer.style_url) {

                //     self.map.addSource(layer.source_id, {
                //         type: layer.source_type,
                //         url: layer.source_url
                //     });

                // }

            };

            self.switchMapStyle = function(styleId, index) {

                console.log('self.switchMapStyle --> styleId', styleId);

                console.log('self.switchMapStyle --> index', index);

                self.map.setStyle(self.mapStyles[index].url);

            };

            self.createMap = function() {

                console.log('self.createMap --> Starting...');

                // var tgt = document.getElementById('project--map');

                var tgt = document.querySelector('.map');

                console.log(
                    'self.createMap --> tgt',
                    tgt);

                self.mapStyles = mapbox.baseStyles;

                console.log(
                    'self.createMap --> mapStyles',
                    self.mapStyles);

                self.activeStyle = 0;

                mapboxgl.accessToken = mapbox.accessToken;

                console.log(
                    'self.createMap --> accessToken',
                    mapboxgl.accessToken);

                var options = JSON.parse(JSON.stringify(mapbox.defaultOptions));

                options.container = 'project--map';

                options.style = self.mapStyles[0].url;

                console.log('self.createMap --> options', options);

                self.map = new mapboxgl.Map(options);

                self.map.on('load', function() {

                    var nav = new mapboxgl.NavigationControl();

                    self.map.addControl(nav, 'top-left');

                    var fullScreen = new mapboxgl.FullscreenControl();

                    self.map.addControl(fullScreen, 'top-left');

                    self.populateMap(self.map, self.project);

                    self.fetchLayers();

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
                        can_edit: false,
                        is_manager: false,
                        is_admin: false
                    };

                    self.loadProject();

                });

            }

        });
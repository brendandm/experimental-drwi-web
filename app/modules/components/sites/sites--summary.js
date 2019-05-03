(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteSummaryController
     * @description
     */
    angular.module('FieldDoc')
        .controller('SiteSummaryController',
            function(Account, $location, $window, $timeout, Practice, $rootScope, $scope,
                $route, nodes, user, Utility, site, Map, MapPreview, mapbox, leafletData,
                leafletBoundsHelpers, Site, Project, practices, $interval, LayerService) {

                var self = this;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.previewMap = JSON.parse(JSON.stringify(MapPreview));

                self.status = {
                    loading: true,
                    processing: false
                };

                self.print = function() {

                    $window.print();

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

                        $rootScope.page.title = self.site.name;

                        self.project = successResponse.project;

                        console.log('self.project', self.project);

                        //
                        // Load practices
                        //

                        practices.$promise.then(function(successResponse) {

                            // console.log('self.practices', successResponse);

                            successResponse.features.forEach(function(feature) {

                                if (feature.geometry) {

                                    feature.geojson = self.buildFeature(feature.geometry);

                                    feature.bounds = self.transformBounds(feature.properties);

                                    // var styledFeature = {
                                    //     "type": "Feature",
                                    //     "geometry": feature.geometry,
                                    //     "properties": {
                                    //         "marker-size": "small",
                                    //         "marker-color": "#2196F3",
                                    //         "stroke": "#2196F3",
                                    //         "stroke-opacity": 1.0,
                                    //         "stroke-width": 2,
                                    //         "fill": "#2196F3",
                                    //         "fill-opacity": 0.5
                                    //     }
                                    // };

                                    // // Build static map URL for Mapbox API

                                    // var staticURL = 'https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                                    // feature.staticURL = staticURL;

                                }

                            });

                            self.practices = successResponse.features;

                            console.log('self.practices', successResponse);

                        }, function(errorResponse) {

                        });

                        //
                        // If a valid site geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.site.geometry !== null &&
                            typeof self.site.geometry !== 'undefined') {

                            leafletData.getMap('site--map').then(function(map) {

                                self.siteExtent = new L.FeatureGroup();

                                self.setGeoJsonLayer(self.site.geometry, self.siteExtent);

                                map.fitBounds(self.siteExtent.getBounds(), {
                                    maxZoom: 18
                                });

                            });

                            self.map.geojson = {
                                data: self.site.geometry
                            };

                        }

                        self.loadMetrics();

                        self.loadTags();

                        self.fetchLayers();

                        self.showElements();

                    });

                };

                self.createPractice = function() {

                    self.practice = new Practice({
                        'practice_type': 'Custom',
                        'site_id': self.site.id,
                        'project_id': self.site.project.id,
                        'organization_id': self.site.organization_id
                    });

                    self.practice.$save(function(successResponse) {

                        $location.path('/practices/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('Unable to create your practice, please try again later');

                    });

                };

                self.loadTags = function() {

                    Site.tags({
                        id: self.site.id
                    }).$promise.then(function(successResponse) {

                        console.log('Site.tags', successResponse);

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

                // self.processCollection = function(arr) {

                //     arr.forEach(function(feature) {

                //         if (feature.geometry !== null) {

                //             // feature.staticURL = self.buildStaticMapURL(feature.geometry);

                //             feature.geojson = self.buildFeature(feature.geometry);

                //             feature.bounds = self.transformBounds(feature);

                //         }

                //     });

                // };

                self.fetchLayers = function(taskId) {

                    LayerService.collection({
                        program: self.project.program_id
                    }).$promise.then(function(successResponse) {

                        console.log(
                            'self.fetchLayers --> successResponse',
                            successResponse);

                        self.layers = successResponse.features;

                        if (self.layers.length) {

                            console.log('self.fetchLayers --> Create overlays object.');

                            self.layers.sort(function(a, b) {

                                return b.index < a.index;

                            });

                        }

                        leafletData.getMap().then(function(map) {

                            console.log(
                                'self.fetchLayers --> map',
                                map);

                            var layerIndex = {};

                            L.mapbox.accessToken = 'pk.eyJ1IjoiZmllbGRkb2MiLCJhIjoiY2p1MW8zOHNyMDNwZTQ0bXlhMjNxaXVpMSJ9.0tUMQt2s0zd6DAthnmJItg';

                            self.layers.forEach(function(layer) {

                                console.log(
                                    'self.fetchLayers --> Add layer:',
                                    layer);

                                if (layer.tileset_url &&
                                    layer.api_token) {

                                    var layerId = 'layer-' + layer.id;

                                    layerIndex[layer.name] = L.mapbox.styleLayer(layer.style_url);

                                    console.log(
                                        'self.fetchLayers --> Added layer with id:',
                                        layerId);

                                }

                            });

                            console.log(
                                'self.fetchLayers --> layerIndex',
                                layerIndex);

                            L.control.layers({
                                'Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11').addTo(map),
                                'Satellite': L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11'),
                                'Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
                            }, layerIndex).addTo(map);

                        });

                    }, function(errorResponse) {

                        console.log(
                            'self.fetchLayers --> errorResponse',
                            errorResponse);

                    });

                };

                self.loadMetrics = function() {

                    Site.progress({
                        id: self.site.id
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

                        self.loadSite();

                    });

                }

            });

})();
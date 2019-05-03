(function() {

    'use strict';

    /**
     * @ngdoc function 
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomSummaryController', [
            'Account',
            '$location',
            '$timeout',
            '$log',
            'Report',
            '$rootScope',
            '$route',
            'Utility',
            'user',
            'Project',
            'Site',
            '$window',
            'Map',
            'mapbox',
            'leafletData',
            'leafletBoundsHelpers',
            'Practice',
            'practice',
            'LayerService',
            function(Account, $location, $timeout, $log, Report, $rootScope,
                $route, Utility, user, Project, Site, $window, Map, mapbox,
                leafletData, leafletBoundsHelpers, Practice, practice,
                LayerService) {

                var self = this,
                    practiceId = $route.current.params.practiceId;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.status = {
                    loading: true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.practice.links.site.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'practice') {

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

                    var targetCollection;

                    switch (featureType) {

                        case 'report':

                            targetCollection = Report;

                            break;

                        default:

                            targetCollection = Practice;

                            break;

                    }

                    targetCollection.delete({
                        id: +self.deletionTarget.feature.id
                    }).$promise.then(function(data) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'report') {

                            self.reports.splice(index, 1);

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

                            if (index === 0) {

                                $route.reload();

                            }

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete this ' + featureType + '. There are pending tasks affecting this feature.',
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

                self.loadReports = function() {

                    Practice.reports({
                        id: self.practice.id
                    }).$promise.then(function(successResponse) {

                        console.log('self.practice', successResponse);

                        self.reports = successResponse.features;

                        self.status.loading = false;

                    }, function(errorResponse) {

                        self.status.loading = false;

                    });

                };

                self.loadPractice = function() {

                    practice.$promise.then(function(successResponse) {

                        console.log('self.practice', successResponse);

                        self.practice = successResponse;

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                            return;

                        }

                        self.permissions.can_edit = successResponse.permissions.write;
                        self.permissions.can_delete = successResponse.permissions.write;

                        $rootScope.page.title = self.practice.name ? self.practice.name : 'Un-named Practice';

                        //
                        // If a valid practice geometry is present, add it to the map
                        // and track the object in `self.savedObjects`.
                        //

                        if (self.practice.geometry !== null &&
                            typeof self.practice.geometry !== 'undefined') {

                            leafletData.getMap('practice--map').then(function(map) {

                                self.practiceExtent = new L.FeatureGroup();

                                self.setGeoJsonLayer(self.practice.geometry, self.practiceExtent);

                                map.fitBounds(self.practiceExtent.getBounds(), {
                                    maxZoom: 18
                                });

                            });

                            self.map.geojson = {
                                data: self.practice.geometry
                            };

                        }

                        self.status.loading = false;

                        self.loadReports();

                        self.loadMetrics();

                        self.loadTags();

                        self.fetchLayers();

                        // self.loadModel();

                    }, function(errorResponse) {

                        self.status.loading = false;

                    });

                };

                self.addReading = function(measurementPeriod) {

                    var newReading = new Report({
                        'measurement_period': 'Installation',
                        'report_date': new Date(),
                        'practice_id': practiceId,
                        'organization_id': self.practice.organization_id
                    });

                    newReading.$save().then(function(successResponse) {

                        $location.path('/reports/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                };

                self.loadTags = function() {

                    Practice.tags({
                        id: self.practice.id
                    }).$promise.then(function(successResponse) {

                        console.log('Practice.tags', successResponse);

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

                self.loadModel = function() {

                    Practice.model({
                        id: self.practice.id
                    }).$promise.then(function(successResponse) {

                        console.log('Practice model successResponse', successResponse);

                    }, function(errorResponse) {

                        console.log('Practice model errorResponse', errorResponse);

                    });

                };

                self.loadMetrics = function() {

                    Practice.progress({
                        id: self.practice.id
                    }).$promise.then(function(successResponse) {

                        console.log('Practice metrics', successResponse);

                        Utility.processMetrics(successResponse.features);

                        self.metrics = Utility.groupByModel(successResponse.features);

                        console.log('self.metrics', self.metrics);

                    }, function(errorResponse) {

                        console.log('Practice metrics errorResponse', errorResponse);

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

                self.fetchLayers = function(taskId) {

                    LayerService.collection({
                        program: self.practice.project.program_id
                    }).$promise.then(function(successResponse) {

                        console.log(
                            'Practice.layers --> successResponse',
                            successResponse);

                        self.layers = successResponse.features;

                        if (self.layers.length) {

                            console.log('Practice.layers --> Create overlays object.');

                            self.layers.sort(function(a, b) {

                                return b.index < a.index;

                            });

                        }

                        leafletData.getMap().then(function(map) {

                            var layerIndex = {};

                            L.mapbox.accessToken = 'pk.eyJ1IjoiZmllbGRkb2MiLCJhIjoiY2p1MW8zOHNyMDNwZTQ0bXlhMjNxaXVpMSJ9.0tUMQt2s0zd6DAthnmJItg';

                            self.layers.forEach(function(layer) {

                                console.log(
                                    'Practice.layers --> Add layer:',
                                    layer);

                                if (layer.tileset_url &&
                                    layer.api_token) {

                                    var layerId = 'layer-' + layer.id;

                                    layerIndex[layer.name] = L.mapbox.styleLayer(layer.style_url);

                                    console.log(
                                        'Practice.layers --> Added layer with id:',
                                        layerId);

                                }

                            });

                            L.control.layers({
                                'Streets': L.mapbox.styleLayer('mapbox://styles/mapbox/streets-v11').addTo(map),
                                'Satellite': L.mapbox.styleLayer('mapbox://styles/mapbox/satellite-streets-v11'),
                                'Outdoors': L.mapbox.styleLayer('mapbox://styles/mapbox/outdoors-v11')
                            }, layerIndex).addTo(map);

                        });

                    }, function(errorResponse) {

                        console.log(
                            'Practice.layers --> errorResponse',
                            errorResponse);

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

                        self.loadPractice();

                    });
                }

            }
        ]);

}());
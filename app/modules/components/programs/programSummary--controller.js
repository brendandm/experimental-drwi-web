(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('ProgramSummaryController', [
            'Account',
            '$location',
            '$timeout',
            '$log',
            '$rootScope',
            '$route',
            'Utility',
            'user',
            '$window',
            'Map',
            'mapbox',
            'leafletData',
            'leafletBoundsHelpers',
            'Program',
            'Project',
            'program',
            function(Account, $location, $timeout, $log, $rootScope,
                $route, Utility, user, $window, Map, mapbox, leafletData,
                leafletBoundsHelpers, Program, Project, program) {

                var self = this;

                self.programId = $route.current.params.programId;

                $rootScope.viewState = {
                    'program': true
                };

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(Map));

                self.map.markers = {};

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

                self.map.layers.overlays = {
                    projects: {
                        type: 'group',
                        name: 'projects',
                        visible: true,
                        layerOptions: {
                            showOnSelector: false
                        },
                        layerParams: {
                            showOnSelector: false
                        }
                    }
                };

                // self.map.defaults = {
                //     // doubleClickZoom: false,
                //     // dragging: false,
                //     // keyboard: false,
                //     scrollWheelZoom: false,
                //     // tap: false,
                //     // touchZoom: false,
                //     maxZoom: 19,
                //     // zoomControl: false
                // };

                self.status = {
                    loading: true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.program.links.site.html);

                }

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'program') {

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

                        case 'project':

                            targetCollection = Project;

                            break;

                        default:

                            targetCollection = Program;

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

                            self.program.readings_custom.splice(index, 1);

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

                self.popupTemplate = function(feature) {

                    return '<div class=\"project--popup\">' +
                        '<div class=\"marker--title border--right\">' + feature.properties.name + '</div>' +
                        '<a href=\"projects/' + feature.properties.id + '\">' +
                        '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                        '</a>' +
                        '</div>';

                };

                self.processLocations = function(features) {

                    self.map.markers = {};

                    features.forEach(function(feature, index) {

                        // var centroid = feature.geometry;

                        // console.log('centroid', centroid);

                        if (feature.geometry &&
                            feature.geometry.coordinates) {

                            self.map.markers['project_' + index] = {
                                lat: feature.geometry.coordinates[1],
                                lng: feature.geometry.coordinates[0],
                                layer: 'projects',
                                focus: false,
                                icon: {
                                    type: 'div',
                                    className: 'project--marker',
                                    iconSize: [24, 24],
                                    popupAnchor: [0, 0],
                                    html: ''
                                },
                                message: self.popupTemplate(feature)
                            };

                        }

                    });

                    console.log('self.map.markers', self.map.markers);

                };

                self.loadProgram = function() {

                    program.$promise.then(function(successResponse) {

                        console.log('self.program', successResponse);

                        self.program = successResponse;

                        $rootScope.program = successResponse;

                        $rootScope.page.title = self.program.name ? self.program.name : 'Un-named Program';

                        self.status.loading = false;

                        self.loadMetrics();

                        self.loadProjects();

                    }, function(errorResponse) {



                    });

                };

                self.loadMetrics = function() {

                    Program.progress({
                        id: self.program.id
                    }).$promise.then(function(successResponse) {

                        console.log('Program metrics', successResponse);

                        successResponse.features.forEach(function(metric) {

                            var _percentComplete = +((metric.current_value / metric.target) * 100).toFixed(0);

                            metric.percentComplete = _percentComplete;

                        });

                        self.metrics = successResponse.features;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };

                self.loadProjects = function() {

                    Program.pointLayer({
                        id: self.program.id
                    }).$promise.then(function(successResponse) {

                        console.log('Program projects', successResponse);

                        var geoJsonLayer = L.geoJson(successResponse, {});

                        leafletData.getMap('program--map').then(function(map) {

                            map.fitBounds(geoJsonLayer.getBounds(), {
                                maxZoom: 18
                            });

                        });

                        self.processLocations(successResponse.features);

                        // self.map.geojson = {
                        //     data: successResponse,
                        //     // onEachFeature: onEachFeature,
                        //     style: {
                        //         color: '#00D',
                        //         fillColor: 'red',
                        //         weight: 2.0,
                        //         opacity: 0.6,
                        //         fillOpacity: 0.2
                        //     }
                        // };

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

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

                        self.loadProgram();

                    });
                }

            }
        ]);

}());
'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
    .controller('ProjectSummaryCtrl',
        function(Account, Notifications, $rootScope, Project, $routeParams,
            $scope, $location, Map, mapbox, Site, user, $window,
            leafletData, leafletBoundsHelpers, $timeout, Practice, project,
            metrics, outcomes, sites, Utility, $interval) {

            //controller is set to self
            var self = this;

            self.actions = {
                print: function() {

                    $window.print();

                },
                saveToPdf: function() {

                    $scope.$emit('saveToPdf');

                }
            };

            $rootScope.viewState = {
                'project': true
            };

            $rootScope.toolbarState = {
                'dashboard': true
            };

            $rootScope.page = {};

            self.map = JSON.parse(JSON.stringify(Map));

            self.map.markers = {};

            console.log('self.map', self.map);

            self.status = {
                loading: true
            };

            self.fillMeter = undefined;

            self.showProgress = function(coefficient) {

                self.fillMeter = $interval(function() {

                    var tempValue = (self.progressValue || 10) * Utility.meterCoefficient();

                    if (!self.progressValue) {

                        self.progressValue = tempValue;

                    } else if ((100 - tempValue) > self.progressValue) {

                        self.progressValue += tempValue;

                    }

                    console.log('progressValue', self.progressValue);

                }, 100);

            };

            self.showElements = function(delay) {

                $interval.cancel(self.fillMeter);

                self.fillMeter = undefined;

                self.progressValue = 100;

                $timeout(function() {

                    self.status.loading = false;

                    self.progressValue = 0;

                }, delay);

            };

            //draw tools
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

                        if (project_.properties.extent) {

                            project_.staticURL = self.buildStaticMapURL(project_.properties.extent);

                        }

                        self.project = project_;

                        $rootScope.page.title = 'Project Summary';

                        leafletData.getMap('project--map').then(function(map) {

                            var southWest = L.latLng(25.837377, -124.211606),
                                northEast = L.latLng(49.384359, -67.158958),
                                bounds = L.latLngBounds(southWest, northEast);

                            self.projectExtent = new L.FeatureGroup();

                            if (self.project.properties.extent) {

                                self.setGeoJsonLayer(self.project.properties.extent, self.projectExtent);

                                map.fitBounds(self.projectExtent.getBounds(), {
                                    maxZoom: 18
                                });

                            } else {

                                map.fitBounds(bounds, {
                                    maxZoom: 18
                                });

                            }

                        });

                        self.loadSites();

                    }

                    self.showElements(1000);

                }).catch(function(errorResponse) {

                    console.log('loadProject.errorResponse', errorResponse);

                    self.showElements(1000);

                });

            };

            self.submitProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Submitted"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.fundProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Funded"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.completeProject = function() {

                if (!self.project.properties.organization_id) {
                    $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.");
                    return;
                }

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Completed"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });
            };

            self.rollbackProjectSubmission = function() {

                var _project = new Project({
                    "id": self.project.id,
                    "properties": {
                        "workflow_state": "Draft"
                    }
                });

                _project.$update(function(successResponse) {
                    self.project = successResponse;
                }, function(errorResponse) {

                });

            };

            self.createSite = function() {

                self.site = new Site({
                    'project_id': self.project.id,
                    'organization_id': self.project.properties.organization_id
                });

                self.site.$save(function(successResponse) {

                    $location.path('/sites/' + successResponse.id + '/edit');

                }, function(errorResponse) {

                    console.error('Unable to create your site, please try again later');

                });

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path('/projects');

            }

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

                        }

                    });

                    self.sites = successResponse.features;

                    leafletData.getMap('project--map').then(function(map) {

                        self.projectExtent.clearLayers();

                        self.sites.forEach(function(feature) {

                            if (feature.geometry) {

                                self.setGeoJsonLayer(feature.geometry, self.projectExtent);

                            }

                        });

                        map.fitBounds(self.projectExtent.getBounds(), {
                            maxZoom: 18
                        });

                        self.projectExtent.addTo(map);

                    });

                }, function(errorResponse) {

                    console.log('loadSites.errorResponse', errorResponse);

                });

            };

            self.loadMetrics = function() {

                metrics.$promise.then(function(successResponse) {

                    console.log('Project metrics', successResponse);

                    successResponse.features.forEach(function(metric) {

                        var _percentComplete = +((metric.installation / metric.planning) * 100).toFixed(0);

                        metric.percentComplete = _percentComplete;

                    });

                    self.metrics = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            self.loadOutcomes = function() {

                outcomes.$promise.then(function(successResponse) {

                    console.log('Project outcomes', successResponse);

                    self.outcomes = successResponse;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            //
            // Verify Account information for proper UI element display
            //

            if (Account.userObject && user) {

                self.showProgress();

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: false,
                        is_manager: false,
                        is_admin: false
                    };

                    self.loadProject();

                    self.loadMetrics();

                    self.loadOutcomes();

                });

            }

        });
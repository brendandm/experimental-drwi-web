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
            $scope, $location, Map, mapbox, summary, Site, user, $window,
            leafletData, leafletBoundsHelpers, $timeout, Practice) {

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

            self.map = Map;

            self.map.markers = {};

            console.log('self.map', self.map);

            self.status = {
                "loading": true
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

            //
            // Assign project to a scoped variable
            //
            summary.$promise.then(function(successResponse) {

                console.log('projectSummary', successResponse);

                self.data = successResponse;
                self.project = successResponse.project;

                self.sites = successResponse.sites;

                self.practices = successResponse.practices;

                //
                // Add rollups to the page scope
                //
                self.rollups = successResponse.rollups;

                self.status.loading = false;

                $rootScope.page.title = 'Project Summary';

                // $rootScope.page.links = [];

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
                            can_edit: Account.canEdit(self.project),
                            is_manager: (Account.hasRole('manager') || Account.inGroup(self.project.properties.organization_id, Account.userObject.properties.account)),
                            is_admin: Account.hasRole('admin')
                        };
                    });
                }

                leafletData.getMap('project--map').then(function(map) {

                    var southWest = L.latLng(25.837377, -124.211606),
                        northEast = L.latLng(49.384359, -67.158958),
                        bounds = L.latLngBounds(southWest, northEast);

                    self.projectExtent = new L.FeatureGroup();

                    if (self.project.properties.extent) {

                        self.setGeoJsonLayer(self.project.properties.extent, self.projectExtent);

                        map.fitBounds(self.projectExtent.getBounds(), {
                            // padding: [20, 20],
                            maxZoom: 18
                        });

                    } else {

                        map.fitBounds(bounds, {
                            // padding: [20, 20],
                            maxZoom: 18
                        });

                    }

                    self.projectExtent.clearLayers();

                    self.sites.forEach(function(feature) {

                        if (feature.site.geometry) {

                            self.setGeoJsonLayer(feature.site.geometry, self.projectExtent);

                        }

                    });

                    map.fitBounds(self.projectExtent.getBounds(), {
                        // padding: [20, 20],
                        maxZoom: 18
                    });

                    self.projectExtent.addTo(map);

                });

            });

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

                var targetCollection;

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

                targetCollection.delete({
                    id: +self.deletionTarget.feature.id
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

        });
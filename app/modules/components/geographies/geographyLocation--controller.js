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
                $scope, $timeout, $interval, user, Shapefile, Utility, Task) {

                var self = this;

                $rootScope.viewState = {
                    'geography': true
                };

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

                self.savedObjects = [];

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

                self.fetchTasks = function(taskId) {

                    if (taskId &&
                        typeof taskId === 'number') {

                        return Task.get({
                            id: taskId
                        }).$promise.then(function(response) {

                            console.log('Task.get response', response);

                            self.pendingTasks = response.features;

                            if (self.pendingTasks.length < 1) {

                                self.loadFeature();

                                $interval.cancel(self.taskPoll);

                            }

                        });

                    } else {

                        return GeographyService.tasks({
                            id: $route.current.params.geographyId
                        }).$promise.then(function(response) {

                            console.log('Task.get response', response);

                            self.pendingTasks = response.features;

                            if (self.pendingTasks.length < 1) {

                                self.loadFeature();

                                $interval.cancel(self.taskPoll);

                            }

                        });

                    }

                };

                self.hideTasks = function() {

                    self.pendingTasks = [];

                    if (typeof self.taskPoll !== 'undefined') {

                        $interval.cancel(self.taskPoll);

                    }

                    self.loadFeatures();

                };

                self.uploadShapefile = function() {

                    if (!self.fileImport ||
                        !self.fileImport.length) {

                        $rootScope.notifications.warning('Uh-oh!', 'You forgot to add a file.');

                        $timeout(function() {
                            $rootScope.notifications.objects = [];
                        }, 1200);

                        return false;

                    }

                    self.progressMessage = 'Uploading your file...';

                    var fileData = new FormData();

                    fileData.append('file', self.fileImport[0]);

                    fileData.append('feature_type', 'geography');

                    fileData.append('feature_id', self.geography.id);

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

                self.scrubFeature = function() {

                    delete self.geography.properties.counties;
                    delete self.geography.properties.creator;
                    delete self.geography.properties.dashboards;
                    delete self.geography.properties.extent;
                    delete self.geography.properties.last_modified_by;
                    delete self.geography.properties.organization;
                    delete self.geography.properties.program;
                    delete self.geography.properties.sites;
                    delete self.geography.properties.watersheds;

                };

                self.saveGeography = function() {

                    self.scrubFeature();

                    if (self.savedObjects.length) {

                        self.savedObjects.forEach(function(object) {

                            console.log('Iterating self.savedObjects', object);

                            if (object.geoJson.geometry &&
                                typeof object.geoJson.geometry !== 'undefined') {

                                self.geography.geometry = object.geoJson.geometry;

                            }

                        });

                    }

                    self.status.processing = true;

                    var data = self.geography.properties;

                    data.geometry = self.geography.geometry;

                    GeographyService.update({
                        id: self.geography.id
                    }, data).$promise.then(function(successResponse) {

                        self.status.processing = false;

                        self.geography = successResponse;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Geography location saved.',
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

                self.loadFeature = function() {

                    geography.$promise.then(function(successResponse) {

                        console.log('self.geography', successResponse);

                        self.geography = successResponse;

                        console.log(JSON.stringify(successResponse.properties.extent));

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

                        if (self.geography.properties.extent !== null &&
                            typeof self.geography.properties.extent !== 'undefined') {

                            leafletData.getMap('geography--map').then(function(map) {

                                // self.geographyExtent = new L.FeatureGroup();

                                // self.setGeoJsonLayer(self.geography.properties.extent, self.geographyExtent);

                                // console.log('self.geographyExtent', self.geographyExtent.getBounds());

                                self.map.bounds = Utility.transformBounds(self.geography.properties.extent);

                            });

                        }

                        self.map.geojson = {
                            data: self.geography.geometry
                        };

                        self.fetchTasks();

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

                    });

                } else {

                    $location.path('/login');

                }

            });

}());
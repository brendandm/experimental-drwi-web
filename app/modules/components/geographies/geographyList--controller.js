(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:GeographyListController
     * @description
     */
    angular.module('FieldDoc')
        .controller('GeographyListController',
            function(Account, $location, $window, $timeout, $rootScope, $scope,
                $route, geographies, user, Utility, GeographyService,
                MapPreview, leafletBoundsHelpers, $interval, Shapefile,
                GeographyType, Task) {

                var self = this;

                self.programId = $route.current.params.programId;

                $rootScope.viewState = {
                    'geography': true
                };

                $rootScope.page = {};

                self.map = JSON.parse(JSON.stringify(MapPreview));

                console.log('self.map', self.map);

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

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                self.confirmDelete = function(obj) {

                    self.deletionTarget = obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(obj, index) {

                    GeographyService.delete({
                        id: obj.id
                    }).$promise.then(function(data) {

                        self.deletionTarget = null;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this geography.',
                            'prompt': 'OK'
                        }];

                        self.geographies.splice(index, 1);

                        $timeout(closeAlerts, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this geography.',
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

                self.processCollection = function(arr) {

                    arr.forEach(function(feature) {

                        if (feature.geometry !== null) {

                            feature.staticURL = self.buildStaticMapURL(feature.geometry);

                            feature.geojson = self.buildFeature(feature.geometry);

                        }

                        feature.bounds = Utility.transformBounds(feature.bounds);

                        if (feature.code !== null &&
                            typeof feature.code === 'string') {

                            feature.classification = feature.code.length;

                        }

                        console.log('feature', feature);

                    });

                };

                self.createGeography = function() {

                    self.geography = new GeographyService({
                        'program_id': self.programId,
                        'organization_id': $rootScope.user.properties.organization_id
                    });

                    self.geography.$save(function(successResponse) {

                        $location.path('/geographies/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        console.error('Unable to create a new geography, please try again later.');

                    });

                };

                self.buildFilter = function() {

                    var params = $location.search(),
                        data = {};

                    if (self.selectedProgram &&
                        typeof self.selectedProgram.id !== 'undefined' &&
                        self.selectedProgram.id > 0) {

                        data.program = self.selectedProgram.id;

                        $rootScope.programContext = self.selectedProgram.id;

                        $location.search('program', self.selectedProgram.id);

                    } else if ($rootScope.programContext !== null &&
                        typeof $rootScope.programContext !== 'undefined') {

                        data.program = $rootScope.programContext;

                        $location.search('program', $rootScope.programContext);

                    } else if (params.program !== null &&
                        typeof params.program !== 'undefined') {

                        data.program = params.program;

                        $rootScope.programContext = params.program;

                    } else {

                        $location.search({});

                    }

                    return data;

                };

                self.loadFeatures = function() {

                    var params = self.buildFilter();

                    GeographyService.collection(params).$promise.then(function(successResponse) {

                        console.log('successResponse', successResponse);

                        for (var collection in successResponse) {

                            if (successResponse.hasOwnProperty(collection) &&
                                Array.isArray(successResponse[collection])) {

                                self.processCollection(successResponse[collection]);

                            }

                        }

                        self.geographies = successResponse.features;

                        console.log('self.geographies', self.geographies);

                        self.showElements();

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.showElements();

                    });

                };

                self.searchGroups = function(value) {

                    return GeographyType.collection({
                        q: value
                    }).$promise.then(function(response) {

                        console.log('SearchService response', response);

                        response.features.forEach(function(result) {

                            result.category = null;

                        });

                        return response.features.slice(0, 5);

                    });

                };

                self.fetchTasks = function() {

                    var params = {
                        scale: 'collection',
                        scope: 'geography',
                        status: 'pending'
                    };

                    if (self.program && self.program.id) {

                        params.program = self.program.id;

                    }

                    return Task.collection(params).$promise.then(function(response) {

                        console.log('Task.collection response', response);

                        self.pendingTasks = response.features;

                        if (!self.pendingTasks.length) {

                            self.loadFeatures();

                            $interval.cancel(self.taskPoll);

                        }

                    });

                };

                self.uploadCollection = function() {

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

                    if (self.fileImport) {

                        var fileData = new FormData();

                        fileData.append('file', self.fileImport[0]);

                        if (self.group) {

                            if (self.group.id) {

                                fileData.append('group', self.group.id);

                            } else if (typeof self.group === 'string') {

                                fileData.append('group', self.group);

                            }

                        }

                        if (self.program && self.program.id) {

                            fileData.append('program', self.program.id);

                        }

                        fileData.append('persist', true);

                        console.log('fileData', fileData);

                        $window.scrollTo(0,0);

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

                                self.fetchTasks();

                            }, 500);

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

                    }

                };

                self.extractPrograms = function(user) {

                    var _programs = [];

                    user.properties.programs.forEach(function(program) {

                        _programs.push(program.properties);

                    });

                    return _programs;

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

                        self.programs = self.extractPrograms($rootScope.user);

                        self.loadFeatures();

                        self.fetchTasks();

                    });

                }

            });

})();
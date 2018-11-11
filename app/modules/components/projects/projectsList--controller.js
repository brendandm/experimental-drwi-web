'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectsCtrl',
        function(Account, $location, $log, Project,
            projects, $rootScope, $scope, Site, user,
            ProjectStore, FilterStore, $interval, $timeout, Utility) {

            $scope.filterStore = FilterStore;

            $scope.projectStore = ProjectStore;

            var self = this;

            self.dashboardFilters = {
                geographies: [],
                grantees: [],
                practices: []
            };

            $rootScope.viewState = {
                'project': true
            };

            //
            // Setup basic page variables
            //
            $rootScope.page = {
                title: 'Projects',
                actions: []
            };

            self.status = {
                loading: true
            };

            self.fillMeter = undefined;

            self.showProgress = function() {

                self.fillMeter = $interval(function() {

                    var tempValue = (self.progressValue || 10) * Utility.meterCoefficient();

                    if (!self.progressValue) {

                        self.progressValue = tempValue;

                    } else if ((100 - tempValue) > self.progressValue) {

                        self.progressValue += tempValue;

                    } else {

                        $interval.cancel(self.fillMeter);

                        self.fillMeter = undefined;

                        self.progressValue = 100;

                        self.showElements(1000, self.filteredProjects, self.progressValue);

                    }

                    console.log('progressValue', self.progressValue);

                }, 50);

            };

            self.showElements = function(delay, object, progressValue) {

                if (object && progressValue > 75) {

                    $timeout(function() {

                        self.status.loading = false;

                        self.progressValue = 0;

                    }, delay);

                }

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

                Project.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this project.',
                        'prompt': 'OK'
                    }];

                    self.filteredProjects.splice(index, 1);

                    $timeout(closeAlerts, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this project.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this project.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this project.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            self.search = {
                query: '',
                execute: function(page) {

                    //
                    // Get all of our existing URL Parameters so that we can
                    // modify them to meet our goals
                    //

                    var q = {
                        filters: [{
                            'and': [{
                                name: 'name',
                                op: 'ilike',
                                val: '%' + self.search.query + '%'
                            }]
                        }],
                        order_by: [{
                            field: 'created_on',
                            direction: 'desc'
                        }]
                    };

                    if (self.filters.active.workflow_state !== null) {
                        console.log('add workflow state filter');

                        q.filters.push({
                            'name': 'workflow_state',
                            'op': 'like',
                            'val': self.filters.active.workflow_state
                        });
                    }

                    if (self.filters.active.year && self.filters.active.year.year) {
                        q.filters.push({
                            'name': 'created_on',
                            'op': 'gte',
                            'val': self.filters.active.year.year + '-01-01'
                        });
                        q.filters.push({
                            'name': 'created_on',
                            'op': 'lte',
                            'val': self.filters.active.year.year + '-12-31'
                        });
                    }

                    Project.query({
                        'q': q,
                        'page': (page ? page : 1)
                    }).$promise.then(function(successResponse) {

                        console.log('successResponse', successResponse);

                        self.projects = successResponse;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                },
                paginate: function(pageNumber) {

                    //
                    // Get all of our existing URL Parameters so that we can
                    // modify them to meet our goals
                    //
                    self.search.execute(pageNumber);
                },
                clear: function() {

                    self.q = {};

                    self.filteredProjects = self.projects;

                    self.processLocations(self.filteredProjects);

                }
            };

            self.createProject = function() {

                $location.path('/projects/collection/new');

            };

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                self.showProgress();

                user.$promise.then(function(userResponse) {
                    $rootScope.user = Account.userObject = userResponse;
                    self.permissions = {
                        isLoggedIn: Account.hasToken()
                    };
                });

                //
                // Project functionality
                //

                self.projects = projects;

                console.log('self.projects', self.projects);

                projects.$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    successResponse.features.forEach(function(feature) {

                        if (feature.extent) {

                            var styledFeature = {
                                "type": "Feature",
                                "geometry": feature.extent,
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

                            feature.geometry = styledFeature;

                            // Build static map URL for Mapbox API

                            var staticURL = 'https://api.mapbox.com/styles/v1/mapbox/streets-v10/static/geojson(' + encodeURIComponent(JSON.stringify(styledFeature)) + ')/auto/400x200@2x?access_token=pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw';

                            feature.staticURL = staticURL;

                        }

                    });

                    $scope.projectStore.setProjects(successResponse.features);

                    self.filteredProjects = $scope.projectStore.filteredProjects;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            } else {

                $location.path('/account/login');

            }

            self.clearFilter = function(obj) {

                // ProjectStore.reset();

                FilterStore.clearItem(obj);

            };

        });
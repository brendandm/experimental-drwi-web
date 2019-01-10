'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectsController',
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

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

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

                    self.projects.splice(index, 1);

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

            self.clearFilter = function(obj) {

                FilterStore.clearItem(obj);

            };

            self.buildFilter = function() {

                var params = $location.search(),
                    data = {};

                if (self.selectedProgram &&
                    typeof self.selectedProgram.id !== 'undefined' &&
                    self.selectedProgram.id > 0) {

                    data.program = self.selectedProgram.id;

                    $location.search('program', self.selectedProgram.id);

                } else if (params.program !== null &&
                    typeof params.program !== 'undefined') {

                    data.program = params.program;

                }

                return data;

            };

            self.loadProjects = function() {

                var params = self.buildFilter();

                Project.collection(params).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    successResponse.features.forEach(function(feature) {

                        if (feature.extent) {

                            feature.staticURL = Utility.buildStaticMapURL(feature.extent);

                        }

                    });

                    self.projects = successResponse.features;

                    if (!$scope.projectStore.projects.length) {

                        $scope.projectStore.setProjects(successResponse.features);

                    }

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

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
                        isLoggedIn: Account.hasToken()
                    };

                    //
                    // Project functionality
                    //

                    if ($rootScope.user.properties.programs.length) {

                        self.selectedProgram = $rootScope.user.properties.programs[0];

                    }

                    self.loadProjects();

                });

            } else {

                $location.path('/login');

            }

        });
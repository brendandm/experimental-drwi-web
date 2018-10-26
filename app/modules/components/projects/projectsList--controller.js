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
            ProjectStore, FilterStore, $interval, $timeout) {

            $scope.filterStore = FilterStore;

            $scope.projectStore = ProjectStore;

            var self = this;

            self.alerts = [];

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

            self.loading = true;

            self.fillMeter = $interval(function() {

                var tempValue = (self.progressValue || 10) * 0.2;

                if (!self.progressValue) {

                    self.progressValue = tempValue;

                } else if ((100 - tempValue) > self.progressValue) {

                    self.progressValue += tempValue;

                }

                console.log('progressValue', self.progressValue);

            }, 100);

            self.showElements = function() {

                $interval.cancel(self.fillMeter);

                self.progressValue = 100;

                $timeout(function() {

                    self.loading = false;

                }, 1000);

            };

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

                    $timeout(function() {

                        self.alerts = [];

                    }, 2000);

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

                    // var projects = [];

                    // successResponse.features.forEach(function(feature) {

                    //     var extentFeature = {
                    //         'type': 'Feature',
                    //         'properties': {}
                    //     };

                    //     extentFeature.geometry = feature.extent;

                    //     feature.extent = extentFeature;

                    //     project.push(feature);

                    // });

                    $scope.projectStore.setProjects(successResponse.features);

                    self.filteredProjects = $scope.projectStore.filteredProjects;

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            } else {

                $location.path('/user/logout');

            }

            self.clearFilter = function(obj) {

                // ProjectStore.reset();

                FilterStore.clearItem(obj);

            };

        });
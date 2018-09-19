'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectsCtrl', function(Account, $location, $log, Project, Map,
        projects, $rootScope, $scope, Site, user, leafletData, leafletBoundsHelpers,
        MetricService, OutcomeService, ProjectStore, FilterStore) {

        $scope.filterStore = FilterStore;

        $scope.projectStore = ProjectStore;

        var self = this;

        self.dashboardFilters = {
            geographies: [],
            grantees: [],
            practices: []
        };

        self.map = Map;

        self.map.markers = {};

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

        console.log('self.map', self.map);

        self.processLocations = function(features) {

            self.map.markers = {};

            features.forEach(function(feature) {

                var centroid = feature.centroid;

                console.log('centroid', centroid);

                if (centroid) {

                    self.map.markers['project_' + feature.id] = {
                        lat: centroid.coordinates[1],
                        lng: centroid.coordinates[0],
                        layer: 'projects'
                    };

                }

            });

            console.log('self.map.markers', self.map.markers);

        };

        self.extractIds = function(arr) {

            var projectIds = [];

            arr.forEach(function(datum) {

                projectIds.push(datum.id);

            });

            return projectIds.join(',');

        };

        self.loadMetrics = function(arr) {

            //
            // A program (account) identifier
            // is required by default.
            //

            var params = {
                id: 3
            };

            //
            // If the `arr` parameter is valid,
            // constrain the query to the given
            // set of numeric project identifiers.
            //

            if (arr && arr.length) {

                params.projects = self.extractIds(arr);

            }

            MetricService.query(params).$promise.then(function(successResponse) {

                console.log('granteeResponse', successResponse);

                self.metrics = successResponse.features;

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadOutcomes = function(arr) {

            //
            // A program (account) identifier
            // is required by default.
            //

            var params = {
                id: 3
            };

            //
            // If the `arr` parameter is valid,
            // constrain the query to the given
            // set of numeric project identifiers.
            //

            if (arr && arr.length) {

                params.projects = self.extractIds(arr);

            }

            OutcomeService.query(params).$promise.then(function(successResponse) {

                console.log('granteeResponse', successResponse);

                self.outcomes = successResponse;

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        //
        // Setup basic page variables
        //
        $rootScope.page = {
            title: 'Program Summary',
            links: [{
                text: 'Program Summary',
                url: '/projects',
                type: 'active'
            }],
            actions: [{
                type: 'button-link new',
                action: function() {
                    self.createProject();
                },
                text: 'Create project'
            }, {
                type: 'button-link new',
                action: function() {
                    self.createSnapshot();
                },
                text: 'Create snapshot'
            }]
        };

        //
        // Project functionality
        //

        self.projects = projects;

        console.log('self.projects', self.projects);

        projects.$promise.then(function(successResponse) {

            console.log('successResponse', successResponse);

            $scope.projectStore.setProjects(successResponse.features);

            self.filteredProjects = $scope.projectStore.filteredProjects;

            self.processLocations(successResponse.features);

        }, function(errorResponse) {

            console.log('errorResponse', errorResponse);

        });

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

                    // self.projects.features.forEach(function(feature) {

                    // var centroid = feature.properties.centroid;

                    // console.log('centroid', centroid);

                    // if (centroid) {

                    // self.map.markers['project_' + feature.id] = {
                    // lat: centroid.coordinates[1],
                    // lng: centroid.coordinates[0],
                    // layer: 'projects'
                    // };

                    // }

                    // });

                    // console.log('self.map.markers', self.map.markers);

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

                // $location.path('/projects/').search('');

                self.q = {};

                self.filteredProjects = self.projects;

                self.processLocations(self.filteredProjects);

            }
        };

        //
        // Set Default Search Filter value
        //
        if (self.search && self.search.query === '') {

            var searchParams = $location.search(),
                q = angular.fromJson(searchParams.q);

            if (q && q.filters && q.filters.length) {
                angular.forEach(q.filters[0].and, function(filter) {
                    if (filter.name === 'name') {
                        self.search.query = filter.val.replace(/%/g, '');
                    }
                });
            }
        }

        self.createProject = function() {
            self.project = new Project({
                'name': 'Untitled Project'
            });

            self.project.$save(function(successResponse) {
                $location.path('/projects/' + successResponse.id + '/edit');
            }, function(errorResponse) {
                $log.error('Unable to create Project object');
            });
        };

        self.createSnapshot = function() {

            $location.path('/snapshot');

        };

        self.createPlan = function() {
            self.project = new Project({
                'name': 'Project Plan',
                'program_type': 'Pre-Project Plan',
                'description': 'This project plan was created to estimate the potential benefits of a project\'s site and best management practices.'
            });

            self.project.$save(function(successResponse) {

                self.site = new Site({
                    'name': 'Planned Site',
                    'project_id': successResponse.id
                });

                self.site.$save(function(siteSuccessResponse) {
                    $location.path('/projects/' + successResponse.id + '/sites/' + siteSuccessResponse.id + '/edit');
                }, function(siteErrorResponse) {
                    console.error('Could not save your new Project Plan');
                });

            }, function(errorResponse) {
                $log.error('Unable to create Project object');
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
            });

            self.loadOutcomes();

            self.loadMetrics();

        } else {

            $location.path('/user/logout');

        }

        //
        // Define our map interactions via the Angular Leaflet Directive
        //

        leafletData.getMap('dashboard--map').then(function(map) {

            // var southWest = L.latLng(25.837377, -124.211606),
            //     northEast = L.latLng(49.384359, -67.158958),
            //     bounds = L.latLngBounds(southWest, northEast);

            // map.fitBounds(bounds, {
            //     padding: [20, 20],
            //     maxZoom: 18
            // });

        });

        self.clearFilter = function(obj) {

            // ProjectStore.reset();

            FilterStore.clearItem(obj);

        };

        $scope.$watch('filterStore.index', function(newVal) {

            console.log('Updated filterStore', newVal);

            self.activeFilters = newVal;

            ProjectStore.filterAll(newVal);

        });

        $scope.$watch('projectStore.filteredProjects', function(newVal) {

            console.log('Updated projectStore', newVal);

            self.filteredProjects = newVal;

            self.processLocations(newVal);

            self.loadMetrics(newVal);

            self.loadOutcomes(newVal);

        });

    });
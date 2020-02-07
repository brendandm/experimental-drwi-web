'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectsController',
        function(Account, $location, $log, Project, Tag,
            projects, $rootScope, $scope, Site, user, mapbox,
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

            self.showModal = {
                organization: false,
                program: false,
                tag: false
            };

            self.filters = {
                organization: undefined,
                program: undefined,
                tag: undefined
            };

            self.numericFilters = [
                'organization',
                'program',
                'tag'
            ];

            self.status = {
                loading: true
            };

            /*START Pagniation vars*/
            self.limit = 12;
            self.page = 1;

            self.viewCountLow = self.page;
            self.viewCountHigh =  self.limit;


          //  self.viewCountLow = self.page * self.limit;
          //  self.viewCountHigh = self.limit

            self.calculateViewCount = function(){
               if(self.page > 1){
                    self.viewCountLow = ((self.page-1) * self.limit);
                    if( self.summary.feature_count > ((self.page-1) * self.limit) ){
                        self.viewCountHigh = ((self.page-1) * self.limit);
                    }else{
                        self.viewCountHigh = self.summary.feature_count;
                    }
               }else{
                    self.viewCountLow = 1;
               }

            }

            self.changeLimit = function(limit){
                self.limit = limit;
                self.
                self.loadProjects();
            }

             self.getPage = function(page){
                console.log("PAGE",page);
               // console.log("LIMIT",limit);

                if(page < 1){
                    self.page = 1;
                }else if(page > self.summary.page_count){
                    self.page = self.summary.page_count;
                }else{
                     self.page   = page;

                     self.loadProjects();
                }

            };
             /*END Pagniation vars*/

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

            self.createProject = function() {

                $location.path('/projects/collection/new');

            };

            self.clearFilter = function(obj) {

                FilterStore.clearItem(obj);

            };

            self.buildFilter = function() {

                console.log(
                    'self.buildFilter --> Starting...');

                var data = {
                    combine: 'true',
                    limit:  self.limit,
                    page:   self.page
                };

                for (var key in self.filters) {

                    if (self.filters.hasOwnProperty(key)) {

                        if (self.numericFilters.indexOf(key) >= 0) {

                            var filterVal = +self.filters[key];

                            if (Number.isInteger(filterVal) &&
                                filterVal > 0) {

                                data[key] = filterVal;

                            }

                        } else {

                            data[key] = self.filters[key];

                        }

                    }

                }

                $location.search(data);

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

                    // self.count = successResponse.count;

                    self.summary = successResponse.summary;

                    self.summary.organizations.unshift({
                        id: 0,
                        name: 'All organizations'
                    });

                    if (!$scope.projectStore.projects.length) {

                        $scope.projectStore.setProjects(successResponse.features);

                    }

                     self.calculateViewCount();

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };



            self.loadTags = function() {

                Tag.collection({}).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.tags = successResponse.features;

                    self.tags.unshift({
                        id: 0,
                        name: 'All tags'
                    });

                    self.filters.tag = self.tags[0].id;

                    console.log("self.filters.tag", self.filters.tag);

                    self.inspectSearchParams();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            };

            self.addMapPreviews = function(arr) {

                var interactions = [
                    'scrollZoom',
                    'boxZoom',
                    'dragRotate',
                    'dragPan',
                    'keyboard',
                    'doubleClickZoom',
                    'touchZoomRotate'
                ];

                arr.forEach(function(feature, index) {

                    var localOptions = JSON.parse(JSON.stringify(self.mapOptions));

                    localOptions.style = self.mapStyles[0].url;

                    localOptions.container = 'project-geography-preview-' + index;

                    var previewMap = new mapboxgl.Map(localOptions);

                    previewMap.on('load', function() {

                        interactions.forEach(function(behavior) {

                            previewMap[behavior].disable();

                        });

                        self.populateMap(previewMap, feature, 'extent');

                    });

                });

            };

            self.populateMap = function(map, feature, attribute) {

                console.log('self.populateMap --> feature', feature);

                if (feature[attribute] !== null &&
                    typeof feature[attribute] !== 'undefined') {

                    var bounds = turf.bbox(feature[attribute]);

                    map.fitBounds(bounds, {
                        padding: 40
                    });

                }

            };

            self.getMapOptions = function() {

                self.mapStyles = mapbox.baseStyles;

                console.log(
                    'self.createMap --> mapStyles',
                    self.mapStyles);

                self.activeStyle = 0;

                mapboxgl.accessToken = mapbox.accessToken;

                console.log(
                    'self.createMap --> accessToken',
                    mapboxgl.accessToken);

                self.mapOptions = JSON.parse(JSON.stringify(mapbox.defaultOptions));

                self.mapOptions.container = 'primary--map';

                self.mapOptions.style = self.mapStyles[0].url;

                return self.mapOptions;

            };

            // 
            // Observe internal route changes. Note that `reloadOnSearch`
            // must be set to `false`.
            // 
            // See: https://stackoverflow.com/questions/15093916
            // 

            self.inspectSearchParams = function(forceFilter) {

                var params = $location.search();

                console.log(
                    'self.inspectSearchParams --> params',
                    params);

                var keys = Object.keys(params);

                console.log(
                    'self.inspectSearchParams --> keys',
                    keys);

                if (!keys.length || forceFilter) {

                    params = self.buildFilter();

                    console.log(
                        'self.inspectSearchParams --> params(2)',
                        params);

                }

                for (var key in params) {

                    if (self.filters.hasOwnProperty(key)) {

                        if (self.numericFilters.indexOf(key) >= 0) {

                            var filterVal = +params[key];

                            console.log(
                                'self.inspectSearchParams --> filterVal',
                                filterVal);

                            if (Number.isInteger(filterVal)) {

                                self.filters[key] = filterVal;

                            }

                        } else {

                            self.filters[key] = params[key];

                        }

                    }

                }

                self.loadProjects(params);

            };

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.user = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken()
                    };

                    var programs = Utility.extractUserPrograms($rootScope.user);

                    programs.unshift({
                        id: 0,
                        name: 'All programs'
                    });

                    self.programs = programs;

                    self.filters.program = self.programs[0].id;

                    //
                    // Project functionality
                    //

                    // self.loadProjects();

                    self.inspectSearchParams();

                    self.loadTags();

                });

            } else {

                $location.path('/logout');

            }

        });
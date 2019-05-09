'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('MetricTypeListController',
        function(Account, $location, $log, MetricType,
            metricTypes, $rootScope, $route, $scope, user,
            $interval, $timeout, Utility) {

            var self = this;

            self.programId = $route.current.params.programId;

            $rootScope.viewState = {
                'metricType': true
            };

            //
            // Setup basic page variables
            //
            $rootScope.page = {
                title: 'Metric Types'
            };

            self.selectedProgram = undefined;

            self.status = {
                loading: true
            };

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.loadingFeatures = false;

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

                MetricType.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this metric.',
                        'prompt': 'OK'
                    }];

                    self.metrics.splice(index, 1);

                    $timeout(closeAlerts, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this metric.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this metric.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this metric.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            self.createMetricType = function() {

                self.metricType = new MetricType({
                    // 'program_id': self.programId,
                    'organization_id': $rootScope.user.properties.organization_id
                });

                self.metricType.$save(function(successResponse) {

                    $location.path('/metric-types/' + successResponse.id + '/edit');

                }, function(errorResponse) {

                    console.error('Unable to create a new metric type, please try again later.');

                });

            };

            self.buildFilter = function() {

                var params = $location.search(),
                    data = {};

                if (self.selectedProgram !== null &&
                        typeof self.selectedProgram !== 'undefined' &&
                        self.selectedProgram === 0) {

                        $location.search(data);

                } else if (self.selectedProgram !== null &&
                    typeof self.selectedProgram !== 'undefined' &&
                    self.selectedProgram > 0) {

                    console.log('self.selectedProgram', self.selectedProgram);

                    data.program = self.selectedProgram;

                    data.prog_only = 'true';

                    $location.search(data);

                } else if (!self.metrics &&
                    params.program !== null &&
                    typeof params.program !== 'undefined') {

                    data.program = params.program;

                    data.prog_only = 'true';

                }

                return data;

            };

            self.loadFeatures = function() {

                self.status.loadingFeatures = true;

                var params = self.buildFilter();

                MetricType.collection(params).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.featureCount = successResponse.count;

                    self.metrics = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            // 
            // Observe internal route changes. Note that `reloadOnSearch`
            // must be set to `false`.
            // 
            // See: https://stackoverflow.com/questions/15093916
            // 

            self.inspectSearchParams = function(params) {

                console.log(
                    'self.inspectSearchParams --> params',
                    params);

                params = params || $location.search();

                var keys = Object.keys(params);

                self.loadFeatures();

            };

            $scope.$on('$routeUpdate', function() {

                var params = $location.search();

                self.inspectSearchParams(params);

            });

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken()
                    };

                    var programs = Utility.extractUserPrograms($rootScope.user);

                    programs.unshift({
                        id: 0,
                        name: 'All programs'
                    });

                    self.programs = programs;

                    self.selectedProgram = self.programs[0].id;

                    self.loadFeatures();

                });

            } else {

                $location.path('/logout');

            }

        });
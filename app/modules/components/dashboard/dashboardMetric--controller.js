'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardMetricController',
        function($scope, Account, $location, $log, Dashboard, dashboard,
            $rootScope, $route, user, FilterStore, $timeout, SearchService,
            MetricType, Utility) {

            var self = this;

            $rootScope.viewState = {
                'dashboard': true
            };

            $rootScope.toolbarState = {
                'editMetrics': true
            };

            $rootScope.page = {};

            self.searchScope = {
                target: 'metric'
            };

            self.status = {
                processing: true
            };

            self.alerts = [];

            self.closeAlerts = function() {

                self.alerts = [];

            };

            self.closeRoute = function() {

                $location.path('/dashboards');

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.loadDashboard = function() {

                //
                // Assign dashboard to a scoped variable
                //
                Dashboard.get({
                    id: $route.current.params.dashboardId
                }).$promise.then(function(successResponse) {

                    self.processDashboard(successResponse);

                }).catch(function(errorResponse) {

                    $log.error('Unable to load dashboard');

                    self.status.processing = false;

                });

            };

            self.search = function(value) {

                if (self.searchScope.target === 'metric') {

                    return SearchService.metric({
                        q: value
                    }).$promise.then(function(response) {

                        console.log('SearchService response', response);

                        response.results.forEach(function(result) {

                            result.category = null;

                        });

                        return response.results.slice(0, 5);

                    });

                } else {

                    return SearchService.program({
                        q: value
                    }).$promise.then(function(response) {

                        console.log('SearchService response', response);

                        response.results.forEach(function(result) {

                            result.category = null;

                        });

                        return response.results.slice(0, 5);

                    });

                }

            };

            self.directQuery = function(item, model, label) {

                if (self.searchScope.target === 'program') {

                    self.loadFeatures(item.id);

                } else {

                    self.addMetric(item);

                }

            };

            self.addMetric = function(item) {

                var _datum = {
                    id: item.id,
                    properties: item
                };

                self.tempMetrics.push(_datum);

                self.metricQuery = null;

                console.log('Updated metrics (addition)', self.tempMetrics);

            };

            self.removeMetric = function(id) {

                var _index;

                self.tempMetrics.forEach(function(item, idx) {

                    if (item.id === id) {

                        _index = idx;

                    }

                });

                console.log('Remove metric at index', _index);

                if (typeof _index === 'number') {

                    self.tempMetrics.splice(_index, 1);

                }

                console.log('Updated metrics (removal)', self.tempMetrics);

            };

            self.processMetrics = function(list) {

                var _list = [];

                angular.forEach(list, function(item) {

                    var _datum = {};

                    if (item.id && item.selected) {
                        _datum.id = item.id;
                    }

                    _list.push(_datum);

                });

                return _list;

            };

            // self.loadFeatures = function(programId) {

            //     var params = {
            //         program: programId
            //     };

            //     MetricType.collection(params).$promise.then(function(successResponse) {

            //         console.log('successResponse', successResponse);

            //         successResponse.features.forEach(function(feature) {

            //             self.addMetric(feature);

            //         });

            //     }, function(errorResponse) {

            //         console.log('errorResponse', errorResponse);

            //         self.showElements();

            //     });

            // };

            self.loadFeatures = function(programId) {

                Dashboard.availableMetrics({
                    id: $route.current.params.dashboardId
                }).$promise.then(function(successResponse) {

                    console.log('Dashboard.availableMetrics.successResponse', successResponse);

                    Utility.processMetrics(successResponse.features);

                    self.metrics = Utility.groupByModel(successResponse.features);

                    console.log('self.metrics', self.metrics);

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    // self.showElements();

                });

            };

            self.processDashboard = function(data) {

                self.dashboardObject = data.properties || data;

                // self.tempMetrics = self.dashboardObject.metrics;

                self.status.processing = false;

                self.loadFeatures();

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'geographies',
                    'geometry',
                    'last_modified_by',
                    'organizations',
                    'organization',
                    'practices',
                    'programs',
                    'projects',
                    'tags'
                ];

                var reservedProperties = [
                    'links',
                    'permissions',
                    '$promise',
                    '$resolved'
                ];

                excludedKeys.forEach(function(key) {

                    if (feature.properties) {

                        delete feature.properties[key];

                    } else {

                        delete feature[key];

                    }

                });

                reservedProperties.forEach(function(key) {

                    delete feature[key];

                });

            };

            self.saveDashboard = function() {

                self.status.processing = true;

                self.scrubFeature(self.dashboardObject);

                self.dashboardObject.metrics = self.processMetrics(self.metrics);

                console.log('self.saveDashboard.dashboardObject', self.dashboardObject);

                Dashboard.update({
                    id: +self.dashboardObject.id
                }, self.dashboardObject).then(function(successResponse) {

                    self.processDashboard(successResponse);

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Dashboard changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                }).catch(function(error) {

                    console.log('saveDashboard.error', error);

                    // Do something with the error

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to update this dashboard.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.dashboardObject.properties) {

                    targetId = self.dashboardObject.properties.id;

                } else {

                    targetId = self.dashboardObject.id;

                }

                Dashboard.delete({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this dashboard.',
                        'prompt': 'OK'
                    });

                    $timeout(self.closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.dashboardObject.properties.name + '”. There are pending tasks affecting this dashboard.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this dashboard.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this dashboard.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

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
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    self.loadDashboard();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit dashboard metrics'
                    };

                });

            } else {

                $location.path('/logout');

            }

        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectTargetController',
        function($scope, Account, $location, $log, Project, project,
            $rootScope, $route, user, FilterStore, $timeout, SearchService,
            MetricType) {

            var self = this;

            $rootScope.viewState = {
                'project': true
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

                $location.path('/projects');

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.loadProject = function() {

                //
                // Assign project to a scoped variable
                //
                Project.get({
                    id: $route.current.params.projectId
                }).$promise.then(function(successResponse) {

                    self.processProject(successResponse);

                }).catch(function(errorResponse) {

                    $log.error('Unable to load project');

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

                    if (item && item.id) {
                        _datum.id = item.id;
                    }

                    _list.push(_datum);

                });

                return _list;

            };

            self.loadFeatures = function(programId) {

                var params = {
                    program: programId
                };

                MetricType.collection(params).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    successResponse.features.forEach(function(feature) {

                        self.addMetric(feature);

                    });

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            self.processProject = function(data) {

                self.projectObject = data.properties || data;

                self.tempMetrics = self.projectObject.metrics;

                self.status.processing = false;

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'geographies',
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

            self.saveProject = function() {

                self.status.processing = true;

                self.scrubFeature(self.projectObject);

                self.projectObject.metrics = self.processMetrics(self.tempMetrics);

                console.log('self.saveProject.projectObject', self.projectObject);

                console.log('self.saveProject.Project', Project);

                Project.update({
                    id: +self.projectObject.id
                }, self.projectObject).then(function(successResponse) {

                    self.processProject(successResponse);

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Project changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                }).catch(function(error) {

                    console.log('saveProject.error', error);

                    // Do something with the error

                    self.status.processing = false;

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.projectObject.properties) {

                    targetId = self.projectObject.properties.id;

                } else {

                    targetId = self.projectObject.id;

                }

                Project.delete({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this project.',
                        'prompt': 'OK'
                    });

                    $timeout(self.closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.projectObject.properties.name + '”. There are pending tasks affecting this project.',
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

                    self.loadProject();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit project targets'
                    };

                });

            } else {

                $location.path('/login');

            }

        });
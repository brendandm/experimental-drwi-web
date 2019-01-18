'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardFilterController',
        function($scope, Account, $location, $log, Dashboard, dashboard,
            $rootScope, $route, user, FilterStore, $timeout, SearchService) {

            var self = this;

            $rootScope.viewState = {
                'dashboard': true
            };

            $rootScope.toolbarState = {
                'editFilters': true
            };

            $rootScope.page = {};

            self.status = {
                processing: true
            };

            self.modes = {
                filter: false,
                list: false
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

            $scope.filterStore = FilterStore;

            console.log('self.filterStore', self.filterStore);

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

            self.loadProjects = function() {

                //
                // Assign dashboard to a scoped variable
                //
                Dashboard.availableProjects({
                    id: $route.current.params.dashboardId
                }).$promise.then(function(successResponse) {

                    self.projects = successResponse.features;

                    if (self.dashboardObject.select_all) {

                        self.markSelected();

                    }

                }).catch(function(errorResponse) {

                    $log.error('Unable to load dashboard projects.');

                });

            };

            self.setMode = function(value) {

                if (value === 0) {

                    self.modes.list = true;

                    self.modes.filter = false;

                    self.activeFilters = [];

                } else {

                    self.modes.list = false;

                    self.modes.filter = true;

                    self.selectedProjects = [];

                    self.dashboardObject.user_only = false;

                    self.dashboardObject.select_all = false;

                    self.dashboardObject.projects = [];

                    self.projects.forEach(function(item) {

                        item.selected = false;

                    });

                }

            };

            self.markSelected = function() {

                self.projects.forEach(function(feature) {

                    if (self.dashboardObject.select_all) {

                        feature.selected = true;

                    } else {

                        feature.selected = false;

                    }

                });

            };

            self.clearFilter = function(obj) {

                FilterStore.clearItem(obj);

            };

            self.clearAllFilters = function(reload) {

                //
                // Remove all stored filter objects
                //

                FilterStore.clearAll();

            };

            self.updateCollection = function(obj, collection) {

                self.dashboardObject[collection].push({
                    id: obj.id
                });

            };

            self.transformRelation = function(obj, category) {

                switch (category) {

                    // case 'geography':

                    //     self.updateCollection(obj, 'geographies');

                    //     break;

                    case 'organization':

                        self.updateCollection(obj, 'organizations');

                        break;

                    case 'practice':

                        self.updateCollection(obj, 'practices');

                        break;

                    case 'program':

                        self.updateCollection(obj, 'programs');

                        break;

                    // case 'project':

                    //     self.updateCollection(obj, 'projects');

                    //     break;

                    // case 'status':

                    //     self.updateCollection(obj, 'statuses');

                    //     break;

                    case 'tag':

                        self.updateCollection(obj, 'tags');

                        break;

                    default:

                        self.updateCollection(obj, category);

                        break;

                }

            };

            self.extractFilter = function(key, data) {

                data.forEach(function(datum) {

                    FilterStore.addItem({
                        id: datum.id,
                        name: datum.name || datum.properties.name,
                        category: self.parseKey(key)
                    });

                });

            };

            self.parseKey = function(obj, pluralize) {

                var keyMap = {
                    plural: {
                        // 'geography': 'geographies',
                        'organization': 'organizations',
                        'practice': 'practices',
                        'program': 'programs',
                        // 'project': 'projects',
                        // 'status': 'statuses',
                        'tag': 'tags'
                    },
                    single: {
                        // 'geographies': 'geography',
                        'organizations': 'organization',
                        'practices': 'practice',
                        'programs': 'program',
                        // 'projects': 'project',
                        // 'statuses': 'status',
                        'tags': 'tag'
                    }
                };

                if (pluralize) {

                    return keyMap.plural[obj];

                }

                console.log('keyMap.single', obj, keyMap.single[obj]);

                return keyMap.single[obj];

            };

            self.search = function(value) {

                return SearchService.get({
                    q: value,
                    scope: 'dashboard'
                }).$promise.then(function(response) {

                    console.log('SearchService response', response);

                    // response.results.forEach(function(result) {

                    //     result.category = null;

                    // });

                    return response.results.slice(0, 5);

                });

            };

            self.processDashboard = function(data) {

                //
                // Reset filters
                //

                self.clearAllFilters();

                var relations = [
                    'creator',
                    // 'geographies',
                    'last_modified_by',
                    'organizations',
                    'organization',
                    'practices',
                    'programs',
                    // 'projects',
                    'tags'
                ];

                self.dashboardObject = data.properties || data;

                console.log('self.processDashboard.dashboardObject', self.dashboardObject);

                relations.forEach(function(relation) {

                    var collection = self.dashboardObject[relation];

                    if (Array.isArray(collection)) {

                        self.extractFilter(relation, collection);

                        self.dashboardObject[relation] = [];

                    } else {

                        delete self.dashboardObject[relation];

                    }

                });

                if (self.dashboardObject.user_only) {

                    self.setMode(0);

                }

                self.status.processing = false;

                self.loadProjects();

            };

            self.processProjects = function(arr) {

                var selectedProjects = [];

                arr.forEach(function(item) {

                    if (item.selected) {

                        selectedProjects.push({
                            id: item.id
                        });

                    }

                });

                return selectedProjects;

            };

            self.processRelations = function(arr) {

                arr.forEach(function(filter) {

                    self.transformRelation(filter, filter.category);

                });

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'geographies',
                    'last_modified_by',
                    'metrics'
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

                if (self.dashboardObject.user_only) {

                    self.dashboardObject.projects = self.processProjects(self.projects);

                } else {

                    self.processRelations(self.activeFilters);

                }

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

            $scope.$watch('filterStore.index', function(newVal) {

                console.log('Updated filterStore', newVal);

                self.activeFilters = newVal;

            });

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

                    // self.loadProjects();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit dashboard filters'
                    };

                });

            } else {

                $location.path('/login');

            }

        });
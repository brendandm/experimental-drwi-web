'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SnapshotEditCtrl',
        function($scope, Account, $location, $log, Snapshot, snapshot,
            $rootScope, $route, user, FilterStore, $timeout) {

            var self = this;

            $rootScope.viewState = {
                'snapshot': true
            };

            $rootScope.toolbarState = {
                'edit': true
            };

            $rootScope.page = {};

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

            $scope.filterStore = FilterStore;

            console.log('self.filterStore', self.filterStore);

            self.loadSnapshot = function() {

                //
                // Assign snapshot to a scoped variable
                //
                snapshot.$promise.then(function(successResponse) {

                    self.processSnapshot(successResponse);

                }, function(errorResponse) {

                    $log.error('Unable to load snapshot');

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
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    self.loadSnapshot();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit Snapshot'
                    };

                });

            } else {

                $location.path('/user/login');

            }

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

                self.snapshotObject[collection].push({
                    id: obj.id
                });

            };

            self.transformRelation = function(obj, category) {

                switch (category) {

                    case 'geography':

                        self.updateCollection(obj, 'geographies');

                        break;

                    case 'organization':

                        self.updateCollection(obj, 'organizations');

                        break;

                    case 'practice':

                        self.updateCollection(obj, 'practices');

                        break;

                    case 'program':

                        self.updateCollection(obj, 'programs');

                        break;

                    case 'project':

                        self.updateCollection(obj, 'projects');

                        break;

                    case 'status':

                        self.updateCollection(obj, 'statuses');

                        break;

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
                        'geography': 'geographies',
                        'organization': 'organizations',
                        'practice': 'practices',
                        'program': 'programs',
                        'project': 'projects',
                        'status': 'statuses',
                        'tag': 'tags'
                    },
                    single: {
                        'geographies': 'geography',
                        'organizations': 'organization',
                        'practices': 'practice',
                        'programs': 'program',
                        'projects': 'project',
                        'statuses': 'status',
                        'tags': 'tag'
                    }
                };

                if (pluralize) {

                    return keyMap.plural[obj];

                }

                console.log('keyMap.single', obj, keyMap.single[obj]);

                return keyMap.single[obj];

            };

            self.processSnapshot = function(data) {

                //
                // Reset filters
                //

                self.clearAllFilters();

                var relations = [
                    'creator',
                    'geographies',
                    'last_modified_by',
                    'organizations',
                    'organization',
                    'practices',
                    'programs',
                    'projects',
                    'statuses',
                    'tags'
                ];

                self.snapshotObject = data;

                relations.forEach(function(relation) {

                    if (Array.isArray(self.snapshotObject[relation])) {

                        self.extractFilter(relation, self.snapshotObject[relation]);

                        self.snapshotObject[relation] = [];

                    } else {

                        delete self.snapshotObject[relation];

                    }

                });

                self.status.processing = false;

            };

            self.processRelations = function(arr) {

                arr.forEach(function(filter) {

                    self.transformRelation(filter, filter.category);

                });

            };

            self.saveSnapshot = function() {

                window.scrollTo(0,0);

                self.status.processing = true;

                self.processRelations(self.activeFilters);

                Snapshot.update({
                    id: +self.snapshotObject.id
                }, self.snapshotObject).$promise.then(function(data) {

                    self.processSnapshot(data.properties);

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Dashboard changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                }).catch(function(error) {

                    // Do something with the error

                    self.status.processing = false;

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.snapshotObject.properties) {

                    targetId = self.snapshotObject.properties.id;

                } else {

                    targetId = self.snapshotObject.id;

                }

                Snapshot.delete({
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
                            'msg': 'Unable to delete “' + self.snapshotObject.properties.name + '”. There are pending tasks affecting this dashboard.',
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

        });
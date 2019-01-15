'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SitePartnershipController',
        function(Account, $location, $log, Site, site, Partnership,
            $rootScope, $route, user, SearchService, $timeout, $window,
            Utility, $interval, partnerships, Allocation) {

            var self = this;

            $rootScope.toolbarState = {
                'partnerships': true
            };

            $rootScope.page = {};

            self.status = {
                loading: true,
                processing: true
            };

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                }, 1000);

            };

            self.alerts = [];

            self.closeAlerts = function() {

                self.alerts = [];

            };

            self.closeRoute = function() {

                $location.path('/sites');

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.loadAllocations = function() {

                Site.allocations({
                    id: self.site.id
                }).$promise.then(function(successResponse) {

                    self.tempAllocations = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    $log.error('Unable to load site allocations.');

                    self.showElements();

                });

            };

            self.loadPartnerships = function() {

                Site.partnerships({
                    id: self.site.id
                }).$promise.then(function(successResponse) {

                    self.partnerships = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    $log.error('Unable to load site partnerships.');

                    self.showElements();

                });

            };

            // self.searchOrganizations = function(value) {

            //     return SearchService.organization({
            //         q: value
            //     }).$promise.then(function(response) {

            //         console.log('SearchService.organization response', response);

            //         response.results.forEach(function(result) {

            //             result.category = null;

            //         });

            //         return response.results.slice(0, 5);

            //     });

            // };

            self.addRelation = function(item, model, label, collection, queryAttr) {

                var _datum = {
                    id: item.id,
                    properties: item
                };

                collection.push(_datum);

                queryAttr = null;

                console.log('Updated ' + collection + ' (addition)', collection);

            };

            self.removeRelation = function(id, collection) {

                var _index;

                collection.forEach(function(item, idx) {

                    if (item.id === id) {

                        _index = idx;

                    }

                });

                console.log('Remove item at index', _index);

                if (typeof _index === 'number') {

                    collection.splice(_index, 1);

                }

                console.log('Updated ' + collection + ' (removal)', collection);

            };

            self.processRelations = function(list) {

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

            self.processFeature = function(data) {

                self.site = data;

                // if (self.site.program) {

                //     self.program = self.site.program;

                // }

                // self.tempAllocations = self.site.partnerships;

                self.status.processing = false;

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'extent',
                    'geometry',
                    'last_modified_by',
                    'organization',
                    'partnership',
                    'tags',
                    'tasks'
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

            self.createAllocation = function() {

                var params = {
                    amount: self.newAllocation.amount,
                    description: self.newAllocation.description,
                    partnership_id: self.targetPartner.id
                },
                allocation = new Allocation(params);

                allocation.$save().then(function(successResponse) {

                    self.tempAllocations.push({
                        id: successResponse.id
                    });

                    console.log('self.createPartnership.self.tempAllocations', self.tempAllocations);

                    self.saveFeature();

                }).catch(function(error) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to create allocation.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                });

            };

            self.editAllocation = function(obj) {

                self.editMode = true;

                self.displayModal = true;

                self.targetFeature = obj;

                $window.scrollTo(0, 0);

            };

            self.addAllocation = function(obj) {

                // self.editMode = true;

                self.newAllocation = {};

                self.addMode = true;

                self.displayModal = true;

                self.targetPartner = obj;

                $window.scrollTo(0, 0);

            };

            self.updateAllocation = function() {

                self.targetFeature.partnership_id = self.targetFeature.partnership.id;

                self.scrubFeature(self.targetFeature);

                Allocation.update({
                    id: self.targetFeature.id
                }, self.targetFeature).$promise.then(function(successResponse) {

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Allocation changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.displayModal = false;

                    self.editMode = false;

                    $window.scrollTo(0, 0);

                    self.loadAllocations();

                }).catch(function(error) {

                    // Do something with the error

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong and the changes could not be saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                    self.displayModal = false;

                    self.editMode = false;

                    $window.scrollTo(0, 0);

                });

            };

            self.removeAllocation = function(feature, index) {

                Allocation.delete({
                    id: feature.id
                }).$promise.then(function(successResponse) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this allocation.',
                        'prompt': 'OK'
                    });

                    $timeout(self.closeAlerts, 2000);

                    self.tempAllocations.splice(index, 1);

                }).catch(function(error) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete allocation.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                });

            };

            self.saveFeature = function() {

                self.status.processing = true;

                self.scrubFeature(self.site);

                self.site.allocations = self.processRelations(self.tempAllocations);

                // self.site.workflow_state = "Draft";

                var exclude = [
                    'centroid',
                    'creator',
                    'dashboards',
                    'extent',
                    'geometry',
                    'members',
                    'metric_types',
                    // 'partners',
                    'practices',
                    'practice_types',
                    'properties',
                    'tags',
                    'targets',
                    'tasks',
                    'type',
                    // 'sites'
                ].join(',');

                Site.update({
                    id: $route.current.params.siteId,
                    exclude: exclude
                }, self.site).then(function(successResponse) {

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Site changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.displayModal = false;

                    self.targetPartner = null;

                    self.loadAllocations();

                    self.loadPartnerships();

                }).catch(function(error) {

                    // Do something with the error

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong and the changes could not be saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                    self.displayModal = false;

                    self.targetPartner = null;

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.site) {

                    targetId = self.site.id;

                } else {

                    targetId = self.site.id;

                }

                Site.delete({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this site.',
                        'prompt': 'OK'
                    });

                    $timeout(self.closeRoute, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + self.site.name + '”. There are pending tasks affecting this site.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this site.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this site.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(self.closeAlerts, 2000);

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
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: false,
                        can_delete: false
                    };

                    //
                    // Assign site to a scoped variable
                    //
                    site.$promise.then(function(successResponse) {

                        self.site = successResponse;

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                        } else {

                            self.processFeature(successResponse);

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                            $rootScope.page.title = 'Edit Project';

                        }

                        self.loadAllocations();

                        self.loadPartnerships();

                    }, function(errorResponse) {

                        $log.error('Unable to load site.');

                        self.showElements();

                    });

                });

            } else {

                $location.path('/login');

            }

        });
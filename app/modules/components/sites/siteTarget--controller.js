'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('SiteTargetController',
        function($scope, Account, $location, $log, Site, site,
            $rootScope, $route, user, FilterStore, $timeout, SearchService,
            MetricType) {

            var self = this;

            $rootScope.viewState = {
                'site': true
            };

            $rootScope.toolbarState = {
                'editTargets': true
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

                $location.path('/sites');

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.loadMatrix = function() {

                //
                // Assign site to a scoped variable
                //
                Site.targetMatrix({
                    id: $route.current.params.siteId
                }).$promise.then(function(successResponse) {

                    self.targets = successResponse;

                }).catch(function(errorResponse) {

                    $log.error('Unable to load site target matrix.');

                });

            };

            self.loadSite = function() {

                var exclude = [
                    'centroid',
                    'creator',
                    'dashboards',
                    'extent',
                    'geometry',
                    'members',
                    'metric_types',
                    'partners',
                    'practices',
                    'practice_types',
                    'properties',
                    'tags',
                    'targets',
                    'tasks',
                    'type',
                    'sites'
                ].join(',');
                
                Site.get({
                    id: $route.current.params.siteId,
                    exclude: exclude
                }).$promise.then(function(successResponse) {

                    self.processSite(successResponse);

                    if (!successResponse.permissions.read &&
                        !successResponse.permissions.write) {

                        self.makePrivate = true;

                    }

                    self.permissions.can_edit = successResponse.permissions.write;
                    self.permissions.can_delete = successResponse.permissions.write;

                }).catch(function(errorResponse) {

                    $log.error('Unable to load site');

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

            self.removeAll = function() {

                self.targets.active.forEach(function (item) {

                    self.targets.inactive.unshift(item);

                });

                self.targets.active = [];

            };

            self.addTarget = function(item, idx) {

                if (!item.value ||
                    typeof item.value !== 'number') {

                    item.value = 0;

                };

                if (typeof idx === 'number') {

                    item.action = 'add';

                    if (!item.metric ||
                        typeof item.metric === 'undefined') {

                        item.metric_id = item.id;

                        delete item.id;

                    }

                    self.targets.inactive.splice(idx, 1);

                    self.targets.active.push(item);

                }

                console.log('Updated targets (addition)');

            };

            self.removeTarget = function(item, idx) {

                if (typeof idx === 'number') {

                    self.targets.active.splice(idx, 1);

                    item.action = 'remove';

                    item.value = null;

                    self.targets.inactive.unshift(item);

                }

                console.log('Updated targets (removal)');

            };

            self.processTargets = function(list) {

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

            self.processSite = function(data) {

                self.site = data.properties || data;

                self.tempTargets = self.site.targets || [];

                self.status.processing = false;

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'extent',
                    'geometry',
                    'last_modified_by',
                    'organization',
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

            self.saveTargets = function() {

                self.status.processing = true;

                self.scrubFeature(self.site);

                console.log('self.saveSite.site', self.site);

                console.log('self.saveSite.Site', Site);

                var data = {
                    targets: self.targets.active.slice(0)
                };

                self.targets.inactive.forEach(function (item) {

                    if (item.action &&
                        item.action === 'remove') {

                        data.targets.push(item);

                    }

                });

                Site.updateMatrix({
                    id: +self.site.id
                }, data).$promise.then(function(successResponse) {

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Target changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                }).catch(function(error) {

                    console.log('saveSite.error', error);

                    // Do something with the error

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Something went wrong and the target changes were not saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                });

            };

            self.saveSite = function() {

                self.status.processing = true;

                self.scrubFeature(self.site);

                self.site.targets = self.processTargets(self.tempTargets);

                console.log('self.saveSite.site', self.site);

                console.log('self.saveSite.Site', Site);

                Site.update({
                    id: +self.site.id
                }, self.site).then(function(successResponse) {

                    self.processSite(successResponse);

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Site changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

                    self.status.processing = false;

                }).catch(function(error) {

                    console.log('saveSite.error', error);

                    // Do something with the error

                    self.status.processing = false;

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.site.properties) {

                    targetId = self.site.properties.id;

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
                            'msg': 'Unable to delete “' + self.site.properties.name + '”. There are pending tasks affecting this site.',
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

                    self.loadSite();

                    self.loadMatrix();

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit site targets'
                    };

                });

            } else {

                $location.path('/logout');

            }

        });
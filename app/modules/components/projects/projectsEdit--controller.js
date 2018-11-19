'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectEditController',
        function(Account, $location, $log, Project, project,
            $rootScope, $route, user, SearchService, $timeout,
            Utility, $interval) {

            var self = this;

            $rootScope.toolbarState = {
                'edit': true
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

                $location.path('/projects');

            };

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

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
                    // Assign project to a scoped variable
                    //
                    project.$promise.then(function(successResponse) {

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                        } else {

                            self.processFeature(successResponse);

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                            $rootScope.page.title = 'Edit Project';

                        }

                        self.showElements();

                    }, function(errorResponse) {

                        $log.error('Unable to load request project');

                        self.showElements();

                    });

                });

            } else {

                $location.path('/login');

            }

            self.searchPrograms = function(value) {

                return SearchService.program({
                    q: value
                }).$promise.then(function(response) {

                    console.log('SearchService.program response', response);

                    response.results.forEach(function(result) {

                        result.category = null;

                    });

                    return response.results.slice(0, 5);

                });

            };

            self.searchOrganizations = function(value) {

                return SearchService.organization({
                    q: value
                }).$promise.then(function(response) {

                    console.log('SearchService.organization response', response);

                    response.results.forEach(function(result) {

                        result.category = null;

                    });

                    return response.results.slice(0, 5);

                });

            };

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

                self.project = data;

                if (self.project.properties.program) {

                    self.program = self.project.properties.program.properties;

                }

                self.tempPartners = self.project.properties.partners;

                self.status.processing = false;

            };

            self.setProgram = function(item, model, label) {

                self.project.properties.program_id = item.id;

            };

            self.unsetProgram = function() {

                self.project.properties.program_id = null;

                self.program = null;

            };

            self.scrubProject = function() {

                delete self.project.properties.geographies;
                delete self.project.properties.practices;
                delete self.project.properties.program;
                delete self.project.properties.sites;
                delete self.project.properties.tags;

            };

            self.saveProject = function() {

                self.status.processing = true;

                self.scrubProject();

                self.project.properties.partners = self.processRelations(self.tempPartners);

                self.project.properties.workflow_state = "Draft";

                self.project.$update().then(function(successResponse) {

                    self.processFeature(successResponse);

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Project changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(self.closeAlerts, 2000);

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

                });

            };

            self.deleteFeature = function() {

                var targetId;

                if (self.project.properties) {

                    targetId = self.project.properties.id;

                } else {

                    targetId = self.project.id;

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
                            'msg': 'Unable to delete “' + self.project.properties.name + '”. There are pending tasks affecting this project.',
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

                });

            };

        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectEditCtrl',
        function(Account, $location, $log, Project, project,
            $rootScope, $route, user, SearchService, $timeout) {

            var self = this;

            $rootScope.toolbarState = {
                'edit': true
            };

            $rootScope.page = {};

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path('/projects');

            }

            self.confirmDelete = function(obj) {

                self.deletionTarget = self.deletionTarget ? null : obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            //
            // Assign project to a scoped variable
            //
            project.$promise.then(function(successResponse) {

                self.project = successResponse;

                self.tempPartners = self.project.properties.partners;

                self.tempPrograms = self.project.properties.programs;

                $rootScope.page.title = 'Edit Project';

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(project),
                            can_delete: Account.canDelete(project)
                        };

                    });

                }

            }, function(errorResponse) {

                $log.error('Unable to load request project');

            });

            self.searchPrograms = function(value) {

                return SearchService.programs({
                    q: value
                }).$promise.then(function(response) {

                    console.log('SearchService.programs response', response);

                    response.results.forEach(function(result) {

                        result.category = null;

                    });

                    return response.results.slice(0, 5);

                });

            };

            self.searchOrganizations = function(value) {

                return SearchService.organizations({
                    q: value
                }).$promise.then(function(response) {

                    console.log('SearchService.organizations response', response);

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

            self.scrubProject = function() {

                delete self.project.properties.geographies;
                delete self.project.properties.practices;
                delete self.project.properties.sites;
                delete self.project.properties.tags;

            };

            self.saveProject = function() {

                self.scrubProject();

                self.project.properties.programs = self.processRelations(self.tempPrograms);

                self.project.properties.partners = self.processRelations(self.tempPartners);

                self.project.properties.workflow_state = "Draft";

                self.project.$update().then(function(response) {

                    $location.path('/projects/' + self.project.id);

                }).then(function(error) {
                    // Do something with the error
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

                    $timeout(closeRoute, 2000);

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

                    $timeout(closeAlerts, 2000);

                });

            };

        });
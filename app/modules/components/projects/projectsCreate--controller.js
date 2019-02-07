'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProjectCreateController',
        function(Account, $location, $log, Project, $rootScope, $route, user, SearchService) {

            var self = this;

            $rootScope.viewState = {
                'project': true
            };

            $rootScope.page = {};

            self.project = {};

            $rootScope.page.title = 'Create Project';

            self.tempPartners = [];

            self.tempPrograms = [];

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

                    self.organization = $rootScope.user.properties.organization;

                    self.project.organization_id = self.organization.properties.id;

                });

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

            self.setProgram = function(item, model, label) {

                self.project.program_id = item.id;

            };

            self.unsetProgram = function() {

                self.project.program_id = null;

                self.program = null;

            };

            self.saveProject = function() {

                var project = new Project(self.project);

                project.$save().then(function(successResponse) {

                    $location.path('/projects/' + successResponse.id);

                }).then(function(error) {

                    $log.error('Unable to create project.');

                });

            };

        });
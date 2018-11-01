(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:ProjectUsersCtrl
     * @description
     * # ProjectUsersCtrl
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('ProjectUsersCtrl',
            function(Account, Collaborators, $window, $rootScope, $scope, $route,
                $location, project, user, members, SearchService) {

                var self = this;

                $rootScope.page = {};

                $rootScope.viewState = {
                    'project': true
                };

                $rootScope.toolbarState = {
                    'users': true
                };

                //
                // Assign project to a scoped variable
                //
                project.$promise.then(function(successResponse) {

                    console.log('self.project', successResponse);

                    self.project = successResponse;

                    $rootScope.page.title = self.project.properties.name;

                    self.tempOwners = self.project.properties.members;

                    console.log('tempOwners', self.tempOwners);

                    // self.project.users = members;
                    self.project.users_edit = false;

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
                                can_edit: Account.canEdit(project)
                            };

                        });

                    }

                }, function(errorResponse) {

                    console.error('Unable to load request project');

                });

                self.searchUsers = function(value) {

                    return SearchService.users({
                        q: value
                    }).$promise.then(function(response) {

                        console.log('SearchService response', response);

                        response.results.forEach(function(result) {

                            result.category = null;

                        });

                        return response.results.slice(0,5);

                    });

                };

                self.addOwner = function(item, model, label) {

                    var _datum = {
                        id: item.id,
                        properties: item
                    };

                    self.tempOwners.push(_datum);

                    self.ownerQuery = null;

                    console.log('Updated owners (addition)', self.tempOwners);

                };

                self.removeOwner = function(id) {

                    var _index;

                    self.tempOwners.forEach(function(item, idx) {

                        if (item.id === id) {

                            _index = idx;

                        }

                    });

                    console.log('Remove owner at index', _index);

                    if (typeof _index === 'number') {

                        self.tempOwners.splice(_index, 1);

                    }

                    console.log('Updated owners (removal)', self.tempOwners);

                };

                self.processOwners = function(list) {

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

                self.saveProject = function() {

                    self.project.properties.members = self.processOwners(self.tempOwners);

                    // We are simply removing this from the request because we should not
                    // be saving updates to the Projects Sites at this point, just the Project
                    delete self.project.properties.geographies;
                    delete self.project.properties.practices;
                    delete self.project.properties.programs;
                    delete self.project.properties.sites;
                    delete self.project.properties.tags;

                    self.project.$update().then(function(response) {

                        $location.path('/projects/' + self.project.id);

                    }).then(function(error) {

                        // Do something with the error

                    });

                };

            });

}());
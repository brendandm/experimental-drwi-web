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
        .controller('ProjectUsersCtrl', function(Account, Collaborators, $rootScope, $scope, $route, $location, project, user, members) {

            var self = this;
            $rootScope.page = {};

            //
            // Assign project to a scoped variable
            //
            project.$promise.then(function(successResponse) {
                self.project = successResponse;

                $rootScope.page.title = self.project.properties.name;
                $rootScope.page.links = [{
                        text: 'Projects',
                        url: '/projects'
                    },
                    {
                        text: self.project.properties.name,
                        url: '/projects/' + self.project.id
                    },
                    {
                        text: 'Edit',
                        url: '/projects/' + self.project.id + '/edit',
                        type: 'active'
                    },
                    {
                        text: 'Collaborators',
                        url: '/projects/' + self.project.id + '/users'
                    }
                ];
                $rootScope.page.actions = [];

                self.project.users = members;
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

            //
            // Empty Collaborators object
            //
            // We need to have an empty geocode object so that we can fill it in later
            // in the address geocoding process. This allows us to pass the results along
            // to the Form Submit function we have in place below.
            //
            self.collaborator = {
                invitations: [],
                sendInvitations: function() {
                    Collaborators.invite({
                        'collaborators': self.collaborator.invitations,
                        'project_id': self.project.id
                    }).$promise.then(function(successResponse) {
                        $route.reload();
                    }, function(errorResponse) {
                        console.log('errorResponse', errorResponse);
                    });
                }
            };

            //
            // When the user has selected a response, we need to perform a few extra
            // tasks so that our scope is updated properly.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.collaborator.response;
            }), function(response) {

                if (response) {

                    // Reset the fields we are done using
                    self.collaborator.query = null;
                    self.collaborator.response = null;

                    // Add the selected user value to the invitations list
                    self.collaborator.invitations.push(response);
                }

            });

            self.users = {
                list: members,
                search: null,
                invite: function(user) {
                    self.invite.push(user); // Add selected User object to invitation list
                    this.search = null; // Clear search text
                },
                add: function() {
                    angular.forEach(self.invite, function(user_, $index) {
                        Feature.AddUser({
                            storage: storage,
                            featureId: $scope.project.id,
                            userId: user_.id,
                            data: {
                                read: true,
                                write: true,
                                is_admin: false
                            }
                        }).then(function(response) {
                            //
                            // Once the users have been added to the project refresh the page
                            //
                            self.page.refresh();
                        });
                    });
                },
                remove: function() {
                    self.project.$update().then(function(response) {
                        $route.reload();
                    }).then(function(error) {
                        // Do something with the error
                    });
                },
                remove_confirm: false
            };

        });

}());
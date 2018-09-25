'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationEditViewController',
        function(Account, $location, $log, Notifications, $rootScope, $route, user, User, Organization) {

            var self = this;

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Edit Organization',
                        'links': []
                    };

                    //
                    // Load organization data
                    //

                    self.actions.organization(self.user);

                });


            } else {
                //
                // If there is not Account.userObject and no user object, then the
                // user is not properly authenticated and we should send them, at
                // minimum, back to the projects page, and have them attempt to
                // come back to this page again.
                //
                self.actions.exit();

            }

            //
            //
            //
            self.status = {
                'saving': false
            };

            self.actions = {
                parseFeature:  function(data) {

                    self.organization = data.properties;

                    delete self.organization.creator;
                    delete self.organization.last_modified_by;
                    delete self.organization.project;
                    delete self.organization.snapshots;

                    console.log('self.organization', self.organization);

                },
                organization: function(user) {

                    var organizationId = user.properties.organization.properties.id;

                    Organization.get({
                        id: organizationId
                    }).$promise.then(function(successResponse) {

                        console.log('self.actions.organization', successResponse);

                        self.actions.parseFeature(successResponse);

                    }, function(errorResponse) {

                        console.error('Unable to load organization.');

                    });

                },
                save: function() {

                    self.status.saving = true;

                    Organization.update({
                        id: self.organization.id
                    }, self.organization).$promise.then(function(successResponse) {

                        self.status.saving = false;

                        $rootScope.notifications.success('Great!', 'Your organization changes were saved.');

                        self.actions.parseFeature(successResponse);

                    }, function(errorResponse) {

                        self.status.saving = false;

                        $rootScope.notifications.error('', 'Unable to save your organization changes.');

                    });
                },
                exit: function() {
                    $location.path('/projects');
                }
            };

        });
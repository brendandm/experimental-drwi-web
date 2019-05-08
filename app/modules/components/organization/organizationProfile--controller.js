'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationProfileViewController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, Organization, SearchService, $timeout) {

            var self = this;

            $rootScope.viewState = {
                'organizationProfile': true
            };

            self.status = {
                loading: true,
                processing: false
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

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
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };

                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Organization Profile'
                    };

                    //
                    // Load organization data
                    //

                    if (self.user.properties.organization) {

                        self.loadOrganization(self.user.properties.organization_id);

                    } else {

                        self.status.loading = false;

                    }

                });


            } else {

                $location.path('/logout');

            }

            self.parseFeature = function(data) {

                self.organizationProfile = data.properties;
                console.log(self.organizationProfile.description)
           //     delete self.organizationProfile.creator;
           //     delete self.organizationProfile.last_modified_by;
           //     delete self.organizationProfile.dashboards;

                console.log('self.organizationProfile', self.organizationProfile);

            };

           self.loadOrganization = function(organizationId, postAssigment) {

                Organization.get({
                    id: organizationId
                }).$promise.then(function(successResponse) {

                    console.log('self.organization', successResponse);

                    self.parseFeature(successResponse);

                    if (postAssigment) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully added you to ' + self.organizationProfile.name + '.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                    }

                    self.status.loading = false;

                }, function(errorResponse) {

                    console.error('Unable to load organization.');

                    self.status.loading = false;

                });

           };

            self.loadOrganizationProjects = function(){

            }


        });
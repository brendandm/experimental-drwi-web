'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OnboardingOrganizationController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, Organization, SearchService, $timeout) {

            var self = this;

            $rootScope.viewState = {
                'organization': true
            };

            self.status = {
                loading: false,
                processing: false
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            self.updateRelation = function(organization) {

                var _user = new User({
                    'id': self.user.id,
                    'first_name': self.user.properties.first_name,
                    'last_name': self.user.properties.last_name,
                    'organization_id': organization.id
                });

                _user.$update(function(successResponse) {

                    console.log('Onboarding update user', successResponse);

                    self.status.processing = false;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully added you to ' + organization.name + '.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);

                    Account.getUser().$promise.then(function(userResponse) {

                        Account.userObject = userResponse;

                        $rootScope.user = Account.userObject;
                        $rootScope.isLoggedIn = Account.hasToken();
                        $rootScope.isAdmin = Account.hasRole('admin');

                        $location.path('/');

                    });

                }, function(errorResponse) {

                    self.status.processing = false;

                });

            };

            self.assignOrganization = function() {

                console.log('self.organizationSelection', self.organizationSelection);

                self.status.processing = true;

                if (typeof self.organizationSelection === 'string') {

                    var _organization = new Organization({
                        'name': self.organizationSelection
                    });

                    _organization.$save(function(successResponse) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully created ' + self.organization.name + '.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        self.updateRelation(successResponse.properties);

                    }, function(errorResponse) {

                        self.status.processing = false;

                    });

                } else {

                    self.updateRelation(self.organizationSelection);

                }

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
                        'title': 'Join an organization'
                    };

                });


            } else {

                $location.path('/login');

            }

        });
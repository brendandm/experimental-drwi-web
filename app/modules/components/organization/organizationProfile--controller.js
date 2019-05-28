'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationProfileViewController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, $routeParams, user, User, Organization, SearchService, $timeout) {

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

            var featureId = $routeParams.id;

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;
                    console.log('userResponse',userResponse);
                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };
                    console.log(" self.permissions", self.permissions);
                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Organization Profile'
                    };

                    //
                    // Load organization data
                    //
                    if(featureId && featureId != self.user.properties.organization) {
                         self.loadOrganization(featureId);

                         self.loadOrganizationProjects(featureId);

                         self.loadOrganizationMembers(featureId);
                    }

                    else if (self.user.properties.organization) {

                        self.loadOrganization(self.user.properties.organization_id);

                        self.loadOrganizationProjects(self.user.properties.organization_id);

                        self.loadOrganizationMembers(self.user.properties.organization_id);

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
                console.log('self.organizationProfile', self.organizationProfile);

                     console.log("page.organizationProfile.id", self.organizationProfile.id);
                    console.log("page.user.properties.organization",self.user.properties.organization.id);

            };

           self.loadOrganization = function(organizationId, postAssigment) {

                Organization.profile({
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

            self.loadOrganizationProjects = function(organizationId, postAssigment) {

                Organization.projects({
                    id: organizationId
                }).$promise.then(function(successResponse) {

                    console.log('self.organizationProjects', successResponse);

                    self.organizationProjects = successResponse.properties;

                    self.projects = successResponse.properties;

                    self.projectCount = successResponse.count;

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


            self.parseMembers = function(members){
                     console.log('members', members);
                     var i = 0;
                     for (var m in members) {
                        if(  self.organizationMembers[i].picture != null){
                            var picture =   self.members[i].picture;
                            console.log(self.members[i].picture);
                            self.members[i].picture = picture.replace("original", "square");
                            console.log(self.members[i].picture);

                         }
                        i++;
                      }
            }

            self.loadOrganizationMembers = function(organizationId, postAssigment) {

                Organization.members({
                    id: organizationId
                }).$promise.then(function(successResponse) {

                    console.log('self.organizationMembers', successResponse);

                     self.organizationMembers = successResponse.properties;

                     self.members = successResponse.properties;

                     self.parseMembers(self.members);

                     self.memberCount = successResponse.count;

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

        });
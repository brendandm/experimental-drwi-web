'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationProfileViewController',
        function(Project, Account, $location, $log, Notifications, $rootScope,
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

                self.organizationProfile = data;
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

                    self.organizationProjects = successResponse.features;

                    self.projects = successResponse.features;

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

                     self.organizationMembers = successResponse.features;

                     self.members = successResponse;

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


           self.confirmDelete = function(obj) {

                self.deletionTarget = obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(obj, index) {

                Project.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this project.',
                        'prompt': 'OK'
                    }];

                    self.projects.splice(index, 1);

                    $timeout(closeAlerts, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this project.',
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
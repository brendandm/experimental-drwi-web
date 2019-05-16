'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('OrganizationEditViewController',
        function(Account, $location, $log, Notifications, $rootScope,
            $route, user, User, Organization, Image, SearchService, $timeout) {

            var self = this;

            self.image = null;

            $rootScope.viewState = {
                'organization': true
            };

            self.status = {
                loading: true,
                processing: false,
                image: {
                    remove: false
                }
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeAlertRedirection() {
                self.alerts = [];
                $location.path('/organizationProfile' );
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
                        'title': 'Edit Organization'
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

            self.saveOrganization = function() {

                self.status.processing = true;

                self.scrubFeature(self.organization);


                if (self.image) {

                        var fileData = new FormData();

                        fileData.append('image', self.image);

                        Image.upload({

                        }, fileData).$promise.then(function(successResponse) {

                            console.log('successResponse', successResponse);

                         //   profile_.images = [{
                         //       id: successResponse.id
                         //   }];

                            self.organization.picture = successResponse.original;
                            console.log('self.organization.picture: '+self.organization.picture);
                        //    profile_.$update(function(userResponse) {
                        //        $rootScope.user = userRespo nse;
                        //        $location.path('/profiles/' + $rootScope.user.id);
                        //    });

                            self.OrganizationUpdate();

                        });

                } else {
                     self.OrganizationUpdate();
                }
                console.log("XX");
                console.log(self.organization);

            }

            self.removeImage = function() {
                 self.organization.picture = null;
                 self.status.image.remove = true;

                 self.OrganizationUpdate();
            }

            self.OrganizationUpdate = function(){

                 self.scrubFeature(self.organization);

                 Organization.update({
                    id: self.organization.id
                }, self.organization).$promise.then(function(successResponse) {

                    self.status.processing = false;



                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Organization profile updated.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);
                //    $timeout(closeAlertRedirection, 2000);

                    self.parseFeature(successResponse);

                }, function(errorResponse) {

                    self.status.processing = false;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Unable to update organization profile.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);

                });

            };



                self.parseFeature = function(data) {

                    self.organization = data.properties;

                    delete self.organization.creator;
                    delete self.organization.last_modified_by;
                    delete self.organization.dashboards;

                    console.log('self.organization', self.organization);
                    console.log('Picture',self.organization.picture);

                };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'creator',
                    'geometry',
                    'tags',
                    'tasks',
                    'user',
                    'projects'
                ];

                var reservedProperties = [
                    'links',
                    'permissions',
                    '$promise',
                    '$resolved'
                ];

                excludedKeys.forEach(function(key) {

                    if (feature.properties) {

                        delete feature.properties[key];

                    } else {

                        delete feature[key];

                    }

                });

                reservedProperties.forEach(function(key) {

                    delete feature[key];

                });

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
                            'msg': 'Successfully added you to ' + self.organization.name + '.',
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

            self.updateRelation = function(organizationId) {

                var _user = new User({
                    'id': self.user.id,
                    'first_name': self.user.properties.first_name,
                    'last_name': self.user.properties.last_name,
                    'organization_id': organizationId
                });

                _user.$update(function(successResponse) {

                    self.status.processing = false;

                    self.user = successResponse;

                    if (self.user.properties.organization) {

                        self.loadOrganization(self.user.properties.organization_id, true);

                    }

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

                        self.parseFeature(successResponse);

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully created ' + self.organization.name + '.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        self.updateRelation(self.organization.id);

                    }, function(errorResponse) {

                        self.status.processing = false;

                    });

                } else {

                    self.updateRelation(self.organizationSelection.id);

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

        });
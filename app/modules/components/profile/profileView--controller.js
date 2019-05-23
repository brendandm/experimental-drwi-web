                                                   'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ProfileViewController',
        function(Account, Profile, $location, $log, Notifications, $rootScope, $routeParams,
            $route, user, Image, $timeout) {

            var self = this;

            self.image = null;

            $rootScope.viewState = {
                'profile': true
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
             var featureId = $routeParams.id;

            //
            // Assign project to a scoped variable
            //
            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {
             //   if(!featureId){
                  console.log("feature id not set");
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
                            'title': 'Profile'
                        };



                           self.actions.getMember();


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

            self.actions = {
                getMember:function() {
                       console.log("GetMember:");
                      Profile.member({
                            id: featureId
                        }, self.member).$promise.then(function(successResponse) {

                               self.member = successResponse;
                               var picture = self.member.picture;
                               self.member.picture = picture.replace("original", "square");

                       }, function(errorResponse) {

                            self.status.processing = false;

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Could not retrieve profile.',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                        });
                }

            };



        });
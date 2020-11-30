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

        //    self.member = {
        //                    picture : null
        //                   };

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

                        self.permissions = {};
                        console.log(" self.permissions", self.permissions);
                        //
                        // Setup page meta data
                        //
                        $rootScope.page = {
                            'title': 'Profile'
                        };

                        if(featureId && featureId != self.user.id){
                               self.actions.getMember();
                        }else{
                            self.member = self.user.properties;
                            console.log("self.member -->",self.member);
                            var picture = self.member.picture;
                            self.member.picture = picture.replace("original", "square");

                        }




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
                        }).$promise.then(function(successResponse) {

                               self.member = successResponse;
                               if(self.member.picture){
                                   var picture = self.member.picture;
                                   self.member.picture = picture.replace("original", "square");
                               }

                                 self.status.loading = false;
                                console.log("self.member", self.member);
                       }, function(errorResponse) {

                            self.status.processing = false;

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Could not retrieve profile.',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                              self.status.loading = false;

                        });
                }

            };



        });
'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('AccountEditViewController',
        function(Account, $location, $log, Notifications, $rootScope, $routeParams,
            $route, user, User, Image, $timeout) {

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

                        if(featureId && featureId != self.user.properties.id){

                             self.actions.getMember();
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
                      User.member({
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
                },
                save: function() {
                      self.status.processing = true;

                      if (self.image) {

                        var fileData = new FormData();

                        fileData.append('image', self.image);

                        Image.upload({

                        }, fileData).$promise.then(function(successResponse) {
                            console.log('YO YO ');
                            console.log('successResponse', successResponse);

                            self.user.properties.picture = successResponse.original;

                            self.updateUser();

                        });

                      } else {
                             self.updateUser();
                      }


                },
                removeImage: function (){
                    self.user.properties.picture = null;
                    self.status.image.remove = true;

                    self.updateUser();
                }
            };

            self.updateUser = function(){

                    var _user = new User({
                        'id': self.user.id,
                        'first_name': self.user.properties.first_name,
                        'last_name': self.user.properties.last_name,
                        'picture': self.user.properties.picture,
                        'bio': self.user.properties.bio,
                        'title': self.user.properties.title
                    });

                    _user.$update(function(successResponse) {

                        console.log('successResponse', successResponse);

                        self.user.properties = successResponse.properties;

                        console.log('self.user.properties', self.user.properties )

                        self.status.processing = false;

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Profile updated.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.status.processing = false;

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Your profile could not be updated.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                    });

            }

        });
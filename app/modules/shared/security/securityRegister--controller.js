(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('SecurityRegisterController',
            function(Account, $location, Notifications, Security, ipCookie, $rootScope, $timeout, User) {

                var self = this,
                    userId = null;

                self.cookieOptions = {
                    path: '/',
                    expires: 2
                };

                //
                // We have a continuing problem with bad data being placed in the URL,
                // the following fixes that
                //
                $location.search({
                    q: undefined,
                    results_per_page: undefined
                });

                function closeAlerts() {

                    $rootScope.alerts = null;

                }

                self.showError = function(msg) {

                    console.log('showError', Date.now());

                    self.register.processing = false;

                    $rootScope.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': msg,
                        'prompt': 'OK'
                    }];

                    console.log('$rootScope.alerts', $rootScope.alerts);

                    $timeout(closeAlerts, 2000);

                };

                self.register = {
                    data: {
                        email: null,
                        first_name: null,
                        last_name: null,
                        password: null
                    },
                    visible: false,
                    login: function(userId) {

                        var credentials = new Security({
                            email: self.register.data.email,
                            password: self.register.data.password,
                        });

                        credentials.$save(function(response) {

                            //
                            // Check to see if there are any errors by checking for the existence
                            // of response.response.errors
                            //
                            if (response.response && response.response.errors) {

                                if (response.response.errors.email) {
                                    self.showError(response.response.errors.email[0]);
                                }

                                if (response.response.errors.password) {
                                    self.showError(response.response.errors.password[0]);
                                }

                                return;

                            } else {

                                ipCookie.remove('FIELDSTACKIO_SESSION');

                                ipCookie('FIELDSTACKIO_SESSION', response.access_token, self.cookieOptions);

                                //
                                // Make sure we also set the User ID Cookie, so we need to wait to
                                // redirect until we're really sure the cookie is set
                                //
                                Account.setUserId().$promise.then(function() {

                                    Account.getUser().$promise.then(function(userResponse) {

                                        Account.userObject = userResponse;

                                        $rootScope.user = Account.userObject;

                                        $rootScope.isLoggedIn = Account.hasToken();

                                        self.newUser = new User({
                                            id: $rootScope.user.id,
                                            first_name: self.register.data.first_name,
                                            last_name: self.register.data.last_name
                                        });

                                        self.newUser.$update().then(function(updateUserSuccessResponse) {
                                            $location.path('/account');
                                        }, function(updateUserErrorResponse) {
                                            console.log('updateUserErrorResponse', updateUserErrorResponse);
                                        });

                                    });
                                });

                            }

                        }, function(response) {

                            if (response.response.errors.email) {
                                self.showError(response.response.errors.email[0]);
                            }

                            if (response.response.errors.password) {
                                self.showError(response.response.errors.password[0]);
                            }

                            return;

                        });

                    },
                    submit: function() {

                        self.register.processing = true;

                        //
                        // Check to see if Username and Password field are valid
                        //
                        if (!self.register.data.email) {

                            self.showError('An email is required.');

                            return;

                        } else if (!self.register.data.password) {

                            self.showError('A password is required.');

                            return;

                        }

                        //
                        // If all fields have values move on to the next step
                        //
                        Security.register({
                            email: self.register.data.email,
                            password: self.register.data.password
                        }, function(response) {

                            //
                            // Check to see if there are any errors by checking for the
                            // existence of response.response.errors
                            //
                            if (response.response && response.response.errors) {

                                if (response.response.errors.email) {
                                    self.showError(response.response.errors.email[0]);
                                }

                                if (response.response.errors.password) {
                                    self.showError(response.response.errors.password[0]);
                                }

                                return;

                            } else {

                                self.register.processing = false;

                                self.register.processingLogin = true;

                                self.register.login(response.response.user.id);

                            }

                        });

                    }

                };

            });

}());
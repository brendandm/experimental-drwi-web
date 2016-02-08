(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name 
     * @description
     */
     angular.module('FieldStack')
        .controller('SecurityController', function(Account, $location, Security, ipCookie, $route, $rootScope, $timeout) {
        
            var self = this;

            self.cookieOptions = {
                'path': '/',
                'expires': 7
            };

            self.login = {
              submit: function(firstTime) {

                self.login.processing = true;

                var credentials = new Security({
                  email: self.login.email,
                  password: self.login.password,
                });

                credentials.$save(function(response) {

                  //
                  // Check to see if there are any errors by checking for the existence
                  // of response.response.errors
                  //
                  if (response.response && response.response.errors) {
                    self.login.errors = response.response.errors;
                    self.register.processing = false;
                    self.login.processing = false;

                    $timeout(function() {
                      self.login.errors = null;
                    }, 3500);
                  } else {
                    //
                    // Make sure our cookies for the Session are being set properly
                    //
                    ipCookie.remove('WATERREPORTER_SESSION');
                    ipCookie('WATERREPORTER_SESSION', response.access_token, self.cookieOptions);

                    //
                    // Make sure we also set the User ID Cookie, so we need to wait to
                    // redirect until we're really sure the cookie is set
                    //
                    Account.setUserId().$promise.then(function() {
                      Account.getUser().$promise.then(function(userResponse) {

                        Account.userObject = userResponse;

                        $rootScope.user = Account.userObject;
                        $rootScope.isLoggedIn = Account.hasToken();
                        $rootScope.isAdmin = Account.hasRole('admin');

                        if ($rootScope.isAdmin) {
                          $location.path('/dashboard');
                        }
                        else if (firstTime) {
                          $location.path('/profiles/' + $rootScope.user.id + '/edit');
                        }
                        else {
                          $location.path('/activity');
                        }
                      });
                    });

                  }
                }, function(){
                  self.login.processing = false;
                  self.login.errors = {
                    email: ['The email or password you provided was incorrect']
                  };

                  $timeout(function() {
                    self.login.errors = null;
                  }, 3500);
                });
              }
            };
        });

}());

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('AccountEditViewController', function (Account, $location, $log, Notifications, $rootScope, $route, user, User) {

    var self = this;

    
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
                role: $rootScope.user.properties.roles[0].properties.name,
                account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
            };

            //
            // Setup page meta data
            //
            $rootScope.page = {
                "title": "Edit Account Information « FieldDoc",
                "links": [
                    {
                        "text": "Account",
                        "url": "/"
                    },
                    {
                        "text": "Edit",
                        "url": "/account/" + $rootScope.user.id + "/edit"
                    }
                ]    
            };


        });


    }
    else {
        //
        // If there is not Account.userObject and no user object, then the
        // user is not properly authenticated and we should send them, at
        // minimum, back to the projects page, and have them attempt to 
        // come back to this page again.
        //
        self.actions.exit();
    }



    //
    //
    //
    self.status = {
        "saving": false
    };

    self.actions = {
        save: function() {

            self.status.saving = true;

            var _user = new User({
                "id": self.user.id,
                "first_name": self.user.properties.first_name,
                "last_name": self.user.properties.last_name,
                "organizations": []    
            });

            _user.$update(function(successResponse) {

                self.status.saving = false;

                $rootScope.notifications.success("Great!", "Your account changes were saved");

                $location.path('/account/');

            }, function(errorResponse) {
                self.status.saving = false;
            });
        },
        exit: function() {
            $location.path('/projects');
        }
    };

  });

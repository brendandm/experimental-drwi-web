(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('SecurityLogoutController',
            function(Account, ipCookie, $location, $rootScope) {

            /**
             * Remove all cookies present for authentication
             */
            ipCookie.remove('FIELDSTACKIO_SESSION');
            ipCookie.remove('FIELDSTACKIO_SESSION', {
                path: '/'
            });

            ipCookie.remove('FIELDSTACKIO_CURRENTUSER');
            ipCookie.remove('FIELDSTACKIO_CURRENTUSER', {
                path: '/'
            });

            /**
             * Remove all data from the User and Account objects, this is really just
             * for display purposes and has no bearing on the actual session
             */
            $rootScope.user = Account.userObject = null;

            $rootScope.targetPath = null;

            /**
             * Redirect individuals back to the activity list
             */
            $location.path('/login');
            
        });

}());
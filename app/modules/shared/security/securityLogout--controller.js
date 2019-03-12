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
            ipCookie.remove('FIELDDOC_SESSION');
            ipCookie.remove('FIELDDOC_SESSION', {
                path: '/'
            });

            ipCookie.remove('FIELDDOC_CURRENTUSER');
            ipCookie.remove('FIELDDOC_CURRENTUSER', {
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
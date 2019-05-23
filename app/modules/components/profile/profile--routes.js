(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, environment) {


              $routeProvider
                .when('/profile/:id', {
                    templateUrl: '/modules/components/profile/views/profileView--view.html?t=' + environment.version,
                    controller: 'ProfileViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account, $rootScope, $document) {

                            $rootScope.targetPath = document.location.pathname;

                            return Account.getUser();

                        }
                    }
                });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc overview
     * @name FieldDoc
     * @description
     * # FieldDoc
     *
     * Main module of the application.
     */
    angular.module('FieldDoc')
        .config(function($routeProvider) {
            $routeProvider
                .when('/', {
                    redirectTo: '/account/login'
                })
                .when('/user', {
                    redirectTo: '/account/login'
                })
                .when('/user/login', {
                    redirectTo: '/account/login'
                })
                .when('/account/login', {
                    templateUrl: '/modules/shared/security/views/securityLogin--view.html',
                    controller: 'SecurityController',
                    controllerAs: 'page'
                })
                .when('/account/register', {
                    templateUrl: '/modules/shared/security/views/securityRegister--view.html',
                    controller: 'SecurityRegisterController',
                    controllerAs: 'page'
                })
                .when('/account/reset', {
                    templateUrl: '/modules/shared/security/views/securityResetPassword--view.html',
                    controller: 'SecurityResetPasswordController',
                    controllerAs: 'page'
                })
                .when('/logout', {
                    redirectTo: '/user/logout'
                })
                .when('/user/logout', {
                    template: 'Logging out ...',
                    controller: 'SecurityLogoutController',
                    controllerAs: 'page'
                });
        });

}());
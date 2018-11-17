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
        .config(function($routeProvider, environment) {
            $routeProvider
                .when('/login', {
                    templateUrl: '/modules/shared/security/views/securityLogin--view.html?t=' + environment.version,
                    controller: 'SecurityController',
                    controllerAs: 'page'
                })
                .when('/register', {
                    templateUrl: '/modules/shared/security/views/securityRegister--view.html?t=' + environment.version,
                    controller: 'SecurityRegisterController',
                    controllerAs: 'page'
                })
                .when('/reset', {
                    templateUrl: '/modules/shared/security/views/securityResetPassword--view.html?t=' + environment.version,
                    controller: 'SecurityResetPasswordController',
                    controllerAs: 'page'
                })
                .when('/logout', {
                    template: 'Logging out ...',
                    controller: 'SecurityLogoutController',
                    controllerAs: 'page'
                });
        });

}());
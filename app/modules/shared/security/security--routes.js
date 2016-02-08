(function() {

    'use strict';

    /**
     * @ngdoc overview
     * @name FieldStack
     * @description
     * # FieldStack
     *
     * Main module of the application.
     */
    angular.module('FieldStack')
      .config(function ($routeProvider) {
        $routeProvider
          .when('/', {
            redirectTo: '/user/login'
          })
          .when('/user', {
            redirectTo: '/user/login'
          })
          .when('/user/login', {
            templateUrl: '/modules/shared/security/views/securityLogin--view.html',
            controller: 'SecurityController',
            controllerAs: 'page'
          })
          .when('/user/register', {
            templateUrl: '/modules/shared/security/views/securityRegister--view.html',
            controller: 'SecurityController',
            controllerAs: 'page'
          })
          .when('/user/reset', {
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

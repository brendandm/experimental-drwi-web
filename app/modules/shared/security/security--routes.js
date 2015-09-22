'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', function($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SecurityLogin',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/authorize', {
        template: 'authorize',
        controller: 'SecurityAuthorize'
      })
      .when('/logout', {
        template: 'logout',
        controller: 'SecurityLogout'
      });

  }]);

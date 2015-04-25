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
        templateUrl: '/views/main.html',
        controller: 'SecurityLogin',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/authorize', {
        template: '',
        controller: 'SecurityAuthorize'
      })
      .when('/logout', {
        template: '',
        controller: 'SecurityLogout'
      });

  }]);

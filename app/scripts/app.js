'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular
  .module('practiceMonitoringAssessmentApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ipCookie',
    'ui.gravatar',
    'leaflet-directive',
    'angularFileUpload',
    'geolocation',
    'angular-loading-bar',
    'monospaced.elastic'
  ])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {


    //
    // Base template URL for piecing together all partial views
    //
    var templateUrl = '/views/main.html';

    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'IndexCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/authorize', {
        templateUrl: '/views/authorize.html',
        controller: 'AuthorizeCtrl'
      })
      .when('/logout', {
        templateUrl: '/views/logout.html',
        controller: 'LogoutCtrl'
      })
      .when('/users', {
        templateUrl: templateUrl,
        controller: 'UsersCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/reports', {
        templateUrl: templateUrl,
        controller: 'ReportsCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/metrics', {
        templateUrl: templateUrl,
        controller: 'MetricsCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/practices', {
        templateUrl: templateUrl,
        controller: 'PracticesCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/sites', {
        templateUrl: templateUrl,
        controller: 'SitesCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/projects', {
        templateUrl: templateUrl,
        controller: 'ProjectsCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .otherwise({
        templateUrl: '/views/errors/404.html'
      });

    //
    //
    //
    $locationProvider.html5Mode(true);


  }]);

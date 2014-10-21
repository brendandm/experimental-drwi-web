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
    'ng-file-upload',
    'ng-file-upload-shim',
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
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  });

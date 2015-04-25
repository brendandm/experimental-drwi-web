'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.authorizationInterceptor
 * @description
 * # authorizationInterceptor
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .factory('AuthorizationInterceptor', ['$location', '$q', 'ipCookie', function($location, $q, ipCookie) {

    return {
      request: function(config) {

        var session = ipCookie('COMMONS_SESSION');

        //
        // Before we make any modifications to the config/header of the request
        // check to see if our authorization page is being requested and if the
        // session cookie is defined
        //
        if (!session) {
          $location.path('/');
          return config || $q.when(config);
        }

        //
        // We have a session cookie if we've gotten this far. That means we
        // need to make some header changes so that all of our requests are
        // properly authenticated.
        //
        config.headers = config.headers || {};

        //
        // Add the Authorization header with our Access Token
        //
        if (session) {
          config.headers.Authorization = 'Bearer ' + session;
        }

        console.debug('AuthorizationInterceptor::Request', config || $q.when(config));
        return config || $q.when(config);
      },
      response: function(response) {
        console.debug('AuthorizationInterceptor::Response', response || $q.when(response));
        return response || $q.when(response);
      },
      responseError: function (response) {
        console.debug('AuthorizationInterceptor::ResponseError', response || $q.when(response));
        return $q.reject(response);
      }
    };
  }]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthorizationInterceptor');
  });

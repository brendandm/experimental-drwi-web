(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name FieldStack.authorizationInterceptor
     * @description
     * # authorizationInterceptor
     * Service in the FieldStack.
     */
    angular.module('FieldStack')
      .factory('AuthorizationInterceptor', function($location, $q, ipCookie, $log) {

        return {
          request: function(config) {

            var sessionCookie = ipCookie('WATERREPORTER_SESSION');

            //
            // Configure our headers to contain the appropriate tags
            //
            config.headers = config.headers || {};

            if (config.headers['Authorization-Bypass'] === true) {
              delete config.headers['Authorization-Bypass'];
              return config || $q.when(config);
            }

            if (sessionCookie) {
              config.headers.Authorization = 'Bearer ' + sessionCookie;
            }

            config.headers['Cache-Control'] = 'no-cache, max-age=0, must-revalidate';

            //
            // Configure or override parameters where necessary
            //
            config.params = (config.params === undefined) ? {} : config.params;

            console.debug('SecurityInterceptor::Request', config || $q.when(config));

            return config || $q.when(config);
          },
          response: function(response) {
            $log.info('AuthorizationInterceptor::Response', response || $q.when(response));
            return response || $q.when(response);
          },
          responseError: function (response) {
            $log.info('AuthorizationInterceptor::ResponseError', response || $q.when(response));
            return $q.reject(response);
          }
        };
      }).config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthorizationInterceptor');
      });

}());

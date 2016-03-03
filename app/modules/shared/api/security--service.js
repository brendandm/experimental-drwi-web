(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Security', function(environment, ipCookie, $http, $resource) {

      var Security = $resource(environment.apiUrl.concat('/v1/auth/account/login'), {}, {
        save: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/remote'),
          params: {
            response_type: 'token',
            client_id: environment.clientId,
            redirect_uri: environment.siteUrl.concat('/authorize'),
            scope: 'user',
            state: 'json'
          }
        },
        register: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/account/register')
        },
        reset: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/password/reset')
        }
      });

      Security.has_token = function() {
        return (ipCookie('FIELDSTACKIO_SESSION')) ? true: false;
      };

      return Security;
    });

}());

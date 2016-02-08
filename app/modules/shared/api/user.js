(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name 
   * @description
   */
  angular.module('FieldStack')
    .service('User', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/user/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH'
        },
        groups: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/user/:id/groups')
        },
        getOrganizations: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/user/:id/organization')
        },
        me: {
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/user/me')
        },
        classifications: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/user/:id/classifications')
        }
      });
    });

}());

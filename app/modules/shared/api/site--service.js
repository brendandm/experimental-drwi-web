(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name 
   * @description
   */
  angular.module('FieldStack')
    .service('Site', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/site/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH'
        },
        practices: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/site/:id/practices')
        }
      });
    });

}());

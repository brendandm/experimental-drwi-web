(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name 
   * @description
   */
  angular.module('FieldStack')
    .service('Project', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/project/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH'
        }
      });
    });

}());

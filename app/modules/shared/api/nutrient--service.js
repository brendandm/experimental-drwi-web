(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Nutrient', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/nutrient/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH'
        }
      });
    });

}());

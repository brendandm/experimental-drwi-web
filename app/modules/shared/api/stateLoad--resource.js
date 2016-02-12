(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldStack')
    .service('UALStateLoad', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/urban-ual-state/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        }
      });
    });

}());

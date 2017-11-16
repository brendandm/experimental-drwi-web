(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeWetlandsNonTidal', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-wetlands-nontidal/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/wetlands-nontidal/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

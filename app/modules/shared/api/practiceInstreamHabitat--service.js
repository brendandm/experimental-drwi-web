(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeInstreamHabitat', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-instream-habitat/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
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

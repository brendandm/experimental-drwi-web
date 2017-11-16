(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeLivestockExclusion', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-livestock-exclusion/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/livestock-exclusion/:id')
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

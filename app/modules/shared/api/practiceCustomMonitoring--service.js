(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeCustomMonitoring', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-custom-monitoring/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'save': {
          method: 'POST',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data),
                json_ = angular.toJson(feature);
            return json_;
          }
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data),
                json_ = angular.toJson(feature);
            return json_;
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldStack')
    .service('Practice', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/practice/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        },
        'urbanHomeowner': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_urban_homeowner'),
          'isArray': false
        },
        'bankStabilization': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bank_stabilization'),
          'isArray': false
        },
        'bioretention': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bioretention'),
          'isArray': false
        },
        'enhancedStreamRestoration': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_enhanced_stream_restoration'),
          'isArray': false
        },
        'forestBuffer': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_forest_buffer'),
          'isArray': false
        },
        'grassBuffer': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_grass_buffer'),
          'isArray': false
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('UnitType', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/unit/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                'update': {
                    'method': 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeType', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/practice-type/:id'), {
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
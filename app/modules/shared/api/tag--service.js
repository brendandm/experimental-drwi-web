(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Tag', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/tag/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/tags')
                },
                update: {
                    'method': 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                }
            });
        });

}());
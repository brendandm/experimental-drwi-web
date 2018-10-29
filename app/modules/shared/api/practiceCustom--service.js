(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeCustom', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/bmp-custom/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'metrics': {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/bmp-custom/:id/metrics')
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/custom/:id')
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
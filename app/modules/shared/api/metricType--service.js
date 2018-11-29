(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('MetricType', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/metric-type/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/metric-type')
                },
                update: {
                    'method': 'PATCH'
                }
            });
        });

}());
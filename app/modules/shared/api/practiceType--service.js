(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('PracticeType', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/practice-type/:id'), {
                'id': '@id',
                'metricId': '@metricId'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice-type')
                },
                update: {
                    'method': 'PATCH'
                },
                getSingle: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice-type/:id')

                },
                addMetric: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice-type/:id/metrics/:metricId/add')

                },
                removeMetric: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice-type/:id/metrics/:metricId/remove')

                }
            });
        });
}());
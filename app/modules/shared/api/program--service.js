(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Program', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/program/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/programs')
                },
                geographies: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/geographies')
                },
                metrics: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/metrics')
                },
                metricTypes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/metric-type')
                },
                outcomes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/outcomes')
                },
                practiceTypes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/practice-type')
                },
                projects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/projects')
                },
                update: {
                    method: 'PATCH'
                }
            });
        });

}());
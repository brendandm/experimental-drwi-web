(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Program', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/program/:id'), {
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
                outcomes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/outcomes')
                },
                projects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/program/:id/projects')
                },
                projectSites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/program/project/:id/sites')
                },
                sitePractices: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/program/site/:id/practices')
                },
                'update': {
                    method: 'PATCH'
                }
            });
        });

}());
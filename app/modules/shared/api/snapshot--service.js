(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Snapshot', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/snapshot/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                geographies: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/geographies')
                },
                metrics: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/metrics')
                },
                outcomes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/outcomes')
                },
                projects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/snapshot/:id/projects')
                },
                projectSites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/snapshot/project/:id/sites')
                },
                sitePractices: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/snapshot/site/:id/practices')
                },
                'update': {
                    method: 'PATCH'
                }
            });
        });

}());
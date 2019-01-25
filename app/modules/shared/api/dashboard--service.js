(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Dashboard', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/dashboard/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                // legacyFormat: {
                //     method: 'GET',
                //     isArray: false,
                //     url: environment.apiUrl.concat('/v1/data/dashboard/:id')
                // },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard')
                },
                filters: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/filters')
                },
                geographies: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/geographies')
                },
                availableMetrics: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/available-metrics')
                },
                metrics: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/metrics')
                },
                outcomes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/outcomes')
                },
                progress: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/progress')
                },
                projects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/projects')
                },
                availableProjects: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/dashboard/:id/available-projects')
                },
                projectSites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/dashboard/project/:id/sites')
                },
                sitePractices: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/dashboard/site/:id/practices')
                },
                update: {
                    method: 'PATCH'
                }
            });
        });

}());
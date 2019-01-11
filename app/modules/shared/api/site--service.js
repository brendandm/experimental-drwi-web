(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Site', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/site/:id'), {
                id: '@id'
            }, {
                'query': {
                    isArray: false
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/site/:id')
                },
                'nodes': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/site/:id/nodes')
                },
                partnerships: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/site/:id/partnerships')
                },
                update: {
                    method: 'PATCH'
                },
                'metrics': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/site/:id/metrics'),
                    'isArray': false
                },
                'outcomes': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/site/:id/outcomes'),
                    'isArray': false
                },
                'practices': {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/site/:id/practices')
                },
                tasks: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/site/:id/tasks'),
                    'isArray': false
                }
            });
        });

}());
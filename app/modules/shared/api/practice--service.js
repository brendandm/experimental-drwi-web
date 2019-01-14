(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Practice', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/practice/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                update: {
                    method: 'PATCH'
                },
                'metrics': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/metrics'),
                    'isArray': false
                },
                'outcomes': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/outcomes'),
                    'isArray': false
                },
                allocations: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/allocations')
                },
                partnerships: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/partnerships')
                },
                'site': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/site'),
                    'isArray': false
                },
                'custom': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_custom'),
                    'isArray': false
                },
                tasks: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/practice/:id/tasks'),
                    'isArray': false
                }
            });
        });

}());
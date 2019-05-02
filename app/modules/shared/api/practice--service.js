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
                layers: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/practice/:id/layers'),
                    'isArray': false
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
                reports: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/reports')
                },
                'site': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/practice/:id/site'),
                    'isArray': false
                },
                'custom': {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_custom'),
                    'isArray': false
                },
                model: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/model')
                },
                progress: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/progress')
                },
                tags: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/tags')
                },
                tagGroups: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/tag-groups')
                },
                targetMatrix: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/matrix')
                },
                tasks: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/practice/:id/tasks'),
                    'isArray': false
                },
                updateMatrix: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/practice/:id/matrix')
                }
            });
        });

}());
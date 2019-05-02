(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('LayerService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/layer/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false,
                    cache: true
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/layers')
                },
                features: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/layer/:id/features')
                },
                matrix: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/layer/:id/matrix')
                },
                updateMatrix: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/layer/:id/matrix')
                },
                update: {
                    method: 'PATCH'
                },
                tags: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/layer/:id/tags'),
                    'isArray': false
                },
                tasks: {
                    'method': 'GET',
                    'url': environment.apiUrl.concat('/v1/layer/:id/tasks'),
                    'isArray': false
                },
                batchDelete: {
                    'method': 'DELETE',
                    'url': environment.apiUrl.concat('/v1/layers'),
                    'isArray': false
                }
            });
        });

}());
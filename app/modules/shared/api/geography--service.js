(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('GeographyService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/geography/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false,
                    cache: true
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/geographies')
                },
                'update': {
                    method: 'PATCH'
                }
            });
        });

}());
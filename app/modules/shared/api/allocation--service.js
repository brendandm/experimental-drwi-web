(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Allocation', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/allocation/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/allocation')
                },
                update: {
                    'method': 'PATCH'
                }
            });
        });

}());
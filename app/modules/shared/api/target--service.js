(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Target', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/target/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/targets')
                },
                update: {
                    'method': 'PATCH'
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Partnership', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/partnership/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/partnership')
                },
                update: {
                    'method': 'PATCH'
                }
            });
        });

}());
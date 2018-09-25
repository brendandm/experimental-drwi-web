(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Organization', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/organization/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                update: {
                    method: 'PATCH'
                }
            });
        });

}());
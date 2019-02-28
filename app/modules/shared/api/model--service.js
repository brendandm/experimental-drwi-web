(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Model', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/model/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/models')
                },
                practiceTypes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/model/:id/practices')
                }
            });
        });

}());
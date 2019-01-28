(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('ColorService', function(environment, Preprocessors, $resource) {

            return $resource(environment.apiUrl.concat('/v1/color/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                randomColor: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/color/random-color')
                }
            });

        });

}());
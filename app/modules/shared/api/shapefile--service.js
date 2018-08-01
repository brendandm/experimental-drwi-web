(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Shapefile', function(environment, $resource) {

            return $resource(environment.apiUrl.concat('/v1/shape'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                upload: {
                    method: 'POST',
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }
            });

        });

}());
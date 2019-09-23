(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Batch', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/batch/:featureType/:id'), {
                featureType: '@featureType',
                id: '@id'
            }, {
                query: {
                    isArray: false,
                },
                batchDelete: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/batch/:featureType/:id')
                }
            });
        });

}());
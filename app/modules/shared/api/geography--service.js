(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('GeographyService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/program/:id/geographies'), {
                id: '@id'
            }, {
                query: {
                    isArray: false,
                    cache: true
                }
            });
        });

}());
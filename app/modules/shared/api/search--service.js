(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name WaterReporter
     * @description
     * Provides access to the map endpoint of the WaterReporter API
     * Service in the WaterReporter.
     */
    angular.module('FieldDoc')
        .service('SearchService', function(environment, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/search'), {}, {
                query: {
                    isArray: false,
                    cache: true
                },
                users: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/user')
                }
            });
        });

}());
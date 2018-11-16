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
                organization: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/organization')
                },
                program: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/program')
                },
                tag: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/tag')
                },
                tagGroup: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/tag-group')
                },
                user: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/user')
                },
                workspace: {
                    method: 'GET',
                    isArray: false,
                    cache: true,
                    url: environment.apiUrl.concat('/v1/data/search/workspace')
                }
            });
        });

}());
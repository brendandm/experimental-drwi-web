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
                },
                profile: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/organization/:id')
                }
                ,
                projects: {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/organization/:id/projects')
                },
                members: {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/organization/:id/members')
                }
            });
        });

}());
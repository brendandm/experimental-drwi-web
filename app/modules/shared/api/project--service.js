(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Project', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/project/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/project/:id')
                },
                update: {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                },
                sites: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/project/:id/sites')
                },
                members: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/project/:id/members')
                },
                minimal: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/data/program/:id/projects')
                }
            });
        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('TagGroup', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/tag-group/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/tag-groups')
                },
                update: {
                    'method': 'PATCH',
                    url: environment.apiUrl.concat('/v1/data/tag-group/:id')
                }
            });
        });

}());
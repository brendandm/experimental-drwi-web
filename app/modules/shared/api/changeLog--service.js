(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('ChangeLog', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/:type/:id/history'), {
                'id': '@id',
                'type':'@type'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/tasks')
                }
            });
        });

}());
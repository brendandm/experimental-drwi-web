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
            });
        });

}());
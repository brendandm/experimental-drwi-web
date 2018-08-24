(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('MetricService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/program/:id/metrics'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                }
            });
        });

}());
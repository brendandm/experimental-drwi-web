(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('OutcomeService', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/program/:id/outcomes'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                }
            });
        });

}());
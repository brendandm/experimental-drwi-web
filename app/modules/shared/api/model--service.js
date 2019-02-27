(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Model', function(environment, Preprocessors, $resource) {
            return $resource(':endpoint', {
                endpoint: '@endpoint'
            }, {
                query: {
                    isArray: false
                },
                // cast: {
                //     method: 'POST',
                //     isArray: false,
                //     url: environment.castUrl.concat('/v1/analyze')
                // },
                // collection: {
                //     method: 'GET',
                //     isArray: false,
                //     url: environment.apiUrl.concat('/v1/models')
                // },
                // dnr: {
                //     method: 'POST',
                //     isArray: false,
                //     url: environment.dnrUrl.concat('/v1/analyze')
                // },
                analyze: {
                    method: 'POST',
                    isArray: false
                },
                practiceTypes: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/model/:id/practices')
                }
            });
        });

}());
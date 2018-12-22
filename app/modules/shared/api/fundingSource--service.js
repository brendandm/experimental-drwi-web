(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('FundingSource', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/funding-source/:id'), {
                'id': '@id'
            }, {
                'query': {
                    'isArray': false
                },
                collection: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/funding-source')
                },
                update: {
                    'method': 'PATCH'
                }
            });
        });

}());
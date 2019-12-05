(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('Report', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/report/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'metrics': {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/report/:id/metrics')
                },
                'summary': {
                    isArray: false,
                    method: 'GET',
                    url: environment.apiUrl.concat('/v1/data/summary/custom/:id')
                },
                targetMatrix: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/report/:id/matrix')
                },
                update: {
                    method: 'PATCH'
                },
                updateMatrix: {
                    method: 'POST',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/report/:id/matrix')
                },
                reportBundle:{
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/report-bundle/:id')
                },
                projectReport:{
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/project/:id/reports')
                }
            });
        });

}());
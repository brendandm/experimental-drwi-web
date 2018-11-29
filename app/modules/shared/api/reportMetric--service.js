(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('ReportMetric', function(environment, Preprocessors, $resource) {
            return $resource(environment.apiUrl.concat('/v1/data/report-metric/:id'), {
                'id': '@id'
            }, {
                'query': {
                    isArray: false
                },
                'save': {
                    method: 'POST',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data),
                            json_ = angular.toJson(feature);
                        return json_;
                    }
                },
                update: {
                    method: 'PATCH'
                }
            });
        });

}());
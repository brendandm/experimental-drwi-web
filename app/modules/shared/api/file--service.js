(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('File', function (environment, Preprocessors, $resource) {

            return $resource(environment.apiUrl.concat('/v1/media/file/:id'), {
                id: '@id'
            }, {
                query: {
                    isArray: false
                },
                upload: {
                    method: 'POST',
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                },
                update: {
                    method: 'PATCH',
                    transformRequest: function(data) {
                        var feature = Preprocessors.geojson(data);
                        return angular.toJson(feature);
                    }
                }
            });

        });

}());

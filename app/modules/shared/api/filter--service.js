(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('Filters', function (environment, Preprocessors, $resource) {
         return $resource(environment.apiUrl.concat('/v1/data/filters'), {
           id: '@id'
         }, {
           projectsByYear: {
             isArray: false,
             url: environment.apiUrl.concat('/v1/data/filters/projects-by-year')
           }
         });

       });

}());

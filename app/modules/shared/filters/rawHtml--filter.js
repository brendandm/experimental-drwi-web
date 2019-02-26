(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .filter('rawHtml', ['$sce', function($sce) {

            return function(value) {

                return $sce.trustAsHtml(val);

            };

        }]);

}());
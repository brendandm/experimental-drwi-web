(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .filter('capitalAttribute', function() {

            return function(string) {

                string.replace(/_/gi, ' ');

                if (string && string.length > 0) {

                    return string.charAt(0).toUpperCase() + string.slice(1);

                }

                return string;

            };

        });

}());
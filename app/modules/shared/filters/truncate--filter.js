(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .filter('truncate', function() {

            return function(string, length) {

                if (string.length > length) {

                    return string.substr(0, length) + '…';

                } else {

                    return string;

                }

            };

        });

}());
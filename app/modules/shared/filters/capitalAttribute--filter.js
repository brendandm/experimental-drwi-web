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

                if (typeof string === 'string') {

                    var normalizedString = string.replace(/_/gi, ' ');

                    if (normalizedString && normalizedString.length > 0) {

                        return normalizedString.charAt(0).toUpperCase() + normalizedString.slice(1);

                    }

                    return normalizedString;

                }

                return string;

            };

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .filter('convertArea', function() {

            return function(value, unit) {

                var unitIndex = {
                        'acre': 0.0002471052,
                        'hectare': 0.0001,
                        'kilometer': 0.000001
                    },
                    multiplicand = unitIndex[unit];

                if (typeof multiplicand !== 'undefined') {

                    return value * multiplicand;

                } else {

                    return null;

                }

            };

        });

}());
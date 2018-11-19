'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
    .service('Utility', function() {

        return {
            machineName: function(name) {

                if (name) {

                    var removeDashes = name.replace(/-/g, ''),
                        removeSpaces = removeDashes.replace(/ /g, '-'),
                        convertLowerCase = removeSpaces.toLowerCase();

                    return convertLowerCase;
                }

                return null;

            },
            camelName: function(name) {

                if (name) {

                    return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
                        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
                    }).replace(/\s+/g, '');

                }

                return null;

            },
            precisionRound: function(value, decimals, base) {

                var pow = Math.pow(base || 10, decimals);

                return Math.round(value * pow) / pow;

            },
            meterCoefficient: function() {

                var range = [
                    0.04,
                    0.08,
                    0.12,
                    0.16,
                    0.20,
                    0.24,
                    0.28,
                    0.32,
                    0.36,
                    0.40
                ];

                return range[Math.floor(Math.random() * range.length)];

            }
        };

    });
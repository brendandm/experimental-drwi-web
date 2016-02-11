'use strict';

/**
 * @ngdoc service
 * @name FieldStack.template
 * @description
 * # template
 * Provider in the FieldStack.
 */
angular.module('FieldStack')
  .service('Utility', function () {

    return {
      machineName: function(name) {
        if (name) {
          var removeDashes = name.replace(/-/g, ''),
              removeSpaces = removeDashes.replace(/ /g, '-'),
              convertLowerCase = removeSpaces.toLowerCase();

          return convertLowerCase;
        }

        return null;
      }
    };

  });

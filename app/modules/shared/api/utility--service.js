'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
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

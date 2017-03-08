'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateStormwater', function(Calculate, $q) {

    return {
      readings: null,
      loadData: null
    };

  });

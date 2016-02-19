(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldStack')
    .filter('isArray', function() {
      return function (input) {
        return (angular.isArray(input)) ? true : false;
      };
    });

}());

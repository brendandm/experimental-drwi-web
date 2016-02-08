'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:SecurityController
 * @description
 * # SecurityController
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('SecurityAuthorize', function($location, token) {

    //
    // If we have an Access Token, forward the user to the Projects page
    //
    if (token.get()) {
      $location.path('/projects');
    } else {
      token.save();
    }

  });

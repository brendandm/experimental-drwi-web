'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:SecurityLogout
 * @description
 * # SecurityLogout
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('SecurityLogout', ['$location', 'token', function($location, token) {

    console.log('SecurityLogout');
    
    //
    // Remove the access token from our session cookie
    //
    token.remove();

    //
    // Redirect the user to the home page
    //
    $location.path('/');
    
  }]);

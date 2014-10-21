'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:LogoutCtrl
 * @description
 * # LogoutCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('LogoutCtrl', ['$scope', 'ipCookie', '$location', function($scope, ipCookie, $location) {

    console.log('LogoutCtrl');

    $scope.logout = function() {
      ipCookie.remove('COMMONS_SESSION');
      ipCookie.remove('COMMONS_SESSION', { path: '/' });

      $location.hash();
      $location.path('/');
    };

  }]);

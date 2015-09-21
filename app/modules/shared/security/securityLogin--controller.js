'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SecurityLogin
 * @description
 * # SecurityLogin
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SecurityLogin', ['$scope', 'ipCookie', '$location', function($scope, ipCookie, $location) {

    var session_cookie = ipCookie('COMMONS_SESSION');

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/modules/shared/security/views/securityLogin--view.html',
      title: 'NFWF Grant Monitoring and Assessment',
      header: {
        hidden: true
      }
    };

    $scope.setupLoginPage = function() {
      var host = $location.host();

      //
      // Redirect based on current enviornment
      //
      if (host === 'localhost' || host === '127.0.0.1') {
        $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=qXadujeb96VrZogGGd6zE6wTtzziBZJnxPfM8ZPu&redirect_uri=http%3A%2F%2F127.0.0.1%3A9000%2Fauthorize&scope=user applications';
      // } else if (host === 'stg.commonscloud.org') {
      //   $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=MbanCzYpm0fUW8md1cdSJjUoYI78zTbak2XhZ2hf&redirect_uri=http%3A%2F%2Fstg.commonscloud.org%2Fauthorize&scope=user applications';
      } else {
        $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=MbanCzYpm0fUW8md1cdSJjUoYI78zTbak2XhZ2hQ&redirect_uri=http%3A%2F%2Fnfwf.viableindustries.com%2Fauthorize&scope=user applications';
      }

    };

    if (session_cookie && session_cookie !== undefined && session_cookie !== 'undefined') {
      $location.path('/projects');
    } else {
      ipCookie.remove('COMMONS_SESSION');
      ipCookie.remove('COMMONS_SESSION', { path: '/' });
      $scope.setupLoginPage();
    }

  }]);

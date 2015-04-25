'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Navigation
 * @description
 * # Navigation
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('token', ['$location', 'ipCookie', function ($location, ipCookie) {
    
    return {
      get: function() {
        return ipCookie('COMMONS_SESSION');
      },
      remove: function() {
        //
        // Clear out existing COMMONS_SESSION cookies that may be invalid or
        // expired. This may happen when a user closes the window and comes back
        //
        ipCookie.remove('COMMONS_SESSION');
        ipCookie.remove('COMMONS_SESSION', { path: '/' });
      },
      save: function() {
        var locationHash = $location.hash(),
            accessToken = locationHash.substring(0, locationHash.indexOf('&')).replace('access_token=', '');

        ipCookie('COMMONS_SESSION', accessToken, {
              path: '/',
              expires: 2
            });

        $location.path('/projects');
      }
    };

  }]);

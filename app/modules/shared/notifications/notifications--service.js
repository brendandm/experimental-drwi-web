(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Notifications', function Notifications($rootScope, $timeout) {

      $rootScope.notifications = {
        objects: [],
        success: function(alertTitle, alertMessage) { // kwargs in this context should be an
          $rootScope.notifications.objects.push({
            type: 'success',
            title: (alertTitle) ? alertTitle : 'Great!',
            message: (alertMessage) ? alertMessage : 'Your report was saved.'
          });
        },
        info: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'info',
            title: (alertTitle) ? alertTitle : 'FYI',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        warning: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'warning',
            title: (alertTitle) ? alertTitle : 'Warning!',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        error: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'error',
            title: (alertTitle) ? alertTitle : 'Uh-oh!',
            message: (alertMessage) ? alertMessage : 'We couldnt save your changes.'
          });
        },
        // dismiss: function($index) {
        //   $timeout(function() {
        //     $rootScope.notifications.objects.splice($index, 1);
        //   }, 5000);
        // },
        dismissAll: function() {
          $rootScope.notifications.objects = [];
        }
      };

    });

}());

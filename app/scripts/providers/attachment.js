'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.attachment
 * @description
 * # attachment
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Attachment', function attachment() {

    this.$get = ['$resource', function ($resource) {

      var Attachment = $resource('//api.commonscloud.org/v2/:storage/:featureId/:attachmentStorage/:attachmentId.json', {

      }, {
        delete: {
          method: 'DELETE'
        }
      });

      return Attachment;
    }];

  });

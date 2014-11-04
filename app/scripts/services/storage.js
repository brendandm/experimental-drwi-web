'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Storage', function Storage() {

    return {
      'Forest Buffer': {
        Planning: {
          storage: 'type_437194b965ea4c94b99aebe22399621f',
          templateId: 277
        },
        Installation: {
          storage: 'type_437194b965ea4c94b99aebe22399621f',
          templateId: 277
        },
        Monitoring: {
          storage: 'type_ed657deb908b483a9e96d3a05e420c50',
          templateId: 141
        }
      }
    };

  });

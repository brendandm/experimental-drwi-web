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
        storage: 'type_ed657deb908b483a9e96d3a05e420c50',
        templateId: 141,
        fields: {
          // Planning: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          // Installation: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          Planning: [],
          Installation: [],
          Monitoring: []
        },
        template: 'views/reports/forest-buffer.html'
      }
    };

  });

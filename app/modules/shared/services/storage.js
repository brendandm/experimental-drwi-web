'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Storage', ['Feature', 'moment', function Storage(Feature, moment) {

    return {
      'Forest Buffer': {
        landuse: 'for',
        storage: 'type_ed657deb908b483a9e96d3a05e420c50',
        templateId: 141,
        fields: {
          // Planning: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          // Installation: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          Planning: [],
          Installation: [],
          Monitoring: []
        },
        templates: {
          report: '/views/reports/forest-buffer.html',
          form: '/views/forms/forest-buffer.html'
        }
      },
      'Grass Buffer': {
        landuse: 'hyo',
        storage: 'type_a1ee0564f2f94eda9c0ca3d6c277cf14',
        templateId: 373,
        fields: {
          // Planning: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          // Installation: ['measurement_period', 'report_date', 'average_width_of_buffer', 'length_of_buffer', 'upland_landuse', 'existing_riparian_landuse'],
          Planning: [],
          Installation: [],
          Monitoring: []
        },
        templates: {
          report: '/views/reports/grass-buffer.html',
          form: '/views/forms/grass-buffer.html'
        }
      }      
    };

  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .constant('AnimalType', {
      beef: {
        average_weight: 877.19,
        manure: 58,
        total_nitrogen: 0.0059,
        total_phosphorus: 0.0016,
      },
      dairy: {
        average_weight: 1351.35,
        manure: 86,
        total_nitrogen: 0.0052,
        total_phosphorus: 0.001,
      },
      'other cattle': {
        average_weight: 480.77,
        manure: 64.39,
        total_nitrogen: 0.0037,
        total_phosphorus: 0.001,
      },
      broilers: {
        average_weight: 2.2,
        manure: 85,
        total_nitrogen: 0.0129,
        total_phosphorus: 0.0035
      },
      layers: {
        average_weight: 4,
        manure: 64,
        total_nitrogen: 0.0131,
        total_phosphorus: 0.0047
      },
      pullets: {
        average_weight: 2.84,
        manure: 45.56,
        total_nitrogen: 0.0136,
        total_phosphorus: 0.0053
      },
      turkeys: {
        average_weight: 14.93,
        manure: 47,
        total_nitrogen: 0.0132,
        total_phosphorus: 0.0049
      },
      'hogs and pigs for breeding': {
        average_weight: 374.53,
        manure: 33.46,
        total_nitrogen: 0.0066,
        total_phosphorus: 0.0021
      },
      'hogs for slaughter': {
        average_weight: 110.01,
        manure: 84,
        total_nitrogen: 0.0062,
        total_phosphorus: 0.0021
      },
      horses: {
        average_weight: 1000,
        manure: 51,
        total_nitrogen: 0.0059,
        total_phosphorus: 0.0014
      },
      'angora goats': {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      'milk goats': {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      'sheep and lambs': {
        average_weight: 100,
        manure: 40,
        total_nitrogen: 0.0105,
        total_phosphorus: 0.0022
      },
      biosolids: {
        average_weight: null,
        manure: null,
        total_nitrogen: 0.039,
        total_phosphorus: 0.025
      }
  });
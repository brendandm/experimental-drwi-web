'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .constant('Landuse', {
    'high-till with manure': 'hwm',
    'high-till with manure nutrient management': 'nhi',
    'high-till without manure': 'hom',
    'high-till without manure nutrient management': 'nho',
    'low-till with manure': 'lwm',
    'low-till with manure nutrient management': 'nlo',
    'hay with nutrients': 'hyw',
    'hay with nutrients nutrient management': 'nhy',
    'alfalfa': 'alf',
    'alfalfa nutrient management': 'nal',
    'hay without nutrients': 'hyo',
    'pasture': 'pas',
    'pasture nutrient management': 'npa',
    'trampled riparian pasture': 'trp',
    'animal feeding operations': 'afo',
    'nursery': 'urs',
    'concentrated animal feeding operations': 'cfo',
    'regulated construction': 'rcn',
    'css construction': 'ccn',
    'regulated extractive': 'rex',
    'css extractive': 'cex',
    'nonregulated extractive': 'nex',
    'forest': 'for',
    'harvested forest': 'hvf',
    'regulated impervious developed': 'rid',
    'nonregulated impervious developed': 'nid',
    'css impervious developed': 'cid',
    'atmospheric deposition to non-tidal water': 'atdep',
    'regulated pervious developed': 'rpd',
    'nonregulated pervious developed': 'npd',
    'css pervious developed': 'cpd',
    'municipal-waste water treatment plants':'wwtp',
    'septic': 'septic',
    'combined sewer overflows': 'cso',
    'industrial-waste water treatment plants': 'indus'
  });

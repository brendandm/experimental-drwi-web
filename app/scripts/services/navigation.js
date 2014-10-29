'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Navigation
 * @description
 * # Navigation
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Navigation', [ function Navigation() {
    
    var Navigation_ = {};

    Navigation_.settings = function() {
      return {
        contextual: []
      };
    };

    return Navigation_;

  }]);

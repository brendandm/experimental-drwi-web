'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.LivestockExclusionCalculate
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('CalculateLivestockExclusion', [function() {
    return {
      animalUnits: function(quantity, multiplier) {
        return ((quantity*multiplier)/1000);
      },
      totalDaysPerYearInStream: function(values) {
        return values.instream_dpmjan+values.instream_dpmfeb+values.instream_dpmmar+values.instream_dpmapr+values.instream_dpmmay+values.instream_dpmjun+values.instream_dpmjul+values.instream_dpmaug+values.instream_dpmsep+values.instream_dpmoct+values.instream_dpmnov+values.instream_dpmdec; 
      },
      totalHoursPerYearInStream: function(values) {
        var totalHoursPerYearInStream = values.instream_hpdjan+values.instream_hpdfeb+values.instream_hpdmar+values.instream_hpdapr+values.instream_hpdmay+values.instream_hpdjun+values.instream_hpdjul+values.instream_hpdaug+values.instream_hpdsep+values.instream_hpdoct+values.instream_hpdnov+values.instream_hpddec; 
        return (totalHoursPerYearInStream/12);
      },
      averageDaysPerYearInStream: function(values) {
        var dpm = this.totalDaysPerYearInStream(values);
        var hpd = this.totalHoursPerYearInStream(values);
        console.log('averageDaysPerYearInStream', dpm, '*', hpd, '/', 24);
        return (dpm*hpd/24);
      }
    };
  }]);

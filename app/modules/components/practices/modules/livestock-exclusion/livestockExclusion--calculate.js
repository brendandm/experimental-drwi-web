'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.LivestockExclusionCalculate
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateLivestockExclusion', ['Calculate', 'Landuse', function(Calculate, Landuse) {
    return {
      toMiles: function(feet) {
        return (feet/5280);
      },
      animalUnits: function(quantity, multiplier) {
        return ((quantity*multiplier)/1000);
      },
      totalDaysPerYearInStream: function(values) {
        return values.instream_dpmjan+values.instream_dpmfeb+values.instream_dpmmar+values.instream_dpmapr+values.instream_dpmmay+values.instream_dpmjun+values.instream_dpmjul+values.instream_dpmaug+values.instream_dpmsep+values.instream_dpmoct+values.instream_dpmnov+values.instream_dpmdec;
      },
      averageHoursPerYearInStream: function(values) {
        var totalHoursPerYearInStream = values.instream_hpdjan+values.instream_hpdfeb+values.instream_hpdmar+values.instream_hpdapr+values.instream_hpdmay+values.instream_hpdjun+values.instream_hpdjul+values.instream_hpdaug+values.instream_hpdsep+values.instream_hpdoct+values.instream_hpdnov+values.instream_hpddec;
        return totalHoursPerYearInStream;
      },
      averageDaysPerYearInStream: function(values) {
        var sumproduct = (values.instream_hpdjan*values.instream_dpmjan)+(values.instream_hpdfeb*values.instream_dpmfeb)+(values.instream_hpdmar*values.instream_dpmmar)+(values.instream_hpdapr*values.instream_dpmapr)+(values.instream_hpdmay*values.instream_dpmmay)+(values.instream_hpdjun*values.instream_dpmjun)+(values.instream_hpdjul*values.instream_dpmjul)+(values.instream_hpdaug*values.instream_dpmaug)+(values.instream_hpdsep*values.instream_dpmsep)+(values.instream_hpdoct*values.instream_dpmoct)+(values.instream_hpdnov*values.instream_dpmnov)+(values.instream_hpddec*values.instream_dpmdec);

        return (sumproduct/24);
      },
      quantityInstalled: function(values, field, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += reading.properties[field];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += reading.properties[field];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total >= 1) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      milesInstalled: function(values, field, format) {

        var installed_length = 0,
            planned_length = 0,
            feetInMiles = 5280;

        angular.forEach(values, function(value, $index) {
          if (value.properties.measurement_period === 'Planning') {
            planned_length += value.properties[field];
          }
          else if (value.properties.measurement_period === 'Installation') {
            installed_length += value.properties[field];
          }
        });

        var miles_installed = installed_length/feetInMiles,
            percentage_installed = installed_length/planned_length;

        return (format === '%') ? (percentage_installed*100) : miles_installed;
      },
      getPrePlannedLoad: function(segment, landuse, area) {

        var promise = Calculate.getLoadVariables(segment, Landuse[landuse.toLowerCase()]).$promise.then(function(efficiency) {
          console.log('Efficienies selected', area, efficiency);
          return Calculate.getLoadTotals(area, efficiency.features[0].properties);
        });

        return promise;
      }
    };
  }]);

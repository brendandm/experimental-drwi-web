'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldStack')
  .service('BankStabilizationCalculate', function() {
    return {
      preInstallationSedimentLoad: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = value.installation_lateral_erosion_rate,
            soilDensity = value.installation_soil_bulk_density,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return (loadTotal)/2000;
      },
      plannedSedimentLoadReduction: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = (parseFloat(value.installation_lateral_erosion_rate)-0.02),
            soilDensity = value.installation_soil_bulk_density,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return (loadTotal)/2000;
      },
      installedSedimentLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += self.plannedSedimentLoadReduction(reading);
          } else if (reading.measurement_period === 'Installation') {
            installed_total += self.plannedSedimentLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      preInstallationNitrogenLoad: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = value.installation_lateral_erosion_rate,
            soilDensity = value.installation_soil_bulk_density,
            soilNDensity = value.installation_soil_n_content,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilNDensity;
      },
      plannedNitrogenLoadReduction: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = (value.installation_lateral_erosion_rate-0.02),
            soilDensity = value.installation_soil_bulk_density,
            soilNDensity = value.installation_soil_n_content,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilNDensity;
      },
      installedNitrogenLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += self.plannedNitrogenLoadReduction(reading);
          } else if (reading.measurement_period === 'Installation') {
            installed_total += self.plannedNitrogenLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      preInstallationPhosphorusLoad: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = value.installation_lateral_erosion_rate,
            soilDensity = value.installation_soil_bulk_density,
            soilPDensity = value.installation_soil_p_content,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilPDensity;
      },
      plannedPhosphorusLoadReduction: function(value) {

        var baseLength = value.installation_length_of_streambank,
            ler = (value.installation_lateral_erosion_rate-0.02),
            soilDensity = value.installation_soil_bulk_density,
            soilPDensity = value.installation_soil_p_content,
            squareRoot = Math.sqrt((value.installation_eroding_bank_height*value.installation_eroding_bank_height)+(value.installation_eroding_bank_horizontal_width*value.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilPDensity;
      },
      installedPhosphorusLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += self.plannedPhosphorusLoadReduction(reading);
          } else if (reading.measurement_period === 'Installation') {
            installed_total += self.plannedPhosphorusLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      milesStreambankRestored: function(value) {
        return (value.installation_length_of_streambank/5280);
      },
      milesStreambankInstalledFromPlan: function(values, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += (reading.installation_length_of_streambank/5280);
          } else if (reading.measurement_period === 'Installation') {
            installed_total += (reading.installation_length_of_streambank/5280);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      quantityInstalled: function(values, field, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += reading[field];
          } else if (reading.measurement_period === 'Installation') {
            installed_total += reading[field];
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
      }
    };
  });

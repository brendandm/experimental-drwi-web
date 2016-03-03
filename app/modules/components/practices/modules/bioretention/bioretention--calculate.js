(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateBioretention
   * @description
   * Service in the FieldDoc.
   */
  angular.module('FieldDoc')
    .service('CalculateBioretention', function() {
      return {
        adjustorCurveNitrogen: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value),
              first = 0.0308*Math.pow(depthTreated, 5),
              second = 0.2562*Math.pow(depthTreated, 4),
              third = 0.8634*Math.pow(depthTreated, 3),
              fourth = 1.5285*Math.pow(depthTreated, 2),
              fifth = 1.501*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.013);

              console.log('runoffVolumeCaptured', runoffVolumeCaptured);

          return (format === '%') ? reduction*100 : reduction;
        },
        adjustorCurvePhosphorus: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value), // we need to make sure that this number is 0 before actually doing the rest of the calculation
              first = 0.0304*Math.pow(depthTreated, 5),
              second = 0.2619*Math.pow(depthTreated, 4),
              third = 0.9161*Math.pow(depthTreated, 3),
              fourth = 1.6837*Math.pow(depthTreated, 2),
              fifth = 1.7072*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.0091);

          return (format === '%') ? reduction*100 : reduction;
        },
        adjustorCurveSediment: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value), // we need to make sure that this number is 0 before actually doing the rest of the calculation
              first = 0.0326*Math.pow(depthTreated, 5),
              second = 0.2806*Math.pow(depthTreated, 4),
              third = 0.9816*Math.pow(depthTreated, 3),
              fourth = 1.8039*Math.pow(depthTreated, 2),
              fifth = 1.8292*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.0098);

          return (format === '%') ? reduction*100 : reduction;
        },
        rainfallDepthTreated: function(value) {
          return (value.properties.installation_rainfall_depth_treated/(value.properties.installation_bioretention_impervious_area/43560))*12;
        },
        gallonsReducedPerYear: function(value) {
          var runoffVolumeCaptured = this.runoffVolumeCaptured(value);

          return (runoffVolumeCaptured*325851.4);
        },
        preInstallationNitrogenLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tn_ual))/43560;
        },
        preInstallationPhosphorusLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tp_ual))/43560;
        },
        preInstallationSedimentLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tss_ual))/43560;
        },
        plannedNitrogenLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tn_ual))*this.adjustorCurveNitrogen(value))/43560;
        },
        plannedPhosphorusLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tp_ual))*this.adjustorCurvePhosphorus(value))/43560;
        },
        plannedSedimentLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tss_ual))*this.adjustorCurveSediment(value))/43560;
        },
        installedPhosphorusLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedPhosphorusLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedPhosphorusLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        installedNitrogenLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedNitrogenLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedNitrogenLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        installedSedimentLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedSedimentLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedSedimentLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        reductionPracticesInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.gallonsReducedPerYear(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.gallonsReducedPerYear(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        acresProtected: function(value) {
          return (value.properties.installation_bioretention_total_drainage_area/43560);
        },
        acresInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.acresProtected(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.acresProtected(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
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
        runoffVolumeCaptured: function(value) {
          return (value.properties.installation_rainfall_depth_treated*value.properties.installation_bioretention_impervious_area)/(12*43560);
        }
      };
    });

}());

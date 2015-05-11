'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.CalculateBioretention
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('CalculateBioretention', [function() {
    return {
      adjustorCurveNitrogen: function(value, format) {

        var self = this,
            rainfallDepthTreated = self.rainfallDepthTreated(value),
            first = 0.0308*Math.pow(rainfallDepthTreated, 5),
            second = 0.2562*Math.pow(rainfallDepthTreated, 4),
            third = 0.8634*Math.pow(rainfallDepthTreated, 3),
            fourth = 1.5285*Math.pow(rainfallDepthTreated, 2),
            fifth = 1.501*rainfallDepthTreated,
            reduction = (first-second+third-fourth+fifth-0.013);

        return (format === '%') ? reduction*100 : reduction;
      },
      adjustorCurvePhosphorus: function(value) {

        var self = this,
            rainfallDepthTreated = self.rainfallDepthTreated(value),
            first = 0.0304*Math.pow(rainfallDepthTreated, 5),
            second = 0.2619*Math.pow(rainfallDepthTreated, 4),
            third = 0.9161*Math.pow(rainfallDepthTreated, 3),
            fourth = 1.6837*Math.pow(rainfallDepthTreated, 2),
            fifth = 1.7072*rainfallDepthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return reduction*100;
      },
      adjustorCurveSediment: function(value) {

        var self = this,
            rainfallDepthTreated = self.rainfallDepthTreated(value),
            first = 0.0326*Math.pow(rainfallDepthTreated, 5),
            second = 0.2806*Math.pow(rainfallDepthTreated, 4),
            third = 0.9816*Math.pow(rainfallDepthTreated, 3),
            fourth = 1.8039*Math.pow(rainfallDepthTreated, 2),
            fifth = 1.8292*rainfallDepthTreated,
            reduction = (first-second+third-fourth+fifth-0.0098);

        return reduction*100;
      },
      rainfallDepthTreated: function(value) {
        return (value.bioretention_runoff_volume_captured/(value.bioretention_impervious_area/43560))*12;
      },
      gallonsReducedPerYear: function(value) {
        return (value.bioretention_runoff_volume_captured/325851.4);
      },
      preInstallationNitrogenLoad: function(value, loaddata) {
        return ((value.bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tn_ual))/43560;
      },
      preInstallationPhosphorusLoad: function(value, loaddata) {
        return ((value.bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tp_ual))/43560;
      },
      preInstallationSedimentLoad: function(value, loaddata) {
        return ((value.bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tss_ual))/43560;
      },
      plannedNitrogenLoadReduction: function(value, loaddata) {
        return (((value.bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tn_ual))*this.adjustorCurveNitrogen(value))/43560;
      },
      plannedPhosphorusLoadReduction: function(value, loaddata) {
        return (((value.bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tp_ual))*this.adjustorCurvePhosphorus(value))/43560;
      },
      plannedSedimentLoadReduction: function(value, loaddata) {
        return (((value.bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.bioretention_total_drainage_area-value.bioretention_impervious_area)*loaddata.pervious.tss_ual))*this.adjustorCurveSediment(value))/43560;
      },
      installedPhosphorusLoadReduction: function(values, loaddata, format) {

        var installed = 0,
            planned = 0,
            self = this;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned += self.plannedPhosphorusLoadReduction(value, loaddata);
          }
          else if (values[$index].measurement_period === 'Installation') {
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.plannedNitrogenLoadReduction(value, loaddata);
          }
          else if (values[$index].measurement_period === 'Installation') {
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.plannedSedimentLoadReduction(value, loaddata);
          }
          else if (values[$index].measurement_period === 'Installation') {
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.gallonsReducedPerYear(value);
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed += self.gallonsReducedPerYear(value);
          }
        });

        var percentage_installed = installed/planned;

        return (format === '%') ? (percentage_installed*100) : installed;
      },
      acresProtected: function(value) {
        return (value.bioretention_total_drainage_area/43560);
      },
      acresInstalled: function(values, format) {

        var installed = 0,
            planned = 0,
            self = this;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned += self.acresProtected(value);
          }
          else if (values[$index].measurement_period === 'Installation') {
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
  }]);
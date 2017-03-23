'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateStormwater', function(Calculate, $q) {

    return {
      readings: null,
      loadData: null,
      plannedRunoffReductionAdjustorCurveNitrogen: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0308*Math.pow(depthTreated, 5),
            second = 0.2562*Math.pow(depthTreated, 4),
            third = 0.8634*Math.pow(depthTreated, 3),
            fourth = 1.5285*Math.pow(depthTreated, 2),
            fifth = 1.501*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.013);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurvePhosphorus: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0304*Math.pow(depthTreated, 5),
            second = 0.2619*Math.pow(depthTreated, 4),
            third = 0.9161*Math.pow(depthTreated, 3),
            fourth = 1.6837*Math.pow(depthTreated, 2),
            fifth = 1.7072*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurveSediment: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0326*Math.pow(depthTreated, 5),
            second = 0.2806*Math.pow(depthTreated, 4),
            third = 0.9816*Math.pow(depthTreated, 3),
            fourth = 1.8039*Math.pow(depthTreated, 2),
            fifth = 1.8292*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0098);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveNitrogen: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0152*Math.pow(depthTreated, 5),
            second = 0.131*Math.pow(depthTreated, 4),
            third = 0.4581*Math.pow(depthTreated, 3),
            fourth = 0.8418*Math.pow(depthTreated, 2),
            fifth = 0.8536*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0046);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurvePhosphorus: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0239*Math.pow(depthTreated, 5),
            second = 0.2058*Math.pow(depthTreated, 4),
            third = 0.7198*Math.pow(depthTreated, 3),
            fourth = 1.3229*Math.pow(depthTreated, 2),
            fifth = 1.3414*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0072);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveSediment: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0304*Math.pow(depthTreated, 5),
            second = 0.2619*Math.pow(depthTreated, 4),
            third = 0.9161*Math.pow(depthTreated, 3),
            fourth = 1.6837*Math.pow(depthTreated, 2),
            fifth = 1.7072*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return (format === '%') ? reduction*100 : reduction;
      },
      prePlannedNitrogenLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tn_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tn_ual))/43560;
      },
      prePlannedPhosphorusLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tp_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tp_ual))/43560;
      },
      prePlannedSedimentLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tss_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tss_ual))/43560;
      },
      plannedNitrogenReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //
        // TO DO this WE PASS THE APPROPRIATE `func` either a `RunoffReduction`
        // or `StormwaterTreatment`
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedNitrogenLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      plannedPhosphorusReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedPhosphorusLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      plannedSedimentReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedSedimentLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      metricTotalPracticeArea: function(_report) {
        return _report.properties.practice_1_extent+_report.properties.practice_2_extent+_report.properties.practice_3_extent+_report.properties.practice_4_extent;
      },
      metricTotalAcresProtected: function(_report) {
        return (_report.properties.total_drainage_area/43560)
      },
      gallonsPerYearStormwaterDetainedFiltration: function(_report) {
        return (_report.properties.runoff_volume_captured*325851.4)
      },
      runoffDepthTreated: function(_report) {
        return (_report.properties.runoff_volume_captured*12)/(_report.properties.impervious_area/43560)
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
      quantityNitrogenReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurveNitrogen';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurveNitrogen';
          }

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_nitrogen_planned = self.plannedNitrogenReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_nitrogen_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_nitrogen_installed = self.plannedNitrogenReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_nitrogen_installed;
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
      quantityPhosphorusReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurvePhosphorus';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurvePhosphorus';
          }
          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned   = self.plannedPhosphorusReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.plannedPhosphorusReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total !== 0) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      quantitySedimentReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurveSediment';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurveSediment';
          }

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.plannedSedimentReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.plannedSedimentReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total !== 0) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      gallonsPerYearStormwaterDetainedFiltrationInstalled: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.gallonsPerYearStormwaterDetainedFiltration(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.gallonsPerYearStormwaterDetainedFiltration(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          } else if (planned_total < installed_total) {
            return 100;
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;
      },
      metricInstalledAcresProtected: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.metricTotalAcresProtected(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.metricTotalAcresProtected(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;
      },
      metricInstalledPracticeArea: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.metricTotalPracticeArea(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.metricTotalPracticeArea(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;

      }
    };

  });

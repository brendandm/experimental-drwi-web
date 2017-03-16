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
      plannedRunoffReductionAdjustorCurveNitrogen: function(format) {

        var depthTreated = 1.0,
            first = 0.0308*Math.pow(depthTreated, 5),
            second = 0.2562*Math.pow(depthTreated, 4),
            third = 0.8634*Math.pow(depthTreated, 3),
            fourth = 1.5285*Math.pow(depthTreated, 2),
            fifth = 1.501*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.013);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurvePhosphorus: function(format) {

        var depthTreated = 1.0,
            first = 0.0304*Math.pow(depthTreated, 5),
            second = 0.2619*Math.pow(depthTreated, 4),
            third = 0.9161*Math.pow(depthTreated, 3),
            fourth = 1.6837*Math.pow(depthTreated, 2),
            fifth = 1.7072*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurveSediment: function(format) {

        var depthTreated = 1.0,
            first = 0.0326*Math.pow(depthTreated, 5),
            second = 0.2806*Math.pow(depthTreated, 4),
            third = 0.9816*Math.pow(depthTreated, 3),
            fourth = 1.8039*Math.pow(depthTreated, 2),
            fifth = 1.8292*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0098);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveNitrogen: function(format) {

        var depthTreated = 1.0,
            first = 0.0152*Math.pow(depthTreated, 5),
            second = 0.131*Math.pow(depthTreated, 4),
            third = 0.4581*Math.pow(depthTreated, 3),
            fourth = 0.8418*Math.pow(depthTreated, 2),
            fifth = 0.8536*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0046);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurvePhosphorus: function(format) {

        var depthTreated = 1.0,
            first = 0.0239*Math.pow(depthTreated, 5),
            second = 0.2058*Math.pow(depthTreated, 4),
            third = 0.7198*Math.pow(depthTreated, 3),
            fourth = 1.3229*Math.pow(depthTreated, 2),
            fifth = 1.3414*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0072);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveSediment: function(format) {

        var depthTreated = 1.0,
            first = 0.0304*Math.pow(depthTreated, 5),
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
      plannedNitrogenReduction: function(imperviousArea, drainageArea, loadData, func) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            prePlannedReductionNitrogen = self.prePlannedNitrogenLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurveNitrogen = self[func](); // @TODO Come back to this and fill in the dynamic adjustor curve value

        return (prePlannedReductionNitrogen*plannedAdjustorCurveNitrogen);
      },
      plannedPhosphorusReduction: function(imperviousArea, drainageArea, loadData, func) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            prePlannedReduction = self.prePlannedPhosphorusLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](); // @TODO Come back to this and fill in the dynamic adjustor curve value

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      plannedSedimentReduction: function(imperviousArea, drainageArea, loadData, func) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            prePlannedReduction = self.prePlannedSedimentLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](); // @TODO Come back to this and fill in the dynamic adjustor curve value

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      metricTotalPracticeArea: function(_report) {
        return _report.properties.practice_1_extent+_report.properties.practice_2_extent+_report.properties.practice_3_extent+_report.properties.practice_4_extent;
      },
      metricTotalAcresProtected: function(_report) {
        return (_report.properties.total_drainage_area/43560)
      }
    };

  });

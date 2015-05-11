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
      rainfallDepthTreated: function(value) {
        return (value.bioretention_runoff_volume_captured/(value.bioretention_impervious_area/43560))*12;
      },
      totalRainfallDepthTreated: function(values, format) {
        
        var installed = 0,
            planned = 0,
            self = this;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned += self.rainfallDepthTreated(value);
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed += self.rainfallDepthTreated(value);
          }
        });

        var percentage_installed = installed/planned;

        return (format === '%') ? (percentage_installed*100) : installed;
      },
      gallonsReducedPerYear: function(value) {
        return (value.bioretention_runoff_volume_captured/325851.4);
      },
      preInstallationNitrogenLoad: function(value, loaddata) {
        var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area),
            pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100));

        return ((impervious)*loaddata.impervious.tn_ual + (pervious)*loaddata.pervious.tn_ual)/43560;
      },
      preInstallationPhosphorusLoad: function(value, loaddata) {
        var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area),
            pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100));

        return ((impervious)*loaddata.impervious.tp_ual + (pervious)*loaddata.pervious.tp_ual)/43560;
      },
      plannedNitrogenLoadReduction: function(value, loaddata) {
        var rainGarden = (value.rain_garden_area/0.12)*8.710,
            rainBarrel = value.rain_barrel_drainage_area*4.360,
            permeablePavement = value.permeable_pavement_area*6.970,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*6.970,
            unmPledgeArea = value.urban_nutrient_management_pledge_area*0.653,
            unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*2.180,
            conservationLandscaping = value.conservation_landscaping*3.830,
            treePlanting = value.tree_planting*0.610,
            imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tn_ual-loaddata.pervious.tn_ual);

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+treePlanting+imperviousCoverRemoval)/43560;
      },
      plannedPhosphorusLoadReduction: function(value, loaddata) {
        var rainGarden = (value.rain_garden_area/0.12)*1.220,
            rainBarrel = value.rain_barrel_drainage_area*0.520,
            permeablePavement = value.permeable_pavement_area*0.870,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*0.870,
            unmPledgeArea = value.urban_nutrient_management_pledge_area*0.013,
            unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*0.044,
            conservationLandscaping = value.conservation_landscaping*0.170,
            imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tp_ual-loaddata.pervious.tp_ual);

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+imperviousCoverRemoval)/43560;
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
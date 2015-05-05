'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.CalculateUrbanHomeowner
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('CalculateUrbanHomeowner', ['Calculate', 'Landuse', function(Calculate, Landuse) {
    return {
      gallonsReducedPerYear: function(value) {

        var rainGarden = (value.rain_garden_area/0.12)*0.623,
            rainBarrel = value.rain_barrel_drainage_area*0.156,
            permeablePavement = value.permeable_pavement_area*0.312,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*0.312;

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection);
      },
      plannedNitrogenLoadReduction: function(value) {
        var rainGarden = (value.rain_garden_area/0.12)*8.710,
            rainBarrel = value.rain_barrel_drainage_area*4.360,
            permeablePavement = value.permeable_pavement_area*6.970,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*6.970,
            unmPledgeArea = value.urban_nutrient_management_pledge_area*0.653,
            unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*2.180,
            conservationLandscaping = value.conservation_landscaping*3.830,
            treePlanting = value.tree_planting*0.610,
            imperviousCoverRemoval = value.impervious_cover_removal_area*(13.55-9.88); // These need to be state specific

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+treePlanting+imperviousCoverRemoval)/43560;
      },
      plannedPhosphorusLoadReduction: function(value) {
        var rainGarden = (value.rain_garden_area/0.12)*1.220,
            rainBarrel = value.rain_barrel_drainage_area*0.520,
            permeablePavement = value.permeable_pavement_area*0.870,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*0.870,
            unmPledgeArea = value.urban_nutrient_management_pledge_area*0.013,
            unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*0.044,
            conservationLandscaping = value.conservation_landscaping*0.170,
            imperviousCoverRemoval = value.impervious_cover_removal_area*(13.55-9.88);

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+imperviousCoverRemoval)/43560;
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
      treesPlanted: function(values, field, format) {

        var installed_trees = 0,
            planned_trees = 0;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned_trees += values[$index][field];
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed_trees += values[$index][field];
          }
        });

        return (format === '%') ? ((installed_trees/planned_trees)*100) : installed_trees;
      },
      acresProtected: function(value) {

        var practiceArea = value.rain_garden_area + value.rain_barrel_drainage_area + value.permeable_pavement_area + value.downspout_disconnection_drainage_area + value.urban_nutrient_management_pledge_area + value.urban_nutrient_management_plan_area_hi_risk + value.conservation_landscaping + value.impervious_cover_removal_area,
            treePlantingArea = value.tree_planting*100;

        return (practiceArea+treePlantingArea)/43560;
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

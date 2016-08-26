(function(){

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateShorelineManagement
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateShorelineManagement', function(Calculate, LoadData, $q) {
      return {
        efficiency: {
          urban: {
            nitrogen: 0.20,
            phosphorus: 0.45,
            sediment: 0.60
          }
        },
        reduceLoadValues: function(previousValue, currentValue) {
          return previousValue + currentValue;
        },
        preInstallationLoadProtocol1TSS: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_length_of_living_shoreline_restored,
              multipler_2 = data.properties.installation_existing_average_bank_height,
              multipler_3 = data.properties.installation_existing_shoreline_recession_rate,
              multipler_4 = data.properties.installation_soil_bulk_density,
              multipler_5 = data.properties.installation_sand_reduction_factor,
              multipler_6 = data.properties.installation_bank_instability_reduction_factor,
              divider = 2000,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2*multipler_3*multipler_4*multipler_5*multipler_6)/2000;

          return returnValue
        },
        preInstallationLoadProtocol2TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = data.properties.protocol_2_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        preInstallationLoadProtocol3TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = data.properties.protocol_3_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        preInstallationLoadProtocol3TSS: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = data.properties.protocol_3_tss_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        preInstallationLoadProtocol4TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = data.properties.protocol_4_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        preInstallationLoadProtocol4TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = data.properties.protocol_4_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        plannedLoad: function(data, parameter) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          var self = this,
              landuses = 4,
              calculatedLoads = [],
              efficiency_parameter,
              reductionValue = 0;

          switch (parameter) {
            case 'nitrogen':
              efficiency_parameter = 'n_efficiency';
              break;
            case 'phosphorus':
              efficiency_parameter = 'p_efficiency';
              break;
            case 'sediment':
              efficiency_parameter = 's_efficiency';
              break;
          }

          for (var i = 0; i < landuses; i++) {
            var landuse = 'installation_upland_landuse_'+(i+1),
                acresTreated = 'installation_landuse_acreage_'+(i+1),
                efficiency = 'installation_efficiency_'+(i+1),
                loads = 'installation_loaddata_'+(i+1);

            if (data.properties[loads] && data.properties[loads].hasOwnProperty('properties')) {
              var loadData = {
                nitrogen: (data.properties[loads].properties.eos_totn/data.properties[loads].properties.eos_acres),
                phosphorus: (data.properties[loads].properties.eos_totp/data.properties[loads].properties.eos_acres),
                sediment: (data.properties[loads].properties.eos_tss/data.properties[loads].properties.eos_acres)/2000
              };

              var parameterReduction = data.properties[acresTreated]*loadData[parameter]*data.properties[efficiency].properties[efficiency_parameter];

              console.log(parameter, efficiency_parameter, data.properties[acresTreated], '*', loadData[parameter], '*', data.properties[efficiency].properties[efficiency_parameter], '=', parameterReduction);

              calculatedLoads.push(parameterReduction);
            }

          };

          // *data.properties[efficiency].properties[efficiency_parameter]

          if (calculatedLoads.length) {
            reductionValue = calculatedLoads.reduce(this.reduceLoadValues);
          }

          return reductionValue;
        },
        loads: function(reports) {

          var self = this,
              planningData = Calculate.getPlanningData(reports);

          return {
            planned: {
              protocol_1_tss: self.preInstallationLoadProtocol1TSS(planningData),
              protocol_2_tn: self.preInstallationLoadProtocol2TN(planningData),
              protocol_3_tp: self.preInstallationLoadProtocol3TP(planningData),
              protocol_3_tss: self.preInstallationLoadProtocol3TSS(planningData, 'sediment'),
              protocol_4_tn: self.preInstallationLoadProtocol4TN(planningData, 'nitrogen'),
              protocol_4_tp: self.preInstallationLoadProtocol4TP(planningData, 'phosphorus')
            }
          };

        },
        installed: function(values, parameter, format) {

          var self = this,
              plannedTotal = 0,
              installedTotal = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === 'Installation') {
              installedTotal += self.plannedLoad(values[i], parameter);
            }
            else if (values[i].properties.measurement_period === 'Planning') {
              plannedTotal += self.plannedLoad(values[i], parameter);
            }
          }

          if (plannedTotal >= 1) {
            if (format === '%') {
              return ((installedTotal/plannedTotal)*100);
            } else {
              return installedTotal;
            }
          }

          return 0;
        },
        milesRestored: function(values, period, format) {

          var self = this,
              milesRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {

              var acreage = [
                values[i].properties.installation_landuse_acreage_1,
                values[i].properties.installation_landuse_acreage_2,
                values[i].properties.installation_landuse_acreage_3,
                values[i].properties.installation_landuse_acreage_4,
                values[i].properties.installation_landuse_acreage_5,
                values[i].properties.installation_landuse_acreage_6
              ]

              milesRestored += acreage.reduce(this.reduceLoadValues);
            }
          }

          if (format === '%') {
            var plannedMilesRestored = self.milesRestored(values, 'Planning');
            milesRestored = (milesRestored/plannedMilesRestored)*100;
          }

          return milesRestored;
        },
        acresRestored: function(values, period, format) {

          var self = this,
              milesRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {

              var acreage = [
                values[i].properties.installation_landuse_acreage_1,
                values[i].properties.installation_landuse_acreage_2,
                values[i].properties.installation_landuse_acreage_3,
                values[i].properties.installation_landuse_acreage_4,
                values[i].properties.installation_landuse_acreage_5,
                values[i].properties.installation_landuse_acreage_6
              ]

              milesRestored += acreage.reduce(this.reduceLoadValues);
            }
          }

          if (format === '%') {
            var plannedMilesRestored = self.milesRestored(values, 'Planning');
            milesRestored = (milesRestored/plannedMilesRestored)*100;
          }

          return milesRestored;
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
        }
      }
    });

}());

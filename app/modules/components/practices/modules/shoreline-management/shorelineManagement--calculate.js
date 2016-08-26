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
          protocol_2_tn_reduction_rate: 0,
          protocol_3_tp_reduction_rate: 0,
          protocol_3_tss_reduction_rate: 0,
          protocol_4_tn_reduction_rate: 0,
          protocol_4_tp_reduction_rate: 0,
        },
        reduceLoadValues: function(previousValue, currentValue) {
          return previousValue + currentValue;
        },
        loadProtocol1TSS: function(data) {

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
        loadProtocol2TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          if (data.properties.protocol_2_tn_reduction_rate) {
            this.efficiency.protocol_2_tn_reduction_rate = data.properties.protocol_2_tn_reduction_rate;
          }

          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_2_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol3TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_3_tp_reduction_rate) {
            this.efficiency.protocol_3_tp_reduction_rate = data.properties.protocol_3_tp_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_3_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol3TSS: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_3_tss_reduction_rate) {
            this.efficiency.protocol_3_tss_reduction_rate = data.properties.protocol_3_tss_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_3_tss_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol4TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_4_tn_reduction_rate) {
            this.efficiency.protocol_4_tn_reduction_rate = data.properties.protocol_4_tn_reduction_rate;
          }

          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_4_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol4TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_4_tp_reduction_rate) {
            this.efficiency.protocol_4_tp_reduction_rate = data.properties.protocol_4_tp_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_4_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loads: function(reports) {

          var self = this,
              planningData = Calculate.getPlanningData(reports);

          return {
            planned: {
              protocol_1_tss: self.loadProtocol1TSS(planningData),
              protocol_2_tn: self.loadProtocol2TN(planningData),
              protocol_3_tp: self.loadProtocol3TP(planningData),
              protocol_3_tss: self.loadProtocol3TSS(planningData, 'sediment'),
              protocol_4_tn: self.loadProtocol4TN(planningData, 'nitrogen'),
              protocol_4_tp: self.loadProtocol4TP(planningData, 'phosphorus')
            }
          };

        },
        installed: function(values, parameter, format) {

          var self = this,
              plannedTotal = 0,
              installedTotal = 0;

          // for (var i = 0; i < values.length; i++) {
          //   if (values[i].properties.measurement_period === 'Installation') {
          //     installedTotal += self.plannedLoad(values[i], parameter);
          //   }
          //   else if (values[i].properties.measurement_period === 'Planning') {
          //     plannedTotal += self.plannedLoad(values[i], parameter);
          //   }
          // }

          // if (plannedTotal >= 1) {
          //   if (format === '%') {
          //     return ((installedTotal/plannedTotal)*100);
          //   } else {
          //     return installedTotal;
          //   }
          // }

          return 0;
        },
        milesRestored: function(values, period, format) {

          var self = this,
              milesRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {
              milesRestored += values[i].properties.installation_length_of_living_shoreline_restored;
            }
          }

          if (format === '%') {
            var plannedMilesRestored = self.milesRestored(values, 'Planning');
            milesRestored = (milesRestored/plannedMilesRestored)*100;
          }

          return (milesRestored/5280);
        },
        acresRestored: function(values, period, format) {

          var self = this,
              acresRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {
              acresRestored += values[i].properties.installation_area_of_planted_or_replanted_tidal_wetlands;
            }
          }

          if (format === '%') {
            var plannedAcresRestored = self.acresRestored(values, 'Planning');
            acresRestored = (acresRestored/plannedAcresRestored)*100;
          }

          return acresRestored;
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

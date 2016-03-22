(function(){

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateWetlandsNonTidal
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateWetlandsNonTidal', function(Calculate, LoadData, $q) {
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
        preInstallationLoad: function(data, parameter) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          var landuses = 4,
              calculatedLoads = [];

          for (var i = 0; i <= landuses; i++) {

            var landuse = 'installation_upland_landuse_'+(i+1),
                acresTreated = 'installation_landuse_acreage_'+(i+1),
                loads = 'installation_loaddata_'+(i+1);

            if (data.properties[loads] && data.properties[loads].hasOwnProperty('properties')) {
              var loadData = {
                    nitrogen: (data.properties[loads].properties.eos_totn/data.properties[loads].properties.eos_acres),
                    phosphorus: (data.properties[loads].properties.eos_totp/data.properties[loads].properties.eos_acres),
                    sediment: (data.properties[loads].properties.eos_tss/data.properties[loads].properties.eos_acres)/2000
                  };

              calculatedLoads.push(data.properties[acresTreated]*loadData[parameter]);
            }
          };

          return (calculatedLoads.length) ? calculatedLoads.reduce(this.reduceLoadValues) : 0;
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
        loads: function(reports, segment) {

          var self = this,
              planningData = Calculate.getPlanningData(reports);

          return {
            preinstallation: {
              nitrogen: self.preInstallationLoad(planningData, 'nitrogen'),
              phosphorus: self.preInstallationLoad(planningData, 'phosphorus'),
              sediment: self.preInstallationLoad(planningData, 'sediment')
            },
            planned: {
              nitrogen: self.plannedLoad(planningData, 'nitrogen'),
              phosphorus: self.plannedLoad(planningData, 'phosphorus'),
              sediment: self.plannedLoad(planningData, 'sediment')
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

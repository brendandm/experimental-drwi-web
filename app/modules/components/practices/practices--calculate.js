(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Calculate', function(LoadData, $q) {
      return {
        getExistingLanduse: function(measurementPeriod, readings) {

          var landuse;

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === measurementPeriod) {
              landuse = reading.properties.existing_riparian_landuse;
            }
          });

          return landuse;
        },
        getUplandLanduse: function(measurementPeriod, readings) {

          var landuse;

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === measurementPeriod) {
              landuse = reading.properties.upland_landuse;
            }
          });

          return landuse;
        },
        getLoadPromise: function(landuse, segment) {

          var defer = $q.defer();

          var request = LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: landuse
                }
              ],
              single: true
            }
          }, function() {
            defer.resolve(request);
          });

          return defer.promise;
        },
        getLoadTotals: function(area, efficiency) {
          return {
            nitrogen: (area*(efficiency.eos_totn/efficiency.eos_acres)),
            phosphorus: (area*(efficiency.eos_totp/efficiency.eos_acres)),
            sediment: ((area*(efficiency.eos_tss/efficiency.eos_acres))/2000)
          };
        },
        getTotalReadingsByCategory: function(period, readings) {
          var total = 0;

          for (var i = 0; i < readings.length; i++) {
            if (readings[i].properties.measurement_period === period) {
              total++;
            }
          }

          return total;
        },
        getPlanningData: function(readings) {

          var planningData = {};

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === 'Planning') {
              planningData = reading;
            }
          });

          return planningData;
        }
      };
    });

}());

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Calculate', ['Load', function(Load) {
    return {
      getLoadVariables: function(segment, landuse) {
        var promise = Load.query({
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        }, function(response) {
          return response;
        });

        return promise;
      },
      getLoadTotals: function(area, efficiency) {
        return {
          nitrogen: (area*(efficiency.eos_totn/efficiency.eos_acres)),
          phosphorus: (area*(efficiency.eos_totp/efficiency.eos_acres)),
          sediment: ((area*(efficiency.eos_tss/efficiency.eos_acres))/2000)
        };
      }
    };
  }]);

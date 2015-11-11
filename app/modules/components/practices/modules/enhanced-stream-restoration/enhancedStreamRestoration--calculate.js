(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('practiceMonitoringAssessmentApp')
    .service('EnhancedStreamRestorationCalculate', function() {
      return {
        bankHeightRatio: function(bankHeight, bankfullHeight) {

          var behi = 0;

          if (bankHeight) {
            behi = (bankHeight/bankfullHeight);
          }

          return behi;

        },
        fractionRunoffTreatedByFloodplain: function(fractionInChannel, fractionRunoffTreated) {

          var fraction = 0;

          //
          // =(POWER(D73,2)+0.3*D73-0.98)*POWER(D74,2)+(-2.35*D73+2)*D74
          //
          if (fractionInChannel && fractionRunoffTreated) {
            fraction = (Math.pow(fractionInChannel, 2)+0.2*fractionInChannel-0.98)*Math.pow(fractionRunoffTreated,2)+(-2.35*fractionInChannel+2)*fractionRunoffTreated;
          }

          return fraction;

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
    });

}());

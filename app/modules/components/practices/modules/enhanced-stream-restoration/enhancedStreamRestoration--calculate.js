(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('practiceMonitoringAssessmentApp')
    .service('EnhancedStreamRestorationCalculate', function($q) {
      return {
        efficiency: {
          n_eff: 0.2,
          p_eff: 0.3,
          s_eff: 0.2
        },
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
        plannedNitrogenProtocol2LoadReduction: function(value, loaddata) {

          var self = this,
              bulkDensity = 125,
              nitrogen = 0,
              leftBehi = self.bankHeightRatio(value.project_left_bank_height, value.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.project_right_bank_height, value.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.length_of_left_bank_with_improved_connectivity*(value.stream_width_at_mean_base_flow/2+5);
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.length_of_right_bank_with_improved_connectivity*(value.stream_width_at_mean_base_flow/2+5);
          }

          //
          // =((IF(E64<1.1,E56*(E55/2+5),0)+IF(E65<1.1,E59*(E55/2+5),0))*5*$D63/2000)*0.000195*365
          //
          nitrogen = ((leftBank+rightBank)*5*bulkDensity/2000)*0.000195*365;

          return nitrogen;

        },
        installedNitrogenProtocol2LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.plannedNitrogenProtocol2LoadReduction(value, loaddata);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.plannedNitrogenProtocol2LoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        plannedNitrogenProtocol3LoadReduction: function(value, loaddata, readings) {

          var self = this,
              nitrogen = 0,
              preProjectData = null;

          //
          // Before we move on we need to make sure we have the appropriate
          // pre-project data which impacts the rest of the calculation
          //
          angular.forEach(readings, function(value, $index) {
            if (readings[$index].measurement_period === 'Pre-Project') {
              preProjectData = value;
            }
          });

          //
          // =IF(E75>0,(E75-D75)*$B$43*(E71*$B$46+E72*$B$47),"")
          //
          if (preProjectData) {
            var plannedRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(value.rainfall_depth_where_connection_occurs, value.floodplain_connection_volume)).toFixed(3),
                preprojectRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(preProjectData.rainfall_depth_where_connection_occurs, preProjectData.floodplain_connection_volume)).toFixed(3);

            nitrogen = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.n_eff*(value.watershed_impervious_area*parseFloat(loaddata.impervious.tn_ual).toFixed(2)+value.watershed_pervious_area*parseFloat(loaddata.pervious.tn_ual).toFixed(2));
          }

          return nitrogen;

        },
        installedNitrogenProtocol3LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.plannedNitrogenProtocol3LoadReduction(value, loaddata, values);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.plannedNitrogenProtocol3LoadReduction(value, loaddata, values);
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
    });

}());

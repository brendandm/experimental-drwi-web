(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldStack')
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
        plannedPhosphorusProtocol3LoadReduction: function(value, loaddata, readings) {

          var self = this,
              phosphorus = 0,
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

            phosphorus = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.p_eff*(value.watershed_impervious_area*parseFloat(loaddata.impervious.tp_ual).toFixed(2)+value.watershed_pervious_area*parseFloat(loaddata.pervious.tp_ual).toFixed(2));
          }

          return phosphorus;

        },
        installedPhosphorusProtocol3LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.plannedPhosphorusProtocol3LoadReduction(value, loaddata, values);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.plannedPhosphorusProtocol3LoadReduction(value, loaddata, values);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        plannedSedimentLoadReduction: function(value, loaddata, readings) {

          var self = this,
              sediment = 0,
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

            sediment = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.s_eff*(value.watershed_impervious_area*parseFloat(loaddata.impervious.tss_ual).toFixed(2)+value.watershed_pervious_area*parseFloat(loaddata.pervious.tss_ual).toFixed(2))/2000;
          }

          return sediment;

        },
        installedSedimentLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.plannedSedimentLoadReduction(value, loaddata, values);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.plannedSedimentLoadReduction(value, loaddata, values);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        milesOfStreambankRestored: function(value) {

          var self = this,
              miles = 0,
              leftBehi = self.bankHeightRatio(value.project_left_bank_height, value.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.project_right_bank_height, value.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.length_of_left_bank_with_improved_connectivity;
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.length_of_right_bank_with_improved_connectivity;
          }

          //
          // =(IF(E64<1.1,E56,0)+IF(E65<1.1,E59,0)+E68)/5280
          //
          console.log('leftBank', leftBank, 'rightBank', rightBank, 'value.stream_length_reconnected_at_floodplain', value.stream_length_reconnected_at_floodplain);
          miles = ((leftBank+rightBank+value.stream_length_reconnected_at_floodplain)/5280);

          return miles;

        },
        milesOfStreambankRestoredInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.milesOfStreambankRestored(value);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.milesOfStreambankRestored(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        acresTreated: function(value) {

          var self = this,
              acres = 0,
              leftBehi = self.bankHeightRatio(value.project_left_bank_height, value.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.project_right_bank_height, value.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.length_of_left_bank_with_improved_connectivity;
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.length_of_right_bank_with_improved_connectivity;
          }

          //
          // =(
          //   IF(E64<1.1,E56*(E55/2+5),0)
          //  +IF(E65<1.1,E59*(E55/2+5),0)
          // )/43560
          //
          acres = (((leftBank*(value.stream_width_at_mean_base_flow/2+5))+(rightBank*(value.stream_width_at_mean_base_flow/2+5))+value.stream_length_reconnected_at_floodplain)/43560);

          return acres;

        },
        acresTreatedInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (values[$index].measurement_period === 'Planning') {
              planned += self.acresTreated(value);
            }
            else if (values[$index].measurement_period === 'Installation') {
              installed += self.acresTreated(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        quantityInstalled: function(values, field, format) {

          console.log('quantityInstalled', field, values)

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {
            if (reading.measurement_period === 'Planning') {
              console.log('loop > planned_total', reading[field])
              planned_total += reading[field];
            } else if (reading.measurement_period === 'Installation') {
              console.log('loop > installed_total', reading[field])
              installed_total += reading[field];
            }

          });

          // Divide the Installed Total by the Planned Total to get a percentage of installed
          if (planned_total) {
            console.log('something to show');
            if (format === '%') {
              percentage = (installed_total/planned_total);
              console.log('percentage', (percentage*100));
              return (percentage*100);
            } else {
              console.log('installed_total', installed_total);
              return installed_total;
            }
          }

          return 0;
        }
      };
    });

}());

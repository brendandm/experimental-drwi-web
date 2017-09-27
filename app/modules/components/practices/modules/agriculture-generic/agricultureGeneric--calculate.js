'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateAgricultureGeneric', function(Calculate, EfficiencyAgricultureGeneric, LoadData, $q) {

    return {
      readings: null,
      loadData: null,
      ual: null,
      GetLoadVariables: function(landRiverSegmentCode, existingLanduseType, callback) {

        var self = this;

        var deferred = $q.defer();

        var promise = LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: planned.segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: planned.landuse
                }
              ]
            }
          }).$promise.then(function(successResponse) {

            if (callback) {
              callback(successResponse)
            }

            deferred.resolve(planned);
          }, function(errorResponse) {

          });

        return deferred.promise;
      },
      getUAL: function(_planning_data) {
        /**
         * Calculate nitrogen, phosphorus, and sediment UALs.
         *
         * @param (object) _planning_data
         *    Planning data reading containing best management practice extent
         *
         * @return (object) _ual
         *    Object containing nitrogen, phosphorus, and sediment UAL values
         */

        var self = this;

        /**
         * Ensure that our LoadData has been returned and assigned to this
         * Agriculture Generic Calculator.
         */
        if (!self.loadData) {
          console.warn("CalculateAgricultureGeneric: Load data not found for practice");
          return;
        }

        /**
         * Load Data is present, we may proceed with calculating the reductions
         */
        var _extent = _planning_data.properties.custom_practice_extent_acres;

        /**
         * UAL's are derived data in the user interface, you get them
         * for each nutrient as follows:
         *
         * Abbreviations:
         *     PA = Practice Area in Acres
         *
         * - Nitrogen = (EOS_TTON/EOS_ACRES)
         * - Phosphorus = (EOS_TTOP/EOS_ACRES)
         * - Sediment = ((EOS_TSS/EOS_ACRES)/2000)
         */
        var _ual = {
          nitrogen: (self.loadData.properties.eos_totn/self.loadData.properties.eos_acres),
          phosphorus: (self.loadData.properties.eos_totp/self.loadData.properties.eos_acres),
          sediment: ((self.loadData.properties.eos_tss/self.loadData.properties.eos_acres)/2000)
        };

        self.ual = _ual;
      },
      getReductionValue: function(_extent, _efficiency, _nutrient) {
        /**
         * Calculate a single nutrient reduction.
         *
         * @param (number) _extent
         *    Extent of the BMP in Acres
         * @param (number) _efficiency
         *    Single nutrient efficiency number from
         *    efficiency_agriculture_generic table
         * @param (object) _nutrient
         *    Nutrient UAL calculated based on current land_river_segment HGMR
         *    code and existing land use type
         *
         * @return (number) _reductionValue
         *    The reduction value for the specified nutrient
         */

         var _ual = self.ual,
             _ualValue = _ual[_nutrient],
             _efficiencyPercentage = (_efficiency/100),
             _reductionValue = _extent*_ualValue*_efficiencyPercentage;

        return _reductionValue
      },
      totalAcresInstalled: function() {

        var self = this,
            total_area = 0;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Installation') {
            total_area += reading.properties.custom_practice_extent_acres;
          }
        });

        return total_area;
      },
      percentageAcresInstalled: function() {

        var self = this,
            total_area = 0,
            planned_area = 0;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            planned_area = reading.properties.custom_practice_extent_acres;
          }
          else if (reading.properties.measurement_period === 'Installation') {
            total_area += reading.properties.custom_practice_extent_acres;
          }
        });

        return ((total_area/planned_area)*100);
      },
      quantityInstalled: function(_ual, _efficiency, format) {

        var installed = 0,
            planned = 0,
            self = this,
            _efficiencyValue = null;

        angular.forEach(self.readings.features, function(value, $index) {

          // Figure out which efficieny to use
          //
          switch (_efficiency) {
            case 'n_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_nitrogen;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
            case 'p_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_phosphorus;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
            case 's_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_sediment;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
          }

          if (value.properties.measurement_period === 'Planning') {
            planned += value.properties.custom_practice_extent_acres*_ual*(_efficiencyValue/100)
          }
          else if (value.properties.measurement_period === 'Installation') {
            installed += value.properties.custom_practice_extent_acres*_ual*(_efficiencyValue/100)
          }
        });

        var percentage_installed = installed/planned;

        return (format === '%') ? (percentage_installed*100) : installed;

      }
    };

  });

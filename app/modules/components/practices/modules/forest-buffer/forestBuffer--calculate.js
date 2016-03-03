(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.Storage
   * @description
   *    Provides site/application specific variables to the entire application
   * Service in the FieldDoc.
   */
  angular.module('FieldDoc')
    .service('CalculateForestBuffer', function(LoadData, $q) {
      return {
        getPreInstallationLoad: function(bufferArea, loaddata) {

          var bufferAreaAcres = (bufferArea/43560);

          console.log('bufferAreaAcres', bufferAreaAcres);

          if (loaddata) {
            console.log('loaddata', loaddata);

            var uplandPreInstallationLoad = {
              nitrogen: ((bufferAreaAcres * 4)*(loaddata.properties.eos_totn/loaddata.properties.eos_acres)),
              phosphorus: ((bufferAreaAcres * 2)*(loaddata.properties.eos_totp/loaddata.properties.eos_acres)),
              sediment: (((bufferAreaAcres * 2)*(loaddata.properties.eos_tss/loaddata.properties.eos_acres))/2000)
            };

            console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

            var existingPreInstallationLoad = {
              nitrogen: (bufferAreaAcres*(loaddata.properties.eos_totn/loaddata.properties.eos_acres)),
              phosphorus: (bufferAreaAcres*(loaddata.properties.eos_totp/loaddata.properties.eos_acres)),
              sediment: ((bufferAreaAcres*(loaddata.properties.eos_tss/loaddata.properties.eos_acres))/2000)
            };

            console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

            return {
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };
          }
        }

        // $scope.calculate.GetPlannedLoad = function(period) {
        //
        //   var existingLanduseType;
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Planning') {
        //       existingLanduseType = $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];
        //     }
        //   }
        //
        //   $scope.calculate.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
        //     $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(newLoaddata) {
        //
        //       Efficiency.query({
        //         q: {
        //           filters: [
        //             {
        //               name: 'cbwm_lu',
        //               op: 'eq',
        //               val: existingLanduseType
        //             },
        //             {
        //               name: 'hydrogeomorphic_region',
        //               op: 'eq',
        //               val: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].hgmr_nme
        //             },
        //             {
        //               name: 'best_management_practice_short_name',
        //               op: 'eq',
        //               val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'ForestBuffersTrp': 'ForestBuffers'
        //             }
        //           ]
        //         }
        //       }).$promise.then(function(efficiencyResponse) {
        //         var efficiency = efficiencyResponse.response.features[0];
        //         $scope.practice_efficiency = efficiency;
        //
        //         //
        //         // EXISTING CONDITION — LOAD VALUES
        //         //
        //         var uplandPlannedInstallationLoad = {
        //           sediment: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.sediment*(efficiency.s_efficiency/100),
        //           nitrogen: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(efficiency.n_efficiency/100),
        //           phosphorus: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(efficiency.p_efficiency/100)
        //         };
        //
        //         console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);
        //
        //         var existingPlannedInstallationLoad = {
        //           sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
        //           nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
        //           phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
        //         };
        //
        //         console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);
        //
        //         //
        //         // PLANNED CONDITIONS — LANDUSE VALUES
        //         //
        //         var totals = {
        //           efficiency: {
        //             new: newLoaddata,
        //             existing: existingLoaddata
        //           },
        //           nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen,
        //           phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus,
        //           sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
        //         };
        //
        //         $scope.calculate.results.totalPlannedLoad = totals;
        //
        //       });
        //     });
        //   });
        //
        // }

        //
        // $scope.calculate.quantityInstalled = function(values, element, format) {
        //
        //   var planned_total = 0,
        //       installed_total = 0,
        //       percentage = 0;
        //
        //   // Get readings organized by their Type
        //   angular.forEach(values, function(reading, $index) {
        //     if (reading.measurement_period === 'Planning') {
        //       planned_total += $scope.calculate.GetSingleInstalledLoad(reading)[element];
        //     } else if (reading.measurement_period === 'Installation') {
        //       installed_total += $scope.calculate.GetSingleInstalledLoad(reading)[element];
        //     }
        //
        //   });
        //
        //   // Divide the Installed Total by the Planned Total to get a percentage of installed
        //   if (planned_total) {
        //     console.log('something to show');
        //     if (format === '%') {
        //       percentage = (installed_total/planned_total);
        //       console.log('percentage', (percentage*100));
        //       return (percentage*100);
        //     } else {
        //       console.log('installed_total', installed_total);
        //       return installed_total;
        //     }
        //   }
        //
        //   return 0;
        //
        // };
        //
        // //
        // // The purpose of this function is to return a percentage of the total installed versus the amount
        // // that was originally planned on being installed:
        // //
        // // (Installation+Installation+Installation) / Planned = % of Planned
        // //
        // //
        // // @param (string) field
        // //    The `field` parameter should be the field that you would like to get the percentage for
        // //
        // $scope.calculate.GetPercentageOfInstalled = function(field, format) {
        //
        //   var planned_total = 0,
        //       installed_total = 0,
        //       percentage = 0;
        //
        //   // Get readings organized by their Type
        //   angular.forEach($scope.practice.readings, function(reading, $index) {
        //
        //     if (reading.measurement_period === 'Planning') {
        //       planned_total += reading[field];
        //     } else if (reading.measurement_period === 'Installation') {
        //       installed_total += reading[field];
        //     }
        //
        //   });
        //
        //   // Divide the Installed Total by the Planned Total to get a percentage of installed
        //   if (planned_total >= 1) {
        //     if (format === 'percentage') {
        //       percentage = (installed_total/planned_total);
        //       return (percentage*100);
        //     } else {
        //       return installed_total;
        //     }
        //   }
        //
        //   return null;
        // };
        //
        // $scope.calculate.GetSingleInstalledLoad = function(value) {
        //
        //   var reduction = 0,
        //       bufferArea = ((value.length_of_buffer * value.average_width_of_buffer)/43560),
        //       landuse = (value.existing_riparian_landuse) ? $scope.landuse[value.existing_riparian_landuse.toLowerCase()] : null,
        //       preExistingEfficieny = $scope.calculate.results.totalPreInstallationLoad.efficieny,
        //       landuseEfficiency = ($scope.calculate.results.totalPlannedLoad && $scope.calculate.results.totalPlannedLoad.efficiency) ? $scope.calculate.results.totalPlannedLoad.efficiency : null,
        //       uplandPreInstallationLoad = null,
        //       existingPreInstallationLoad = null;
        //
        //   if ($scope.practice_efficiency) {
        //     uplandPreInstallationLoad = {
        //       sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*$scope.practice_efficiency.s_efficiency/100),
        //       nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*$scope.practice_efficiency.n_efficiency/100),
        //       phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*$scope.practice_efficiency.p_efficiency/100)
        //     };
        //   }
        //
        //   if (landuseEfficiency) {
        //     existingPreInstallationLoad = {
        //       sediment: ((bufferArea*((landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_tss/landuseEfficiency.new.efficieny.eos_acres)))/2000),
        //       nitrogen: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totn/landuseEfficiency.new.efficieny.eos_acres))),
        //       phosphorus: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totp/landuseEfficiency.new.efficieny.eos_acres)))
        //     };
        //   }
        //
        //   if (uplandPreInstallationLoad && existingPreInstallationLoad) {
        //     return {
        //       nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
        //       phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
        //       sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
        //     };
        //   } else {
        //     return {
        //       nitrogen: null,
        //       phosphorus: null,
        //       sediment: null
        //     };
        //   }
        // };
        //
        // $scope.calculate.GetTreeDensity = function(trees, length, width) {
        //   return (trees/(length*width/43560));
        // };
        //
        // $scope.calculate.GetPercentage = function(part, total) {
        //   return ((part/total)*100);
        // };
        //
        // $scope.calculate.GetConversion = function(part, total) {
        //   return (part/total);
        // };
        //
        // $scope.calculate.GetConversionWithArea = function(length, width, total) {
        //   return ((length*width)/total);
        // };
        //
        // $scope.calculate.GetRestorationTotal = function(unit, area) {
        //
        //   var total_area = 0;
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Installation') {
        //       if (area) {
        //         total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
        //       } else {
        //         total_area += $scope.practice.readings[i].length_of_buffer;
        //       }
        //     }
        //   }
        //
        //   // console.log('GetRestorationTotal', total_area, unit, (total_area/unit));
        //
        //
        //   return (total_area/unit);
        // };
        //
        // $scope.calculate.GetRestorationPercentage = function(unit, area) {
        //
        //   var planned_area = 0,
        //       total_area = $scope.calculate.GetRestorationTotal(unit, area);
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Planning') {
        //       if (area) {
        //         planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
        //       } else {
        //         planned_area = $scope.practice.readings[i].length_of_buffer;
        //       }
        //     }
        //   }
        //
        //   planned_area = (planned_area/unit);
        //
        //   return ((total_area/planned_area)*100);
        // };

      };
    });

}());

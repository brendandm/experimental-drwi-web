'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.LivestockExclusionCalculate
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateLivestockExclusion', function(Calculate, Landuse, Efficiency, LoadData, $q) {
    return {
      newLanduse: 'hyo',
      readings: {},
      site: {},
      practice_efficiency: {},
      grass_efficiency: {},
      forest_efficiency: {},
      toMiles: function(feet) {
        return (feet/5280);
      },
      animalUnits: function(quantity, multiplier) {
        return ((quantity*multiplier)/1000);
      },
      totalDaysPerYearInStream: function(values) {
        return values.instream_dpmjan+values.instream_dpmfeb+values.instream_dpmmar+values.instream_dpmapr+values.instream_dpmmay+values.instream_dpmjun+values.instream_dpmjul+values.instream_dpmaug+values.instream_dpmsep+values.instream_dpmoct+values.instream_dpmnov+values.instream_dpmdec;
      },
      averageHoursPerYearInStream: function(values) {
        var totalHoursPerYearInStream = values.instream_hpdjan+values.instream_hpdfeb+values.instream_hpdmar+values.instream_hpdapr+values.instream_hpdmay+values.instream_hpdjun+values.instream_hpdjul+values.instream_hpdaug+values.instream_hpdsep+values.instream_hpdoct+values.instream_hpdnov+values.instream_hpddec;
        return totalHoursPerYearInStream;
      },
      averageDaysPerYearInStream: function(values) {
        var sumproduct = (values.instream_hpdjan*values.instream_dpmjan)+(values.instream_hpdfeb*values.instream_dpmfeb)+(values.instream_hpdmar*values.instream_dpmmar)+(values.instream_hpdapr*values.instream_dpmapr)+(values.instream_hpdmay*values.instream_dpmmay)+(values.instream_hpdjun*values.instream_dpmjun)+(values.instream_hpdjul*values.instream_dpmjul)+(values.instream_hpdaug*values.instream_dpmaug)+(values.instream_hpdsep*values.instream_dpmsep)+(values.instream_hpdoct*values.instream_dpmoct)+(values.instream_hpdnov*values.instream_dpmnov)+(values.instream_hpddec*values.instream_dpmdec);

        return (sumproduct/24);
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
      },
      milesInstalled: function(values, field, format) {

        var installed_length = 0,
            planned_length = 0,
            feetInMiles = 5280;

        angular.forEach(values, function(value, $index) {
          if (value.properties.measurement_period === 'Planning') {
            planned_length += value.properties[field];
          }
          else if (value.properties.measurement_period === 'Installation') {
            installed_length += value.properties[field];
          }
        });

        var miles_installed = installed_length/feetInMiles,
            percentage_installed = installed_length/planned_length;

        return (format === '%') ? (percentage_installed*100) : miles_installed;
      },
      getPrePlannedLoad: function(segment, landuse, area) {

        var promise = Calculate.getLoadVariables(segment, Landuse[landuse.toLowerCase()]).$promise.then(function(efficiency) {
          // console.log('Efficienies selected', area, efficiency);
          return Calculate.getLoadTotals(area, efficiency.features[0].properties);
        });

        return promise;
      },
      GetLoadVariables: function(period, landuse) {

        var self = this;

        var planned = {
          width: 0,
          length: 0,
          area: 0,
          landuse: '',
          segment: self.site.properties.segment.properties.hgmr_code,
          efficieny: null
        };

        var deferred = $q.defer();

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === period) {

            planned.length = reading.properties.length_of_fencing;
            planned.width = reading.properties.average_buffer_width;
            planned.area = ((planned.length*planned.width)/43560);
            planned.landuse = (landuse) ? landuse : reading.properties.existing_riparian_landuse;

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
                planned.efficieny = successResponse.features[0].properties;
                deferred.resolve(planned);
              });
          }
        });

        return deferred.promise;
      },
      GetPreInstallationLoad: function(callback) {

        var self = this;

        var rotationalGrazingArea, existingLanduseType, uplandLanduseType, animal, auDaysYr;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
             rotationalGrazingArea = (reading.properties.length_of_fencing*200/43560);
             existingLanduseType = reading.properties.existing_riparian_landuse;
             uplandLanduseType = reading.properties.upland_landuse;
             animal = reading.properties.animal_type;
             auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
          }
        });

        self.GetLoadVariables('Planning', existingLanduseType).then(function(existingLoaddata) {
          self.GetLoadVariables('Planning', uplandLanduseType).then(function(loaddata) {

            //
            // =X38*2*AA$10/2000 + Z34*(AA$10/2000)*(AE$5/100)
            //
            var uplandPreInstallationLoad = {
              sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000) + rotationalGrazingArea*((loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres)/2000)*(self.practice_efficiency.s_efficiency),
              nitrogen: (((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres))) + rotationalGrazingArea*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)*(self.practice_efficiency.n_efficiency),
              phosphorus: (((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres))) + rotationalGrazingArea*((loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres))*(self.practice_efficiency.p_efficiency)
            };

            console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

            var existingPreInstallationLoad = {
              sediment: ((loaddata.area*(existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres))/2000),
              nitrogen: (loaddata.area*(existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)),
              phosphorus: (loaddata.area*(existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres))
            };

            console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

            var directDeposit = {
              nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
              phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
            };

            console.log('directDeposit', directDeposit);

            self.results.totalPreInstallationLoad = {
              directDeposit: directDeposit,
              efficieny: loaddata.efficieny,
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen + directDeposit.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus + directDeposit.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };

            console.log('self.results.totalPreInstallationLoad', self.results.totalPreInstallationLoad)

            if (callback) {
              callback(self.results.totalPreInstallationLoad);
            }

          });
        });

      },
      GetPlannedLoad: function(period, callback) {

        var self = this;

        var existingLanduseType, bmpEfficiency, animal, auDaysYr;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === period) {
            existingLanduseType = reading.properties.existing_riparian_landuse;
            bmpEfficiency = (reading.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency;
            animal = reading.properties.animal_type;
            auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
          }
        });

        self.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
          self.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

            Efficiency.query({
              q: {
                filters: [
                  {
                    name: 'cbwm_lu',
                    op: 'eq',
                    val: existingLanduseType
                  },
                  {
                    name: 'hydrogeomorphic_region',
                    op: 'eq',
                    val: self.site.properties.segment.properties.hgmr_name
                  },
                  {
                    name: 'best_management_practice_short_name',
                    op: 'eq',
                    val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'ForestBuffersTrp': 'ForestBuffers'
                  }
                ]
              }
            }).$promise.then(function(efficiencyResponse) {
              // var efficiency = self.practice_efficiency = efficiencyResponse.response.features[0];

              //
              // EXISTING CONDITION — LOAD VALUES
              //
              var uplandPlannedInstallationLoad = {
                sediment: (self.results.totalPreInstallationLoad.uplandLanduse.sediment/100)*bmpEfficiency.s_efficiency,
                nitrogen: self.results.totalPreInstallationLoad.uplandLanduse.nitrogen/100*bmpEfficiency.n_efficiency,
                phosphorus: self.results.totalPreInstallationLoad.uplandLanduse.phosphorus/100*bmpEfficiency.p_efficiency
              };

              // console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

              var existingPlannedInstallationLoad = {
                sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
              };

              // console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

              var directDeposit = {
                nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
                phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
              };

              //
              // PLANNED CONDITIONS — LANDUSE VALUES
              //
              var totals = {
                efficiency: {
                  new: newLoaddata,
                  existing: existingLoaddata
                },
                directDeposit: directDeposit,
                nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen + directDeposit.nitrogen,
                phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus + directDeposit.phosphorus,
                sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
              };

              self.results.totalPlannedLoad = totals;

              if (callback) {
                callback(self.results.totalPlannedLoad);
              }
            });
          });
        });
      },
      quantityReductionInstalled: function(values, element, format) {

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.GetSingleInstalledLoad(reading)[element];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.GetSingleInstalledLoad(reading)[element];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;

      },
      GetPercentageOfInstalled: function(field, format) {
        //
        // The purpose of this function is to return a percentage of the total installed versus the amount
        // that was originally planned on being installed:
        //
        // (Installation+Installation+Installation) / Planned = % of Planned
        //
        //
        // @param (string) field
        //    The `field` parameter should be the field that you would like to get the percentage for
        //

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(self.readings.features, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += reading.properties[field];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += reading.properties[field];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total >= 1) {
          if (format === 'percentage') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return null;
      },
      GetSingleInstalledLoad: function(value) {

        /********************************************************************/
        // Setup
        /********************************************************************/

        var self = this;

        //
        // Before we allow any of the following calculations to happen we
        // need to ensure that our basic load data has been loaded
        //
        if (!self.results.totalPlannedLoad) {
          return {
            nitrogen: null,
            phosphorus: null,
            sediment: null
          };
        }

        //
        // Setup variables we will need to complete the calculation
        //
        //
        var bufferArea = (value.properties.length_of_fencing * value.properties.average_buffer_width)/43560,
            bmpEfficiency = (value.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency,
            newLanduseLoadData = self.results.totalPlannedLoad.efficiency.new.efficieny,
            existingLoaddata = self.results.totalPlannedLoad.efficiency.existing.efficieny,
            uplandLoaddata = self.results.totalPreInstallationLoad.efficieny,
            rotationalGrazingArea = (value.properties.length_of_fencing*200/43560),
            animal = value.properties.animal_type,
            auDaysYr,
            planningValue;

        //
        // Get Animal Unit Days/Year from Planning data
        //
        angular.forEach(self.readings.features, function(reading) {
          if (reading.properties.measurement_period === 'Planning') {
            planningValue = reading.properties;
            auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
          }
        });

        /********************************************************************/
        // Part 1: Pre-Project Loads based on "Installed" buffer size
        /********************************************************************/

        var preUplandPreInstallationLoad = {
          sediment: (bufferArea * 2 * (uplandLoaddata.eos_tss/uplandLoaddata.eos_acres)/2000) + rotationalGrazingArea * ((uplandLoaddata.eos_tss/uplandLoaddata.eos_acres)/2000) * (self.practice_efficiency.s_efficiency),
          nitrogen: ((bufferArea * 4 * (uplandLoaddata.eos_totn/uplandLoaddata.eos_acres))) + rotationalGrazingArea*(uplandLoaddata.eos_totn/uplandLoaddata.eos_acres)*(self.practice_efficiency.n_efficiency),
          phosphorus: ((bufferArea * 2 * (uplandLoaddata.eos_totp/uplandLoaddata.eos_acres))) + rotationalGrazingArea*((uplandLoaddata.eos_totp/uplandLoaddata.eos_acres))*(self.practice_efficiency.p_efficiency)
        };

        var preExistingPreInstallationLoad = {
          sediment: ((bufferArea*(existingLoaddata.eos_tss/existingLoaddata.eos_acres))/2000),
          nitrogen: (bufferArea*(existingLoaddata.eos_totn/existingLoaddata.eos_acres)),
          phosphorus: (bufferArea*(existingLoaddata.eos_totp/existingLoaddata.eos_acres))
        };

        var preDirectDeposit = {
          nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
          phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
        };

         var preInstallationeBMPLoadTotals = {
             nitrogen: preUplandPreInstallationLoad.nitrogen + preExistingPreInstallationLoad.nitrogen + preDirectDeposit.nitrogen,
             phosphorus: preUplandPreInstallationLoad.phosphorus + preExistingPreInstallationLoad.phosphorus + preDirectDeposit.phosphorus,
             sediment: preUplandPreInstallationLoad.sediment + preExistingPreInstallationLoad.sediment
         };

        //  console.log('preInstallationeBMPLoadTotals', preInstallationeBMPLoadTotals);

         /********************************************************************/
         // Part 2: Loads based on "Installed" buffer size
         /********************************************************************/
         var uplandPlannedInstallationLoad = {
           sediment: preUplandPreInstallationLoad.sediment/100*bmpEfficiency.s_efficiency,
           nitrogen: preUplandPreInstallationLoad.nitrogen/100*bmpEfficiency.n_efficiency,
           phosphorus: preUplandPreInstallationLoad.phosphorus/100*bmpEfficiency.p_efficiency
         };

         var existingPlannedInstallationLoad = {
           sediment: ((bufferArea*((existingLoaddata.eos_tss/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_tss/newLanduseLoadData.eos_acres)))/2000),
           nitrogen: (bufferArea*((existingLoaddata.eos_totn/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totn/newLanduseLoadData.eos_acres))),
           phosphorus: (bufferArea*((existingLoaddata.eos_totp/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totp/newLanduseLoadData.eos_acres)))
         };

         var directDeposit = {
           nitrogen: preDirectDeposit.nitrogen*value.properties.length_of_fencing/planningValue.length_of_fencing,
           phosphorus: preDirectDeposit.phosphorus*value.properties.length_of_fencing/planningValue.length_of_fencing,
         };

        if (uplandPlannedInstallationLoad && existingPlannedInstallationLoad && directDeposit) {
          return {
            nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen + directDeposit.nitrogen,
            phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus + directDeposit.phosphorus,
            sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
          };
        } else {
          return {
            nitrogen: null,
            phosphorus: null,
            sediment: null
          };
        }
      },
      GetTreeDensity: function(trees, length, width) {
        return (trees/(length*width/43560));
      },
      GetPercentage: function(part, total) {
        return ((part/total)*100);
      },
      GetConversion: function(part, total) {
        return (part/total);
      },
      GetConversionWithArea: function(length, width, total) {
        return ((length*width)/total);
      },
      GetRestorationTotal: function(unit, area) {

        var self = this;

        var total_area = 0;

        angular.forEach(self.readings.features, function(reading) {
          if (reading.properties.measurement_period === 'Installation') {
            if (area) {
              total_area += (reading.properties.length_of_fencing*reading.properties.average_buffer_width);
            } else {
              total_area += reading.properties.length_of_fencing;
            }
          }
        });

        // console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


        return (total_area/unit);
      },
      GetRestorationPercentage: function(unit, area) {

        var self = this;

        var planned_area = 0,
            total_area = self.GetRestorationTotal(unit, area);

        angular.forEach(self.readings.features, function(reading) {
          if (reading.properties.measurement_period === 'Planning') {
            if (area) {
              planned_area = (reading.properties.length_of_fencing*reading.properties.average_buffer_width);
            } else {
              planned_area = reading.properties.length_of_fencing;
            }
          }
        });

        planned_area = (planned_area/unit);

        return ((total_area/planned_area)*100);
      },
      quantityBufferInstalled: function(values, element, format) {

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {
          if (reading.measurement_period === 'Planning') {
            planned_total += self.GetSingleInstalledLoad(reading)[element];
          } else if (reading.measurement_period === 'Installation') {
            installed_total += self.GetSingleInstalledLoad(reading)[element];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;

      },
      results: function() {

        var self = this;

        return {
          totalPreInstallationLoad: self.GetPreInstallationLoad(),
          totalPlannedLoad: self.GetPlannedLoad('Planning')
        }
      }
    };
  });

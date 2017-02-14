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
    .service('CalculateForestBuffer', function(Calculate, Efficiency, LoadData, $q) {
      return {
        newLanduse: 'for',
        readings: {},
        site: {},
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
              planned.length = reading.properties.length_of_buffer;
              planned.width = reading.properties.average_width_of_buffer;
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
                }, function(errorResponse) {
                  deferred.resolve({
                    area: null,
                    efficieny: {
                      eos_totn: null,
                      eos_tss: null,
                      eos_totp: null,
                      eos_acres: null
                    }
                  });
                });
            }
          });

          return deferred.promise;
        },
        GetPreInstallationLoad: function(period, callback) {

          var self = this;

          //
          // Existing Landuse
          //
          self.GetLoadVariables(period).then(function(loaddata) {

            if (!loaddata.area) {
              self.results.totalPreInstallationLoad = null;
              return;
            }

            var uplandPreInstallationLoad = {
              nitrogen: ((loaddata.area*4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
              phosphorus: ((loaddata.area*2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
              sediment: (((loaddata.area*2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
            };

            var existingPreInstallationLoad = {
              nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
              phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
              sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
            };

            self.results.totalPreInstallationLoad = {
              efficieny: loaddata.efficieny,
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };

            if (callback) {
              callback(self.results.totalPreInstallationLoad)
            }

          });


        },
        GetPlannedLoad: function(period, callback) {

          var self = this;

          var existingLanduseType, bufferProjectType;

          angular.forEach(self.readings.features, function(reading, $index) {
            if (reading.properties.measurement_period === 'Planning') {
              existingLanduseType = reading.properties.existing_riparian_landuse;
              bufferProjectType = reading.properties.type_of_buffer_project;
            }
          });

          if (!period && !existingLanduseType) {
            return;
          }

          self.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
            self.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

              var best_management_practice_short_name = 'ForestBuffersTrp';

              if (bufferProjectType === 'agriculture' && (existingLanduseType === 'pas' || existingLanduseType === 'npa')) {
                best_management_practice_short_name = 'ForestBuffersTrp';
              } else if (bufferProjectType === 'agriculture' && (existingLanduseType !== 'pas' || existingLanduseType === 'npa')) {
                best_management_practice_short_name = 'ForestBuffers';
              } else if (bufferProjectType === 'urban') {
                best_management_practice_short_name = 'ForestBufUrban';
              }

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
                      val: best_management_practice_short_name
                    }
                  ]
                }
              }).$promise.then(function(efficiencyResponse) {

                self.practice_efficiency = efficiencyResponse.features[0].properties;

                //
                // EXISTING CONDITION — LOAD VALUES
                //
                // console.log('uplandPlannedInstallationLoad', self.results.totalPreInstallationLoad.uplandLanduse.nitrogen, self.practice_efficiency.n_efficiency)
                var uplandPlannedInstallationLoad = {
                  sediment: self.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                  nitrogen: self.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                  phosphorus: self.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
                };

                // console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                var existingPlannedInstallationLoad = {
                  sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                  nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                  phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                };

                // console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

                //
                // PLANNED CONDITIONS — LANDUSE VALUES
                //
                var totals = {
                  efficiency: {
                    new: newLoaddata,
                    existing: existingLoaddata
                  },
                  nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen,
                  phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus,
                  sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
                };

                self.results.totalPlannedLoad = totals;

                if (callback) {
                  callback(self.results.totalPlannedLoad)
                }

              });
            });
          });

        },
        quantityInstalled: function(values, element, format) {

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

          var self = this;

          var reduction = 0,
              bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
              landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
              preExistingEfficieny = self.results.totalPreInstallationLoad.efficieny,
              landuseEfficiency = (self.results.totalPlannedLoad && self.results.totalPlannedLoad.efficiency) ? self.results.totalPlannedLoad.efficiency : null,
              uplandPreInstallationLoad = null,
              existingPreInstallationLoad = null;

          if (self.practice_efficiency) {
            uplandPreInstallationLoad = {
              sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*self.practice_efficiency.s_efficiency),
              nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.n_efficiency),
              phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.p_efficiency)
            };
          }

          if (landuseEfficiency) {
            existingPreInstallationLoad = {
              sediment: ((bufferArea*((landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_tss/landuseEfficiency.new.efficieny.eos_acres)))/2000),
              nitrogen: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totn/landuseEfficiency.new.efficieny.eos_acres))),
              phosphorus: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totp/landuseEfficiency.new.efficieny.eos_acres)))
            };
          }

          if (uplandPreInstallationLoad && existingPreInstallationLoad) {
            return {
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
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

          angular.forEach(self.readings.features, function(reading, $index) {
            if (reading.properties.measurement_period === 'Installation') {
              if (area) {
                total_area += (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
              } else {
                total_area += reading.properties.length_of_buffer;
              }
            }
          });

          return (total_area/unit);
        },GetRestorationPercentage: function(unit, area) {

          var self = this;

          var planned_area = 0,
              total_area = self.GetRestorationTotal(unit, area);

          angular.forEach(self.readings.features, function(reading, $index) {
            if (reading.properties.measurement_period === 'Planning') {
              if (area) {
                planned_area = (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
              } else {
                planned_area = reading.properties.length_of_buffer;
              }
            }
          });

          planned_area = (planned_area/unit);

          return ((total_area/planned_area)*100);
        },
        results: function() {

          var self = this;

          return {
            percentageLengthOfBuffer: {
              percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
              total: self.GetPercentageOfInstalled('length_of_buffer')
            },
            percentageTreesPlanted: {

              percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
              total: self.GetPercentageOfInstalled('number_of_trees_planted')
            },
            totalPreInstallationLoad: self.GetPreInstallationLoad('Planning'),
            totalPlannedLoad: self.GetPlannedLoad('Planning'),
            totalMilesRestored: self.GetRestorationTotal(5280),
            percentageMilesRestored: self.GetRestorationPercentage(5280, false),
            totalAcresRestored: self.GetRestorationTotal(43560, true),
            percentageAcresRestored: self.GetRestorationPercentage(43560, true)
          }
        },
        metrics: function() {

          var self = this;

          return {
            percentageLengthOfBuffer: {
              percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
              total: self.GetPercentageOfInstalled('length_of_buffer')
            },
            percentageTreesPlanted: {

              percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
              total: self.GetPercentageOfInstalled('number_of_trees_planted')
            },
            totalMilesRestored: self.GetRestorationTotal(5280),
            percentageMilesRestored: self.GetRestorationPercentage(5280, false),
            totalAcresRestored: self.GetRestorationTotal(43560, true),
            percentageAcresRestored: self.GetRestorationPercentage(43560, true)
          }
        }

      };
    });

}());

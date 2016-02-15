(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldStack')
    .controller('ForestBufferReportController', function (Account, Calculate, CalculateForestBuffer, Efficiency, LoadData, $location, $log, practice, PracticeForestBuffer, $q, readings, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };
      self.newLanduse = 'for';

      self.calculate = Calculate;

      practice.$promise.then(function(successResponse) {

        self.practice = successResponse;

        self.practiceType = Utility.machineName(self.practice.properties.practice_type);

        //
        //
        //
        self.template = {
          path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
        };

        //
        //
        //
        site.$promise.then(function(successResponse) {
          self.site = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                type: 'active'
              }
          ];

          $rootScope.page.actions = [
            {
              type: 'button-link new',
              action: function() {
                self.addReading();
              },
              text: 'Add Measurement Data'
            }
          ];

          readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            // self.existingLanduse = self.calculateForestBuffer.getExistingLanduse('Planning', self.readings.features);
            //
            // self.uplandLanduse = self.calculateForestBuffer.getExistingLanduse('Planning', self.readings.features);
            //
            // self.segment = self.site.properties.segment.properties.hgmr_code;
            //
            // self.calculateForestBuffer.getLoadPromise(self.existingLanduse, self.segment).then(function(successResponse) {
            //   self.loadData = successResponse;
            // });

            self.calculateForestBuffer = {};

            self.calculateForestBuffer.GetLoadVariables = function(period, landuse) {

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
                        ],
                        single: true
                      }
                    }).$promise.then(function(successResponse) {
                      planned.efficieny = successResponse.properties;
                      deferred.resolve(planned);
                    });
                }
              });

              return deferred.promise;
            };

            self.calculateForestBuffer.GetPreInstallationLoad = function(period) {

              //
              // Existing Landuse
              //
              self.calculateForestBuffer.GetLoadVariables(period).then(function(loaddata) {

                var uplandPreInstallationLoad = {
                  nitrogen: ((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: ((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

                var existingPreInstallationLoad = {
                  nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

                self.calculateForestBuffer.results.totalPreInstallationLoad = {
                  efficieny: loaddata.efficieny,
                  uplandLanduse: uplandPreInstallationLoad,
                  existingLanduse: existingPreInstallationLoad,
                  nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
                  phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
                  sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                };

              });


            };

            self.calculateForestBuffer.GetPlannedLoad = function(period) {

              var existingLanduseType;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  existingLanduseType = reading.properties.existing_riparian_landuse;
                }
              });

              if (!period && !existingLanduseType) {
                return;
              }

              self.calculateForestBuffer.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
                self.calculateForestBuffer.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

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
                      ],
                      single: true
                    }
                  }).$promise.then(function(efficiencyResponse) {

                    console.log('efficiencyResponse', efficiencyResponse);

                    self.practice_efficiency = efficiencyResponse.properties;

                    //
                    // EXISTING CONDITION — LOAD VALUES
                    //
                    console.log('uplandPlannedInstallationLoad', self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.nitrogen, self.practice_efficiency.n_efficiency)
                    var uplandPlannedInstallationLoad = {
                      sediment: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                      nitrogen: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                      phosphorus: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
                    };

                    console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                    var existingPlannedInstallationLoad = {
                      sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                      nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                      phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                    };

                    console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

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

                    self.calculateForestBuffer.results.totalPlannedLoad = totals;

                  });
                });
              });

            };


            self.calculateForestBuffer.quantityInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += self.calculateForestBuffer.GetSingleInstalledLoad(reading)[element];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += self.calculateForestBuffer.GetSingleInstalledLoad(reading)[element];
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

            };

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
            self.calculateForestBuffer.GetPercentageOfInstalled = function(field, format) {

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
            };

            self.calculateForestBuffer.GetSingleInstalledLoad = function(value) {

              var reduction = 0,
                  bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
                  landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
                  preExistingEfficieny = self.calculateForestBuffer.results.totalPreInstallationLoad.efficieny,
                  landuseEfficiency = (self.calculateForestBuffer.results.totalPlannedLoad && self.calculateForestBuffer.results.totalPlannedLoad.efficiency) ? self.calculateForestBuffer.results.totalPlannedLoad.efficiency : null,
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
            };

            self.calculateForestBuffer.GetTreeDensity = function(trees, length, width) {
              return (trees/(length*width/43560));
            };

            self.calculateForestBuffer.GetPercentage = function(part, total) {
              return ((part/total)*100);
            };

            self.calculateForestBuffer.GetConversion = function(part, total) {
              return (part/total);
            };

            self.calculateForestBuffer.GetConversionWithArea = function(length, width, total) {
              return ((length*width)/total);
            };

            self.calculateForestBuffer.GetRestorationTotal = function(unit, area) {

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
            };

            self.calculateForestBuffer.GetRestorationPercentage = function(unit, area) {

              var planned_area = 0,
                  total_area = self.calculateForestBuffer.GetRestorationTotal(unit, area);

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
            };

            self.calculateForestBuffer.results = {
              percentageLengthOfBuffer: {
                percentage: self.calculateForestBuffer.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
                total: self.calculateForestBuffer.GetPercentageOfInstalled('length_of_buffer')
              },
              percentageTreesPlanted: {

                percentage: self.calculateForestBuffer.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
                total: self.calculateForestBuffer.GetPercentageOfInstalled('number_of_trees_planted')
              },
              totalPreInstallationLoad: self.calculateForestBuffer.GetPreInstallationLoad('Planning'),
              totalPlannedLoad: self.calculateForestBuffer.GetPlannedLoad('Planning'),
              totalMilesRestored: self.calculateForestBuffer.GetRestorationTotal(5280),
              percentageMilesRestored: self.calculateForestBuffer.GetRestorationPercentage(5280, false),
              totalAcresRestored: self.calculateForestBuffer.GetRestorationTotal(43560, true),
              percentageAcresRestored: self.calculateForestBuffer.GetRestorationPercentage(43560, true)
            };

          }, function(errorResponse) {

          });

        }, function(errorResponse) {
          //
        });

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {
            user.$promise.then(function(userResponse) {
                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: true
                };
            });
        }
      });

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeForestBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

    });

}());

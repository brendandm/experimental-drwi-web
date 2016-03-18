'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('LivestockExclusionReportController', function (Account, animals, Calculate, CalculateLivestockExclusion, Efficiency, LoadData, $location, practice, PracticeLivestockExclusion, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.newLanduse = 'hyo';

    //
    // Temporary Fix
    //
    self.practice_efficiency = {
      s_efficiency: 30/100,
      n_efficiency: 9/100,
      p_efficiency: 24/100
    };

    self.grass_efficiency = {
      s_efficiency: 60/100,
      n_efficiency: 21/100,
      p_efficiency: 45/100
    };

    self.forest_efficiency = {
      s_efficiency: 60/100,
      n_efficiency: 21/100,
      p_efficiency: 45/100
    };

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
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
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

            self.calculateLivestockExclusion = CalculateLivestockExclusion;

            self.calculateLivestockExclusion.GetLoadVariables = function(period, landuse) {

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
            };

            self.calculateLivestockExclusion.GetPreInstallationLoad = function() {

              var rotationalGrazingArea, existingLanduseType, uplandLanduseType, animal, auDaysYr;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                   rotationalGrazingArea = (reading.properties.length_of_fencing*200/43560);
                   existingLanduseType = reading.properties.existing_riparian_landuse;
                   uplandLanduseType = reading.properties.upland_landuse;
                   animal = reading.properties.animal_type;
                   auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
                }
              });

              self.calculateLivestockExclusion.GetLoadVariables('Planning', existingLanduseType).then(function(existingLoaddata) {
                self.calculateLivestockExclusion.GetLoadVariables('Planning', uplandLanduseType).then(function(loaddata) {

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

                  self.calculateLivestockExclusion.results.totalPreInstallationLoad = {
                    directDeposit: directDeposit,
                    efficieny: loaddata.efficieny,
                    uplandLanduse: uplandPreInstallationLoad,
                    existingLanduse: existingPreInstallationLoad,
                    nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen + directDeposit.nitrogen,
                    phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus + directDeposit.phosphorus,
                    sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                  };

                });
              });

            };

            self.calculateLivestockExclusion.GetPlannedLoad = function(period) {

              var existingLanduseType, bmpEfficiency, animal, auDaysYr;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === period) {
                  existingLanduseType = reading.properties.existing_riparian_landuse;
                  bmpEfficiency = (reading.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency;
                  animal = reading.properties.animal_type;
                  auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
                }
              });

              self.calculateLivestockExclusion.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
                self.calculateLivestockExclusion.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

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
                      sediment: (self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.sediment/100)*bmpEfficiency.s_efficiency,
                      nitrogen: self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.nitrogen/100*bmpEfficiency.n_efficiency,
                      phosphorus: self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.phosphorus/100*bmpEfficiency.p_efficiency
                    };

                    console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                    var existingPlannedInstallationLoad = {
                      sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                      nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                      phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                    };

                    console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

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

                    self.calculateLivestockExclusion.results.totalPlannedLoad = totals;

                  });
                });
              });

            };


            self.calculateLivestockExclusion.quantityReductionInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
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
            self.calculateLivestockExclusion.GetPercentageOfInstalled = function(field, format) {

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

            self.calculateLivestockExclusion.GetSingleInstalledLoad = function(value) {

              /********************************************************************/
              // Setup
              /********************************************************************/

              //
              // Before we allow any of the following calculations to happen we
              // need to ensure that our basic load data has been loaded
              //
              if (!self.calculateLivestockExclusion.results.totalPlannedLoad) {
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
                  newLanduseLoadData = self.calculateLivestockExclusion.results.totalPlannedLoad.efficiency.new.efficieny,
                  existingLoaddata = self.calculateLivestockExclusion.results.totalPlannedLoad.efficiency.existing.efficieny,
                  uplandLoaddata = self.calculateLivestockExclusion.results.totalPreInstallationLoad.efficieny,
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
                  auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
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

               console.log('preInstallationeBMPLoadTotals', preInstallationeBMPLoadTotals);

               /********************************************************************/
               // Part 2: Loads based on "Installed" buffer size
               /********************************************************************/
               var uplandPlannedInstallationLoad = {
                 sediment: preUplandPreInstallationLoad.sediment/100*bmpEfficiency.s_efficiency,
                 nitrogen: preUplandPreInstallationLoad.nitrogen/100*bmpEfficiency.n_efficiency,
                 phosphorus: preUplandPreInstallationLoad.phosphorus/100*bmpEfficiency.p_efficiency
               };

               console.log('postInstallationeBMPLoadTotals uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

               var existingPlannedInstallationLoad = {
                 sediment: ((bufferArea*((existingLoaddata.eos_tss/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_tss/newLanduseLoadData.eos_acres)))/2000),
                 nitrogen: (bufferArea*((existingLoaddata.eos_totn/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totn/newLanduseLoadData.eos_acres))),
                 phosphorus: (bufferArea*((existingLoaddata.eos_totp/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totp/newLanduseLoadData.eos_acres)))
               };

               console.log('postInstallationeBMPLoadTotals existingPlannedInstallationLoad', existingPlannedInstallationLoad);

               var directDeposit = {
                 nitrogen: preDirectDeposit.nitrogen*value.length_of_fencing/planningValue.length_of_fencing,
                 phosphorus: preDirectDeposit.phosphorus*value.length_of_fencing/planningValue.length_of_fencing,
               };

               console.log('postInstallationeBMPLoadTotals directDeposit', directDeposit);

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
            };

            self.calculateLivestockExclusion.GetTreeDensity = function(trees, length, width) {
              return (trees/(length*width/43560));
            };

            self.calculateLivestockExclusion.GetPercentage = function(part, total) {
              return ((part/total)*100);
            };

            self.calculateLivestockExclusion.GetConversion = function(part, total) {
              return (part/total);
            };

            self.calculateLivestockExclusion.GetConversionWithArea = function(length, width, total) {
              return ((length*width)/total);
            };

            self.calculateLivestockExclusion.GetRestorationTotal = function(unit, area) {

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

              console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


              return (total_area/unit);
            };

            self.calculateLivestockExclusion.GetRestorationPercentage = function(unit, area) {

              var planned_area = 0,
                  total_area = self.calculateLivestockExclusion.GetRestorationTotal(unit, area);

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
            };


            self.calculateLivestockExclusion.quantityBufferInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.measurement_period === 'Planning') {
                  planned_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                } else if (reading.measurement_period === 'Installation') {
                  installed_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
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

            };

            self.calculateLivestockExclusion.results = {
              totalPreInstallationLoad: self.calculateLivestockExclusion.GetPreInstallationLoad(),
              totalPlannedLoad: self.calculateLivestockExclusion.GetPlannedLoad('Planning')
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

      var newReading = new PracticeLivestockExclusion({
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

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldStack')
    .controller('ForestBufferReportController', function (Account, Calculate, CalculateForestBuffer, $location, practice, PracticeForestBuffer, readings, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      self.calculate = Calculate;
      self.calculateForestBuffer = CalculateForestBuffer;

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

      readings.$promise.then(function(successResponse) {

        self.readings = successResponse;

        self.total = {
          planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
          installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
          monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
        };

      }, function(errorResponse) {

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


      // //
      // // Assign project to a scoped variable
      // //
      // $scope.project = project;
      // $scope.site = site;
      //
      // $scope.template = template;
      // $scope.fields = fields;
      //
      // $scope.practice = practice;
      // $scope.practice.practice_type = 'forest-buffer';
      // $scope.practice.readings = readings;
      // $scope.practice_efficiency = null;
      //
      // $scope.storage = Storage[$scope.practice.practice_type];
      //
      // $scope.user = user;
      // $scope.user.owner = false;
      // $scope.user.feature = {};
      // $scope.user.template = {};
      //
      // $scope.landuse = Landuse;
      //
      // $scope.GetTotal = function(period) {
      //
      //   var total = 0;
      //
      //   for (var i = 0; i < $scope.practice.readings.length; i++) {
      //     if ($scope.practice.readings[i].measurement_period === period) {
      //       total++;
      //     }
      //   }
      //
      //   return total;
      // };
      //
      // $scope.total = {
      //   planning: $scope.GetTotal('Planning'),
      //   installation: $scope.GetTotal('Installation'),
      //   monitoring: $scope.GetTotal('Monitoring')
      // };
      //
      // //
      // // Load Land river segment details
      // //
      // Feature.GetFeature({
      //   storage: commonscloud.collections.land_river_segment.storage,
      //   featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
      // }).then(function(response) {
      //   $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
      // });
      //
      // $scope.readings = {
      //   bufferWidth: function() {
      //     for (var i = 0; i < $scope.practice.readings.length; i++) {
      //       if ($scope.practice.readings[i].measurement_period === 'Planning') {
      //         return $scope.practice.readings[i].average_width_of_buffer;
      //       }
      //     }
      //   },
      //   landuse: function(landuseType) {
      //     for (var i = 0; i < $scope.practice.readings.length; i++) {
      //       if ($scope.practice.readings[i].measurement_period === 'Planning') {
      //         return $scope.practice.readings[i][landuseType];
      //       }
      //     }
      //   },
      //   add: function(practice, readingType) {
      //     //
      //     // Creating a practice reading is a two step process.
      //     //
      //     //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
      //     //     for the Practice Reading table
      //     //  2. Update the Practice to create a relationship with the Reading created in step 1
      //     //
      //     Feature.CreateFeature({
      //       storage: $scope.storage.storage,
      //       data: {
      //         measurement_period: (readingType) ? readingType : null,
      //         average_width_of_buffer: $scope.readings.bufferWidth(),
      //         existing_riparian_landuse: $scope.readings.landuse('existing_riparian_landuse'),
      //         upland_landuse: $scope.readings.landuse('upland_landuse'),
      //         report_date: moment().format('YYYY-MM-DD'),
      //         owner: $scope.user.id,
      //         status: 'private'
      //       }
      //     }).then(function(reportId) {
      //
      //       var data = {};
      //       data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);
      //
      //       //
      //       // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
      //       // to submit all relationships that are created and should remain. If we only submit the new
      //       // ID the system will kick out the sites that were added previously.
      //       //
      //       Feature.UpdateFeature({
      //         storage: commonscloud.collections.practice.storage,
      //         featureId: practice.id,
      //         data: data
      //       }).then(function() {
      //         //
      //         // Once the new Reading has been associated with the existing Practice we need to
      //         // display the form to the user, allowing them to complete it.
      //         //
      //         $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
      //       });
      //     });
      //   },
      //   addGrassBuffer: function(practice, readingType) {
      //     //
      //     // Creating a practice reading is a two step process.
      //     //
      //     //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
      //     //     for the Practice Reading table
      //     //  2. Update the Practice to create a relationship with the Reading created in step 1
      //     //
      //     Feature.CreateFeature({
      //       storage: $scope.storage.storage,
      //       data: {
      //         measurement_period: (readingType) ? readingType : null,
      //         report_date: moment().format('YYYY-MM-DD'),
      //         owner: $scope.user.id,
      //         status: 'private'
      //       }
      //     }).then(function(reportId) {
      //
      //       var data = {};
      //       data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);
      //
      //       //
      //       // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
      //       // to submit all relationships that are created and should remain. If we only submit the new
      //       // ID the system will kick out the sites that were added previously.
      //       //
      //       Feature.UpdateFeature({
      //         storage: commonscloud.collections.practice.storage,
      //         featureId: practice.id,
      //         data: data
      //       }).then(function() {
      //         //
      //         // Once the new Reading has been associated with the existing Practice we need to
      //         // display the form to the user, allowing them to complete it.
      //         //
      //         $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + reportId + '/edit');
      //       });
      //     });
      //   }
      // };
      //
      // //
      // // Setup basic page variables
      // //
      // $rootScope.page = {
      //   template: '/modules/components/practices/views/practices--view.html',
      //   title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      //   links: [
      //     {
      //       text: 'Projects',
      //       url: '/projects'
      //     },
      //     {
      //       text: $scope.project.project_title,
      //       url: '/projects/' + $scope.project.id,
      //     },
      //     {
      //       text: $scope.site.site_number,
      //       url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
      //     },
      //     {
      //       text: $scope.practice.name,
      //       url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
      //       type: 'active'
      //     }
      //   ],
      //   actions: [
      //     {
      //       type: 'button-link new',
      //       action: function() {
      //         $scope.readings.add($scope.practice);
      //       },
      //       text: 'Add Measurement Data'
      //     }
      //   ],
      //   refresh: function() {
      //     $route.reload();
      //   }
      // };
      //
      //
      // $scope.GetAllReadings = function(existingReadings, readingId) {
      //
      //   var updatedReadings = [{
      //     id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      //   }];
      //
      //   angular.forEach(existingReadings, function(reading, $index) {
      //     updatedReadings.push({
      //       id: reading.id
      //     });
      //   });
      //
      //   return updatedReadings;
      // };
      //
      // $scope.calculate = {};
      //
      // $scope.calculate.GetLoadVariables = function(period, landuse) {
      //
      //   var planned = {
      //     width: 0,
      //     length: 0,
      //     area: 0,
      //     landuse: '',
      //     segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
      //     efficieny: null
      //   };
      //
      //   var deferred = $q.defer();
      //
      //   for (var i = 0; i < $scope.practice.readings.length; i++) {
      //     if ($scope.practice.readings[i].measurement_period === period) {
      //       planned.length = $scope.practice.readings[i].length_of_buffer;
      //       planned.width = $scope.practice.readings[i].average_width_of_buffer;
      //       planned.area = ((planned.length*planned.width)/43560);
      //       planned.landuse = (landuse) ? landuse : $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];
      //
      //       var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
      //         params: {
      //           q: {
      //             filters: [
      //               {
      //                 name: 'landriversegment',
      //                 op: 'eq',
      //                 val: planned.segment
      //               },
      //               {
      //                 name: 'landuse',
      //                 op: 'eq',
      //                 val: planned.landuse
      //               }
      //             ]
      //           }
      //         },
      //         headers: {
      //           'Authorization': 'external'
      //         }
      //       }).success(function(data, status, headers, config) {
      //         planned.efficieny = data.response.features[0];
      //         deferred.resolve(planned);
      //       });
      //     }
      //   }
      //
      //   return deferred.promise;
      // };
      //
      // $scope.calculate.GetPreInstallationLoad = function(period) {
      //
      //   //
      //   // Existing Landuse
      //   //
      //   $scope.calculate.GetLoadVariables(period).then(function(loaddata) {
      //
      //     var uplandPreInstallationLoad = {
      //       nitrogen: ((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
      //       phosphorus: ((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
      //       sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
      //     };
      //
      //     console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);
      //
      //     var existingPreInstallationLoad = {
      //       nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
      //       phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
      //       sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
      //     };
      //
      //     console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);
      //
      //     $scope.calculate.results.totalPreInstallationLoad = {
      //       efficieny: loaddata.efficieny,
      //       uplandLanduse: uplandPreInstallationLoad,
      //       existingLanduse: existingPreInstallationLoad,
      //       nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
      //       phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
      //       sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
      //     };
      //
      //   });
      //
      //
      // };
      //
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
      // };
      //
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
      //
      //
      //
      // //
      // // Scope elements that run the actual equations and send them back to the
      // // user interface for display
      // //
      // // In order to run all of these we need to make sure that our HGMR
      // // information from our selected Site has been added to the HGMR object
      // //
      // Feature.GetFeature({
      //   storage: 'type_f9d8609090494dac811e6a58eb8ef4be',
      //   featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
      // }).then(function(hgmrResponse) {
      //
      //   //
      //   // Assign HGMR Code Lookup information to the existing site
      //   //
      //   $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = hgmrResponse;
      //
      //   //
      //   //
      //   //
      //   $scope.calculate.results = {
      //     percentageLengthOfBuffer: {
      //       percentage: $scope.calculate.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
      //       total: $scope.calculate.GetPercentageOfInstalled('length_of_buffer')
      //     },
      //     percentageTreesPlanted: {
      //
      //       percentage: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
      //       total: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted')
      //     },
      //     totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
      //     totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
      //     totalMilesRestored: $scope.calculate.GetRestorationTotal(5280),
      //     percentageMilesRestored: $scope.calculate.GetRestorationPercentage(5280, false),
      //     totalAcresRestored: $scope.calculate.GetRestorationTotal(43560, true),
      //     percentageAcresRestored: $scope.calculate.GetRestorationPercentage(43560, true)
      //   };
      // });
      //
      // //
      // // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
      // // backend functionality. Even if the user guesses the URL the API will stop them from editing the
      // // actual Feature within the system
      // //
      // if ($scope.user.id === $scope.project.owner) {
      //   $scope.user.owner = true;
      // } else {
      //   Template.GetTemplateUser({
      //     storage: commonscloud.collections.project.storage,
      //     templateId: $scope.template.id,
      //     userId: $scope.user.id
      //   }).then(function(response) {
      //
      //     $scope.user.template = response;
      //
      //     //
      //     // If the user is not a Template Moderator or Admin then we need to do a final check to see
      //     // if there are permissions on the individual Feature
      //     //
      //     if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
      //       Feature.GetFeatureUser({
      //         storage: commonscloud.collections.project.storage,
      //         featureId: $route.current.params.projectId,
      //         userId: $scope.user.id
      //       }).then(function(response) {
      //         $scope.user.feature = response;
      //         if ($scope.user.feature.is_admin || $scope.user.feature.write) {
      //         } else {
      //           $location.path('/projects/' + $route.current.params.projectId);
      //         }
      //       });
      //     }
      //
      //   });
      // }
      //

    });

}());

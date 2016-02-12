'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:UrbanHomeownerReportController
 * @description
 * # UrbanHomeownerReportController
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('UrbanHomeownerReportController', function (Account, Utility, $rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, site, practice, readings, commonscloud, Storage, Landuse, CalculateUrbanHomeowner, Calculate, StateLoad, PracticeUrbanHomeowner) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId,
        practiceType;

    $rootScope.page = {};

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + practiceType + '/views/report--view.html'
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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

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
    // $scope.practice.practice_type = 'urban-homeowner';
    // $scope.practice.readings = readings;
    //
    // $scope.practice_efficiency = null;
    //
    // $scope.storage = Storage[$scope.practice.practice_type];
    //
    // $scope.user = user;
    // $scope.user.owner = false;
    // $scope.user.feature = {};
    // $scope.user.template = {};
    //
    // //
    // // Retrieve State-specific Load Data
    // //
    // StateLoad.query({
    //   q: {
    //     filters: [
    //       {
    //         name: 'state',
    //         op: 'eq',
    //         val: $scope.site.site_state
    //       }
    //     ]
    //   }
    // }, function(response) {
    //   $scope.loaddata = {};
    //
    //   angular.forEach(response.response.features, function(feature, $index) {
    //     $scope.loaddata[feature.developed_type] = {
    //       tn_ual: feature.tn_ual,
    //       tp_ual: feature.tp_ual,
    //       tss_ual: feature.tss_ual
    //     };
    //   });
    // }, function(errorResponse) {
    //   console.log('errorResponse', errorResponse);
    // });
    //
    //
    // $scope.landuse = Landuse;
    //
    // $scope.calculate = CalculateUrbanHomeowner;
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
    // $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {
    //
    //   var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;
    //
    //   var deferred = $q.defer();
    //
    //   var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
    //     params: {
    //       q: {
    //         filters: [
    //           {
    //             name: 'landriversegment',
    //             op: 'eq',
    //             val: segment
    //           },
    //           {
    //             name: 'landuse',
    //             op: 'eq',
    //             val: landuse
    //           }
    //         ]
    //       }
    //     },
    //     headers: {
    //       'Authorization': 'external'
    //     }
    //   }).success(function(data, status, headers, config) {
    //
    //     var efficieny = data.response.features[0],
    //         total_area = 0;
    //
    //     for (var i = 0; i < $scope.practice.readings.length; i++) {
    //       if ($scope.practice.readings[i].measurement_period === period) {
    //
    //         var that = {
    //           length: $scope.practice.readings[i].length_of_fencing,
    //           width: $scope.practice.readings[i].average_buffer_width
    //         };
    //
    //         total_area += (that.length*that.width);
    //       }
    //     }
    //
    //     deferred.resolve({
    //       efficieny: efficieny,
    //       area: (total_area/43560)
    //     });
    //   });
    //
    //   return deferred.promise;
    // };
    //
    // $scope.calculate.GetPreInstallationLoad = function(period) {
    //
    //   $scope.calculate.GetLoadVariables(period).then(function(loaddata) {
    //
    //     console.log('GetPreInstallationLoad', loaddata);
    //
    //     var results = {
    //       nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
    //       phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
    //       sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
    //     };
    //
    //     console.log('results', results);
    //
    //     $scope.calculate.results.totalPreInstallationLoad = results;
    //   });
    //
    // };
    //
    // $scope.calculate.GetPlannedLoad = function(period) {
    //
    //   $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {
    //
    //     console.log('GetPlannedLoad', loaddata);
    //
    //     var results = {
    //       nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
    //       phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
    //       sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
    //     };
    //
    //     console.log('results', results);
    //
    //     $scope.calculate.results.totalPlannedLoad = results;
    //   });
    //
    // };
    //
    //
    // $scope.calculate.GetInstalledLoad = function(period) {
    //
    //   $scope.calculate.GetInstalledLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {
    //
    //     console.log('GetInstalledLoad', loaddata);
    //
    //     $scope.practice_efficiency = loaddata.efficieny;
    //
    //     var results = {
    //       nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
    //       phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
    //       sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
    //     };
    //
    //     console.log('results', results);
    //
    //     $scope.calculate.results.totalInstalledLoad = results;
    //   });
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
    // $scope.calculate.GetSingleInstalledLoad = function(length, width, element) {
    //
    //     var efficieny = $scope.practice_efficiency,
    //         area = ((length*width)/43560),
    //         value = null;
    //
    //     console.log('efficieny', efficieny);
    //
    //     if (element === 'nitrogen') {
    //       value = (area*(efficieny.eos_totn/efficieny.eos_acres));
    //     } else if (element === 'phosphorus') {
    //       value = (area*(efficieny.eos_totp/efficieny.eos_acres));
    //     } else if (element === 'sediment') {
    //       value = ((area*(efficieny.eos_tss/efficieny.eos_acres))/2000);
    //     }
    //
    //     return value;
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
    //         total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].av);
    //       } else {
    //         total_area += $scope.practice.readings[i].length_of_buffer;
    //       }
    //     }
    //   }
    //
    //   console.log('GetRestorationTotal', total_area, unit, (total_area/unit));
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
    //   console.log(total_area, planned_area, (total_area/planned_area));
    //
    //   return ((total_area/planned_area)*100);
    // };
    //
    // //
    // // Scope elements that run the actual equations and send them back to the user interface for display
    // //
    // // $scope.calculate.results = {
    // //   totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
    // //   totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
    // //   totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation')
    // // };
    //
    //
    // //
    // //
    // //
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
    $scope.readings = {
      bufferWidth: function() {
        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === 'Planning') {
            return $scope.practice.readings[i].average_width_of_buffer;
          }
        }
      },
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            average_width_of_buffer: $scope.readings.bufferWidth(),
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      },
      addReading: function(measurementPeriod) {

        var newReading = new PracticeUrbanHomeowner({
            measurement_period: measurementPeriod,
            report_date: moment().format('YYYY-MM-DD')
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/readings/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      }
    };

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

  });

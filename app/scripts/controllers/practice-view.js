'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticeViewCtrl
 * @description
 * # PracticeViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticeViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$http', '$q', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'variables', 'Storage', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, Template, Feature, template, fields, project, site, practice, readings, variables, Storage) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.site = site;

    $scope.template = template;
    $scope.fields = fields;
    
    $scope.practice = practice;
    $scope.practice_type = Feature.MachineReadable($scope.practice.practice_type);
    $scope.practice.readings = readings;

    $scope.reading_storage = Storage[$scope.practice.practice_type];

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Load Land river segment details
    //
    Feature.GetFeature({
      storage: variables.land_river_segment.storage,
      featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    }).then(function(response) {
      $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    });

    $scope.landuse = {
      'high-till with manure': 'hwm',
      'high-till with manure nutrient management': 'nhi',
      'high-till without manure': 'hom',
      'high-till without manure nutrient management': 'nho',
      'low-till with manure': 'lwm',
      'low-till with manure nutrient management': 'nlo',
      'hay with nutrients': 'hyw',
      'hay with nutrients nutrient management': 'nhy',
      'alfalfa': 'alf',
      'alfalfa nutrient management': 'nal',
      'hay without nutrients': 'hyo',
      'pasture': 'pas',
      'pasture nutrient management': 'npa',
      'pasture corridor': 'trp',
      'animal feeding operations': 'afo',
      'nursery': 'urs',
      'concentrated animal feeding operations': 'cfo',
      'regulated construction': 'rcn',
      'css construction': 'ccn',
      'regulated extractive': 'rex',
      'css extractive': 'cex',
      'nonregulated extractive': 'nex',
      'forest': 'for',
      'harvested forest': 'hvf',
      'regulated impervious developed': 'rid',
      'nonregulated impervious developed': 'nid',
      'css impervious developed': 'cid',
      'atmospheric deposition to non-tidal water': 'atdep',
      'regulated pervious developed': 'rpd',
      'nonregulated pervious developed': 'npd',
      'css pervious developed': 'cpd',
      'municipal-waste water treatment plants':'wwtp',
      'septic': 'septic',
      'combined sewer overflows': 'cso',
      'industrial-waste water treatment plants': 'indus'
    };

    $scope.readings = {
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.reading_storage.storage,
          data: {
            measurement_period: null,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.reading_storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: variables.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + reportId + '/edit');
          });
        });
      }
    };


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/practice-view.html',
      title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.practice_type,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice_type,
          type: 'active'
        }    
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice);
          },
          text: 'Add Measurement Data'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllReadings = function(existingReadings, readingId) {

      var updatedReadings = [{
        id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      }];

      angular.forEach(existingReadings, function(reading, $index) {
        updatedReadings.push({
          id: reading.id
        });
      });

      return updatedReadings;
    };

    $scope.calculate = {};

    // $scope.calculate.GetLoadData('A42061SJ3_2230_2060', 'alf');

    $scope.calculate.GetLoadVariables = function(period, landuse) {

      var planned = {
        width: 0,
        length: 0,
        area: 0,
        landuse: '',
        segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
        efficieny: null
      };

      var deferred = $q.defer();

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          planned.length = $scope.practice.readings[i].length_of_buffer;
          planned.width = $scope.practice.readings[i].average_width_of_buffer;
          planned.area = (planned.length*planned.width);
          planned.landuse = (landuse) ? landuse : $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];

          var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
            params: {
              q: {
                filters: [
                  {
                    name: 'landriversegment',
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
            }
          }).success(function(data, status, headers, config) {
            planned.efficieny = data.response.features[0];
            deferred.resolve(planned);
          });
        }
      }

      return deferred.promise;
    };

    $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {

      var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;

      var deferred = $q.defer();

      var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
        params: {
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        }
      }).success(function(data, status, headers, config) {
        
        var efficieny = data.response.features[0],
            total_area = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {

            var that = {
              length: $scope.practice.readings[i].length_of_buffer,
              width: $scope.practice.readings[i].average_width_of_buffer
            };

            total_area += (that.length*that.width);
          }
        }

        deferred.resolve({
          efficieny: efficieny,
          area: total_area
        });
      });

      return deferred.promise;
    };

    $scope.calculate.GetPreInstallationLoad = function(period) {

      $scope.calculate.GetLoadVariables(period).then(function(loaddata) {

        console.log('GetPreInstallationLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPreInstallationLoad = results;
      });

    };

    $scope.calculate.GetPlannedLoad = function(period) {

      $scope.calculate.GetLoadVariables(period, 'for').then(function(loaddata) {

        console.log('GetPlannedLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPlannedLoad = results;
      });

    };


    $scope.calculate.GetInstalledLoad = function(period) {

      $scope.calculate.GetInstalledLoadVariables(period, 'for').then(function(loaddata) {

        console.log('GetInstalledLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalInstalledLoad = results;
      });

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
    $scope.calculate.GetPercentageOfInstalled = function(field) {

      var planned_total = 0,
          installed_total = 0,
          percentage = 0;

      // Get readings organized by their Type
      angular.forEach($scope.practice.readings, function(reading, $index) {

        if (reading.measurement_period === 'Planning') {
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          installed_total += reading[field];
        }

      });

      // Divide the Installed Total by the Planned Total to get a percentage of installed
      if (planned_total >= 1) {
        percentage = (installed_total/planned_total);
        return (percentage*100);
      }

      return null;
    };


    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    $scope.calculate.results = {
      percentageLengthOfBuffer: $scope.calculate.GetPercentageOfInstalled('length_of_buffer'),
      percentageTreesPlanted: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted'),
      totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
      totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
      totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation')
    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: variables.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: variables.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }


  }]);

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('practiceMonitoringAssessmentApp')
    .controller('EnhancedStreamRestorationReportController', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, user, Template, Feature, Field, template, project, site, practice, readings, commonscloud, Storage, Landuse, EnhancedStreamRestorationCalculate, Calculate, StateLoad) {

      //
      // Assign project to a scoped variable
      //
      $scope.project = project;
      $scope.site = site;

      $scope.template = template;

      $scope.practice = practice;
      $scope.practice.practice_type = 'enhanced-stream-restoration';
      $scope.practice.readings = readings;

      $scope.practice_efficiency = null;

      $scope.storage = Storage[$scope.practice.practice_type];

      $scope.user = user;
      $scope.user.owner = false;
      $scope.user.feature = {};
      $scope.user.template = {};

      $scope.landuse = Landuse;
      $scope.calculate = EnhancedStreamRestorationCalculate;

      Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
        $scope.fields = response;
      });

      //
      // Retrieve State-specific Load Data
      //
      StateLoad.query({
        q: {
          filters: [
            {
              name: 'state',
              op: 'eq',
              val: $scope.site.site_state
            }
          ]
        }
      }, function(response) {
        $scope.loaddata = {};

        angular.forEach(response.response.features, function(feature, $index) {
          $scope.loaddata[feature.developed_type] = {
            tn_ual: feature.tn_ual,
            tp_ual: feature.tp_ual,
            tss_ual: feature.tss_ual
          };
        });

      });


      //
      //
      //
      $scope.GetTotal = function(period) {

        var total = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {
            total++;
          }
        }

        return total;
      };

      $scope.total = {
        planning: $scope.GetTotal('Planning'),
        installation: $scope.GetTotal('Installation'),
        monitoring: $scope.GetTotal('Monitoring')
      };

      //
      // Load Land river segment details
      //
      Feature.GetFeature({
        storage: commonscloud.collections.land_river_segment.storage,
        featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
      }).then(function(response) {
        $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
      });

      $scope.readings = {
        bufferWidth: function() {
          for (var i = 0; i < $scope.practice.readings.length; i++) {
            if ($scope.practice.readings[i].measurement_period === 'Planning') {
              return $scope.practice.readings[i].average_width_of_buffer;
            }
          }
        },
        add: function(practice, readingType) {

          var reportDate = new Date();

          //
          // Creating a practice reading is a two step process.
          //
          //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
          //     for the Practice Reading table
          //  2. Update the Practice to create a relationship with the Reading created in step 1
          //
          console.log('reportDate', reportDate, angular.isDate(reportDate), typeof reportDate);

          Feature.CreateFeature({
            storage: $scope.storage.storage,
            data: {
              measurement_period: (readingType) ? readingType : null,
              report_date: reportDate,
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
        addReading: function(practice, readingType) {
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
              report_date: new Date(),
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
        }
      };

      //
      // Setup basic page variables
      //
      $rootScope.page = {
        template: '/modules/components/practices/views/practices--view.html',
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
            text: $scope.practice.name,
            url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
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


      //
      // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
      // backend functionality. Even if the user guesses the URL the API will stop them from editing the
      // actual Feature within the system
      //
      if ($scope.user.id === $scope.project.owner) {
        $scope.user.owner = true;
      } else {
        Template.GetTemplateUser({
          storage: commonscloud.collections.project.storage,
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
              storage: commonscloud.collections.project.storage,
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
    });

}());

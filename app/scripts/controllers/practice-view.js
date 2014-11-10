'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticeViewCtrl
 * @description
 * # PracticeViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticeViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'variables', 'Storage', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Template, Feature, template, fields, project, site, practice, readings, variables, Storage) {

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
            measurement_period: readingType,
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
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + reportId + '/' + readingType + '/edit');
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
            $scope.readings.add($scope.practice, 'Installation');
          },
          text: 'Add Installation Data'
        },
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice, 'Monitoring');
          },
          text: 'Add Monitoring Data'
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
          console.log('Planning', reading[field]);
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          console.log('Installation', reading[field]);
          installed_total += reading[field];
        }

      });

      // Divide the Installed Total by the Planned Total to get a percentage of installed
      if (planned_total >= 1) {
        percentage = (installed_total/planned_total);
        console.log(installed_total, '/', planned_total, '=', percentage);
        return (percentage*100);
      }

      return null;
    };

    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    $scope.calculate.results = {
      percentageLengthOfBuffer: $scope.calculate.GetPercentageOfInstalled('length_of_buffer'),
      percentageTreesPlanted: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted')
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

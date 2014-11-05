'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticeViewCtrl
 * @description
 * # PracticeViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticeViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'variables', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Feature, template, fields, project, site, practice, variables) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.readings = {};

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.readings = {
      type: {
        'Forest Buffer': {
          Planning: 'type_437194b965ea4c94b99aebe22399621f',
          Installation: 'type_437194b965ea4c94b99aebe22399621f',
          Monitoring: 'type_ed657deb908b483a9e96d3a05e420c50'
        }
      },
      load: function(options) {
        Feature.GetRelatedFeatures({
          storage: options.storage,
          relationship: options.relationship,
          featureId: options.featureId
        }).then(function(response) {
          // $scope.practice.readings[options.readingType] = response;
          console.log('response', response, $scope.practice);
          $scope.practice.readings[options.readingType] = response;
        });
      },
      process: function() {
        if ($scope.practice.practice_type && $scope.readings.type.hasOwnProperty($scope.practice.practice_type) && practice.practice_type !== null && practice.practice_type !== '') {
          //
          // Get installation readings
          //
          $scope.readings.load({
            storage: variables.practice.storage,
            relationship: $scope.readings.type[$scope.practice.practice_type].Installation,
            featureId: $scope.practice.id,
            readingType: 'Installation'
          });

          //
          // Get monitoring readings
          //
          $scope.readings.load({
            storage: variables.practice.storage,
            relationship: $scope.readings.type[$scope.practice.practice_type].Monitoring,
            featureId: $scope.practice.id,
            readingType: 'Monitoring'
          });
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
          storage: $scope.readings.type[practice.practice_type][readingType],
          data: {
            measurement_period: readingType,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          console.log('reportId', reportId);

          var data = {};
          data[$scope.readings.type[practice.practice_type][readingType]] = $scope.GetAllReadings(practice.readings[readingType], reportId);

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
      title: $scope.site.site_number,
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
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id,
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

    //
    // Once the page has loaded we need to load in all Reading Features that are associated with
    // the Practices related to the Site being viewed
    //
    $scope.readings.process();

  }]);

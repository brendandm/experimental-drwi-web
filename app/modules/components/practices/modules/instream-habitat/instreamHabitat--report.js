'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldStack')
  .controller('InstreamHabitatReportController', function(commonscloud, Feature, fields, InstreamHabitatCalculate, Landuse, $location, practice, project, readings, $rootScope, $route, $scope, site, Storage, template, Template, user) {

    /**
     * Define how we should handle individual Practice/Monitoring Readings
     * for the In-stream Habitat Practice
     *
     * @param add (function) Add an entirely new Reading to this practice instance
     */
     $scope.readings = {
       count: function(measurementPeriodName) {

         var total = 0;

         for (var i = 0; i < $scope.practice.readings.length; i++) {
           if ($scope.practice.readings[i].measurement_period === measurementPeriodName) {
             total++;
           }
         }

         return total;
       },
       all: function(existingReadings, readingId) {

         // Start by adding the newest relationships, then we'll add the existing sites
         var updatedReadings = [{
           id: readingId
         }];

         // Add all existing readings back to our newly updated array
         angular.forEach(existingReadings, function(reading, $index) {
           updatedReadings.push({
             id: reading.id
           });
         });

         // Return our revised and combined readings array
         return updatedReadings;
       },
       add: function(practice, readingType) {

         var reportDate = new Date();

         /**
          * Creating a practice reading is a two step process.
          *
          *  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
          *     for the Practice Reading table
          *  2. Update the Practice to create a relationship with the Reading created in step 1
          *
          * @todo When we implement the Enterprise we'll be remove the `status`
          *       defintion here. Allowing folks to set this or intercept this
          *       defeats the purpose of really having it to secure the system.
          *
          */
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

           //
           // We need to make sure that we add the new reading to the existing
           // list of readings on this Pracitce Instance. if we don't submit
           // all old `id`s with the new `id` bad things happen. Our `POST`
           // needs the entire list of reading `id` in order to retain the
           // relationship between `Practice` instance <> `Reading` list
           //
           data[$scope.storage.storage] = $scope.readings.all(practice.readings, reportId);

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

      /**
       * Ensures that all 'resolve' $promises are loaded into the page as
       * variables on the $scope. If they are not, you won't be able to access
       * them in the page templates
       *
       * @see $routeProvier.when.resolve
       *    https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when
       *
       */
      $scope.project = project;
      $scope.site = site;

      $scope.template = template;
      $scope.fields = fields;

      $scope.practice = practice;
      $scope.practice.practice_type = 'instream-habitat';
      $scope.practice.readings = readings;
      $scope.practice_efficiency = null;

      $scope.storage = Storage[$scope.practice.practice_type];

      $scope.user = user;
      $scope.user.owner = false;
      $scope.user.feature = {};
      $scope.user.template = {};

      $scope.landuse = Landuse;

      $scope.total = {
        planning: $scope.readings.count('Planning'),
        installation: $scope.readings.count('Installation'),
        monitoring: $scope.readings.count('Monitoring')
      };

      $scope.calculate = InstreamHabitatCalculate;

      /**
       * Defined the Page variables to load and display the page properly
       *
       * @param template (string) The name of the page template to load for this report
       * @param title (string) The title of the page
       * @param links (array) Defines the list of breadcrumbs across the top of the page
       * @param actions (array) Defines the 'action' buttons that appear in the top level beside the breadcrumbs (e.g., Add a Practice)
       * @param refresh (function) A generic page reload function
       */
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


      /**
       * Setup the User's page access and ensure that we are allowing them
       * to access page elements appropriate for their user role.
       *
       * [IF] the user account is already loaded and they are the owner, allow
       * them to go on their way without any further processing.
       *
       * [ELSE] If the user does not own this resource, we need to figure out if
       *        they are allowed to access this.
       *
       * @todo When we upgrade to the Enterprise level API we'll be able to get
       *       rid of large portions of this conditional statement. For now we
       *       need to do things this way because of how the CommonsCloud
       *       Community API is built.
       */
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

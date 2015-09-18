'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('BankStabilizationFormController', function(commonscloud, Feature, Field, fields, $location, practice, project, $rootScope, $route, $scope, site, Storage, template, Template, user) {

    /**
     * Ensures that all 'resolve' $promises are loaded into the page as
     * variables on the $scope. If they are not, you won't be able to access
     * them in the page templates
     *
     * @see $routeProvier.when.resolve
     *    https://docs.angularjs.org/api/ngRoute/provider/$routeProvider#when
     *
     */
     $scope.report = {};
     $scope.template = template;

     $scope.project = project;
     $scope.practice = practice;
     $scope.practice.practice_type = 'bank-stabilization';

     $scope.storage = Storage[$scope.practice.practice_type];

     $scope.site = site;
     $scope.user = user;
     $scope.user.owner = false;
     $scope.user.feature = {};
     $scope.user.template = {};

     $scope.options = {
       lerEvaluationTypes: [
         'BEHI/NBS',
         'Bank Erosion Pins',
         'Evaluation of Recession Severity Category',
         'Other'
       ]
     };


     /**
      *
      */
     Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
       $scope.fields = response;
     });

     Feature.GetFeature({
       storage: $scope.storage.storage,
       featureId: $route.current.params.reportId
     }).then(function(reportResponse) {

       //
       // Load the reading into the scope
       //
       $scope.report = reportResponse;

       $scope.report.template = $scope.storage.templates.form;
     });

     /**
      * Defined the Page variables to load and display the page properly
      *
      * @param template (string) The name of the page template to load for this reading
      * @param title (string) The title of the page
      * @param links (array) Defines the list of breadcrumbs across the top of the page
      * @param actions (array) Defines the 'action' buttons that appear in the top level beside the breadcrumbs (e.g., Add a Practice)
      * @param refresh (function) A generic page reload function
      */
     $rootScope.page = {
       template: '/modules/components/practices/views/practices--form.html',
       title: null,
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
           url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type
         }
       ],
       actions: [
         {
           type: 'button-link',
           action: function($index) {
             $scope.reading.delete();
           },
           visible: false,
           loading: false,
           text: 'Delete Reading'
         },
         {
           type: 'button-link new',
           action: function($index) {
             $scope.reading.save();
             $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
           },
           visible: false,
           loading: false,
           text: 'Save Changes'
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

     /**
      * Define how we should handle individual Practice/Monitoring Readings
      * for the In-stream Habitat Form
      *
      * @param add (function) Add an entirely new Reading to this practice instance
      */
      $scope.reading = {
        save: function() {
          Feature.UpdateFeature({
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            data: $scope.report
          }).then(function(response) {
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
          }).then(function(error) {
            // Do something with the error
          });
        },
        delete: function() {
          //
          // Before we can remove the Practice we need to remove the relationship it has with the Site
          //
          //
          angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
            if (feature.id === $scope.report.id) {
              $scope.practice[$scope.storage.storage].splice($index, 1);
            }
          });

          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: $scope.practice.id,
            data: $scope.practice
          }).then(function(response) {

            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);

            /**
             * @todo We should be actually deleting the feature as displayed in
             *       the code below:
             *
             *         Feature.DeleteFeature({
             *           storage: $scope.storage.storage,
             *           featureId: $scope.report.id
             *         });
             *
             *       However, because of a weird permissions issue that breaks
             *       the endpoint in the existing version of CommonsAPI we
             *       cannot delete this because of the following error:
             *
             * IntegrityError: (IntegrityError) update or delete on table
             * "type_6800a0c907494118b9a8872a70ee26da" violates foreign key
             * constraint "type_6800a0c907494118b9a8872a70ee26da_users_feature_id_fkey"
             * on table "type_6800a0c907494118b9a8872a70ee26da_users"
             *
             *       This issue will be resolved through new permission usage
             *       on the NFWF Enterprise API, but will exist while we use the
             *       existing CommonsCloud API data models.
             *
             *       Our existing and bad fix is to simply "disassociated" the
             *       the Reading Feature from the Practice Feature without
             *       deleting the Feature from the system.
             */

          });
        }
      };

  });

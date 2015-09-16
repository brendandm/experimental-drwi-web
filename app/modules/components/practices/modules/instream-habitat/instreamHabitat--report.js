'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('InstreamHabitatReportController', function(commonscloud, Feature, fields, Landuse, $location, practice, project, readings, $rootScope, $route, $scope, site, Storage, template, Template, user) {
    return {

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
       };

    };
  });

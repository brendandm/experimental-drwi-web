'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjecteditCtrl
 * @description
 * # ProjecteditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectEditCtrl', ['$scope', '$route', 'project', 'Feature', 'Field', 'template', 'fields', 'storage', function ($scope, $route, project, Feature, Field, template, fields, storage) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.template = template;
    $scope.fields = fields;

    console.log('$scope.fields', $scope.fields);

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/project-edit.html',
      title: $scope.project.project_title,
      display_title: false,
      editable: true,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
          type: 'active'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.project.save = function() {
      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {

        //
        // Now that we've successfully saved the Project we need to reinject those changes back into the
        // page so that things like the breadcrumbs update
        //
        // $scope.project = response.response;

        //
        // Refresh the page so that those things update appropriately.
        //
        $scope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };

  }]);

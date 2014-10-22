'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', '$routeParams', 'Feature', 'projects', function ($rootScope, $scope, $route, $routeParams, Feature, projects) {

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/projects.html',
      title: 'Projects',
      back: '/',
      links: [
        // {
        //   type: 'edit',
        //   url: '/applications/' + $scope.application.id + '/edit/',
        //   text: 'Edit this application',
        //   static: "static"
        // },
        {
          type: 'button-link new',
          url: '/projects/new/',
          text: 'Create project',
          static: "static"
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.projects = projects;


    //
    // Setup project filter functionality
    //
    $scope.project_filter = {
      storage: 'type_061edec30db54fa0b96703b40af8d8ca',
      field: 'project_title',
      value: ''
    };


    //
    // Search across all projects for matching criteria
    //
    $scope.$watch('project_filter.value', function(user_input, existing) {
      console.log('user_input', user_input);
      console.log('$routeParams.page', $routeParams.page);

      $scope.project = Feature.query({
        storage: $scope.project_filter.storage,
        // page: $routeParams.page,
        q: {
          'filters': [
            {
              'name': $scope.project_filter.field,
              'op': 'ilike',
              'val': '%' + $scope.project_filter.value + '%'
            }
          ]
        },
        updated: new Date().getTime()
      }).$promise.then(function(response) {
        $scope.projects = response;
      });

      console.log('$scope.project', $scope.project);
    });


  }]);

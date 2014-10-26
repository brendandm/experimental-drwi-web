'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', '$routeParams', '$location', 'Feature', 'Search', 'projects', 'template', 'fields', function ($rootScope, $scope, $route, $routeParams, $location, Feature, Search, projects, template, fields) {


    //
    // Setup basic page variables
    //
    $scope.page = {
      template: 'views/projects.html',
      title: 'Projects',
      display_title: true,
      back: '/',
      links: [
        {
          type: 'button-link new',
          url: '/projects/new/',
          text: 'Create project'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    //
    // These are the Projects that populate the list shown to the user, we update this later
    // on based upon filters that the user applies
    //
    $scope.projects = projects;


    //
    // We need the Template and it's associated Field list so that we can automatically populate
    // the Filter options for the user and display the Fields/Options specific to this Template,
    // in the case of this specific application and route we are only dealing with a single Template
    // for the Projects Feature Collection
    //
    $scope.template = template;
    $scope.defaults = $location.search();


    //
    // Setup project filter functionality
    //
    var filters_ = Search.buildFilters(fields, $scope.defaults);

    $scope.filters = {
      page: null,
      results_per_page: null,
      callback: null,
      selected: filters_,
      available: filters_
    };

    $scope.filters.select = function ($index) {
      $scope.filters.available[$index].active = true;
      console.log('$scope.filters.select', $scope.filters.available[$index]);
    };

    $scope.filters.remove = function ($index) {
      $scope.filters.available[$index].active = false;
    };

    $scope.$watch('filters', function(newValue, oldValue) {
      // Execute a search when the filters change
      $scope.search.projects();

      console.log('filters', $scope.filters);
    });


    //
    // Filter existing Projects to a specified list based on the user's input
    //
    $scope.search = {};

    $scope.search.projects = function() {

      var Q = Search.getFilters($scope.filters);

      Feature.query({
        storage: $scope.template.storage,
        q: {
          filters: Q
        },
        page: ($scope.filters.page) ? $scope.filters.page: null,
        results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
        callback: ($scope.filters.callback) ? $scope.filters.callback: null,
        updated: new Date().getTime()
      }).$promise.then(function(response) {

        //
        // Update the list of projects being displayed to the user
        //
        $scope.projects = response;

        $location.search({
          q: angular.toJson({
            filters: Q
          }),
          page: ($scope.filters.page) ? $scope.filters.page: null,
          results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
          callback: ($scope.filters.callback) ? $scope.filters.callback: null 
        });

        //
        // Make sure our user's search criteria gets passed back to the address bar
        // so that we can keep track of it for saved searches and between pages
        //


      });
    };


  }]);

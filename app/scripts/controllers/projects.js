'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', '$routeParams', '$location', '$timeout', 'Feature', 'template', 'fields', 'storage', 'user', function ($rootScope, $scope, $route, $routeParams, $location, $timeout, Feature, template, fields, storage, user) {

    var timeout;

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/projects.html',
      title: 'Projects',
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.project.create();
          },
          text: 'Create project'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.user = user;


    //
    // We need the Template and it's associated Field list so that we can automatically populate
    // the Filter options for the user and display the Fields/Options specific to this Template,
    // in the case of this specific application and route we are only dealing with a single Template
    // for the Projects Feature Collection
    //
    $scope.template = template;
    $scope.defaults = $location.search();


    //
    // When the page initially loads, we should check to see if existing filters are present in the
    // browser's address bar. We should pass those filters along to the Feature Search. The Projects
    // that populate the list shown to the user, we update this later on based upon filters that the
    // user applies
    //
    Feature.GetFeatures({
      storage: storage,
      page: $route.current.params.page,
      q: $route.current.params.q,
      location: $scope.defaults,
      fields: fields
    }).then(function(response) {
      $scope.projects = response;
      $scope.projects.response.features = $scope.processProjects(response);
    });

    //
    // IMPORTANT!!! DO NOT REMOVE!!!
    //
    // We have to filter these on the public side instead of the server side
    //
    $scope.processProjects = function(projects) {

      var features = [];

      angular.forEach(projects.response.features, function(project, $index) {
        console.log(project.status);
        if (project.status !== 'public') {
          features.push(project);
        }
      });

      return features;
    };

    //
    // Setup project filter functionality
    //
    var filters_ = Feature.buildFilters(fields, $scope.defaults);

    $scope.filters = {
      page: ($scope.defaults.page) ? $scope.defaults.page : null,
      results_per_page: ($scope.defaults.results_per_page) ? $scope.defaults.results_per_page : null,
      callback: ($scope.defaults.callback) ? $scope.defaults.callback : null,
      selected: filters_,
      available: filters_
    };

    $scope.filters.select = function ($index) {
      $scope.filters.available[$index].active = true;
    };

    $scope.filters.remove = function ($index) {
      $scope.filters.available[$index].active = false;

      //
      // Each Filter can have multiple criteria such as single ilike, or
      // a combination of gte and lte. We need to null the values of all 
      // filters in order for the URL to change appropriately
      //
      angular.forEach($scope.filters.available[$index].filter, function(criteria, $_index) {
        $scope.filters.available[$index].filter[$_index].value = null;
      }); 

      $scope.search.execute();
    };


    //
    // Filter existing Projects to a specified list based on the user's input
    //
    $scope.search = {};

    $scope.search.projects = function() {

      $timeout.cancel(timeout);

      timeout = $timeout(function () {
        $scope.search.execute();
      }, 1000);
      
    };

    $scope.search.execute = function(page_number) {

      var Q = Feature.getFilters($scope.filters);

      console.log('Q', Q);

      $scope.filters.page = page_number;

      Feature.query({
        storage: $scope.template.storage,
        q: {
          filters: Q,
          order_by: [
            {
              field: 'created',
              direction: 'desc'
            }
          ]
        },
        page: ($scope.filters.page) ? $scope.filters.page: null,
        results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
        callback: ($scope.filters.callback) ? $scope.filters.callback: null,
        updated: new Date().getTime()
      }).$promise.then(function(response) {

        //
        // Update the list of projects being displayed to the user
        //
        $scope.projects = $scope.processProjects(response);

        //
        // Check to see if there are Filters remaining and if not, we should just remove the Q
        //
        var Q_ = null;

        if (Q.length) {
          Q_ = angular.toJson({
            filters: Q
          });
        }

        $location.search({
          q: Q_,
          page: ($scope.filters.page) ? $scope.filters.page: null,
          results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
          callback: ($scope.filters.callback) ? $scope.filters.callback: null 
        });
      });
    };

    $scope.search.paginate = function(page_number) {

      //
      // First, we need to make sure we preserve any filters that the user has defined
      //
      $scope.search.execute(page_number);

      //
      // Next we go to the selected page `page_number`
      //

      console.log('Go to page', page_number);
    };


    //
    // Project functionality
    //
    $scope.project = {};
    
    $scope.project.create = function() {
      
      Feature.CreateFeature({
        storage: storage,
        data: {
          project_title: 'Untitled Project',
          owner: $scope.user.id,
          status: 'private'
        }
      }).then(function(project) {

        console.log('New Project', project);

        //
        // Forward the user along to the new project
        //
        $location.path('/projects/' + project + '/edit');
      });
    };

  }]);

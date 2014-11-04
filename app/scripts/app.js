'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular
  .module('practiceMonitoringAssessmentApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ipCookie',
    'ui.gravatar',
    'leaflet-directive',
    'angularFileUpload',
    'geolocation',
    'angular-loading-bar',
    'monospaced.elastic',
    'angular-medium-editor',
    'angularMoment',
  ])
  .config(['$routeProvider', '$locationProvider', '$httpProvider', function($routeProvider, $locationProvider, $httpProvider) {


    //
    // Base template URL for piecing together all partial views
    //
    var templateUrl = '/views/main.html',
        project = {
          templateId: 121,
          storage: 'type_061edec30db54fa0b96703b40af8d8ca'
        },
        site = {
          templateId: 122,
          storage: 'type_646f23aa91a64f7c89a008322f4f1093'
        },
        practice = {
          templateId: 123,
          storage: 'type_77f5c44516674e8da2532939619759dd'
        },
        land_river_segment = {
          templateId: 272,
          storage: 'type_f9d8609090494dac811e6a58eb8ef4be'
        };

    $routeProvider
      .when('/', {
        templateUrl: '/views/main.html',
        controller: 'IndexCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/authorize', {
        templateUrl: '/views/authorize.html',
        controller: 'AuthorizeCtrl'
      })
      .when('/logout', {
        templateUrl: '/views/logout.html',
        controller: 'LogoutCtrl'
      })
      .when('/users', {
        templateUrl: templateUrl,
        controller: 'UsersCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/projects', {
        templateUrl: templateUrl,
        controller: 'ProjectsCtrl',
        reloadOnSearch: false,
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(project.templateId);
          },
          storage: function() {
            return project.storage;
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: templateUrl,
        controller: 'ProjectViewCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(project.templateId, 'object');
          },
          site: function() {
            return site;
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          sites: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: project.storage,
              relationship: site.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return project.storage;
          }
        }
      })
      .when('/projects/:projectId/edit', {
        templateUrl: templateUrl,
        controller: 'ProjectEditCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return project.storage;
          }
        }
      })
      .when('/projects/:projectId/users', {
        templateUrl: templateUrl,
        controller: 'ProjectUsersCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: project.templateId
            });
          },
          users: function(User) {
            return User.GetUsers();
          },
          projectUsers: function(Feature, $route) {
            return Feature.GetFeatureUsers({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return project.storage;
          }
        }
      })
      .when('/projects/:projectId/sites', {
        redirectTo: '/projects/:projectId',
      })
      .when('/projects/:projectId/sites/:siteId', {
        templateUrl: templateUrl,
        controller: 'SiteViewCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(practice.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practices: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: site.storage,
              relationship: practice.storage,
              featureId: $route.current.params.siteId
            });
          },
          variables: function() {
            return {
              project: project,
              site: site,
              practice: practice,
              land_river_segment: land_river_segment
            };
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/edit', {
        templateUrl: templateUrl,
        controller: 'SiteEditCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: site.storage,
              featureId: $route.current.params.siteId
            });
          },
          storage: function() {
            return project.storage;
          },
          variables: function() {
            return site;
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/readings/:readingId', {
        templateUrl: templateUrl,
        controller: 'ReportEditCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(project.templateId);
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practices: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: site.storage,
              relationship: practice.storage,
              featureId: $route.current.params.siteId
            });
          },
          variables: function() {
            return {
              project: project,
              site: site,
              practice: practice,
              land_river_segment: land_river_segment
            };
          }
        }
      })
      .when('/reports', {
        templateUrl: templateUrl,
        controller: 'SummaryCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .otherwise({
        templateUrl: '/views/errors/404.html'
      });

    //
    //
    //
    $locationProvider.html5Mode(true);


  }]);

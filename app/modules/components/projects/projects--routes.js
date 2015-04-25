'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectsCtrl',
        reloadOnSearch: false,
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId);
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectViewCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          site: function() {
            return commonscloud.collections.site;
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          sites: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.project.storage,
              relationship: commonscloud.collections.site.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectEditCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId/users', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectUsersCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.project.templateId
            });
          },
          users: function(User) {
            return User.GetUsers();
          },
          projectUsers: function(Feature, $route) {
            return Feature.GetFeatureUsers({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      });

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name FieldStack
 * @description
 * # FieldStack
 *
 * Main module of the application.
 */
angular.module('FieldStack')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites', {
        redirectTo: '/projects/:projectId'
      })
      .when('/projects/:projectId/sites/:siteId', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SiteViewCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practices: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.site.storage,
              relationship: commonscloud.collections.practice.storage,
              featureId: $route.current.params.siteId
            });
          },
          variables: function() {
            return {
              project: commonscloud.collections.project,
              site: commonscloud.collections.site,
              practice: commonscloud.collections.practice,
              land_river_segment: commonscloud.collections.land_river_segment
            };
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SiteEditCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          },
          variables: function() {
            return commonscloud.collections.site;
          }
        }
      });

  }]);



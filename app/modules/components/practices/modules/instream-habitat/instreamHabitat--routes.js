'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat', {
        templateUrl: '/modules/shared/default.html',
        controller: 'InstreamHabitatReportController',
        resolve: {
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          readings: function(Storage, Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.practice.storage,
              relationship: Storage['instream-habitat'].storage,
              featureId: $route.current.params.practiceId
            });
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat/:reportId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'InstreamHabitatFormController',
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
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          }
        }
      });

  });

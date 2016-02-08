(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldStack')
    .config(function($routeProvider, commonscloud) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration', {
          templateUrl: '/modules/shared/default.html',
          controller: 'EnhancedStreamRestorationReportController',
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
            practice: function(Feature, $route) {
              return Feature.GetFeature({
                storage: commonscloud.collections.practice.storage,
                featureId: $route.current.params.practiceId
              });
            },
            readings: function(Storage, Feature, $route) {
              return Feature.GetRelatedFeatures({
                storage: commonscloud.collections.practice.storage,
                relationship: Storage['enhanced-stream-restoration'].storage,
                featureId: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration/:reportId/edit', {
          templateUrl: '/modules/shared/default.html',
          controller: 'EnhancedStreamRestorationFormController',
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


}());

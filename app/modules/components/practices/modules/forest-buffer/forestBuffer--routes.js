'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer', {
        templateUrl: '/modules/components/practices/modules/forest-buffer/views/summary--view.html',
        controller: 'ForestBufferSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeForestBuffer, $route) {
            return PracticeForestBuffer.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/forest-buffer/views/form--view.html',
        controller: 'ForestBufferFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeForestBuffer, $route) {
            return PracticeForestBuffer.get({
              id: $route.current.params.reportId
            });
          },
          landuse: function(Landuse) {
            return Landuse.query({
              results_per_page: 50
            });
          }
        }
      });

  });

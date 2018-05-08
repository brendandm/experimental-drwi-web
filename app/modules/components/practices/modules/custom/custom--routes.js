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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/custom', {
        templateUrl: '/modules/components/practices/modules/custom/views/summary--view.html',
        controller: 'CustomSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeCustom, $route) {
            return PracticeCustom.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/custom/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/custom/views/form--view.html',
        controller: 'CustomFormController',
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
          report: function(PracticeCustom, $route) {
            return PracticeCustom.get({
              id: $route.current.params.reportId
            });
          },
          practice_types: function(PracticeType, $route) {
            return PracticeType.query({
              results_per_page: 500
            });
          },
          metric_types: function(MetricType, $route) {
            return MetricType.query({
              results_per_page: 500
            });
          },
          monitoring_types: function(MonitoringType, $route) {
            return MonitoringType.query({
              results_per_page: 500
            });
          },
          unit_types: function(UnitType, $route) {
            return UnitType.query({
              results_per_page: 500
            });
          }

        }
      });

  });

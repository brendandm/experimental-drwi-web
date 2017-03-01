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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/agriculture-generic', {
        templateUrl: '/modules/components/practices/modules/agriculture-generic/views/report--view.html',
        controller: 'AgricultureGenericReportController',
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
          readings: function(Practice, $route) {
            return Practice.agricultureGeneric({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/agriculture-generic/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/agriculture-generic/views/form--view.html',
        controller: 'AgricultureGenericFormController',
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
          report: function(PracticeAgricultureGeneric, $route) {
            return PracticeAgricultureGeneric.get({
              id: $route.current.params.reportId
            });
          },
          landuse: function(Landuse) {
            return Landuse.query({
              results_per_page: 50
            });
          },
          efficiency_agriculture_generic: function(EfficiencyAgricultureGeneric) {
            return EfficiencyAgricultureGeneric.query({
              results_per_page: 150
            });
          }
        }
      });

  });

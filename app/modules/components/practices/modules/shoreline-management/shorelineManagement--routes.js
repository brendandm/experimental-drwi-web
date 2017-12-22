(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name FieldDoc
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/shoreline-management', {
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/report--view.html',
          controller: 'ShorelineManagementReportController',
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
              return Practice.shorelineManagement({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/shoreline-management/summary', {
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/summary--view.html',
          controller: 'ShorelineManagementSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeShorelineManagement, $route) {
              return PracticeShorelineManagement.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/shoreline-management/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/form--view.html',
          controller: 'ShorelineManagementFormController',
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
            report: function(PracticeShorelineManagement, $route) {
              return PracticeShorelineManagement.get({
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

}());

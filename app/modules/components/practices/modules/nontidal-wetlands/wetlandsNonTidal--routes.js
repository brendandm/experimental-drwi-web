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
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/nontidal-wetlands', {
          templateUrl: '/modules/components/practices/modules/nontidal-wetlands/views/summary--view.html',
          controller: 'WetlandsNonTidalSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeWetlandsNonTidal, $route) {
              return PracticeWetlandsNonTidal.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/nontidal-wetlands/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/nontidal-wetlands/views/form--view.html',
          controller: 'WetlandsNonTidalFormController',
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
            report: function(PracticeWetlandsNonTidal, $route) {
              return PracticeWetlandsNonTidal.get({
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

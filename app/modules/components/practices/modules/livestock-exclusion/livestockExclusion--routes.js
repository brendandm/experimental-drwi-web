(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion', {
          templateUrl: '/modules/components/practices/modules/livestock-exclusion/views/summary--view.html',
          controller: 'LivestockExclusionSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeLivestockExclusion, $route) {
              return PracticeLivestockExclusion.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/livestock-exclusion/views/form--view.html',
          controller: 'LivestockExclusionFormController',
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
            report: function(PracticeLivestockExclusion, $route) {
              return PracticeLivestockExclusion.get({
                id: $route.current.params.reportId
              });
            },
            animals: function(AnimalManure) {
              return AnimalManure.query();
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

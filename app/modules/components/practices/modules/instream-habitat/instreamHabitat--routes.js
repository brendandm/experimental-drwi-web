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
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat', {
          templateUrl: '/modules/components/practices/modules/instream-habitat/views/summary--view.html',
          controller: 'InstreamHabitatSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeInstreamHabitat, $route) {
              return PracticeInstreamHabitat.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/instream-habitat/views/form--view.html',
          controller: 'InstreamHabitatFormController',
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
            report: function(PracticeInstreamHabitat, $route) {
              return PracticeInstreamHabitat.get({
                id: $route.current.params.reportId
              });
            }
          }
        });

    });


}());

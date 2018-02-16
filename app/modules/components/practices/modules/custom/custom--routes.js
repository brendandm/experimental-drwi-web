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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/generic', {
        templateUrl: '/modules/components/practices/modules/generic/views/summary--view.html',
        controller: 'GenericSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeAgricultureGeneric, $route) {
            return PracticeAgricultureGeneric.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/generic/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/generic/views/form--view.html',
        controller: 'GenericFormController',
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
          report: function(PracticeGeneric, $route) {
            return PracticeGeneric.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  });

'use strict';

/**
 * @ngdoc overview
 * @name FieldStack
 * @description
 * # FieldStack
 *
 * Main module of the application.
 */
angular.module('FieldStack')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner', {
        templateUrl: '/modules/components/practices/modules/urban-homeowner/views/report--view.html',
        controller: 'UrbanHomeownerReportController',
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
            return Practice.urbanHomeowner({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/urban-homeowner/views/form--view.html',
        controller: 'UrbanHomeownerFormController',
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
          report: function(PracticeUrbanHomeowner, $route) {
            return PracticeUrbanHomeowner.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  }]);

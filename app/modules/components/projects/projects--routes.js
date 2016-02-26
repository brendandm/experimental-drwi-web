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
  .config(function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects', {
        templateUrl: '/modules/components/projects/views/projectsList--view.html',
        controller: 'ProjectsCtrl',
        controllerAs: 'page',
        reloadOnSearch: false,
        resolve: {
          projects: function(Project) {
            return Project.query();
          },
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: '/modules/components/projects/views/projectsSingle--view.html',
        controller: 'ProjectViewCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          },
          sites: function(Project, $route) {
            return Project.sites({
                'id': $route.current.params.projectId
            });
          }
        }
      })
      .when('/projects/:projectId/edit', {
        templateUrl: '/modules/components/projects/views/projectsEdit--view.html',
        controller: 'ProjectEditCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          }
        }
      })
      .when('/projects/:projectId/users', {
        templateUrl: '/modules/components/projects/views/projectsUsers--view.html',
        controller: 'ProjectUsersCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          },
          members: function(Project, $route) {
            return Project.members({
                'id': $route.current.params.projectId
            });
          }
        }
      });

  });

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
    .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

        $routeProvider
            .when('/sites', {
                redirectTo: '/projects/:projectId'
            })
            .when('/sites/:siteId', {
                templateUrl: '/modules/components/sites/views/sites--summary.html',
                controller: 'SiteSummaryCtrl',
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
                    summary: function(Site, $route) {
                        return Site.summary({
                            id: $route.current.params.siteId
                        });
                    },
                    nodes: function(Site, $route) {
                        return Site.nodes({
                            id: $route.current.params.siteId
                        });
                    },
                    practices: function(Site, $route) {
                        return Site.practices({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/edit', {
                templateUrl: '/modules/components/sites/views/sites--edit.html',
                controller: 'SiteEditCtrl',
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
                    }
                }
            });

    }]);
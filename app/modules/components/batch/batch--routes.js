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
    .config([
        '$routeProvider',
        'environment',
        function($routeProvider, environment) {

            $routeProvider
                .when('/sites/:siteId/batchDelete', {
                    templateUrl: '/modules/components/batch/views/sitesBatchDelete--view.html?t=' + environment.version,
                    controller: 'SitesBatchDeleteController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account, $rootScope, $document) {

                            $rootScope.targetPath = document.location.pathname;

                            if (Account.userObject && !Account.userObject.id) {
                                return Account.getUser();
                            }

                            return Account.userObject;

                        },
                        site: function(Site, $route) {
                            return Site.get({
                                id: $route.current.params.siteId,
                                format: 'geojson'
                            });
                        }
                    }
                })
                .when('/projects/:projectId/batchDelete', {
                    templateUrl: '/modules/components/batch/views/projectsBatchDelete--view.html?t=' + environment.version,
                    controller: 'ProjectsBatchDeleteController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account, $rootScope, $document) {

                            $rootScope.targetPath = document.location.pathname;

                            if (Account.userObject && !Account.userObject.id) {
                                return Account.getUser();
                            }

                            return Account.userObject;

                        },
                        project: function(Project, $route) {
                            return Project.get({
                                id: $route.current.params.projectId,
                                format: 'geojson'
                            });
                        },

                    }
                })
                 .when('/batchDelete', {
                    templateUrl: '/modules/components/batch/views/batchDelete--view.html?t=' + environment.version,
                    controller: 'BatchDeleteController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account, $rootScope, $document) {

                            $rootScope.targetPath = document.location.pathname;

                            if (Account.userObject && !Account.userObject.id) {
                                return Account.getUser();
                            }

                            return Account.userObject;

                        },
                        site: function(Site, $route) {
                            return Site.get({
                                id: $route.current.params.siteId,
                                format: 'geojson'
                            });
                        }
                    }
                })

                ;

        }
    ]);
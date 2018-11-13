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
    .config(function($routeProvider, environment) {

        $routeProvider
            .when('/dashboards', {
                templateUrl: '/modules/components/dashboard/views/dashboardList--view.html?t=' + environment.version,
                controller: 'DashboardListCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    dashboards: function($route, $location, Dashboard) {

                        return Dashboard.query();

                    },
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/:dashboardId', {
                templateUrl: '/modules/components/dashboard/views/dashboard--view.html?t=' + environment.version,
                controller: 'DashboardCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($route, $location, Dashboard) {

                        return Dashboard.geographies({
                            id: $route.current.params.dashboardId
                        });

                    },
                    baseProjects: function($route, $location, Dashboard) {

                        return Dashboard.projects({
                            id: $route.current.params.dashboardId
                        });

                    },
                    dashboard: function($route, $location, Dashboard, $rootScope, $document) {

                        $rootScope.targetPath = '/dashboards';

                        return Dashboard.get({
                            id: $route.current.params.dashboardId
                        });

                    },
                    user: function(Account, $rootScope, $document) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/collection/new', {
                templateUrl: '/modules/components/dashboard/views/dashboardCreate--view.html?t=' + environment.version,
                controller: 'DashboardCreateCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/:dashboardId/edit', {
                templateUrl: '/modules/components/dashboard/views/dashboardEdit--view.html?t=' + environment.version,
                controller: 'DashboardEditCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    dashboard: function($route, $location, Dashboard) {

                        return Dashboard.get({
                            id: $route.current.params.dashboardId
                        });

                    },
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }
                
            });

    });
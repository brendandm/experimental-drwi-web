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
            .when('/programs/:programId/geographies', {
                templateUrl: '/modules/components/geographies/views/geographyList--view.html?t=' + environment.version,
                controller: 'GeographyListController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    geographies: function(Program, $route) {

                        return Program.geographies({
                            id: $route.current.params.programId
                        });

                    }
                }
            })
            .when('/geographies/:geographyId', {
                templateUrl: '/modules/components/geographies/views/geographySummary--view.html?t=' + environment.version,
                controller: 'GeographySummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metrics: function(GeographyService, $route) {
                        return Geography.metrics({
                            id: $route.current.params.geographyId
                        });
                    },
                    outcomes: function(GeographyService, $route) {
                        return Geography.outcomes({
                            id: $route.current.params.geographyId
                        });
                    },
                    geography: function(GeographyService, $route) {
                        return Geography.get({
                            id: $route.current.params.geographyId
                        });
                    }
                }
            })
            .when('/geographies/:geographyId/edit', {
                templateUrl: '/modules/components/geographies/views/geographyEdit--view.html?t=' + environment.version,
                controller: 'GeographyEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    geography: function(GeographyService, $route) {
                        return Geography.get({
                            id: $route.current.params.geographyId
                        });
                    }
                }
            })
            .when('/geographies/:geographyId/location', {
                templateUrl: '/modules/components/geographies/views/geographyLocation--view.html?t=' + environment.version,
                controller: 'GeographyLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    geography: function(GeographyService, $route) {
                        return Geography.get({
                            id: $route.current.params.geographyId
                        });
                    }
                }
            });

    });
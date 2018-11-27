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
            .when('/geographies', {
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
                    geographies: function(Program, $route, $rootScope, $location) {

                        var params = $location.search(),
                            data = {};

                        if ($rootScope.programContext !== null &&
                            typeof $rootScope.programContext !== 'undefined') {

                            data.id = $rootScope.programContext;

                            $location.search('program', $rootScope.programContext);

                        } else if (params.program !== null &&
                            typeof params.program !== 'undefined') {

                            data.id = params.program;

                            $rootScope.programContext = params.program;

                        }

                        return Program.geographies(data);

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
                        return GeographyService.metrics({
                            id: $route.current.params.geographyId
                        });
                    },
                    outcomes: function(GeographyService, $route) {
                        return GeographyService.outcomes({
                            id: $route.current.params.geographyId
                        });
                    },
                    geography: function(GeographyService, $route) {
                        return GeographyService.get({
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
                        return GeographyService.get({
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
                        return GeographyService.get({
                            id: $route.current.params.geographyId
                        });
                    }
                }
            })
            .when('/geographies/:geographyId/tags', {
                templateUrl: '/templates/featureTag--view.html?t=' + environment.version,
                controller: 'FeatureTagController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    featureCollection: function(GeographyService) {

                        return {
                            name: 'geography',
                            path: '/geographies',
                            cls: GeographyService
                        }

                    },
                    feature: function(GeographyService, $route) {

                        return GeographyService.get({
                            id: $route.current.params.geographyId
                        });

                    }
                }
            });

    });
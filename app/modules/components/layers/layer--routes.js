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
            .when('/layers', {
                templateUrl: '/modules/components/layers/views/layerList--view.html?t=' + environment.version,
                controller: 'LayerListController',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layers: function(Program, $route, $rootScope, $location) {

                        $location.search({});

                        return [];

                    }
                }
            })
            .when('/layers/collection/new', {
                templateUrl: '/modules/components/layers/views/layerCreate--view.html?t=' + environment.version,
                controller: 'LayerCreateController',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layers: function(Program, $route, $rootScope, $location) {

                        $location.search({});

                        return [];

                    }
                }
            })
            .when('/layers/:layerId', {
                templateUrl: '/modules/components/layers/views/layerSummary--view.html?t=' + environment.version,
                controller: 'LayerSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    // metrics: function(LayerService, $route) {

                    //     return {};

                    //     // return LayerService.metrics({
                    //     //     id: $route.current.params.layerId
                    //     // });

                    // },
                    // outcomes: function(LayerService, $route) {

                    //     return {};

                    //     // return LayerService.outcomes({
                    //     //     id: $route.current.params.layerId
                    //     // });

                    // },
                    layer: function(LayerService, $route) {

                        return LayerService.get({
                            id: $route.current.params.layerId
                        });

                    }
                }
            })
            .when('/layers/:layerId/edit', {
                templateUrl: '/modules/components/layers/views/layerEdit--view.html?t=' + environment.version,
                controller: 'LayerEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layer: function(LayerService, $route) {

                        return LayerService.get({
                            id: $route.current.params.layerId
                        });

                    }
                }
            })
            .when('/layers/:layerId/location', {
                templateUrl: '/modules/components/layers/views/layerLocation--view.html?t=' + environment.version,
                controller: 'LayerLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layer: function(LayerService, $route) {

                        return LayerService.get({
                            id: $route.current.params.layerId
                        });

                    }
                }
            })
            .when('/layers/:layerId/location', {
                templateUrl: '/modules/components/layers/views/layerLocation--view.html?t=' + environment.version,
                controller: 'LayerLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layer: function(LayerService, $route) {

                        return LayerService.get({
                            id: $route.current.params.layerId
                        });

                    }
                }
            })
            .when('/layers/:layerId/tags', {
                templateUrl: '/modules/shared/tags/views/featureTag--view.html?t=' + environment.version,
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
                    featureCollection: function(LayerService, $route) {

                        return {
                            featureId: $route.current.params.layerId,
                            name: 'layer',
                            path: '/layers',
                            cls: LayerService
                        };

                    },
                    feature: function(LayerService, $route) {

                        return LayerService.get({
                            id: $route.current.params.layerId
                        });

                    },
                    toolbarUrl: function() {

                        return '/templates/toolbars/layer.html?t=' + environment.version;

                    },
                    viewState: function() {

                        return {
                            'layer': true
                        };

                    }
                }
            })
            .when('/layers/:layerId/targets', {
                templateUrl: '/modules/components/layers/views/layerTarget--view.html?t=' + environment.version,
                controller: 'LayerTargetController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    layer: function(LayerService, $route) {

                        return {};

                        // return LayerService.get({
                        //     id: $route.current.params.layerId,
                        //     exclude: 'geometry,properties,type'
                        // });

                    }
                }
            });

    });
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
            .when('/models/:modelId', {
                templateUrl: '/modules/components/model/views/modelSummary--view.html?t=' + environment.version,
                controller: 'ModelSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $route, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        // $rootScope.modelContext = $route.current.params.modelId;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    model: function(Model, $route) {
                        return Model.get({
                            id: $route.current.params.modelId
                        });
                    }
                }
            })
            .when('/models/:modelId/practices', {
                templateUrl: '/modules/components/model/views/modelTag--view.html?t=' + environment.version,
                controller: 'ModelTagController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $route, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        // $rootScope.modelContext = $route.current.params.modelId;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    model: function(Model, $route) {
                        return Model.get({
                            id: $route.current.params.modelId
                        });
                    }
                }
            })
            .when('/models/:modelId/tags', {
                templateUrl: '/modules/components/model/views/modelTag--view.html?t=' + environment.version,
                controller: 'ModelTagController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $route, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        // $rootScope.modelContext = $route.current.params.modelId;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    model: function(Model, $route) {
                        return Model.get({
                            id: $route.current.params.modelId
                        });
                    }
                }
            });

    });
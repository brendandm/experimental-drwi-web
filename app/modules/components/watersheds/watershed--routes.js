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
            .when('/watersheds/:watershedId', {
                templateUrl: '/modules/components/watersheds/views/watershedSummary--view.html?t=' + environment.version,
                controller: 'WatershedSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metrics: function(Watershed, $route) {

                        return {};

                        return Watershed.metrics({
                            id: $route.current.params.watershedId
                        });

                    },
                    outcomes: function(Watershed, $route) {

                        return {};

                        return Watershed.outcomes({
                            id: $route.current.params.watershedId
                        });

                    },
                    watershed: function(Watershed, $route) {

                        return Watershed.get({
                            id: $route.current.params.watershedId
                        });

                    }
                }
            });

    });
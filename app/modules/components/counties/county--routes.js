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
            .when('/counties/:countyId', {
                templateUrl: '/modules/components/counties/views/countySummary--view.html?t=' + environment.version,
                controller: 'CountySummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metrics: function(County, $route) {

                        return {};

                        return County.metrics({
                            id: $route.current.params.countyId
                        });

                    },
                    outcomes: function(County, $route) {

                        return {};

                        return County.outcomes({
                            id: $route.current.params.countyId
                        });

                    },
                    county: function(County, $route) {

                        return County.get({
                            id: $route.current.params.countyId
                        });

                    }
                }
            });

    });
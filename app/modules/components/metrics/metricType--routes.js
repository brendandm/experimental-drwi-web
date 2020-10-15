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
            .when('/metrics', {
                templateUrl: '/modules/components/metrics/views/metricTypeList--view.html?t=' + environment.version,
                controller: 'MetricTypeListController',
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
                    metricTypes: function(Program, $route, $rootScope, $location) {

                        return [];

                    }
                }
            })
            .when('/metrics/:metricId', {
                templateUrl: '/modules/components/metrics/views/metricTypeSummary--view.html?t=' + environment.version,
                controller: 'MetricSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metric: function(MetricType, $route) {
                        return MetricType.single({
                            id: $route.current.params.metricId
                        });
                    }
                }
            })
            .when('/metrics/:metricId/edit', {
                templateUrl: '/modules/components/metrics/views/metricTypeEdit--view.html?t=' + environment.version,
                controller: 'MetricTypeEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metricType: function(MetricType, $route) {

                        return MetricType.get({
                            id: $route.current.params.metricId
                        });

                    },
                    unitTypes: function(UnitType, $route) {
                        return UnitType.query({
                            results_per_page: 500
                        });
                    }
                }
            });
    });
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
    .config(function($routeProvider) {

        $routeProvider
            .when('/practices/:practiceId', {
                templateUrl: '/modules/components/practices/views/summary--view.html',
                controller: 'CustomSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    metrics: function(Practice, $route) {
                        return Practice.metrics({
                            id: $route.current.params.practiceId
                        });
                    },
                    outcomes: function(Practice, $route) {
                        return Practice.outcomes({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            })
            .when('/practices/:practiceId/:reportId/edit', {
                templateUrl: '/modules/components/practices/views/edit--view.html',
                controller: 'CustomFormController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    },
                    report: function(PracticeCustom, $route) {
                        return PracticeCustom.get({
                            id: $route.current.params.reportId
                        });
                    },
                    report_metrics: function(PracticeCustom, $route) {
                        return PracticeCustom.metrics({
                            id: $route.current.params.reportId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    metric_types: function(MetricType, $route) {
                        return MetricType.query({
                            results_per_page: 500
                        });
                    },
                    monitoring_types: function(MonitoringType, $route) {
                        return MonitoringType.query({
                            results_per_page: 500
                        });
                    },
                    unit_types: function(UnitType, $route) {
                        return UnitType.query({
                            results_per_page: 500
                        });
                    }

                }
            })
            .when('/practices/:practiceId/edit', {
                templateUrl: '/modules/components/practices/views/practiceEdit--view.html',
                controller: 'PracticeEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    site: function(Practice, $route) {
                        return Practice.site({
                            id: $route.current.params.practiceId
                        });
                    },
                    practice_types: function(PracticeType, $route) {
                        return PracticeType.query({
                            results_per_page: 500
                        });
                    },
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            });

    });
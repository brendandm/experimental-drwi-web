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
            .when('/practices/:practiceId', {
                templateUrl: '/modules/components/practices/views/summary--view.html?t=' + environment.version,
                controller: 'CustomSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
            .when('/reports/:reportId/edit', {
                templateUrl: '/modules/components/practices/views/edit--view.html?t=' + environment.version,
                controller: 'ReportEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    // practice: function(Practice, $route) {
                    //     return Practice.get({
                    //         id: $route.current.params.practiceId
                    //     });
                    // },
                    report: function(Report, $route) {
                        return Report.get({
                            id: $route.current.params.reportId
                        });
                    },
                    report_metrics: function(Report, $route) {
                        return Report.metrics({
                            id: $route.current.params.reportId
                        });
                    },
                    // metric_types: function(MetricType, $route) {
                    //     return MetricType.query({
                    //         results_per_page: 500
                    //     });
                    // },
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
                templateUrl: '/modules/components/practices/views/practiceEdit--view.html?t=' + environment.version,
                controller: 'PracticeEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
            })
            .when('/practices/:practiceId/location', {
                templateUrl: '/modules/components/practices/views/practiceLocation--view.html?t=' + environment.version,
                controller: 'PracticeLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
                    practice: function(Practice, $route) {
                        return Practice.get({
                            id: $route.current.params.practiceId
                        });
                    }
                }
            })
            .when('/practices/:practiceId/photos', {
                templateUrl: '/modules/components/practices/views/practicePhoto--view.html?t=' + environment.version,
                controller: 'PracticePhotoController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
            })
            .when('/practices/:practiceId/tags', {
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
                    featureCollection: function(Practice) {

                        return {
                            name: 'practice',
                            path: '/practices',
                            cls: Practice
                        }

                    },
                    feature: function(Practice, $route) {

                        return Practice.get({
                            id: $route.current.params.practiceId
                        });

                    }
                }
            });

    });
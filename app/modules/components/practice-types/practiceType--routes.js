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
            .when('/practice-types', {
                templateUrl: '/modules/components/practice-types/views/practiceTypeList--view.html?t=' + environment.version,
                controller: 'PracticeTypeListController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    programs: function(PracticeType, $route) {

                        return PracticeType.collection({});

                    }
                }
            })
            .when('/practice-types/:practiceTypeId', {
                templateUrl: '/modules/components/practice-types/views/practiceTypeSummary--view.html?t=' + environment.version,
                controller: 'PracticeTypeSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    metrics: function(PracticeType, $route) {
                        return PracticeType.metrics({
                            id: $route.current.params.practiceTypeId
                        });
                    },
                    outcomes: function(PracticeType, $route) {
                        return PracticeType.outcomes({
                            id: $route.current.params.practiceTypeId
                        });
                    },
                    practiceType: function(PracticeType, $route) {
                        return PracticeType.get({
                            id: $route.current.params.practiceTypeId
                        });
                    }
                }
            })
            .when('/practice-types/:practiceTypeId/edit', {
                templateUrl: '/modules/components/practice-types/views/practiceTypeEdit--view.html?t=' + environment.version,
                controller: 'PracticeTypeEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    practiceType: function(PracticeType, $route) {
                        return PracticeType.get({
                            id: $route.current.params.practiceTypeId
                        });
                    }
                }
            });

    });
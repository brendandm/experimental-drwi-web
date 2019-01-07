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
            .when('/awards', {
                templateUrl: '/modules/components/award/views/awardList--view.html?t=' + environment.version,
                controller: 'AwardListController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    awards: function(Program, $route, $rootScope, $location) {

                        return [];

                    }
                }
            })
            .when('/awards/:awardId', {
                templateUrl: '/modules/components/award/views/awardSummary--view.html?t=' + environment.version,
                controller: 'AwardSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    award: function(Award, $route) {

                        return Award.get({
                            id: $route.current.params.awardId
                        });
                        
                    }
                }
            })
            .when('/awards/:awardId/edit', {
                templateUrl: '/modules/components/award/views/awardEdit--view.html?t=' + environment.version,
                controller: 'AwardEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    award: function(Award, $route) {

                        return Award.get({
                            id: $route.current.params.awardId
                        });
                        
                    }
                }
            });

    });
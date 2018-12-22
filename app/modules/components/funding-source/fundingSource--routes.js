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
            .when('/funding-sources', {
                templateUrl: '/modules/components/funding-source/views/fundingSourceList--view.html?t=' + environment.version,
                controller: 'FundingSourceListController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    fundingSources: function(Program, $route, $rootScope, $location) {

                        return [];

                    }
                }
            })
            .when('/funding-sources/:fundingSourceId', {
                templateUrl: '/modules/components/funding-source/views/fundingSourceSummary--view.html?t=' + environment.version,
                controller: 'FundingSourceSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    fundingSource: function(FundingSource, $route) {

                        return FundingSource.get({
                            id: $route.current.params.fundingSourceId
                        });
                        
                    }
                }
            })
            .when('/funding-sources/:fundingSourceId/edit', {
                templateUrl: '/modules/components/funding-source/views/fundingSourceEdit--view.html?t=' + environment.version,
                controller: 'FundingSourceEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    fundingSource: function(FundingSource, $route) {

                        return FundingSource.get({
                            id: $route.current.params.fundingSourceId
                        });
                        
                    }
                }
            });

    });
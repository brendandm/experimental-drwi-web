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
            .when('/tags', {
                templateUrl: '/modules/components/tags/views/tagList--view.html?t=' + environment.version,
                controller: 'TagListController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    tags: function(Tag, $route) {

                        return Tag.collection({
                            group: true
                        });

                    }
                }
            })
            .when('/tags/:tagId', {
                templateUrl: '/modules/components/tags/views/tagSummary--view.html?t=' + environment.version,
                controller: 'TagSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    tag: function(Tag, $route) {
                        return Tag.get({
                            id: $route.current.params.tagId
                        });
                    }
                }
            })
            .when('/tags/:tagId/edit', {
                templateUrl: '/modules/components/tags/views/tagEdit--view.html?t=' + environment.version,
                controller: 'TagEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    tag: function(Tag, $route) {
                        return Tag.get({
                            id: $route.current.params.tagId
                        });
                    }
                }
            });

    });
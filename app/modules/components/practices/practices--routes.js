(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, commonscloud) {

            $routeProvider
                .when('/projects/:projectId/sites/:siteId/practices', {
                    redirectTo: '/projects/:projectId/sites/:siteId'
                })
                .when('/projects/:projectId/sites/:siteId/practices/:practiceId', {
                    templateUrl: '/modules/components/practices/views/practices--view.html',
                    controller: 'PracticeViewController',
                    controllerAs: 'page',
                    resolve: {
                        practice: function(Practice, $route) {
                            return Practice.get({
                                id: $route.current.params.practiceId
                            });
                        }
                    }
                })
                .when('/projects/:projectId/sites/:siteId/practices/:practiceId/edit', {
                    templateUrl: '/modules/components/practices/views/practices--edit.html',
                    controller: 'PracticeEditController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            if (Account.userObject && !Account.userObject.id) {
                                return Account.getUser();
                            }
                            return Account.userObject;
                        },
                        site: function(Site, $route) {
                            return Site.get({
                                id: $route.current.params.siteId
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

}());
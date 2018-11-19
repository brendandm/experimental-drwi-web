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
            .when('/', {
                templateUrl: '/modules/components/home/views/home--view.html?t=' + environment.version,
                controller: 'HomeController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    projects: function(Project, $route) {

                        return Project.collection({
                            limit: 4,
                            sort: 'modified_on'
                        });

                    },
                    programs: function(Program, $route) {

                        return Program.collection({});

                    }
                }
            });

    });
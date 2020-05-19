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
            .when('/projects/:feature_id/changeLog/', {
                templateUrl: '/modules/components/change-log/views/changeLog--view.html?t=' + environment.version,
                controller: 'ChangeLogController',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                /*    projects: function($location, Project, $rootScope) {

                        return Project.collection({});

                    },
                    */
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    }
                }
            });

    });
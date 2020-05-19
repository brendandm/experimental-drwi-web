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
            .when('/:feature_type/:id/history', {
                templateUrl: '/modules/components/change-log/views/changeLog--view.html?t=' + environment.version,
                controller: 'ChangeLogController',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
            });

    });
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
    .config(function($routeProvider, commonscloud) {

        $routeProvider
            .when('/snapshot/:snapshotId', {
                templateUrl: '/modules/components/snapshot/views/snapshot--view.html',
                controller: 'SnapshotCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($location, GeographyService) {

                        return GeographyService.query({
                            id: 3
                        });

                    },
                    projects: function($route, $location, Snapshot) {

                        return Snapshot.projects({
                            id: $route.current.params.snapshotId
                        });

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            })
            .when('/snapshot', {
                templateUrl: '/modules/components/snapshot/views/snapshotCreate--view.html',
                controller: 'SnapshotCreateCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            })
            .when('/snapshot/:snapshotId/edit', {
                templateUrl: '/modules/components/snapshot/views/snapshotEdit--view.html',
                controller: 'SnapshotEditCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshot: function($route, $location, Snapshot) {

                        return Snapshot.get({
                            id: $route.current.params.snapshotId
                        });

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            });

    });
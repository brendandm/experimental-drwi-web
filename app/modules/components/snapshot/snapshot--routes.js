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
            .when('/snapshots', {
                templateUrl: '/modules/components/snapshot/views/snapshotList--view.html',
                controller: 'SnapshotListCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshots: function($route, $location, Snapshot) {

                        return Snapshot.query();

                    },
                    user: function(Account) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }
                }
            })
            .when('/snapshots/:snapshotId', {
                templateUrl: '/modules/components/snapshot/views/snapshot--view.html',
                controller: 'SnapshotCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($route, $location, Snapshot) {

                        return Snapshot.geographies({
                            id: $route.current.params.snapshotId
                        });

                    },
                    baseProjects: function($route, $location, Snapshot) {

                        return Snapshot.projects({
                            id: $route.current.params.snapshotId
                        });

                    },
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
            })
            .when('/snapshots/collection/new', {
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
            .when('/snapshots/:snapshotId/edit', {
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
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
            .when('/dashboards', {
                templateUrl: '/modules/components/snapshot/views/snapshotList--view.html?t=' + environment.version,
                controller: 'SnapshotListCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshots: function($route, $location, Snapshot) {

                        return Snapshot.query();

                    },
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/:snapshotId', {
                templateUrl: '/modules/components/snapshot/views/snapshot--view.html?t=' + environment.version,
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
                    snapshot: function($route, $location, Snapshot, $rootScope, $document) {

                        $rootScope.targetPath = '/dashboards';

                        return Snapshot.get({
                            id: $route.current.params.snapshotId
                        });

                    },
                    user: function(Account, $rootScope, $document) {

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/collection/new', {
                templateUrl: '/modules/components/snapshot/views/snapshotCreate--view.html?t=' + environment.version,
                controller: 'SnapshotCreateCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {

                            return Account.getUser();
                            
                        }

                        return Account.userObject;

                    }

                }

            })
            .when('/dashboards/:snapshotId/edit', {
                templateUrl: '/modules/components/snapshot/views/snapshotEdit--view.html?t=' + environment.version,
                controller: 'SnapshotEditCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    snapshot: function($route, $location, Snapshot) {

                        return Snapshot.get({
                            id: $route.current.params.snapshotId
                        });

                    },
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
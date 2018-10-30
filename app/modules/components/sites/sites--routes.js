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
    .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

        $routeProvider
            // .when('/sites', {
            //     redirectTo: '/projects/:projectId'
            // })
            .when('/sites/:siteId', {
                templateUrl: '/modules/components/sites/views/sites--summary.html',
                controller: 'SiteSummaryCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    metrics: function(Site, $route) {
                        return Site.metrics({
                            id: $route.current.params.siteId
                        });
                    },
                    nodes: function(Site, $route) {
                        return Site.nodes({
                            id: $route.current.params.siteId
                        });
                    },
                    outcomes: function(Site, $route) {
                        return Site.outcomes({
                            id: $route.current.params.siteId
                        });
                    },
                    practices: function(Site, $route) {
                        return Site.practices({
                            id: $route.current.params.siteId
                        });
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/geographies', {
                templateUrl: '/modules/components/sites/views/siteGeography--view.html',
                controller: 'SiteGeographyCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    nodes: function(Site, $route) {
                        return Site.nodes({
                            id: $route.current.params.siteId
                        });
                    },
                    site: function(Site, $route) {
                        return Site.get({
                            id: $route.current.params.siteId
                        });
                    }
                }
            })
            .when('/sites/:siteId/edit', {
                templateUrl: '/modules/components/sites/views/sites--edit.html',
                controller: 'SiteEditCtrl',
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
                    }
                }
            })
            .when('/sites/:siteId/location', {
                templateUrl: '/modules/components/sites/views/siteLocation--view.html',
                controller: 'SiteLocationCtrl',
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
                    }
                }
            })
            .when('/sites/:siteId/photos', {
                templateUrl: '/modules/components/sites/views/sitePhoto--view.html',
                controller: 'SitePhotoCtrl',
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
                    }
                }
            });

    }]);
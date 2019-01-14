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
    .config([
        '$routeProvider',
        'environment',
        function($routeProvider, environment) {

        $routeProvider
            .when('/sites/:siteId', {
                templateUrl: '/modules/components/sites/views/sites--summary.html?t=' + environment.version,
                controller: 'SiteSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
                templateUrl: '/modules/components/sites/views/siteGeography--view.html?t=' + environment.version,
                controller: 'SiteGeographyController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
                templateUrl: '/modules/components/sites/views/sites--edit.html?t=' + environment.version,
                controller: 'SiteEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
                templateUrl: '/modules/components/sites/views/siteLocation--view.html?t=' + environment.version,
                controller: 'SiteLocationController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
                templateUrl: '/modules/components/sites/views/sitePhoto--view.html?t=' + environment.version,
                controller: 'SitePhotoController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

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
            .when('/sites/:siteId/partnerships', {
                templateUrl: '/modules/components/sites/views/sitePartnership--view.html?t=' + environment.version,
                controller: 'SitePartnershipController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    site: function(Site, $route) {

                        var exclude = [
                            'centroid',
                            'creator',
                            'dashboards',
                            'extent',
                            'geometry',
                            'members',
                            'metric_types',
                            // 'partners',
                            'practices',
                            'practice_types',
                            'properties',
                            'tags',
                            'targets',
                            'tasks',
                            'type',
                            'sites'
                        ].join(',');

                        return Site.get({
                            id: $route.current.params.siteId,
                            exclude: exclude
                        });

                    },
                    // allocations: function(Site, $route) {

                    //     return Site.partnerships({
                    //         id: $route.current.params.siteId
                    //     });

                    // },
                    partnerships: function(Site, $route) {

                        return Site.partnerships({
                            id: $route.current.params.siteId
                        });

                    }
                }
            })
            .when('/sites/:siteId/tags', {
                templateUrl: '/modules/shared/tags/views/featureTag--view.html?t=' + environment.version,
                controller: 'FeatureTagController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    featureCollection: function(Site, $route) {

                        return {
                            featureId: $route.current.params.siteId,
                            name: 'site',
                            path: '/sites',
                            cls: Site
                        }

                    },
                    feature: function(Site, $route) {

                        return Site.get({
                            id: $route.current.params.siteId
                        });

                    },
                    toolbarUrl: function() {

                        return '/templates/toolbars/site.html?t=' + environment.version;

                    },
                    viewState: function() {

                        return {
                            'site': true
                        };

                    }
                }
            });

    }]);
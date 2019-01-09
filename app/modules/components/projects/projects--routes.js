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
            .when('/projects', {
                templateUrl: '/modules/components/projects/views/projectsList--view.html?t=' + environment.version,
                controller: 'ProjectsController',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    projects: function($location, Project, $rootScope) {

                        var params = $location.search(),
                            data = {};

                        if (// $rootScope.programContext !== null &&
                            typeof // $rootScope.programContext !== 'undefined') {

                            data.program = // $rootScope.programContext;

                            $location.search('program', // $rootScope.programContext);

                        } else if (params.program !== null &&
                            typeof params.program !== 'undefined') {

                            data.program = params.program;

                            // $rootScope.programContext = params.program;

                        }

                        return Project.collection(data);

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
            .when('/projects/:projectId', {
                templateUrl: '/modules/components/projects/views/projectsSummary--view.html?t=' + environment.version,
                controller: 'ProjectSummaryController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    project: function(Project, $route) {
                        
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

                        return Project.get({
                            id: $route.current.params.projectId,
                            exclude: exclude
                        });
                        
                    },
                    metrics: function(Project, $route) {
                        return Project.metrics({
                            id: $route.current.params.projectId
                        });
                    },
                    // nodes: function(Site, $route) {
                    //     return Site.nodes({
                    //         id: $route.current.params.projectId
                    //     });
                    // },
                    outcomes: function(Project, $route) {
                        return Project.outcomes({
                            id: $route.current.params.projectId
                        });
                    },
                    sites: function(Project, $route) {
                        return Project.sites({
                            id: $route.current.params.projectId
                        });
                    }
                }
            })
            .when('/projects/collection/new', {
                templateUrl: '/modules/components/projects/views/projectsCreate--view.html?t=' + environment.version,
                controller: 'ProjectCreateController',
                controllerAs: 'page',
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
            .when('/projects/:projectId/edit', {
                templateUrl: '/modules/components/projects/views/projectsEdit--view.html?t=' + environment.version,
                controller: 'ProjectEditController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    project: function(Project, $route) {

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

                        return Project.get({
                            id: $route.current.params.projectId,
                            exclude: exclude
                        });

                    }
                }
            })
            .when('/projects/:projectId/users', {
                templateUrl: '/modules/components/projects/views/projectsUsers--view.html?t=' + environment.version,
                controller: 'ProjectUsersController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    project: function(Project, $route) {

                        var exclude = [
                            'centroid',
                            'creator',
                            'dashboards',
                            'extent',
                            'geometry',
                            // 'members',
                            'metric_types',
                            'partners',
                            'practices',
                            'practice_types',
                            'properties',
                            'tags',
                            'targets',
                            'tasks',
                            'type',
                            'sites'
                        ].join(',');

                        return Project.get({
                            id: $route.current.params.projectId,
                            exclude: exclude
                        });

                    }
                }
            })
            .when('/projects/:projectId/tags', {
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
                    featureCollection: function(Project, $route) {

                        return {
                            featureId: $route.current.params.projectId,
                            name: 'project',
                            path: '/projects',
                            cls: Project
                        };

                    },
                    feature: function(Project, $route) {

                        var exclude = [
                            'centroid',
                            'creator',
                            'dashboards',
                            'extent',
                            'geometry',
                            'members',
                            'metric_types',
                            'partners',
                            'practices',
                            'practice_types',
                            'properties',
                            // 'tags',
                            'targets',
                            'tasks',
                            'type',
                            'sites'
                        ].join(',');

                        return Project.get({
                            id: $route.current.params.projectId,
                            exclude: exclude
                        });

                    },
                    toolbarUrl: function() {

                        return '/templates/toolbars/project.html?t=' + environment.version;

                    },
                    viewState: function() {

                        return {
                            'project': true
                        };

                    }
                }
            })
            .when('/projects/:projectId/targets', {
                templateUrl: '/modules/components/projects/views/projectTarget--view.html?t=' + environment.version,
                controller: 'ProjectTargetController',
                controllerAs: 'page',
                resolve: {
                    user: function(Account, $rootScope, $document) {

                        $rootScope.targetPath = document.location.pathname;

                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }

                        return Account.userObject;

                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    }
                }
            });

    });
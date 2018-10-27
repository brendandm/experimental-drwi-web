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
            .when('/projects', {
                templateUrl: '/modules/components/projects/views/projectsList--view.html',
                controller: 'ProjectsCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    projects: function($location, Project) {

                        return Project.collection({});

                    },
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    }
                }
            })
            .when('/projects/:projectId', {
                templateUrl: '/modules/components/projects/views/projectsSummary--view.html',
                controller: 'ProjectSummaryCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    },
                    // summary: function(Project, $route) {
                    //     return Project.summary({
                    //         'id': $route.current.params.projectId
                    //     });
                    // },
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
                templateUrl: '/modules/components/projects/views/projectsCreate--view.html',
                controller: 'ProjectCreateCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    }
                }
            })
            .when('/projects/:projectId/edit', {
                templateUrl: '/modules/components/projects/views/projectsEdit--view.html',
                controller: 'ProjectEditCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
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
            })
            .when('/projects/:projectId/users', {
                templateUrl: '/modules/components/projects/views/projectsUsers--view.html',
                controller: 'ProjectUsersCtrl',
                controllerAs: 'page',
                resolve: {
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    project: function(Project, $route) {
                        return Project.get({
                            'id': $route.current.params.projectId
                        });
                    },
                    members: function(Project, $route) {
                        return Project.members({
                            'id': $route.current.params.projectId
                        });
                    }
                }
            });

    });
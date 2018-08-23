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

                        //
                        // Get all of our existing URL Parameters so that we can
                        // modify them to meet our goals
                        //
                        var search_params = $location.search();

                        //
                        // Prepare any pre-filters to append to any of our user-defined
                        // filters in the browser address bar
                        //
                        search_params.q = (search_params.q) ? angular.fromJson(search_params.q) : {};

                        search_params.q.filters = (search_params.q.filters) ? search_params.q.filters : [];

                        search_params.q.order_by = [{
                            field: 'created_on',
                            direction: 'desc'
                        }];

                        //
                        // Execute our query so that we can get the Reports back
                        //
                        // return Project.query(search_params);

                        return Project.minimal({
                            id: 3
                        });
                    },
                    user: function(Account) {
                        if (Account.userObject && !Account.userObject.id) {
                            return Account.getUser();
                        }
                        return Account.userObject;
                    },
                    'years': function(Filters) {
                        return Filters.projectsByYear();
                    },
                    geographies: function(Filters) {
                        return Filters.customGeographies({
                            id: 3
                        });
                    },
                    grantees: function(Filters) {
                        return Filters.grantees({
                            id: 3
                        });
                    },
                    practices: function(Filters) {
                        return Filters.practices({
                            id: 3
                        });
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
                    summary: function(Project, $route) {
                        return Project.summary({
                            'id': $route.current.params.projectId
                        });
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
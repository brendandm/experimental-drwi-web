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
            .when('/dashboard', {
                templateUrl: '/modules/components/dashboard/views/dashboard--view.html',
                controller: 'DashboardCtrl',
                controllerAs: 'page',
                reloadOnSearch: false,
                resolve: {
                    geographies: function($location, GeographyService) {

                        return GeographyService.query({
                            id: 3
                        });

                    },
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

                        return Project.collection();

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
(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('globalSearch', [
            '$window',
            '$location',
            '$filter',
            '$http',
            'SearchService',
            'ProjectStore',
            'FilterStore',
            function($window, $location, $filter, $http, SearchService,
                ProjectStore, FilterStore) {
                return {
                    restrict: 'EA',
                    // scope: {
                    //     filterProjects: '&'
                    // },
                    link: function(scope, element, attrs) {

                        scope.query = undefined;

                        // The user triggered a selection action

                        scope.routeTo = function(item, model, label) {

                            // $window.location.href = item.permalink;

                            console.log('searchItem', item);

                            var path = item.category + 's/' + item.id;

                            // $location.path(item.permalink).search({});

                            $location.path(path).search({});

                        };

                        // Populate a list of possible matches based on the search string

                        scope.fetchSuggestions = function(a, scope_) {

                            var params = {
                                q: a
                            };

                            if (typeof scope_ === 'string' &&
                                scope_.length > 0) {

                                params.scope = scope_;

                            }

                            return SearchService.get(params).$promise.then(function(response) {

                                console.log(response);

                                return response.results.slice(0,5);

                            });

                        };

                        scope.setFilter = function($item, $model, $label) {

                            scope.query = undefined;

                            // FilterStore.clearAll();

                            FilterStore.addItem($item);

                            console.log('FilterStore.index', FilterStore.index);

                            // ProjectStore.filterProjects($item);

                            // ProjectStore.filterAll(FilterStore.index);

                        };

                    }

                };
            }
        ]);

}());
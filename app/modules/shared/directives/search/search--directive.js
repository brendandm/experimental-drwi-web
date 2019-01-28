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

                            var featureType = item.category,
                                path;

                            switch (featureType) {

                                case 'geography':

                                    path = 'geographies/' + item.id;

                                    break;

                                case 'metric type':

                                    path = 'metric-types/' + item.id + '/edit';

                                    break;

                                case 'practice type':

                                    path = 'practice-types/' + item.id + '/edit';

                                    break;

                                case 'tag':

                                    path = 'tags/' + item.id + '/edit';

                                    break;

                                default:

                                    path = featureType + 's/' + item.id;

                                    break;

                            }

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
(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('globalSearch', [
            '$window',
            '$location',
            '$filter',
            '$http',
            'SearchService',
            function($window, $location, $filter, $http, SearchService) {
                return {
                    restrict: 'EA',

                    link: function(scope, element, attrs) {

                        scope.query = undefined;

                        // The user triggered a selection action

                        scope.routeTo = function(item, model, label) {

                            // $window.location.href = item.permalink;

                            console.log('searchItem', item);

                            $location.path(item.permalink).search({});

                        };

                        // Populate a list of possible matches based on the search string

                        scope.fetchSuggestions = function(a) {

                            return SearchService.get({
                                q: a
                            }).$promise.then(function(response) {

                                console.log(response);

                                return response.results;

                            });

                        };

                    }

                };
            }
        ]);

}());
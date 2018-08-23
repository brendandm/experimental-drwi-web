(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('classificationSearch', [
            '$window',
            '$location',
            '$filter',
            '$http',
            'ClassificationIndex',
            function($window, $location, $filter, $http, ClassificationIndex) {
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

                            return $http({
                                method: 'GET',
                                url: 'https://search.waterreporter.org/search?q=' + a,
                                cache: true
                            }).then(function(response) {

                                console.log(response);

                                return response.data.results;

                            });

                        };

                    }

                };
            }
        ]);

}());
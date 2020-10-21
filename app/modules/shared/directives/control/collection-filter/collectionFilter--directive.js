(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('collectionFilter', [
            '$window',
            'environment',
            function($window, environment) {
                return {
                    restrict: 'EA',
                    scope: {
                        'collection': '@collection',
                        'displayStates': '=?',
                        'features': '=?',
                        'filters': '=?',
                        'trackName': '=?',
                        'update': '&'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/control/collection-filter/collectionFilter--view.html?t=' + environment.version;

                    },
                    link: function(scope, element, attrs) {

                        if (typeof scope.trackName === 'undefined') {

                            scope.trackName = true;

                        }

                        scope.toggleModal = function (update, filterValue, resetFilter) {

                            resetFilter = resetFilter || false;

                            var collection = scope.collection;

                            console.log(
                                'toggleModal:collection:',
                                collection
                            );

                            var visible = scope.displayStates[collection] || false;

                            console.log(
                                'toggleModal:visible:',
                                visible
                            );

                            scope.displayStates = {};

                            scope.displayStates[collection] = !visible;

                            console.log(
                                'toggleModal:displayStates:',
                                scope.displayStates
                            );

                            if (resetFilter) {

                                if (filterValue && filterValue !== 0 &&
                                    filterValue !== 'all') {

                                    scope.filters[scope.collection] = filterValue;

                                } else {

                                    scope.filters[scope.collection] = undefined;

                                }

                            }

                            console.log(
                                'toggleModal:filters:',
                                scope.filters
                            );

                            if (update) {

                                scope.update(true);

                            }

                        };

                    }

                };

            }

        ]);

}());
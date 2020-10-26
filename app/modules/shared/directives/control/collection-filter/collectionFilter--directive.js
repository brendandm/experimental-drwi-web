(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('collectionFilter', [
            '$window',
            'environment',
            'QueryParamManager',
            function($window, environment, QueryParamManager) {
                return {
                    restrict: 'EA',
                    scope: {
                        'collection': '@collection',
                        'displayStates': '=?',
                        'features': '=?',
                        'params': '=?',
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

                        scope.toggleModal = function (filterValue, resetFilter) {

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

                                    scope.params[scope.collection] = filterValue;

                                } else {

                                    delete scope.params[scope.collection];

                                }

                                scope.params.page = 1;

                                QueryParamManager.setParams(scope.params);

                                scope.update({
                                    params: scope.params
                                });

                            }

                            console.log(
                                'toggleModal:params:',
                                scope.params
                            );

                        };

                        scope.$watch('params', function (newVal) {

                            if (newVal) {

                                scope.params = newVal;

                            }

                        });

                    }

                };

            }

        ]);

}());
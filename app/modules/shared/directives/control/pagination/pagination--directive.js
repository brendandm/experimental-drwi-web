(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('pagination', [
            '$window',
            'environment',
            'QueryParamManager',
        function($window, environment, QueryParamManager) {
                return {
                    restrict: 'EA',
                    scope: {
                        'params': '=?',
                        'rotate': '&',
                        'summary': '=?',
                        'updateParams': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return [
                            // Base path
                            'modules/shared/directives/',
                            // Directive path
                            'control/pagination/pagination--view.html',
                            // Query string
                            '?t=' + environment.version
                        ].join('');

                    },
                    link: function(scope, element, attrs) {

                        // if (!scope.params.hasOwnProperty('page')) {
                        //
                        //     throw 'A `page` parameter is required.';
                        // }
                        //
                        // if (!scope.params.hasOwnProperty('limit')) {
                        //
                        //     throw 'A `limit` parameter is required.';
                        // }

                        if (typeof scope.updateParams === 'undefined') {

                            scope.updateParams = false;

                        }

                        scope.changeLimit = function (limit) {

                            console.log(
                                'changeLimit:limit:',
                                limit
                            );

                            scope.params.limit = limit;
                            scope.params.page = 1;

                            console.log(
                                'changeLimit:params:',
                                scope.params
                            );

                            if (scope.updateParams) QueryParamManager.setParams(scope.params);

                            scope.rotate({
                                params: scope.params
                            });

                        };

                        scope.getPage = function (page) {

                            if (page < 1) {

                                scope.params.page = 1;

                            } else if (page > scope.summary.page_count) {

                                scope.params.page = scope.summary.page_count;

                            } else {

                                scope.params.page = page;

                                if (scope.updateParams) QueryParamManager.setParams(scope.params);

                                scope.rotate({
                                    params: scope.params
                                });

                            }

                        };

                        scope.$watch('summary', function (newVal) {

                            if (newVal) {

                                var featureCount = newVal.feature_count;

                                scope.boundaryLow = scope.params.page === 1 ? 1 : (scope.params.limit * (scope.params.page - 1)) + 1;

                                var maxCount = scope.params.limit * scope.params.page;

                                if (featureCount <= maxCount) {

                                    scope.boundaryHigh = featureCount;

                                } else {

                                    scope.boundaryHigh = maxCount;

                                }

                            }

                        });

                        scope.$watch('params', function (newVal) {

                            if (typeof newVal === 'undefined') {

                                scope.params = QueryParamManager.getDefaults();

                            } else {

                                scope.params = newVal;

                            }

                        });

                    }

                };

            }

        ]);

}());
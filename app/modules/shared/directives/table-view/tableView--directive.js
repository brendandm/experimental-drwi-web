(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('tableView', [
            'environment',
            '$window',
            '$timeout',
            '$location',
            'AnchorScroll',
            function (environment, $window, $timeout, $location, AnchorScroll) {
                return {
                    restrict: 'EA',
                    scope: {
                        'featureType': '=?',
                        'index': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/table-view/tableView--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        $window.scrollTo(0, 0);

                        //
                        // Additional scope vars.
                        //

                        scope.tipManager = {};

                        scope.resetTip = function (key, projectId) {

                            var existing = scope.tipManager[key];

                            scope.tipManager = {};

                            if (existing === projectId) return;

                            if (key && projectId) {
                                scope.tipManager[key] = projectId;
                            }

                        };

                        scope.processIndex = function () {

                        };

                        scope.$watch('index', function (newVal) {

                            if (newVal) {

                                scope.processIndex();

                            }

                        });

                    }

                };

            }

        ]);

}());
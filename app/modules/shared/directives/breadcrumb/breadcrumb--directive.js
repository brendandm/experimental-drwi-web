(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('breadcrumb', [
            'environment',
            '$timeout',
            function (environment, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'metric': '=?',
                        'pad': '@',
                        'practice': '=?',
                        'practiceType': '=?',
                        'program': '=?',
                        'project': '=?',
                        'report': '=?',
                        'site': '=?',
                        'tail': '@'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/breadcrumb/breadcrumb--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        //
                        // Additional scope vars.
                        //

                        scope.calcAvailWidth = function () {

                            var parent = document.querySelector(
                                '.breadcrumb');

                            var parentWidth;

                            if (parent) {

                                parentWidth = (parent.clientWidth * 0.90);

                            }

                            var anchorEls = document.querySelectorAll(
                                '.anchor');

                            var anchorWidth = 0;

                            for (var i = 0; i < anchorEls.length; i++) {

                                var el = anchorEls[i];

                                anchorWidth += el.clientWidth;

                            }

                            return parentWidth - anchorWidth;

                        };

                        // scope.collapse = function (availWidth) {
                        //
                        //     var collapseEls = document.querySelectorAll(
                        //         '.breadcrumb .collapse');
                        //
                        //     var count = collapseEls.length;
                        //
                        //     console.log(
                        //         'collapse:count:',
                        //         count
                        //     );
                        //
                        //     var width = Math.floor(availWidth / count);
                        //
                        //     console.log(
                        //         'collapse:width:',
                        //         width
                        //     );
                        //
                        //     for (var i = 0; i < count; i++) {
                        //
                        //         var el = collapseEls[i];
                        //
                        //         el.style.width = width + 'px';
                        //
                        //     }
                        //
                        // };

                        scope.setBasis = function () {

                            //
                            // The following conditions are abortive.
                            //

                            if (scope.report && !scope.practice) return;

                            if (scope.practice && !scope.project) return;

                            if (scope.site && !scope.project) return;

                            // var ancestors = [
                            //     scope.practice,
                            //     scope.site,
                            //     scope.project
                            // ];
                            //
                            // var ancestorCount = 0;
                            //
                            // ancestors.forEach(function (feature) {
                            //
                            //     if (feature !== null && feature !== 'undefined') {
                            //
                            //         ancestorCount += 1;
                            //
                            //     }
                            //
                            // });

                            $timeout(function () {

                                var collapseEls = document.querySelectorAll(
                                    '.breadcrumb div:not(.anchor)');

                                var count = collapseEls.length;

                                console.log(
                                    'calcAvailWidth',
                                    scope.calcAvailWidth()
                                );

                                // scope.collapse(scope.calcAvailWidth())

                                var availWidth = Math.floor(scope.calcAvailWidth() * 0.75);

                                var focusWidth = Math.floor(scope.calcAvailWidth() * 0.25);

                                console.log(
                                    'availWidth',
                                    availWidth
                                );

                                console.log(
                                    'focusWidth',
                                    focusWidth
                                );

                                scope.basis = Math.floor(scope.calcAvailWidth() / count);

                                // scope.basis = {
                                //     ancestor: availWidth / ancestorCount,
                                //     focus: focusWidth
                                // }

                                console.log(
                                    'scope.basis',
                                    scope.basis
                                );

                            }, 50)

                        };

                        scope.$watch('report', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('practice', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('metric', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('practiceType', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('site', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('program', function (newVal) {

                            scope.setBasis();

                        });

                        scope.$watch('project', function (newVal) {

                            scope.setBasis();

                        });

                    }

                };

            }

        ]);

}());
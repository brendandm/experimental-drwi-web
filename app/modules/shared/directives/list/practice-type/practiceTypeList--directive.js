(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('practiceTypeList', [
            'environment',
            '$window',
            'AnchorScroll',
            function (environment, $window, AnchorScroll) {
                return {
                    restrict: 'EA',
                    scope: {
                        'index': '=?',
                        'letters': '=?',
                        'link': '@',
                        'practice': '=?',
                        'practiceType': '=?',
                        'program': '=?',
                        'summary': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/list/practice-type/practiceTypeList--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        $window.scrollTo(0, 0);

                        //
                        // Additional scope vars.
                        //

                        scope.scrollManager = AnchorScroll;

                        scope.queryToken = undefined;

                        scope.addLink = (scope.link === 'true');

                        if (scope.practiceType) {

                            scope.selectionId = 'type-' + scope.practiceType.id;

                        }

                        scope.closeView = function() {

                            scope.visible = false;

                        };

                        scope.setPracticeType = function (feature) {

                            scope.practiceType = feature;

                        };

                    }

                };

            }

        ]);

}());
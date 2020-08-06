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
                        'selectable': '@',
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

                        scope.enableSelection = (scope.selectable === 'true');

                        if (scope.practiceType) {

                            scope.selectionId = 'type-' + scope.practiceType.id;

                        }

                        scope.processIndex = function () {

                            if (Array.isArray(scope.index)) {

                                scope.index.forEach(function (item) {

                                    console.log(
                                        'practiceTypeList:processIndex:item',
                                        item
                                    );

                                    if (scope.practiceType && scope.practiceType.id) {

                                        item.selected = (item.id === scope.practiceType.id);

                                    } else {

                                        item.selected = false;

                                    }

                                });

                            }

                        };

                        scope.closeView = function() {

                            scope.visible = false;

                        };

                        scope.setPracticeType = function (feature) {

                            feature.selected = true;

                            scope.practiceType = feature;

                            scope.selectionId = 'type-' + scope.practiceType.id;

                            scope.processIndex();

                        };

                        scope.$watch('index', function (newVal) {

                            if (Array.isArray(newVal)) {

                                scope.processIndex();

                            }

                        });

                    }

                };

            }

        ]);

}());
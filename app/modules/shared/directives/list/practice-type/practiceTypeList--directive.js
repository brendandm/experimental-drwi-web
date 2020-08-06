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

                        scope.addLink = (scope.link === 'true');

                        scope.enableSelection = (scope.selectable === 'true');

                        scope.hiddenKeys = {};

                        if (scope.practiceType) {

                            scope.selectionId = 'type-' + scope.practiceType.id;

                        }

                        scope.filterIndex = function (queryToken) {

                            console.log(
                                'practiceTypeList:filterIndex'
                            );

                            console.log(
                                'practiceTypeList:filterIndex:queryToken',
                                queryToken
                            );

                            if (typeof queryToken === 'string') {

                                var token = queryToken.toLowerCase();

                                for (var key in scope.index) {

                                    if (scope.index.hasOwnProperty(key)) {

                                        var group = scope.index[key];

                                        if (Array.isArray(group)) {

                                            group.forEach(function (item) {

                                                var name = item.name;

                                                if (typeof name === 'string' && name.length) {

                                                    if (queryToken.length >= 3) {

                                                        item.hide = !(item.name.toLowerCase().indexOf(token) >= 0);

                                                    } else {

                                                        item.hide = false;

                                                    }

                                                }

                                            });

                                        }

                                    }

                                }

                            }

                        };

                        scope.processIndex = function () {

                            console.log(
                                'practiceTypeList:processIndex'
                            );

                            for (var key in scope.index) {

                                if (scope.index.hasOwnProperty(key)) {

                                    var group = scope.index[key];

                                    if (Array.isArray(group)) {

                                        group.forEach(function (item) {

                                            // console.log(
                                            //     'practiceTypeList:processIndex:item',
                                            //     item
                                            // );

                                            if (scope.practiceType && scope.practiceType.id) {

                                                item.selected = (item.id === scope.practiceType.id);

                                            } else {

                                                item.selected = false;

                                            }

                                            if (typeof scope.queryToken === 'string' &&
                                                scope.queryToken.length >= 3) {

                                                if (item.name.indexOf(scope.queryToken) >= 0) {

                                                    item.hide = false;

                                                } else {

                                                    item.hide = false;

                                                }

                                            } else {

                                                item.hide = false;

                                            }

                                        });

                                    }

                                }

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

                            if (newVal) {

                                scope.processIndex();

                            }

                        });

                    }

                };

            }

        ]);

}());
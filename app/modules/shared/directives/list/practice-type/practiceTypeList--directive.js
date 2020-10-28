(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('practiceTypeList', [
            'environment',
            '$window',
            '$timeout',
            '$location',
            'AnchorScroll',
            function (environment, $window, $timeout, $location, AnchorScroll) {
                return {
                    restrict: 'EA',
                    scope: {
                        'dismissable': '=?',
                        'index': '=?',
                        'letters': '=?',
                        'link': '@link',
                        'practice': '=?',
                        'practiceType': '=?',
                        'program': '=?',
                        'selectable': '@selectable',
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

                        scope.zeroMatches = false;

                        if (scope.practiceType) {

                            scope.selectionId = 'type-' + scope.practiceType.id;

                        }

                        scope.clearSearchInput = function () {

                            var input = document.getElementById('practice-type-search');

                            if (input) input.value = '';

                        };

                        scope.jumpToSelection = function () {

                            console.log(
                                'jumpToSelection:selectionId',
                                scope.selectionId
                            );

                            $location.hash('');

                            scope.scrollManager.scrollToAnchor(scope.selectionId);

                        };

                        scope.filterIndex = function (queryToken) {

                            console.log(
                                'practiceTypeList:filterIndex'
                            );

                            console.log(
                                'practiceTypeList:filterIndex:queryToken',
                                queryToken
                            );

                            var totalItems = 0;

                            var totalHidden = 0;

                            if (typeof queryToken === 'string') {

                                var token = queryToken.toLowerCase();

                                for (var key in scope.index) {

                                    if (scope.index.hasOwnProperty(key)) {

                                        var group = scope.index[key];

                                        if (Array.isArray(group)) {

                                            totalItems += group.length;

                                            var hiddenItems = 0;

                                            group.forEach(function (item) {

                                                var name = item.name;

                                                if (typeof name === 'string' && name.length) {

                                                    if (queryToken.length >= 3) {

                                                        item.hide = !(item.name.toLowerCase().indexOf(token) >= 0);

                                                    } else {

                                                        item.hide = false;

                                                    }

                                                    if (item.hide) {

                                                        hiddenItems++;

                                                        totalHidden++;

                                                    }

                                                }

                                            });

                                            scope.hiddenKeys[key] = (group.length === hiddenItems);

                                        }

                                    }

                                }

                            }

                            scope.zeroMatches = (totalItems > 0 && totalHidden > 0 && (totalItems === totalHidden));

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

                            feature.showConfirmation = true;

                            scope.practiceType = feature;

                            scope.selectionId = 'type-' + scope.practiceType.id;

                            scope.filterIndex('');

                            scope.processIndex();

                            scope.clearSearchInput();

                            $timeout(function () {

                                // $window.scrollTo(0, 0);

                                scope.scrollManager.scrollToAnchor(scope.selectionId);

                            }, 200);

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
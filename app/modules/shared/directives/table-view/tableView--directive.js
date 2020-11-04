(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('tableView', [
            'environment',
            '$window',
            '$timeout',
            '$location',
            'AnchorScroll',
            'Project',
            function (environment, $window, $timeout, $location, AnchorScroll, Project) {
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

                        scope.modalManager = {
                            action: undefined
                        };

                        scope.resetTip = function (key, projectId) {

                            var existing = scope.tipManager[key];

                            scope.tipManager = {};

                            if (existing === projectId) return;

                            if (key && projectId) {
                                scope.tipManager[key] = projectId;
                            }

                        };

                        scope.toggleActionModal = function (projectId) {

                            var existing = scope.modalManager.action;

                            scope.modalManager = {};

                            if (existing === projectId) return;

                            if (projectId) {
                                scope.modalManager.action = projectId;
                            }

                        };

                        scope.processIndex = function () {

                        };

                        scope.editProject = function (projectId) {

                            $location.path('/projects/' + projectId + '/edit');

                        };

                        scope.$watch('index', function (newVal) {

                            if (newVal) {

                                scope.processIndex();

                            }

                        });

                        scope.$on('globalClick', function (event, target) {

                            console.log(
                                'globalClick:tableView:event:',
                                event
                            );

                            console.log(
                                'globalClick:tableView:target:',
                                target
                            );

                            if (!element[0].contains(target)) {

                                scope.$apply(function () {

                                    console.log(
                                        'globalClick:tableView:event:$apply'
                                    );

                                    if (typeof scope.tipManager.created !== 'undefined' ||
                                        typeof scope.tipManager.modified !== 'undefined') {

                                        console.log(
                                            'globalClick:tableView:event:$apply:closeTip',
                                            scope.tipManager
                                        );

                                        scope.tipManager = {};

                                    }

                                    if (typeof scope.modalManager.action !== 'undefined') {

                                        console.log(
                                            'globalClick:tableView:event:$apply:closeModal',
                                            scope.modalManager
                                        );

                                        scope.modalManager = {
                                            action: undefined
                                        };

                                    }

                                });

                            }

                        });

                    }

                };

            }

        ]);

}());
(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('metricLinkList', [
            'environment',
            '$window',
            '$timeout',
            '$location',
            'AnchorScroll',
            'PracticeType',
            function (environment, $window, $timeout, $location,
                      AnchorScroll, PracticeType) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'index': '=?',
                        'letters': '=?',
                        'linkedMetrics': '=?',
                        'practiceType': '=?'
                    },
                    templateUrl: function (elem, attrs) {

                        return [
                            // Base path
                            'modules/shared/directives/',
                            // Directive path
                            'list/metric-link/metricLinkList--view.html',
                            // Query string
                            '?t=' + environment.version
                        ].join('');

                    },
                    link: function (scope, element, attrs) {

                        $window.scrollTo(0, 0);

                        //
                        // Additional scope vars.
                        //

                        scope.status = {
                            loading: false,
                            processing: false
                        };

                        scope.scrollManager = AnchorScroll;

                        scope.hiddenKeys = {};

                        scope.zeroMatches = false;

                        scope.closeAlerts = function() {

                            scope.alerts = [];

                        };

                        scope.clearSearchInput = function () {

                            var input = document.getElementById('metric-search');

                            if (input) input.value = '';

                        };

                        scope.jumpToSelection = function () {

                            $location.hash('');

                            scope.scrollManager.scrollToAnchor(scope.selectionId);

                        };

                        scope.filterIndex = function (queryToken) {

                            console.log(
                                'metricLinkList:filterIndex'
                            );

                            console.log(
                                'metricLinkList:filterIndex:queryToken',
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

                        scope.manageMetric = function(metricType, action) {

                            console.log(
                                'metricLinkList:manageMetric'
                            );

                            if ((action !== 'add' && action !== 'remove') ||
                                scope.status.processing) return;

                            scope.status.processing = true;

                            PracticeType.manageMetric({
                                id: scope.practiceType.id,
                                metricId: metricType.id,
                                action: action
                            }, {}).$promise.then(function(successResponse) {

                                console.log(
                                    'scope.manageMetric.successResponse',
                                    successResponse
                                );

                                metricType.linked = !metricType.linked;

                                if (action === 'add') {

                                    scope.alerts = [{
                                        'type': 'success',
                                        'flag': 'Success!',
                                        'msg': 'Metric linked to practice type.',
                                        'prompt': 'OK'
                                    }];

                                } else {

                                    scope.alerts = [{
                                        'type': 'success',
                                        'flag': 'Success!',
                                        'msg': 'Metric un-linked from practice type.',
                                        'prompt': 'OK'
                                    }];

                                }

                                $timeout(scope.closeAlerts, 2000);

                                scope.status.processing = false;

                                scope.syncMetricArrays(metricType, action);

                            }).catch(function(errorResponse) {

                                console.log(
                                    'scope.manageMetric.errorResponse',
                                    errorResponse
                                );

                                // Do something with the error

                                scope.alerts = [{
                                    'type': 'success',
                                    'flag': 'Success!',
                                    'msg': 'Something went wrong and the changes were not saved.',
                                    'prompt': 'OK'
                                }];

                                $timeout(scope.closeAlerts, 2000);

                                scope.status.processing = false;

                            });

                            scope.metricType = undefined;

                        };

                        scope.syncMetricArrays = function(metricType, action) {

                            if (action === 'add') {

                                scope.linkedMetrics.push(metricType);

                            } else {

                                scope.linkedMetrics = scope.linkedMetrics.filter(function (feature) {

                                    return feature.id !== metricType.id;

                                });

                            }

                        };

                    }

                };

            }

        ]);

}());
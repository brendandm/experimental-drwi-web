(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('creationDialog', [
            '$routeParams',
            '$filter',
            '$parse',
            '$location',
            'Site',
            'Practice',
            'Report',
            '$timeout',
            function($routeParams, $filter, $parse, $location, Site, Practice, Report, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'organization': '=?',
                        'parent': '=?',
                        'resetType': '=?',
                        'site': '=?',
                        'type': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/dialog/creationDialog--view.html';

                    },
                    link: function(scope, element, attrs) {

                        if (scope.resetType === 'undefined') {

                            scope.resetType = true;

                        }

                        function closeAlerts() {

                            scope.alerts = [];

                        }

                        scope.closeChildModal = function() {

                            scope.visible = false;

                            if (scope.resetType) scope.type = undefined;

                        };

                        scope.createChild = function(name) {

                            if (scope.type !== 'report' &&
                                scope.type !== 'practice' &&
                                scope.type !== 'site') return;

                            if (!name || typeof name === 'undefined') return;

                            var newFeature;

                            var data;

                            if (scope.type === 'practice' ||
                                scope.type === 'site') {

                                data = {
                                    'name': name,
                                    'project_id': scope.parent,
                                    'organization_id': scope.organization
                                };

                                if (scope.type === 'site') {

                                    newFeature = new Site(data);

                                } else {

                                    if (scope.site) {

                                        data.site_id = scope.site;
                                    }

                                    newFeature = new Practice(data);

                                }

                            } else {

                                data = {
                                    'measurement_period': name,
                                    'report_date': new Date(),
                                    'practice_id': scope.parent,
                                    'organization_id': scope.organization
                                };

                                newFeature = new Report(data);

                            }

                            newFeature.$save(function(successResponse) {

                                var nextPath = [
                                    '/',
                                    scope.type,
                                    's/',
                                    successResponse.id,
                                    '/edit'
                                ].join('');

                                if (scope.type === 'report') {

                                    Report.prepare({
                                        id: +successResponse.id
                                    }, {}).$promise.then(function(successResponse) {

                                        $location.path(nextPath);

                                    }).catch(function(error) {

                                        scope.alerts = [{
                                            'type': 'error',
                                            'flag': 'Error!',
                                            'msg': 'Something went wrong while attempting to create this ' + scope.type + '.',
                                            'prompt': 'OK'
                                        }];

                                        $timeout(closeAlerts, 2000);

                                    });

                                } else {

                                    $location.path(nextPath);

                                }

                            }, function(errorResponse) {

                                scope.alerts = [{
                                    'type': 'error',
                                    'flag': 'Error!',
                                    'msg': 'Something went wrong while attempting to create this ' + scope.type + '.',
                                    'prompt': 'OK'
                                }];

                                $timeout(closeAlerts, 2000);

                            });

                        };

                    }

                };

            }

        ]);

}());
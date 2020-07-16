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
                        'project': '=?',
                        'parent': '=?',
                        'site': '=?',
                        'type': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/dialog/creationDialog--view.html';

                    },
                    link: function(scope, element, attrs) {

                        function closeAlerts() {

                            scope.alerts = [];

                        }

                        scope.closeChildModal = function() {

                            scope.visible = false;

                            scope.type = undefined;

                        };

                        scope.createChild = function(name) {

                            console.log("creationDialog scope.Type",scope.type)

                            if (!name || typeof name === 'undefined') return;

                            var newFeature;

                            if (scope.type === 'practice' ||
                                scope.type === 'site') {

                                var data = {
                                    'name': name,
                                    'project_id': scope.project,
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
                            }else if(scope.type === 'report'){

                                var data = {
                                    'measurement_period': name,
                                    'report_date': new Date(),
                                    'practice_id': scope.parent,
                                    'organization_id': scope.organization
                                };

                                newFeature = new Report(data);

                            }

                            console.log("newFeature",newFeature);

                            newFeature.$save(function(successResponse) {

                                    var nextPath = [
                                        '/',
                                        scope.type,
                                        's/',
                                        successResponse.id,
                                        '/edit'
                                    ].join('');

                                    $location.path(nextPath);
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
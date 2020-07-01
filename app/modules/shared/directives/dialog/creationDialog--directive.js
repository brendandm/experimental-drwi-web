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
            '$timeout',
            function($routeParams, $filter, $parse, $location, Site, Practice, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'organization': '=?',
                        'project': '=?',
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

                            if (scope.type !== 'practice' &&
                                scope.type !== 'site') return;

                            if (!name || typeof name === 'undefined') return;

                            var data = {
                                'name': name,
                                'project_id': scope.project,
                                'organization_id': scope.organization
                            };

                            var newFeature;

                            if (scope.type === 'site') {

                                newFeature = new Site(data);

                            } else {

                                if (scope.site) {

                                    data.site_id = scope.site;

                                }

                                newFeature = new Practice(data);

                            }

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
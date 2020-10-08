(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('importDialog', [
            '$routeParams',
            '$filter',
            '$parse',
            '$location',
            'ImportTpl',
            '$timeout',
            function($routeParams, $filter, $parse, $location, ImportTpl, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'program': '=?',
                        'type': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/dialog/import/importDialog--view.html';

                    },
                    link: function(scope, element, attrs) {

                        scope.label = scope.type.replace(/_/g, ' ');

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

                        scope.downloadTpl = function() {

                            ImportTpl.download({
                                collection: scope.type.replace(/_/g, '-')
                            }).$promise.then(function(success) {

                                    console.log('csv', success);

                                },
                                function(failure) {
                                    console.error('Error with download', failure);
                                });

                        };

                        scope.resetFileInput = function() {

                            scope.setFileInput = false;

                            $timeout(function () {

                                scope.setFileInput = true;

                            }, 10);

                        };

                        scope.hideTasks = function() {

                            scope.pendingTasks = [];

                            if (typeof scope.taskPoll !== 'undefined') {

                                $interval.cancel(scope.taskPoll);

                            }

                        };

                        scope.uploadFile = function() {

                            if (!scope.fileImport ||
                                !scope.fileImport.length) {

                                scope.alerts = [{
                                    'type': 'error',
                                    'flag': 'Error!',
                                    'msg': 'Please select a file.',
                                    'prompt': 'OK'
                                }];

                                $timeout(closeAlerts, 2000);

                                return false;

                            }

                            scope.progressMessage = 'Uploading your file...';

                            var fileData = new FormData();

                            fileData.append('file', scope.fileImport[0]);

                            fileData.append('feature_type', 'practice');

                            fileData.append('feature_id', scope.practice.id);

                            console.log('fileData', fileData);

                            try {

                                Shapefile.upload({}, fileData, function(successResponse) {

                                    console.log('successResponse', successResponse);

                                    scope.uploadError = null;

                                    scope.fileImport = null;

                                    scope.alerts = [{
                                        'type': 'success',
                                        'flag': 'Success!',
                                        'msg': 'Upload complete. Processing data...',
                                        'prompt': 'OK'
                                    }];

                                    $timeout(closeAlerts, 2000);

                                    if (successResponse.task) {

                                        scope.pendingTasks = [
                                            successResponse.task
                                        ];

                                    }

                                    scope.taskPoll = $interval(function() {

                                        scope.fetchTasks(successResponse.task.id);

                                    }, 1000);

                                }, function(errorResponse) {

                                    console.log('Upload error', errorResponse);

                                    scope.uploadError = errorResponse;

                                    scope.fileImport = null;

                                    scope.alerts = [{
                                        'type': 'error',
                                        'flag': 'Error!',
                                        'msg': 'The file could not be processed.',
                                        'prompt': 'OK'
                                    }];

                                    $timeout(closeAlerts, 2000);

                                });

                            } catch (error) {

                                console.log('Shapefile upload error', error);

                                scope.fileImport = null;

                            }

                        };

                    }

                };

            }

        ]);

}());
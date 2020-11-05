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
            'Program',
            function($routeParams, $filter, $parse, $location,
                     ImportTpl, $timeout, Program) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'callback': '&',
                        'fileInput': '@fileInput',
                        'program': '=?',
                        'type': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/dialog/import/importDialog--view.html';

                    },
                    link: function(scope, element, attrs) {

                        if (scope.resetType === 'undefined') {

                            scope.resetType = true;

                        }

                        function closeAlerts() {

                            scope.alerts = [];

                        }

                        scope.closeChildModal = function(refresh) {

                            scope.processing = false;

                            scope.uploadComplete = false;

                            scope.uploadError = null;

                            scope.visible = false;

                            if (scope.resetType) scope.type = undefined;

                            if (refresh) scope.callback();

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

                        scope.resetFileInput = function(element) {

                            element.value = null;

                            scope.processing = false;

                            scope.uploadComplete = false;

                        };

                        scope.hideTasks = function() {

                            scope.pendingTasks = [];

                            if (typeof scope.taskPoll !== 'undefined') {

                                $interval.cancel(scope.taskPoll);

                            }

                        };

                        scope.uploadFile = function() {

                            var input = document.getElementById(scope.fileInput);

                            console.log(
                                'scope.uploadFile:input',
                                input
                            );

                            var selectedFile = input.files[0];

                            console.log(
                                'scope.uploadFile:selectedFile',
                                selectedFile
                            );

                            if (!selectedFile) {

                                scope.alerts = [{
                                    'type': 'error',
                                    'flag': 'Error!',
                                    'msg': 'Please select a file.',
                                    'prompt': 'OK'
                                }];

                                $timeout(closeAlerts, 2000);

                                return false;

                            }

                            scope.processing = true;

                            scope.progressMessage = 'Processing…';

                            var fileData = new FormData();

                            fileData.append('file', selectedFile);

                            console.log('fileData', fileData);

                            try {

                                Program.importCollection({
                                    id: scope.program.id,
                                    collection: scope.type.replace(/_/g, '-')
                                }, fileData, function(successResponse) {

                                    console.log('successResponse', successResponse);

                                    scope.progressMessage = 'Complete';

                                    scope.uploadComplete = true;

                                    scope.uploadError = null;

                                    $timeout(function () {

                                        scope.closeChildModal(true);

                                    }, 1500);

                                    // scope.resetFileInput(input);
                                    //
                                    // if (successResponse.task) {
                                    //
                                    //     scope.pendingTasks = [
                                    //         successResponse.task
                                    //     ];
                                    //
                                    // }
                                    //
                                    // scope.taskPoll = $interval(function() {
                                    //
                                    //     scope.fetchTasks(successResponse.task.id);
                                    //
                                    // }, 500);

                                }, function(errorResponse) {

                                    console.log('Upload error', errorResponse);

                                    scope.uploadError = errorResponse.data;

                                    scope.resetFileInput(input);

                                });

                            } catch (error) {

                                console.log('File upload error', error);

                                scope.resetFileInput(input);

                            }

                        };

                        scope.$watch('type', function (newVal) {

                            if (typeof newVal === 'string') {

                                scope.label = newVal.replace(/_/g, ' ');

                            }

                        });

                    }

                };

            }

        ]);

}());
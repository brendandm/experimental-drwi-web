(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('imageUploadDialog', [
            'environment',
            '$routeParams',
            '$filter',
            '$parse',
            '$location',
            '$timeout',
            '$q',
            'Dashboard',
            'Program',
            'Project',
            'Site',
            'Practice',
            'Report',
            'Media',
            'Image',
            function(environment, $routeParams, $filter, $parse, $location,
                     $timeout, $q, Dashboard, Program, Project, Site, Practice,
                     Report, Media, Image) {
                return {
                    restrict: 'EA',
                    scope: {
                        'alerts': '=?',
                        'callback': '&',
                        'featureType': '@featureType',
                        'fileInput': '@fileInput',
                        'parent': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return [
                            // Base path
                            'modules/shared/directives/',
                            // Directive path
                            'dialog/image/imageUploadDialog--view.html',
                            // Query string
                            '?t=' + environment.version
                        ].join('');

                    },
                    link: function(scope, element, attrs) {

                        var modelIdx = {
                            'dashboard': Dashboard,
                            'practice': Practice,
                            'program': Program,
                            'project': Project,
                            'report': Report,
                            'site': Site
                        };

                        scope.model = modelIdx[scope.featureType];

                        if (typeof scope.model === 'undefined') {

                            throw 'Un-recognized `featureType` parameter.';

                        }

                        scope.mediaManager = Media;

                        scope.mediaManager.images = [];

                        function closeAlerts() {

                            scope.alerts = [];

                        }

                        scope.closeChildModal = function(refresh) {

                            scope.processing = false;

                            scope.uploadComplete = false;

                            scope.uploadError = null;

                            scope.visible = false;

                            if (refresh) scope.callback();

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

                        scope.uploadImage = function() {

                            console.log(
                                'imageUploadDialog:uploadImage:mediaManager.images:',
                                scope.mediaManager.images
                            );

                            var input = document.getElementById(scope.fileInput);

                            scope.processing = true;

                            var imageCollection = {
                                images: []
                            };

                            scope.parent.images.forEach(function(image) {

                                imageCollection.images.push({
                                    id: image.id
                                });

                            });

                            if (!scope.mediaManager.images) {

                                scope.alerts = [{
                                    'type': 'error',
                                    'flag': 'Error!',
                                    'msg': 'Please select an image.',
                                    'prompt': 'OK'
                                }];

                                $timeout(closeAlerts, 2000);

                                return false;

                            }

                            scope.processing = true;

                            scope.progressMessage = 'Uploading…';

                            var savedQueries = scope.mediaManager.preupload(
                                scope.mediaManager.images,
                                'image',
                                scope.featureType,
                                scope.parent.id);

                            console.log(
                                'ProjectPhotoController:saveImage:savedQueries:',
                                savedQueries
                            );

                            $q.all(savedQueries).then(function(successResponse) {

                                console.log('Images::successResponse', successResponse);

                                angular.forEach(successResponse, function(image) {

                                    imageCollection.images.push({
                                        id: image.id
                                    });

                                });

                                scope.model.update({
                                    id: scope.parent.id
                                }, imageCollection).$promise.then(function(successResponse) {

                                    scope.progressMessage = 'Complete';

                                    scope.uploadComplete = true;

                                    scope.uploadError = null;

                                    $timeout(function () {

                                        scope.closeChildModal(true);

                                    }, 1500);

                                    // scope.alerts = [{
                                    //     'type': 'success',
                                    //     'flag': 'Success!',
                                    //     'msg': 'Photo library updated.',
                                    //     'prompt': 'OK'
                                    // }];

                                }, function(errorResponse) {

                                    console.log('errorResponse', errorResponse);

                                    scope.uploadError = errorResponse.data;

                                    scope.resetFileInput(input);

                                });

                            }, function(errorResponse) {

                                console.log('errorResponse', errorResponse);

                                scope.uploadError = errorResponse.data;

                                scope.resetFileInput(input);

                            });

                        };

                    }

                };

            }

        ]);

}());
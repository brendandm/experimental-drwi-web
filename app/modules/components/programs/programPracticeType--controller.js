(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('ProgramPracticeTypeController', [
            'Account',
            '$location',
            '$timeout',
            '$log',
            '$rootScope',
            '$route',
            'Utility',
            'user',
            '$window',
            'Program',
            'Project',
            'program',
            'PracticeType',
            function(Account, $location, $timeout, $log, $rootScope,
                $route, Utility, user, $window, Program,
                Project, program, PracticeType) {

                var self = this;

                self.programId = $route.current.params.programId;

                self.practiceTypeId = $route.current.params.practiceTypeId;

                $rootScope.viewState = {
                    'program': true
                };

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.status = {
                    loading: true
                };

                self.alerts = [];

                self.closeAlerts = function() {

                    self.alerts = [];

                };

                function closeRoute() {

                    $location.path(self.program.links.site.html);

                }

                self.showElements = function() {

                    $timeout(function() {

                        self.status.loading = false;

                        self.status.processing = false;

                    }, 1000);

                };

                self.confirmDelete = function(obj, targetCollection) {

                    console.log('self.confirmDelete', obj, targetCollection);

                    if (self.deletionTarget &&
                        self.deletionTarget.collection === 'program') {

                        self.cancelDelete();

                    } else {

                        self.deletionTarget = {
                            'collection': targetCollection,
                            'feature': obj
                        };

                    }

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function(featureType, index) {

                    console.log('self.deleteFeature', featureType, index);

                    var targetCollection;

                    switch (featureType) {

                        case 'project':

                            targetCollection = Project;

                            break;

                        default:

                            targetCollection = Program;

                            break;

                    }

                    targetCollection.delete({
                        id: +self.deletionTarget.feature.id
                    }).$promise.then(function(data) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                        if (index !== null &&
                            typeof index === 'number' &&
                            featureType === 'report') {

                            self.program.readings_custom.splice(index, 1);

                            self.cancelDelete();

                            $timeout(self.closeAlerts, 2000);

                            if (index === 0) {

                                $route.reload();

                            }

                        } else {

                            $timeout(closeRoute, 2000);

                        }

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete this ' + featureType + '. There are pending tasks affecting this feature.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this ' + featureType + '.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(self.closeAlerts, 2000);

                    });

                };

                self.loadProgram = function() {

                    program.$promise.then(function(successResponse) {

                        console.log('self.program', successResponse);

                        self.program = successResponse;

                        $rootScope.program = successResponse;

                        $rootScope.page.title = self.program.name ? self.program.name : 'Un-named Program';

                        self.status.loading = false;

                        self.loadProgramMetrics();

                        self.loadPracticeType();

                    }, function(errorResponse) {



                    });

                };

                self.loadProgramMetrics = function() {

                    console.log("loadProgramMetrics");

                    Program.metrics({
                        id: self.program.id
                    }).$promise.then(function(successResponse) {

                        console.log('Metric Types', successResponse);

                        self.metricsTypes = successResponse.features;

                        self.metricCount = self.metricsTypes.length;

                        console.log("self.metricCount", self.metricCount);

                        self.showElements();

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.showElements();

                    });

                };

                self.loadPracticeType = function() {

                    PracticeType.getSingle({
                        id: self.practiceTypeId,
                        program: self.program.id
                    }).$promise.then(function(successResponse) {

                        console.log('practiceType', successResponse);

                        self.practiceType = successResponse;

                        self.metricMatrix = successResponse.metrics;

                        self.showElements();

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.showElements();

                    });

                };

                /*START LOAD PROGRAM METRICS
                    this is for search. We want a list of all metrics to add
                    to th practice type. This makes a list object that we need
                    to maintain (ie remove add list items from
                */

                self.loadProgramMetrics = function() {

                    console.log("loadProgramMetrics");

                    Program.metrics({
                        id: self.program.id
                    }).$promise.then(function(successResponse) {

                        console.log('Metric Types', successResponse);

                        self.metricTypes = successResponse.features;

                        self.metricCount = self.metricTypes.length;

                        console.log("self.metricCount", self.metricCount);

                        self.showElements();

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.showElements();

                    });

                };

                self.addMetric = function($item, $model, $label) {

                    self.metricType = undefined;

                    self.metricMatrix.push($item);

                    console.log("addMetric $item", $item);

                    self.saveMetric($item);

                };

                self.saveMetric = function(metricType) {

                    PracticeType.addMetric({
                        id: self.practiceType.id,
                        metricId: $item.id,
                        program: self.program.id
                    }).$promise.then(function(successResponse) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Target changes saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.status.processing = false;

                        console.log("practice.updateMatrix", successResponse);

                    }).catch(function(error) {

                        console.log('updateMatrix.error', error);

                        // Do something with the error

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Something went wrong and the changes were not saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.status.processing = false;

                    });

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0],
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: true
                        };

                        self.loadProgram();

                    });
                }

            }
        ]);

}());
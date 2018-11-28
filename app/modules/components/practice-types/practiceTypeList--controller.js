'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeTypeListController',
        function(Account, $location, $log, PracticeType,
            practiceTypes, $rootScope, $route, $scope, user,
            $interval, $timeout, Utility) {

            var self = this;

            self.programId = $route.current.params.programId;

            $rootScope.viewState = {
                'practice': true
            };

            //
            // Setup basic page variables
            //
            $rootScope.page = {
                title: 'Practice Types'
            };

            self.status = {
                loading: true
            };

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                }, 1000);

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            self.confirmDelete = function(obj) {

                self.deletionTarget = obj;

            };

            self.cancelDelete = function() {

                self.deletionTarget = null;

            };

            self.deleteFeature = function(obj, index) {

                PracticeType.delete({
                    id: obj.id
                }).$promise.then(function(data) {

                    self.deletionTarget = null;

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully deleted this practice.',
                        'prompt': 'OK'
                    }];

                    self.practices.splice(index, 1);

                    $timeout(closeAlerts, 2000);

                }).catch(function(errorResponse) {

                    console.log('self.deleteFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to delete “' + obj.name + '”. There are pending tasks affecting this practice.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to delete this practice.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to delete this practice.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };

            self.createPracticeType = function() {

                self.practiceType = new PracticeType({
                    'program_id': self.programId,
                    'organization_id': $rootScope.user.properties.organization_id
                });

                self.practiceType.$save(function(successResponse) {

                    $location.path('/practice-types/' + successResponse.id + '/edit');

                }, function(errorResponse) {

                    console.error('Unable to create a new practice type, please try again later.');

                });

            };

            self.buildFilter = function() {

                var params = $location.search(),
                    data = {};

                if ($rootScope.programContext !== null &&
                    typeof $rootScope.programContext !== 'undefined') {

                    data.program = $rootScope.programContext;

                    $location.search('program', $rootScope.programContext);

                } else if (params.program !== null &&
                    typeof params.program !== 'undefined') {

                    data.program = params.program;

                    $rootScope.programContext = params.program;

                } else if (self.selectedProgram &&
                    typeof self.selectedProgram.id !== 'undefined' &&
                    self.selectedProgram.id > 0) {

                    data.program = self.selectedProgram.id;

                    $location.search('program', self.selectedProgram.id);

                } else {

                    $location.search({});

                }

                return data;

            };

            self.loadFeatures = function() {

                var params = self.buildFilter();

                PracticeType.collection(params).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.practices = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken()
                    };

                    self.loadFeatures();

                });

            } else {

                $location.path('/login');

            }

        });
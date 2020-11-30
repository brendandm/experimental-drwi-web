(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:LayerListController
     * @description
     */
    angular.module('FieldDoc')
        .controller('LayerCreateController',
            function(Account, $location, $window, $timeout, $rootScope, $scope,
                $route, geographies, user, Utility, LayerService, $interval,
                Shapefile, LayerType, Task) {

                var self = this;

                $rootScope.viewState = {
                    'layer': true
                };

                $rootScope.page = {};

                self.status = {
                    loading: true,
                    processing: false
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                self.searchGroups = function(value) {

                    return LayerType.collection({
                        q: value
                    }).$promise.then(function(response) {

                        console.log('SearchService response', response);

                        response.features.forEach(function(result) {

                            result.category = null;

                        });

                        return response.features.slice(0, 5);

                    });

                };

                self.loadGroups = function(value) {

                    LayerType.collection({
                        sort: 'name:desc'
                    }).$promise.then(function(response) {

                        console.log('LayerType.collection response', response);

                        response.features.forEach(function(result) {

                            result.category = null;

                        });

                        self.layerGroups = response.features;

                        // return response.features.slice(0, 5);

                    });

                };

                self.uploadCollection = function() {

                    if (!self.fileImport ||
                        !self.fileImport.length) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Please select a file.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        return false;

                    }

                    if (self.fileImport) {

                        var fileData = new FormData();

                        fileData.append('file', self.fileImport[0]);

                        if (self.group) {

                            if (self.group.id) {

                                fileData.append('group', self.group.id);

                            } else if (typeof self.group === 'string') {

                                fileData.append('group', self.group);

                            }

                        }

                        if (self.program && self.program.id) {

                            fileData.append('program', self.program.id);

                        }

                        fileData.append('persist', true);

                        console.log('fileData', fileData);

                        $window.scrollTo(0, 0);

                        Shapefile.upload({}, fileData, function(successResponse) {

                            console.log('successResponse', successResponse);

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Upload complete. Processing data...',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                            if (successResponse.task) {

                                self.pendingTasks = [
                                    successResponse.task
                                ];

                            }

                            $location.path('/geographies');

                        }, function(errorResponse) {

                            console.log('Upload error', errorResponse);

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'The file could not be processed.',
                                'prompt': 'OK'
                            }];

                            $timeout(closeAlerts, 2000);

                        });

                    }

                };

                self.extractPrograms = function(user) {

                    var _programs = [];

                    user.programs.forEach(function(program) {

                        _programs.push(program.properties);

                    });

                    return _programs;

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {};

                        self.programs = self.extractPrograms($rootScope.user);

                        if ($rootScope.user.programs.length) {

                            self.selectedProgram = $rootScope.user.programs[0];

                        }

                        self.loadGroups();

                    });

                }

            });

})();
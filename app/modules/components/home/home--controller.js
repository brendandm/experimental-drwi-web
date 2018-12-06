(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('HomeController', [
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
            'programs',
            'projects',
            function(Account, $location, $timeout, $log, $rootScope,
                $route, Utility, user, $window, Program, Project, programs,
                projects) {

                var self = this;

                $rootScope.viewState = {
                    'home': true
                };

                $rootScope.page = {};

                self.status = {
                    loading: true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

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

                        case 'program':

                            targetCollection = Program;

                            break;

                        default:

                            targetCollection = Project;

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
                            typeof index === 'number') {

                            if (featureType === 'program') {

                                self.programs.splice(index, 1);

                            } else {

                                self.projects.splice(index, 1);

                            }

                            self.cancelDelete();

                            $timeout(closeAlerts, 2000);

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

                        $timeout(closeAlerts, 2000);

                    });

                };

                self.buildStaticMapURL = function(geometry) {

                    var styledFeature = {
                        "type": "Feature",
                        "geometry": geometry,
                        "properties": {
                            "marker-size": "small",
                            "marker-color": "#2196F3",
                            "stroke": "#2196F3",
                            "stroke-opacity": 1.0,
                            "stroke-width": 2,
                            "fill": "#2196F3",
                            "fill-opacity": 0.5
                        }
                    };

                    // Build static map URL for Mapbox API

                    return [
                        'https://api.mapbox.com/styles/v1',
                        '/mapbox/streets-v10/static/geojson(',
                        encodeURIComponent(JSON.stringify(styledFeature)),
                        ')/auto/400x200@2x?access_token=',
                        'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                    ].join('');

                };

                self.loadPrograms = function() {

                    programs.$promise.then(function(successResponse) {

                        console.log('self.program', successResponse);

                        self.programs = successResponse.features;

                        self.status.loading = false;

                    }, function(errorResponse) {

                        self.status.loading = false;

                    });

                };

                self.loadProjects = function() {

                    projects.$promise.then(function(successResponse) {

                        console.log('self.program', successResponse);

                        successResponse.features.forEach(function(feature) {

                            if (feature.extent) {

                                feature.staticURL = self.buildStaticMapURL(feature.extent);

                            }

                        });

                        self.projects = successResponse.features;

                        self.status.loading = false;

                    }, function(errorResponse) {

                        self.status.loading = false;

                    });

                };

                self.createProgram = function() {

                    var newProgram = new Program({
                        'organization_id': $rootScope.user.properties.organization_id
                    });

                    newProgram.$save(function(successResponse) {

                        $location.path('/programs/' + successResponse.id + '/edit');

                    }, function(errorResponse) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to create a new program.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

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

                        self.loadPrograms();

                        self.loadProjects();

                    }).catch(function(errorResponse) {

                        $location.path('/login');

                    });

                } else {

                    $location.path('/login');

                }

            }

        ]);

}());
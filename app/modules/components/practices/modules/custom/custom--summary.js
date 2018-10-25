(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomSummaryController',
            function(Account, $location, $timeout, $log, PracticeCustom,
                $rootScope, $route, $scope, summary, Utility, user, Project, Site,
                $window, Map, mapbox, leafletData, leafletBoundsHelpers, Practice) {

                var self = this,
                    projectId = $route.current.params.projectId,
                    siteId = $route.current.params.siteId,
                    practiceId = $route.current.params.practiceId;

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.practiceType = null;

                self.project = {
                    'id': projectId
                };

                self.map = Map;

                self.status = {
                    loading: true
                };

                self.actions = {
                    print: function() {

                        $window.print();

                    },
                    saveToPdf: function() {

                        $scope.$emit('saveToPdf');

                    }
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    var parentPath = '/sites/' + self.data.site.id;

                    $location.path(parentPath);

                }

                self.confirmDelete = function(obj) {

                    console.log('self.confirmDelete', obj);

                    self.deletionTarget = self.deletionTarget ? null : obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.deleteFeature = function() {

                    Practice.delete({
                        id: +self.deletionTarget.id
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this practice.',
                            'prompt': 'OK'
                        });

                        $timeout(closeRoute, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.name + '”. There are pending tasks affecting this practice.',
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

                //draw tools
                function addNonGroupLayers(sourceLayer, targetGroup) {
                    if (sourceLayer instanceof L.LayerGroup) {
                        sourceLayer.eachLayer(function(layer) {
                            addNonGroupLayers(layer, targetGroup);
                        });
                    } else {
                        targetGroup.addLayer(sourceLayer);
                    }
                }

                self.setGeoJsonLayer = function(data, layerGroup, clearLayers) {

                    if (clearLayers) {

                        layerGroup.clearLayers();

                    }

                    var featureGeometry = L.geoJson(data, {});

                    addNonGroupLayers(featureGeometry, layerGroup);

                };
                //Temp change loading to "loading"

                summary.$promise.then(function(successResponse) {

                    self.data = successResponse;

                    console.log('self.summary', successResponse);

                    self.summary = successResponse;

                    //
                    // Determine if the actions should be shown or hidden depending on
                    // whether of not this practice has planning data
                    //
                    if (self.summary.practice.properties.has_planning_data) {
                        $rootScope.page.hideActions = false;
                    } else {
                        $rootScope.page.hideActions = true;
                    }

                    $rootScope.page.title =
                        "Other Conservation Practice";

                    self.practiceType = Utility.machineName(self.summary
                        .practice.properties.practice_type);

                    if (self.summary.practice.geometry !== null &&
                        typeof self.summary.practice.geometry !== 'undefined') {

                        leafletData.getMap('practice--map').then(function(map) {

                            self.practiceExtent = new L.FeatureGroup();

                            self.setGeoJsonLayer(self.summary.practice.geometry, self.practiceExtent);

                            map.fitBounds(self.practiceExtent.getBounds(), {
                                // padding: [20, 20],
                                maxZoom: 18
                            });
                        });
                        self.map.geojson = {
                            data: self.summary.practice.geometry
                        };
                    }

                    self.status.loading = false;
                }, function() {});

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject =
                            userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[
                                0].properties.name,
                            account: ($rootScope.account &&
                                    $rootScope.account.length) ?
                                $rootScope.account[0] : null,
                            can_edit: true
                        };
                    });
                }

                self.addReading = function(measurementPeriod) {

                    var newReading = new PracticeCustom({
                        'measurement_period': 'Planning',
                        'report_date': new Date(),
                        'practice_id': practiceId,
                        'organization_id': self.summary.site.properties
                            .project.properties.organization_id
                    });

                    newReading.$save().then(function(successResponse) {
                        $location.path('/projects/' + projectId +
                            '/sites/' + siteId +
                            '/practices/' + practiceId +
                            '/' + self.practiceType + '/' +
                            successResponse.id + '/edit');
                    }, function(errorResponse) {
                        console.error('ERROR: ', errorResponse);
                    });
                };

            });

}());
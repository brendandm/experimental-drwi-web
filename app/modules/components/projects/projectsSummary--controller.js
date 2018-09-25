'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
    .controller('ProjectSummaryCtrl', function(Account, Notifications, $rootScope, Project, $route,
        $scope, $location, Map, mapbox, summary, Site, user, $window, leafletData, leafletBoundsHelpers) {

        //controller is set to self
        var self = this;

        $rootScope.page = {};

        self.map = Map;

        self.map.markers = {};

        console.log('self.map', self.map);

        self.status = {
            "loading": true
        }

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

        //
        // Assign project to a scoped variable
        //
        summary.$promise.then(function(successResponse) {

            console.log('projectSummary', successResponse);

            self.data = successResponse;
            self.project = successResponse.project;

            self.sites = successResponse.sites;

            self.practices = successResponse.practices;

            //
            // Add rollups to the page scope
            //
            self.rollups = successResponse.rollups;

            self.status.loading = false;

            $rootScope.page.title = 'Project Summary';

            $rootScope.page.links = [{
                    text: 'Projects',
                    url: '/projects'
                },
                {
                    text: self.project.properties.name,
                    url: '/projects/' + $route.current.params.projectId,
                    type: 'active'
                }
            ];

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {
                user.$promise.then(function(userResponse) {
                    $rootScope.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0].properties.name,
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: Account.canEdit(self.project),
                        is_manager: (Account.hasRole('manager') || Account.inGroup(self.project.properties.organization_id, Account.userObject.properties.account)),
                        is_admin: Account.hasRole('admin')
                    };
                });
            }

            leafletData.getMap('project--map').then(function(map) {

                var southWest = L.latLng(25.837377, -124.211606),
                    northEast = L.latLng(49.384359, -67.158958),
                    bounds = L.latLngBounds(southWest, northEast);

                self.projectExtent = new L.FeatureGroup();

                if (self.project.properties.extent) {

                    self.setGeoJsonLayer(self.project.properties.extent, self.projectExtent);

                    map.fitBounds(self.projectExtent.getBounds(), {
                        // padding: [20, 20],
                        maxZoom: 18
                    });

                } else {

                    map.fitBounds(bounds, {
                        // padding: [20, 20],
                        maxZoom: 18
                    });

                }

                self.projectExtent.clearLayers();

                self.sites.forEach(function(feature) {

                    if (feature.site.geometry) {

                        self.setGeoJsonLayer(feature.site.geometry, self.projectExtent);

                    }

                });

                map.fitBounds(self.projectExtent.getBounds(), {
                    // padding: [20, 20],
                    maxZoom: 18
                });

                self.projectExtent.addTo(map);

            });

        });

        self.submitProject = function() {

            if (!self.project.properties.organization_id) {
                $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
                return;
            }

            var _project = new Project({
                "id": self.project.id,
                "properties": {
                    "workflow_state": "Submitted"
                }
            })

            _project.$update(function(successResponse) {
                self.project = successResponse
            }, function(errorResponse) {

            });
        }

        self.fundProject = function() {

            if (!self.project.properties.organization_id) {
                $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
                return;
            }

            var _project = new Project({
                "id": self.project.id,
                "properties": {
                    "workflow_state": "Funded"
                }
            })

            _project.$update(function(successResponse) {
                self.project = successResponse
            }, function(errorResponse) {

            });
        }

        self.completeProject = function() {

            if (!self.project.properties.organization_id) {
                $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
                return;
            }

            var _project = new Project({
                "id": self.project.id,
                "properties": {
                    "workflow_state": "Completed"
                }
            })

            _project.$update(function(successResponse) {
                self.project = successResponse
            }, function(errorResponse) {

            });
        }

        self.rollbackProjectSubmission = function() {
            var _project = new Project({
                "id": self.project.id,
                "properties": {
                    "workflow_state": "Draft"
                }
            })

            _project.$update(function(successResponse) {
                self.project = successResponse
            }, function(errorResponse) {

            });
        }

        self.createSite = function() {
            self.site = new Site({
                'name': 'Untitled Site',
                'project_id': self.project.id,
                'organization_id': self.project.properties.organization_id
            });

            self.site.$save(function(successResponse) {
                $location.path('/projects/' + self.project.id + '/sites/' + successResponse.id + '/edit');
            }, function(errorResponse) {
                console.error('Unable to create your site, please try again later');
            });
        };

        //
        // Setup basic page variables
        //
        $rootScope.page.actions = [{
                type: 'button-link',
                action: function() {
                    $window.print();
                },
                hideIcon: true,
                text: 'Print'
            },
            {
                type: 'button-link',
                action: function() {
                    $scope.$emit('saveToPdf');
                },
                hideIcon: true,
                text: 'Save as PDF'
            },
            {
                type: 'button-link new',
                action: function() {
                    self.createSite();
                },
                text: 'Create site'
            }
        ];

        // leafletData.getMap('dashboard--map').then(function(map) {

        //     var southWest = L.latLng(25.837377, -124.211606),
        //         northEast = L.latLng(49.384359, -67.158958),
        //         bounds = L.latLngBounds(southWest, northEast);

        //     map.fitBounds(bounds, {
        //         padding: [20, 20],
        //         maxZoom: 18
        //     });

        // });

    });
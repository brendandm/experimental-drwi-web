(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteSummaryCtrl
     * @description
     */
    angular.module('FieldDoc')
        .controller('SiteSummaryCtrl', function(Account, $location, Practice, project,
            $rootScope, $route, summary, nodes, user, Utility, Map, mapbox, leafletData, leafletBoundsHelpers) {

            var self = this;

            $rootScope.page = {};

            self.map = Map;
            //self.mapbox = mapbox;

            self.status = {
                "loading": true
            }

            //draw tools
            function addNonGroupLayers(sourceLayer, targetGroup) {
                if (sourceLayer instanceof L.LayerGroup) {
                    sourceLayer.eachLayer(function (layer) {
                        addNonGroupLayers(layer, targetGroup);
                    });
                } else {
                    targetGroup.addLayer(sourceLayer);
                }
            }

            self.setGeoJsonLayer = function (data, layerGroup, clearLayers) {

                if (clearLayers) {

                    layerGroup.clearLayers();

                }

                var featureGeometry = L.geoJson(data, {});

                addNonGroupLayers(featureGeometry, layerGroup);

            };


            self.cleanName = function(string_) {
                return Utility.machineName(string_);
            };

            summary.$promise.then(function(successResponse) {

                console.log('self.summary', successResponse);

                self.data = successResponse;

                self.site = successResponse.site;
                self.practices = successResponse.practices;

                //
                // Add rollups to the page scope
                //
                self.rollups = successResponse.rollups;

                //
                // Set the default tab to "All"
                //
                self.rollups.active = "all";

                self.status.loading = false;

                //
                // Load spatial nodes
                //

                nodes.$promise.then(function(successResponse) {

                    self.nodes = successResponse;

                }, function(errorResponse) {

                });

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.project = project;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: Account.canEdit(self.project)
                        };

                        $rootScope.page.title = self.site.properties.name;
                        $rootScope.page.links = [{
                                text: 'Projects',
                                url: '/projects'
                            },
                            {
                                text: self.site.properties.project.properties.name,
                                url: '/projects/' + $route.current.params.projectId
                            },
                            {
                                text: self.site.properties.name,
                                url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id,
                                type: 'active'
                            }
                        ];

                    });
                    //
                    // If a valid site geometry is present, add it to the map
                    // and track the object in `self.savedObjects`.
                    //

                    if (self.site.geometry !== null &&
                        typeof self.site.geometry !== 'undefined') {

                        leafletData.getMap('site--map').then(function (map) {

                        self.siteExtent = new L.FeatureGroup();

                        self.setGeoJsonLayer(self.site.geometry, self.siteExtent);

                        map.fitBounds(self.siteExtent.getBounds(), {
                                // padding: [20, 20],
                            maxZoom: 22
                        });
                    });
                    self.map.geojson = {
                        data:self.site.geometry
                    };
                    }
                }

            }, function(errorResponse) {

            });

            self.createPractice = function() {

                self.practice = new Practice({
                    'practice_type': 'Custom',
                    'site_id': self.site.id,
                    'organization_id': self.site.properties.project.properties.organization_id
                });

                self.practice.$save(function(successResponse) {
                    $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
                }, function(errorResponse) {
                    console.error('Unable to create your practice, please try again later');
                });

            };

            //
            // Setup basic page variables
            //
            $rootScope.page.actions = [{
                    type: 'button-link',
                    action: function() {
                        $location.path('/projects/' + $route.current.params.projectId + '/sites/' + $route.current.params.siteId + '/edit');
                    },
                    text: 'Edit Site'
                },
                {
                    type: 'button-link new',
                    action: function() {
                        self.createPractice();
                    },
                    text: 'Create practice'
                }
            ];


        });

})();
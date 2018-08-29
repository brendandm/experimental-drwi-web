'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardCtrl', function(Account, $location, $log, Project, Map,
        projects, $rootScope, $scope, Site, user, leafletData, leafletBoundsHelpers,
        MetricService, OutcomeService, ProjectStore, FilterStore, geographies, mapbox) {

        $scope.filterStore = FilterStore;

        $scope.projectStore = ProjectStore;

        var self = this;

        self.activeTab = 'metric';

        self.cardTpl = {
            project: null,
            heading: 'Delaware River Watershed Initiative',
            yearsActive: '2013 - 2018',
            funding: '$2.65 million',
            url: 'https://4states1source.org',
            resourceUrl: null,
            linkTarget: '_blank',
            description: 'The Delaware River Watershed Initiative is a cross-cutting collaboration working to conserve and restore the streams that supply drinking water to 15 million people in New York, New Jersey, Pennsylvania and Delaware.',
        };

        self.card = self.cardTpl;

        self.dashboardFilters = {
            geographies: [],
            grantees: [],
            practices: []
        };

        self.map = Map;

        self.map.layers = {
            baselayers: {
                streets: {
                    name: 'Streets',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                terrain: {
                    name: 'Terrain',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.run-bike-hike',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                },
                satellite: {
                    name: 'Satellite',
                    type: 'xyz',
                    url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                    layerOptions: {
                        apikey: mapbox.access_token,
                        mapid: 'mapbox.streets-satellite',
                        attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                    }
                }
            }
        };

        self.map.markers = {};

        self.map.layers.overlays = {
            projects: {
                type: 'group',
                name: 'projects',
                visible: true,
                layerOptions: {
                    showOnSelector: false
                },
                layerParams: {
                    showOnSelector: false
                }
            }
        };

        console.log('self.map', self.map);

        self.popupTemplate = function(feature) {

            return '<div class=\"project--popup\">' +
                '<div class=\"marker--title border--right\">' + feature.name + '</div>' +
                '<a href=\"projects/' + feature.id + '\">' +
                '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                '</a>' +
                '</div>';

        };

        self.processLocations = function(features) {

            self.map.markers = {};

            features.forEach(function(feature) {

                var centroid = feature.centroid;

                console.log('centroid', centroid);

                if (centroid) {

                    self.map.markers['project_' + feature.id] = {
                        lat: centroid.coordinates[1],
                        lng: centroid.coordinates[0],
                        layer: 'projects',
                        focus: false,
                        icon: {
                            type: 'div',
                            className: 'project--marker',
                            iconSize: [24, 24],
                            popupAnchor: [-2, -10],
                            html: ''
                        },
                        message: self.popupTemplate(feature)
                    };

                }

            });

            console.log('self.map.markers', self.map.markers);

        };

        self.resetMapExtent = function() {

            leafletData.getMap('dashboard--map').then(function(map) {

                leafletData.getLayers('dashboard--map').then(function(layers) {

                    console.log('leafletData.getLayers', layers);

                    map.removeLayer(layers.baselayers.satellite);

                    map.removeLayer(layers.baselayers.terrain);

                    map.addLayer(layers.baselayers.streets);

                });

                leafletData.getGeoJSON('dashboard--map').then(function(geoJsonLayer) {

                    console.log('geoJsonLayer', geoJsonLayer);

                    map.fitBounds(geoJsonLayer.getBounds(), {
                        maxZoom: 18
                    });

                });

            });

        };

        self.setMapBoundsToFeature = function(feature) {

            var geoJsonLayer = L.geoJson(feature, {});

            leafletData.getMap('dashboard--map').then(function(map) {

                map.fitBounds(geoJsonLayer.getBounds(), {
                    maxZoom: 18
                });

            });

        };

        //
        // Load custom geographies
        //

        function onEachFeature(feature, layer) {

            console.log('onEachFeature', feature, layer);

            var popup;

            layer.on({

                click: function() {

                    console.log(layer.feature.properties.name);

                    self.setMapBoundsToFeature(layer.feature);

                    self.setGeoFilter(layer.feature.properties);

                },
                mouseover: function(event) {

                    console.log('onEachFeature.mouseover', event);

                    console.log(layer.feature.properties.name);

                    self.removeMarkerPopups();

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                        popup = L.popup()
                            .setLatLng(event.latlng)
                            .setContent('<div class=\"marker--title\">' + feature.properties.name + '</div>');

                        popup.openOn(map);

                    });

                },
                mouseout: function() {

                    console.log(layer.feature.properties.name);

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                    });

                }

            });
        }

        geographies.$promise.then(function(successResponse) {

            console.log('geographies.successResponse', successResponse);

            self.map.geojson = {
                data: successResponse,
                onEachFeature: onEachFeature,
                style: {
                    color: '#00D',
                    fillColor: 'red',
                    weight: 2.0,
                    opacity: 0.6,
                    fillOpacity: 0.2
                }
            };

            //
            // Fit map bounds to GeoJSON
            //

            self.resetMapExtent();

        }, function(errorResponse) {

            console.log('errorResponse', errorResponse);

        });

        self.extractIds = function(arr) {

            var projectIds = [];

            arr.forEach(function(datum) {

                projectIds.push(datum.id);

            });

            return projectIds.join(',');

        };

        self.loadMetrics = function(arr) {

            //
            // A program (account) identifier
            // is required by default.
            //

            var params = {
                id: 3
            };

            //
            // If the `arr` parameter is valid,
            // constrain the query to the given
            // set of numeric project identifiers.
            //

            if (arr && arr.length) {

                params.projects = self.extractIds(arr);

            }

            MetricService.query(params).$promise.then(function(successResponse) {

                console.log('granteeResponse', successResponse);

                self.metrics = successResponse.features;

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadOutcomes = function(arr) {

            //
            // A program (account) identifier
            // is required by default.
            //

            var params = {
                id: 3
            };

            //
            // If the `arr` parameter is valid,
            // constrain the query to the given
            // set of numeric project identifiers.
            //

            if (arr && arr.length) {

                params.projects = self.extractIds(arr);

            }

            OutcomeService.query(params).$promise.then(function(successResponse) {

                console.log('granteeResponse', successResponse);

                self.outcomes = successResponse;

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        //
        // Setup basic page variables
        //
        $rootScope.page = {
            title: 'Dashboard'
        };

        //
        // Project functionality
        //

        self.projects = projects;

        console.log('self.projects', self.projects);

        projects.$promise.then(function(successResponse) {

            console.log('successResponse', successResponse);

            $scope.projectStore.setProjects(successResponse.features);

            self.filteredProjects = $scope.projectStore.filteredProjects;

            self.processLocations(successResponse.features);

            leafletData.getMap('dashboard--map').then(function(map) {

                map.on('zoomend', function(event) {

                    var zoomLevel = map.getZoom();

                    leafletData.getLayers('dashboard--map').then(function(layers) {

                        console.log('leafletData.getLayers', layers);

                        if (zoomLevel > 15) {

                            map.removeLayer(layers.baselayers.streets);

                            map.removeLayer(layers.baselayers.terrain);

                            map.addLayer(layers.baselayers.satellite);

                        } else {

                            map.removeLayer(layers.baselayers.satellite);

                            map.removeLayer(layers.baselayers.terrain);

                            map.addLayer(layers.baselayers.streets);

                        }

                    });

                });

            });

        }, function(errorResponse) {

            console.log('errorResponse', errorResponse);

        });

        self.search = {
            query: '',
            execute: function(page) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //

                var q = {
                    filters: [{
                        'and': [{
                            name: 'name',
                            op: 'ilike',
                            val: '%' + self.search.query + '%'
                        }]
                    }],
                    order_by: [{
                        field: 'created_on',
                        direction: 'desc'
                    }]
                };

                if (self.filters.active.workflow_state !== null) {
                    console.log('add workflow state filter');

                    q.filters.push({
                        'name': 'workflow_state',
                        'op': 'like',
                        'val': self.filters.active.workflow_state
                    });
                }

                if (self.filters.active.year && self.filters.active.year.year) {
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'gte',
                        'val': self.filters.active.year.year + '-01-01'
                    });
                    q.filters.push({
                        'name': 'created_on',
                        'op': 'lte',
                        'val': self.filters.active.year.year + '-12-31'
                    });
                }

                Project.query({
                    'q': q,
                    'page': (page ? page : 1)
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.projects = successResponse;

                    // self.projects.features.forEach(function(feature) {

                    // var centroid = feature.properties.centroid;

                    // console.log('centroid', centroid);

                    // if (centroid) {

                    // self.map.markers['project_' + feature.id] = {
                    // lat: centroid.coordinates[1],
                    // lng: centroid.coordinates[0],
                    // layer: 'projects'
                    // };

                    // }

                    // });

                    // console.log('self.map.markers', self.map.markers);

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            },
            paginate: function(pageNumber) {

                //
                // Get all of our existing URL Parameters so that we can
                // modify them to meet our goals
                //
                self.search.execute(pageNumber);
            },
            clear: function() {

                // $location.path('/projects/').search('');

                self.q = {};

                self.filteredProjects = self.projects;

                self.processLocations(self.filteredProjects);

            }
        };

        //
        // Set Default Search Filter value
        //
        if (self.search && self.search.query === '') {

            var searchParams = $location.search(),
                q = angular.fromJson(searchParams.q);

            if (q && q.filters && q.filters.length) {
                angular.forEach(q.filters[0].and, function(filter) {
                    if (filter.name === 'name') {
                        self.search.query = filter.val.replace(/%/g, '');
                    }
                });
            }
        }

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {
                $rootScope.user = Account.userObject = userResponse;
                self.permissions = {
                    isLoggedIn: Account.hasToken()
                };
            });

            self.loadOutcomes();

            self.loadMetrics();

        } else {

            $location.path('/user/logout');

        }

        self.removeMarkerPopups = function() {

            for (var key in self.map.markers) {

                if (self.map.markers.hasOwnProperty(key)) {

                    self.map.markers[key].focus = false;

                }

            }

        };

        self.setMarkerFocus = function(feature) {

            var markerId = 'project_' + feature.id,
                marker = self.map.markers[markerId];

            self.removeMarkerPopups();

            if (marker) {

                self.map.markers[markerId].focus = true;

            }

            console.log('setMarkerFocus', markerId, self.map.markers[markerId]);

        };

        self.clearMarkerFocus = function(feature) {

            var markerId = 'project_' + feature.id,
                marker = self.map.markers[markerId];

            if (marker) {

                self.map.markers[markerId].focus = false;

            }

            console.log('clearMarkerFocus', markerId, self.map.markers[markerId]);

        };

        self.setProjectFilter = function(obj) {

            //
            // Fit map bounds to GeoJSON
            //

            var feature = {
                type: 'Feature',
                properties: obj,
                geometry: obj.extent
            };

            self.setMapBoundsToFeature(feature);

            // leafletData.getMap('dashboard--map').then(function(map) {

            //     leafletData.getLayers('dashboard--map').then(function(layers) {

            //         console.log('leafletData.getLayers', layers);

            //         map.removeLayer(layers.baselayers.streets);

            //         map.removeLayer(layers.baselayers.terrain);

            //         map.addLayer(layers.baselayers.satellite);

            //     });

            // });

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'project'
            };

            FilterStore.addItem(_filterObject);

            ProjectStore.filterAll(FilterStore.index);

            self.loadMetrics([
                obj
            ]);

            self.loadOutcomes([
                obj
            ]);

            //
            // Display filter controls
            //

            self.showFilters = true;

        };

        self.setGeoFilter = function(obj) {

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'geography'
            };

            FilterStore.addItem(_filterObject);

            ProjectStore.filterAll(FilterStore.index);

            //
            // Display filter controls
            //

            self.showFilters = true;

        };

        self.setTab = function(obj) {

            self.activeTab = obj;

        };

        self.clearFilter = function(obj) {

            FilterStore.clearItem(obj);

            self.resetMapExtent();

            self.card = self.cardTpl;

        };

        $scope.$watch('filterStore.index', function(newVal) {

            console.log('Updated filterStore', newVal);

            self.activeFilters = newVal;

            ProjectStore.filterAll(newVal);

        });

        $scope.$watch('projectStore.filteredProjects', function(newVal) {

            console.log('Updated projectStore', newVal);

            self.filteredProjects = newVal;

            self.processLocations(newVal);

            self.loadMetrics(newVal);

            self.loadOutcomes(newVal);

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.click', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.click', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project);

            self.card = {
                project: project,
                heading: project.name,
                yearsActive: '2018',
                funding: '$100k',
                url: 'projects/' + project.id,
                description: project.description,
                linkTarget: '_self'
            };

            self.setProjectFilter(project);

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.mouseover', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.mouseover', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project);

            // self.card = {
            //     project: project,
            //     heading: project.name,
            //     yearsActive: '2018',
            //     funding: '$100k',
            //     url: 'projects/' + project.id,
            //     description: project.description,
            //     linkTarget: '_self'
            // };

        });

        // $scope.$on('leafletDirectiveGeoJson.mouseover', function(event, args) {

        //     console.log('leafletDirectiveGeoJson.mouseover', event, args);

        //     // self.card = self.cardTpl;

        // });

        // $scope.$on('leafletDirectiveMarker.dashboard--map.mouseout', function(event, args) {

        //     console.log('leafletDirectiveMarker.dashboard--map.click', event, args);

        //     self.card = self.cardTpl;

        // });

    });
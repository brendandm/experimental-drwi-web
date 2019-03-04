'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardController', function(Account, $location, $log, $interval, $timeout, Project, Map,
        baseProjects, $rootScope, $scope, Site, leafletData, leafletBoundsHelpers,
        MetricService, OutcomeService, ProjectStore, FilterStore, geographies, mapbox,
        Practice, GeographyService, dashboard, $routeParams, Dashboard, Utility, user) {

        $scope.filterStore = FilterStore;

        FilterStore.clearAll();

        // $scope.projectStore = ProjectStore;

        var self = this;

        self.status = {
            loading: true
        };

        self.fillMeter = undefined;

        self.showProgress = function() {

            self.progressMessage = 'Loading dashboard data\u2026';

            self.fillMeter = $interval(function() {

                var tempValue = (self.progressValue || 10) * Utility.meterCoefficient();

                if (!self.progressValue) {

                    self.progressValue = tempValue;

                } else if ((100 - tempValue) > self.progressValue) {

                    self.progressValue += tempValue;

                } else {

                    $interval.cancel(self.fillMeter);

                    self.fillMeter = undefined;

                    self.progressValue = 100;

                    self.showElements(1000, self.filteredProjects, self.progressValue);

                }

                console.log('progressValue', self.progressValue);

            }, 50);

        };

        self.showElements = function(delay, object, progressValue) {

            if (object && progressValue > 90) {

                self.progressMessage = 'Rendering\u2026';

                $timeout(function() {

                    self.status.loading = false;

                    self.progressValue = 0;

                }, delay);

            }

        };

        //
        // Setup basic page variables
        //
        $rootScope.page = {
            title: 'Dashboard'
        };

        self.activeTab = {
            collection: 'metric'
        };

        self.cardTpl = {};

        self.card = {};

        // self.cardTpl = {
        //     featureType: 'program',
        //     featureTabLabel: 'Projects',
        //     feature: null,
        //     heading: 'Delaware River Watershed Initiative',
        //     yearsActive: '2013 - 2018',
        //     funding: '$2.65 million',
        //     url: 'https://4states1source.org',
        //     resourceUrl: null,
        //     linkTarget: '_blank',
        //     description: 'The Delaware River Watershed Initiative is a cross-cutting collaboration working to conserve and restore the streams that supply drinking water to 15 million people in New York, New Jersey, Pennsylvania and Delaware.',
        // };

        // self.card = self.cardTpl;

        self.historyItem = null;

        self.historyIndex = [];

        self.project = {};

        self.map = JSON.parse(JSON.stringify(Map));

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

            self.map.geojson.data = self.geographies;

            leafletData.getMap('dashboard--map').then(function(map) {

                map.closePopup();

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

            console.log('setMapBoundsToFeature', feature);

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

                    if (layer.feature.properties.feature_type === 'site') {

                        self.activeSite = feature;

                        self.card = {
                            featureType: 'site',
                            featureTabLabel: 'Practices',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2018',
                            funding: '$100k',
                            url: '/sites/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        self.loadSitePractices(layer.feature.properties);

                        self.loadMetrics(null, {
                            collection: 'site',
                            featureId: feature.properties.id
                        });

                        self.loadTags('site', feature.properties.id);

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeProject,
                            label: self.activeProject.properties.name,
                            geoJson: self.activeProject,
                            type: 'project'
                        };

                    } else if (layer.feature.properties.feature_type === 'geography') {

                        self.setGeoFilter(layer.feature.properties);

                        self.card = {
                            featureType: 'geography',
                            featureTabLabel: 'Projects',
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: '2013-2018',
                            funding: '$50k',
                            url: 'geographies/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        self.loadMetrics(null, {
                            collection: 'geography',
                            featureId: feature.properties.id
                        });

                        self.loadTags('geography', feature.properties.id);

                    } else if (layer.feature.properties.feature_type === 'practice') {

                        self.loadMetrics(null, {
                            collection: 'practice',
                            featureId: feature.properties.id
                        });

                        self.loadTags('practice', feature.properties.id);

                        self.card = {
                            featureType: 'practice',
                            featureTabLabel: null,
                            feature: feature.properties,
                            heading: feature.properties.name,
                            yearsActive: null,
                            funding: null,
                            url: '/practices/' + feature.properties.id,
                            description: feature.properties.description,
                            linkTarget: '_self'
                        };

                        //
                        // Set value of `self.historyItem`
                        //

                        self.historyItem = {
                            feature: self.activeSite,
                            label: self.activeSite.properties.name,
                            geoJson: self.activeSite,
                            type: 'site'
                        };

                    }

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
                mouseout: function(event) {

                    console.log('onEachFeature.mouseout', event);

                    console.log(layer.feature.properties.name);

                    leafletData.getMap('dashboard--map').then(function(map) {

                        if (popup) {

                            map.closePopup(popup);

                        }

                    });

                }

            });
        }

        self.loadGeographies = function() {

            geographies.$promise.then(function(successResponse) {

                console.log('geographies.successResponse', successResponse);

                self.geographies = successResponse;

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

                //
                // Set up layer visibility logic
                //

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

                self.loadBaseProjects();

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.extractIds = function(arr) {

            var projectIds = [];

            arr.forEach(function(datum) {

                projectIds.push(datum.id);

            });

            return projectIds.join(',');

        };

        self.processMetrics = function(arr) {

            Utility.processMetrics(arr);

            self.metrics = Utility.groupByModel(arr);

            console.log('self.metrics', self.metrics);

        };

        self.loadMetrics = function(arr, options) {

            if (options) {

                if (options.collection === 'site') {

                    Site.progress({
                        id: options.featureId,
                        t: Date.now()
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.processMetrics(successResponse.features);

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else if (options.collection === 'practice') {

                    Practice.progress({
                        id: options.featureId,
                        t: Date.now()
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.processMetrics(successResponse.features);

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else if (options.collection === 'project') {

                    Project.progress({
                        id: options.featureId,
                        t: Date.now()
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.processMetrics(successResponse.features);

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                } else {

                    GeographyService.progress({
                        id: options.featureId,
                        t: Date.now()
                    }).$promise.then(function(successResponse) {

                        console.log('granteeResponse', successResponse);

                        self.processMetrics(successResponse.features);

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                }

            } else {

                //
                // A program (account) identifier
                // is required by default.
                //

                var params = {};

                //
                // If the `arr` parameter is valid,
                // constrain the query to the given
                // set of numeric project identifiers.
                //

                if (arr && arr.length) {

                    params.projects = self.extractIds(arr);

                }

                Dashboard.progress({
                    id: $routeParams.dashboardId,
                    t: Date.now()
                }).$promise.then(function(successResponse) {

                    console.log('Dashboard.progress.successResponse', successResponse);

                    self.processMetrics(successResponse.features);

                }, function(errorResponse) {

                    console.log('Dashboard.progress.errorResponse', errorResponse);

                });

            }

        };

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

        self.removeMarkerPopups = function() {

            for (var key in self.map.markers) {

                if (self.map.markers.hasOwnProperty(key)) {

                    self.map.markers[key].focus = false;

                }

            }

        };

        self.setMarkerFocus = function(feature, collection, setFilter) {

            if (collection === 'project') {

                var markerId = 'project_' + feature.id,
                    marker = self.map.markers[markerId];

                console.log('setMarkerFocus', markerId, self.map.markers[markerId]);

                self.removeMarkerPopups();

                if (marker) {

                    self.map.markers[markerId].focus = true;

                    if (setFilter) {

                        self.setProjectFilter(feature);

                    }

                }

            } else {

                if (collection === 'practice') {

                    self.map.geojson.data = self.practices;

                }

                self.setMapBoundsToFeature(feature);

            }

        };

        self.clearMarkerFocus = function(feature) {

            var markerId = 'project_' + feature.id,
                marker = self.map.markers[markerId];

            if (marker) {

                self.map.markers[markerId].focus = false;

            }

            console.log('clearMarkerFocus', markerId, self.map.markers[markerId]);

        };

        self.loadProjectSites = function(obj) {

            Dashboard.projectSites({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('projectSiteResponse', successResponse);

                self.sites = successResponse;

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

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadSitePractices = function(obj) {

            Dashboard.sitePractices({
                id: obj.id
            }).$promise.then(function(successResponse) {

                console.log('sitePracticeResponse', successResponse);

                self.practices = successResponse;

                leafletData.getMap('dashboard--map').then(function(map) {

                    map.closePopup();

                    self.setMapBoundsToFeature(successResponse);

                });

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

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.navigateBack = function(featureType) {

            console.log('self.navigateBack', featureType);

            console.log('self.navigateBack.activeProject', self.activeProject);

            console.log('self.navigateBack.activeSite', self.activeSite);

            // var historyType = self.historyItem.type;

            switch (featureType) {

                case 'program':

                    self.resetMapExtent();

                    self.clearAllFilters(true);

                    self.tags = [];

                    // self.loadTags('program', self.activeProject.properties.id);

                    break;

                case 'project':

                    // self.setMapBoundsToFeature(self.activeProject);

                    self.setProjectFilter(self.activeProject.properties);

                    self.card = {
                        featureType: 'project',
                        featureTabLabel: 'Sites',
                        feature: self.activeProject.properties,
                        heading: self.activeProject.properties.name,
                        yearsActive: '2018',
                        funding: '$100k',
                        url: 'projects/' + self.activeProject.properties.id,
                        description: self.activeProject.properties.description,
                        linkTarget: '_self'
                    };

                    self.loadMetrics(null, {
                        collection: 'project',
                        featureId: self.activeProject.properties.id
                    });

                    self.loadTags('project', self.activeProject.properties.id);

                    break;

                case 'site':

                    self.map.geojson.data = self.activeSite;

                    self.setMapBoundsToFeature(self.activeSite);

                    // self.practices = null;

                    self.card = {
                        featureType: 'site',
                        featureTabLabel: 'Practices',
                        feature: self.activeSite.properties,
                        heading: self.activeSite.properties.name,
                        yearsActive: '2018',
                        funding: '$10k',
                        url: '/sites/' + self.activeSite.properties.id,
                        description: self.activeSite.properties.description,
                        linkTarget: '_self'
                    };

                    self.loadMetrics(null, {
                        collection: 'site',
                        featureId: self.activeSite.properties.id
                    });

                    self.loadTags('site', self.activeSite.properties.id);

                    //
                    // Update history item
                    //

                    self.historyItem = {
                        feature: self.activeProject,
                        label: self.activeProject.properties.name,
                        geoJson: self.activeProject,
                        type: 'project'
                    };

                    break;

                default:

                    break;

            }

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

            self.loadProjectSites(obj);

            FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'project'
            };

            FilterStore.addItem(_filterObject);

            //
            // Load project progress
            //

            self.loadMetrics(null, {
                collection: 'project',
                featureId: obj.id
            });

            //
            // Load project tags
            //

            self.loadTags('project', obj.id);

            //
            // Set value of `self.historyItem`
            //

            self.historyItem = {
                feature: null,
                label: 'All projects',
                geoJson: self.geographies,
                type: 'program'
            };

            //
            // Track project object
            //

            self.activeProject = feature;

            //
            // Update `self.card` values
            //

            self.card = {
                featureType: 'project',
                featureTabLabel: 'Sites',
                feature: feature,
                heading: obj.name,
                yearsActive: '2018',
                funding: '$100k',
                url: 'projects/' + obj.id,
                description: obj.description,
                linkTarget: '_self'
            };

        };

        self.setGeoFilter = function(obj) {

            // FilterStore.clearAll();

            var _filterObject = {
                id: obj.id,
                name: obj.name,
                category: 'geography'
            };

            FilterStore.addItem(_filterObject);

            // self.filterProjects();

        };

        self.setTab = function(collection) {

            self.activeTab = {
                collection: collection
            };

        };

        self.clearFilter = function(obj) {

            FilterStore.clearItem(obj);

        };

        self.clearAllFilters = function(reload) {

            //
            // Remove all stored filter objects
            //

            FilterStore.clearAll();

            //
            // Dismiss filter modal
            //

            self.showFilters = false;

            //
            // Reset map extent
            //

            self.resetMapExtent();

            //
            // Reset metadata card values
            //

            self.card = self.cardTpl;

            //
            // Reset value of `self.historyItem`
            //

            self.historyItem = null;

            //
            // Reset value of `self.activeProject`
            //

            self.activeProject = null;

            //
            // Reset value of `self.activeSite`
            //

            self.activeSite = null;

            //
            // Refresh project list
            //

            if (reload) {

                // self.loadProjects({}, false);

                self.loadBaseProjects();

            }

        };

        self.zoomToProjects = function() {

            var featureCollection = {
                type: 'FeatureCollection',
                features: []
            };

            self.filteredProjects.forEach(function(feature) {

                featureCollection.features.push({
                    type: 'Feature',
                    properties: {},
                    geometry: feature.extent
                });

            });

            self.setMapBoundsToFeature(featureCollection);

        };

        self.processProjectData = function(data) {

            self.filteredProjects = data.features;

            self.processLocations(data.features);

            self.loadMetrics(self.filteredProjects);

            self.zoomToProjects();

        };

        self.loadDashboard = function() {

            self.showProgress();

            dashboard.$promise.then(function(successResponse) {

                console.log('self.loadDashboard.successResponse', successResponse);

                self.dashboardObject = successResponse;

                self.cardTpl = {
                    featureType: 'dashboard',
                    featureTabLabel: 'Projects',
                    feature: null,
                    heading: self.dashboardObject.name,
                    // yearsActive: '2013 - 2018',
                    // funding: '$2.65 million',
                    // url: 'https://4states1source.org',
                    // resourceUrl: null,
                    // linkTarget: '_blank',
                    description: self.dashboardObject.description
                };

                self.card = self.cardTpl;

                // self.loadBaseProjects();

                self.loadGeographies();

            }, function(errorResponse) {

                console.log('self.loadDashboard.errorResponse', errorResponse);

            });

        };

        self.loadBaseProjects = function() {

            baseProjects.$promise.then(function(successResponse) {

                console.log('self.loadBaseProjects.successResponse', successResponse);

                self.baseProjects = successResponse.features;

                self.processProjectData(successResponse);

                self.showElements(1000, self.filteredProjects, self.progressValue);

            }, function(errorResponse) {

                console.log('self.loadBaseProjects.errorResponse', errorResponse);

                self.showElements(1000, self.filteredProjects, self.progressValue);

            });

        };

        self.loadProjects = function(params) {

            Project.collection(params).$promise.then(function(successResponse) {

                console.log('self.filterProjects.successResponse', successResponse);

                self.processProjectData(successResponse);

            }, function(errorResponse) {

                console.log('self.filterProjects.errorResponse', errorResponse);

            });

        };

        $scope.$on('leafletDirectiveMarker.dashboard--map.click', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.click', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            console.log('leafletDirectiveMarker.dashboard--map.click.project', project);

            self.setMarkerFocus(project, 'project', true);

        });

        $scope.$on('leafletDirectiveMarker.dashboard--map.mouseover', function(event, args) {

            console.log('leafletDirectiveMarker.dashboard--map.mouseover', event, args);

            var project = self.filteredProjects.filter(function(datum) {

                var id = +(args.modelName.split('project_')[1]);

                return datum.id === id;

            })[0];

            self.setMarkerFocus(project, 'project');

        });

        self.showMetricModal = function(metric) {

            console.log('self.showMetricModal', metric);

            self.selectedMetric = metric;

            self.displayModal = true;

        };

        self.closeMetricModal = function() {

            self.selectedMetric = null;

            self.displayModal = false;

        };

        self.loadTags = function(featureType, featureId) {

            var models = {
                    'geography': GeographyService,
                    'practice': Practice,
                    'project': Project,
                    'site': Site
                },
                targetModel = models[featureType];

            if (targetModel) {

                targetModel.tags({
                    id: featureId
                }).$promise.then(function(successResponse) {

                    console.log('Feature.tags', successResponse);

                    successResponse.features.forEach(function(tag) {

                        if (tag.color &&
                            tag.color.length) {

                            tag.lightColor = tinycolor(tag.color).lighten(5).toString();

                        }

                    });

                    self.tags = successResponse.features;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.loadDashboard();

    });
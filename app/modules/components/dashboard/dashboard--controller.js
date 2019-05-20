'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('DashboardController', function(
        Account, $location, $log, $interval, $timeout, Project,
        baseProjects, $rootScope, $scope, Site, MetricService,
        OutcomeService, ProjectStore, FilterStore, geographies,
        mapbox, Practice, GeographyService, dashboard,
        $routeParams, Dashboard, Utility, user) {

        $scope.filterStore = FilterStore;

        FilterStore.clearAll();

        // $scope.projectStore = ProjectStore;

        var self = this;

        self.dashboardId = $routeParams.dashboardId;

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

                    $timeout(function() {

                        if (!self.mapOptions) {

                            self.mapOptions = self.getMapOptions();

                        }

                        self.createMap(self.mapOptions);

                    }, 500);

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

        self.historyItem = null;

        self.historyIndex = [];

        self.project = {};

        self.map = undefined;

        self.extentHistory = [];

        self.layerIndex = [];

        self.popupIndex = [];

        self.markerIndex = [];

        self.siteIndex = {};

        self.practiceIndex = {};

        self.projectIndex = {};

        self.geographyIndex = {};

        self.removeMarkers = function() {

            self.markerIndex.forEach(function(obj) {

                obj.remove();

            });

        };

        self.removePopups = function() {

            self.popupIndex.forEach(function(obj) {

                obj.remove();

            });

        };

        self.popupTemplate = function(collection, feature) {

            console.log(
                'self.popupTemplate --> collection',
                collection);

            console.log(
                'self.popupTemplate --> feature',
                feature);

            var id = feature.properties.id || feature.id;

            var name = feature.properties.name || feature.name;

            var pathPrefix = $location.path().split('?')[0];

            var nextPath;

            var tpl;

            if (collection === 'project') {

                nextPath = [
                    pathPrefix,
                    '?',
                    collection,
                    '=',
                    id,
                    '&sites=true'
                ].join('');

                tpl = '<div class=\"project--popup\">' +
                    '<div class=\"title--group\">' +
                    '<div class=\"marker--title border--right\">' + name + '</div>' +
                    '<a href=\"projects/' + id + '\">' +
                    '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                    '</a>' +
                    '</div>' +
                    // '<view-features data-collection=\"' + collection + '\" data-id=\"' + id + '\"></view-features>' +
                    '<a class=\"marker--title view-features\" href=\"' + nextPath + '\">View sites</a>' +
                    '</div>';

            } else if (collection === 'site') {

                nextPath = [
                    pathPrefix,
                    '?',
                    collection,
                    '=',
                    id,
                    '&practices=true'
                ].join('');

                tpl = '<div class=\"project--popup\">' +
                    '<div class=\"title--group\">' +
                    '<div class=\"marker--title border--right\">' + name + '</div>' +
                    '<a href=\"sites/' + id + '\">' +
                    '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                    '</a>' +
                    '</div>' +
                    '<a class=\"marker--title view-features\" href=\"' + nextPath + '\">View practices</a>' +
                    '</div>';

            } else if (collection === 'practice') {

                tpl = '<div class=\"project--popup\">' +
                    '<div class=\"title--group\">' +
                    '<div class=\"marker--title border--right\">' + name + '</div>' +
                    '<a href=\"practices/' + id + '\">' +
                    '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                    '</a>' +
                    '</div>' +
                    '</div>';

            } else {

                tpl = '<div class=\"project--popup\">' +
                    '<div class=\"title--group\">' +
                    '<div class=\"marker--title border--right\">' + name + '</div>' +
                    '<a href=\"geographies/' + id + '\">' +
                    '<i class=\"material-icons\">keyboard_arrow_right</i>' +
                    '</a>' +
                    '</div>' +
                    '</div>';

            }

            return tpl;

        };

        self.processLocations = function(map, collection, features, spatialProperty) {

            console.log(
                'self.processLocations --> features',
                features);

            spatialProperty = spatialProperty || 'geometry';

            features.forEach(function(feature, index) {

                if (feature[spatialProperty] &&
                    feature[spatialProperty].coordinates) {

                    // var geoJson = {
                    //     'type': 'Feature',
                    //     'geometry': feature[spatialProperty]
                    // };

                    // delete feature[spatialProperty];

                    // geoJson.properties = feature;

                    var tpl = self.popupTemplate(collection, feature);

                    var popup = new mapboxgl.Popup()
                        .setLngLat(feature.geometry.coordinates)
                        .setHTML(tpl);

                    self.popupIndex.push(popup);

                    var markerEl = document.createElement('div');

                    markerEl.className = 'project--marker';

                    var marker = new mapboxgl.Marker(markerEl)
                        .setLngLat(feature.geometry.coordinates)
                        .setPopup(popup)
                        .addTo(map);

                    self.markerIndex.push(marker);

                    self.projectIndex[feature.properties.id] = feature;

                }

            });

        };

        self.resetMapExtent = function() {

            console.log(
                'self.resetMapExtent --> Starting...');

            if (self.map) {

                self.removePopups();

                // self.populateMap(
                //     self.map,
                //     'project',
                //     null,
                //     self.projectCollection,
                //     null,
                //     true);

            }

            self.clearAllFilters();

            $location.search({});

        };

        //
        // Load custom geographies
        //

        self.setActiveFeature = function(collection, feature, loadResources) {

            console.log(
                'self.setActiveFeature --> collection',
                collection);

            console.log(
                'self.setActiveFeature --> feature',
                feature);

            // 
            // Update Window.location to preserve state
            // 

//            var params = $location.search();
//
//            if (params[collection] !== feature.properties.id) {
//
//                params = {};
//
//                params[collection] = feature.properties.id;
//
//                $location.search(params);
//
//            }

            if (collection === 'site') {

                self.activeSite = self.siteIndex[feature.properties.id];

                self.card = {
                    featureType: 'site',
                    featureTabLabel: 'Practices',
                    feature: self.activeSite.properties,
                    heading: self.activeSite.properties.name,
                    yearsActive: '2018',
                    funding: '$100k',
                    url: '/sites/' + self.activeSite.properties.id,
                    description: self.activeSite.properties.description,
                    linkTarget: '_self'
                };

                if (loadResources) {

                    self.loadSitePractices(self.activeSite.properties.id);

                }

                self.loadMetrics(null, {
                    collection: 'site',
                    featureId: self.activeSite.properties.id
                });

                self.loadTags('site', self.activeSite.properties.id);

                //
                // Set value of `self.historyItem`
                //

                if (self.activeProject) {

                    self.historyItem = {
                        feature: self.activeProject,
                        label: self.activeProject.properties.name,
                        geoJson: self.activeProject,
                        type: 'project'
                    };

                }

            } else if (collection === 'geography') {

                // self.setGeoFilter(layer.feature.properties);

                self.activeGeography = self.geographyIndex[feature.properties.id];

                self.card = {
                    featureType: 'geography',
                    featureTabLabel: 'Projects',
                    feature: self.activeGeography.properties,
                    heading: self.activeGeography.properties.name,
                    yearsActive: '2013-2018',
                    funding: '$50k',
                    url: 'geographies/' + self.activeGeography.properties.id,
                    description: self.activeGeography.properties.description,
                    linkTarget: '_self'
                };

                self.loadMetrics(null, {
                    collection: 'geography',
                    featureId: self.activeGeography.properties.id
                });

                self.loadTags('geography', self.activeGeography.properties.id);

            } else if (collection === 'practice') {

                self.activePractice = self.practiceIndex[feature.properties.id];

                self.loadMetrics(null, {
                    collection: 'practice',
                    featureId: self.activePractice.properties.id
                });

                self.loadTags('practice', self.activePractice.properties.id);

                self.card = {
                    featureType: 'practice',
                    featureTabLabel: null,
                    feature: self.activePractice.properties,
                    heading: self.activePractice.properties.name,
                    yearsActive: null,
                    funding: null,
                    url: '/practices/' + self.activePractice.properties.id,
                    description: self.activePractice.properties.description,
                    linkTarget: '_self'
                };

                //
                // Set value of `self.historyItem`
                //

                if (self.activeSite) {

                    self.historyItem = {
                        feature: self.activeSite,
                        label: self.activeSite.properties.name,
                        geoJson: self.activeSite,
                        type: 'site'
                    };

                }

            }

        };

        self.loadGeographies = function() {

            geographies.$promise.then(function(successResponse) {

                console.log('geographies.successResponse', successResponse);

                self.geographies = successResponse.features;

                self.geographies.forEach(function(feature) {

                    self.geographyIndex[feature.properties.id] = feature;

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

                    self.baseMetrics = successResponse.features;

                    self.processMetrics(self.baseMetrics);

                }, function(errorResponse) {

                    console.log('Dashboard.progress.errorResponse', errorResponse);

                });

            }

        };

        self.loadFeatures = function(collection, featureId) {

            console.log(
                'self.loadFeatures --> collection',
                collection);

            console.log(
                'self.loadFeatures --> featureId',
                featureId);

        };

        self.loadProjectSites = function(featureId) {

            console.log(
                'self.loadProjectSites --> featureId',
                featureId);

            if (self.map) {

                self.removeMarkers();

                self.removePopups();

            }

            // var matches = self.baseProjects.filter(function(feature) {

            //     if (feature.properties.id === featureId) {

            //         return true;

            //     }

            //     return false;

            // });

            var match = self.projectIndex[featureId];

            if (match && match.geometry) {

                // var targetProject = matches[0];

                self.setProjectFilter(match);

                Dashboard.projectSites({
                    id: featureId
                }).$promise.then(function(successResponse) {

                    console.log('projectSiteResponse', successResponse);

                    var mappedSites = [];

                    successResponse.features.forEach(function(feature) {

                        if (feature.geometry &&
                            feature.geometry.coordinates) {

                            mappedSites.push(feature);

                            self.siteIndex[feature.properties.id] = feature;

                        }

                    });

                    if (mappedSites.length) {

                        var featureCollection = {
                            'type': 'FeatureCollection',
                            'features': mappedSites
                        }

                        self.populateMap(
                            self.map,
                            'site',
                            featureId,
                            featureCollection,
                            null,
                            true);

                    }

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

            }

        };

        self.loadPractice = function(featureId) {

            console.log(
                'self.loadPractice --> featureId',
                featureId);

            if (self.map) {

                self.removeMarkers();

                self.removePopups();

            }

            var exclude = [
                'allocations',
                'centroid',
                'creator',
                'dashboards',
                'extent',
                // 'geometry',
                'last_modified_by',
                'members',
                'metric_types',
                'organization',
                'practices',
                'practice_types',
                'program',
                'project',
                'properties',
                'reports',
                'tags',
                'targets',
                'tasks',
                'type',
                'sites'
            ].join(',');

            Practice.publicFeature({
                id: featureId,
                exclude: exclude
            }).$promise.then(function(successResponse) {

                console.log('practiceResponse', successResponse);

                //

                Utility.scrubFeature(successResponse, []);

                if (successResponse.geometry) {

                    var geometry = successResponse.geometry;

                    console.log(
                        'self.loadPractice --> geometry',
                        geometry);

                    console.log(
                        'self.loadPractice --> successResponse',
                        successResponse);

                    delete successResponse.geometry;

                    var feature = {
                        'type': 'Feature',
                        'geometry': geometry,
                        'properties': successResponse
                    };

                    self.practiceIndex[successResponse.id] = feature;

                    self.setActiveFeature('practice', feature);

                    var featureCollection = turf.featureCollection([feature]);

                    self.populateMap(
                        self.map,
                        'practice',
                        successResponse.id,
                        featureCollection,
                        null,
                        true);

                }

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadSite = function(featureId) {

            console.log(
                'self.loadSite --> featureId',
                featureId);

            if (self.map) {

                self.removeMarkers();

                self.removePopups();

            }

            var exclude = [
                'centroid',
                'creator',
                'dashboards',
                'extent',
                // 'geometry',
                'last_modified_by',
                'members',
                'metric_types',
                'organization',
                'practices',
                'practice_types',
                'program',
                'project',
                'properties',
                'tags',
                'targets',
                'tasks',
                'type',
                'sites'
            ].join(',');

            Site.publicFeature({
                id: featureId,
                exclude: exclude
            }).$promise.then(function(successResponse) {

                console.log('siteResponse', successResponse);

                Utility.scrubFeature(successResponse, []);

                //

                var geometry = successResponse.geometry;

                console.log(
                    'self.loadSite --> geometry',
                    geometry);

                console.log(
                    'self.loadSite --> successResponse',
                    successResponse);

                delete successResponse.geometry;

                var feature = {
                    'type': 'Feature',
                    'geometry': geometry,
                    'properties': successResponse
                };

                self.siteIndex[successResponse.id] = feature;

                self.setActiveFeature('site', feature, false);

                var featureCollection = turf.featureCollection([feature]);

                self.populateMap(
                    self.map,
                    'site',
                    successResponse.id,
                    featureCollection,
                    null,
                    true);

                // self.loadSitePractices(successResponse.id);

            }, function(errorResponse) {

                console.log('errorResponse', errorResponse);

            });

        };

        self.loadSitePractices = function(featureId) {

            console.log(
                'self.loadSitePractices --> featureId',
                featureId);

            if (self.map) {

                self.removeMarkers();

                self.removePopups();

            }

            Dashboard.sitePractices({
                id: featureId
            }).$promise.then(function(successResponse) {

                console.log('sitePracticeResponse', successResponse);

                var mappedPractices = [];

                successResponse.features.forEach(function(feature) {

                    if (feature.geometry &&
                        feature.geometry.coordinates) {

                        mappedPractices.push(feature);

                        self.practiceIndex[feature.properties.id] = feature;

                    }

                });

                if (mappedPractices.length) {

                    var featureCollection = {
                        'type': 'FeatureCollection',
                        'features': mappedPractices
                    }

                    self.populateMap(
                        self.map,
                        'practice',
                        featureId,
                        featureCollection,
                        null,
                        true);

                }

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

                    // self.resetMapExtent();

                    self.populateMap(
                        self.map,
                        'project',
                        null,
                        self.projectCollection,
                        null,
                        true);

                    self.clearAllFilters(true);

                    self.tags = [];

                    break;

                case 'project':

                    self.setProjectFilter(self.activeProject.properties);

                    break;

                case 'site':

                    self.setActiveFeature('site', self.activeSite);

                    self.map.geojson.data = self.activeSite;

                    // self.card = {
                    //     featureType: 'site',
                    //     featureTabLabel: 'Practices',
                    //     feature: self.activeSite.properties,
                    //     heading: self.activeSite.properties.name,
                    //     yearsActive: '2018',
                    //     funding: '$10k',
                    //     url: '/sites/' + self.activeSite.properties.id,
                    //     description: self.activeSite.properties.description,
                    //     linkTarget: '_self'
                    // };

                    // self.loadMetrics(null, {
                    //     collection: 'site',
                    //     featureId: self.activeSite.properties.id
                    // });

                    // self.loadTags('site', self.activeSite.properties.id);

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

        self.setProjectFilter = function(feature) {

            console.log(
                'self.setProjectFilter --> feature',
                feature);

            // FilterStore.clearAll();

            // var _filterObject = {
            //     id: obj.id,
            //     name: obj.name,
            //     category: 'project'
            // };

            // FilterStore.addItem(_filterObject);

            //
            // Load project progress
            //

            self.loadMetrics(null, {
                collection: 'project',
                featureId: feature.properties.id
            });

            //
            // Load project tags
            //

            self.loadTags('project', feature.properties.id);

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
                heading: feature.properties.name,
                yearsActive: '2018',
                funding: '$100k',
                url: 'projects/' + feature.properties.id,
                description: feature.properties.description,
                linkTarget: '_self'
            };

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

            // self.resetMapExtent();

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
            // Remove displayed tags
            // 

            self.tags = undefined;

            //
            // Refresh project list
            //

            if (reload) {

                // self.loadProjects({}, false);

                self.loadBaseProjects();

            }

        };

        self.toGeoJson = function(arr, spatialProperty) {

            console.log(
                'self.toGeoJson --> arr',
                arr);

            console.log(
                'self.toGeoJson --> spatialProperty',
                spatialProperty);

            var validFeatures = [];

            spatialProperty = spatialProperty || 'geometry';

            arr.forEach(function(feature, index) {

                if (feature[spatialProperty] &&
                    feature[spatialProperty].coordinates) {

                    var geoJson = {
                        'type': 'Feature',
                        'geometry': feature[spatialProperty]
                    };

                    delete feature[spatialProperty];

                    geoJson.properties = feature;

                    validFeatures.push(geoJson);

                }

            });

            return validFeatures;

        };

        self.processProjectData = function(data) {

            var featureCollection = {
                type: 'FeatureCollection',
                features: self.toGeoJson(data.features, 'centroid')
            };

            self.projectCollection = featureCollection;

            self.filteredProjects = data.features;

            // self.summary = data.properties;

            self.summary = data.summary;

            self.loadMetrics(self.filteredProjects);

        };

        self.loadDashboard = function() {

            self.showProgress();

            dashboard.$promise.then(function(successResponse) {

                console.log('self.loadDashboard.successResponse', successResponse);

                self.dashboardObject = successResponse;

                // self.summary = self.dashboardObject.summary;

                self.cardTpl = {
                    featureType: 'dashboard',
                    featureTabLabel: 'Projects',
                    feature: null,
                    heading: self.dashboardObject.name,
                    description: self.dashboardObject.description
                };

                self.card = self.cardTpl;

                self.loadGeographies();

            }, function(errorResponse) {

                console.log('self.loadDashboard.errorResponse', errorResponse);

            });

        };

        self.loadBaseProjects = function() {

            Dashboard.projects({
                id: self.dashboardObject.id
            }).$promise.then(function(successResponse) {

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

        self.addGeographyLayer = function(map, arr) {

            console.log(
                'self.addGeographyLayer --> arr',
                arr);

            if (!arr || !arr.length) return;

            var featureCollection = turf.featureCollection(arr);

            self.populateMap(
                map,
                'geography',
                null,
                featureCollection,
                null,
                false);

        };

        self.populateMap = function(map, collection, collectionId, feature, attribute, fitBounds) {

            console.log('self.populateMap --> collection', collection);

            console.log('self.populateMap --> collectionId', collectionId);

            console.log('self.populateMap --> feature', feature);

            collectionId = collectionId || Date.now();

            var geojson = attribute ? feature[attribute] : feature;

            if (geojson !== null &&
                typeof geojson !== 'undefined') {

                if (fitBounds) {

                    var bounds = turf.bbox(geojson);

                    map.fitBounds(bounds, {
                        padding: 40
                    });

                    // 
                    // Prepend `bounds` to extent history array.
                    // 

                    self.extentHistory.unshift(bounds);

                    console.log('self.extentHistory', self.extentHistory);

                }

                if (collection === 'project') {

                    self.processLocations(
                        map,
                        'project',
                        geojson.features,
                        'geometry');

                }

                if (collection === 'geography' ||
                    collection === 'practice' ||
                    collection === 'site') {

                    var layerId = collection + '-collection-' + collectionId;

                    console.log(
                        'self.populateMap --> layerId',
                        layerId);

                    var fillColor,
                        lineColor;

                    if (collection === 'practice') {

                        fillColor = '#df063e';

                        lineColor = 'rgba(223, 6, 62, 0.8)';

                    } else if (collection === 'site') {

                        fillColor = '#06aadf';

                        lineColor = 'rgba(6, 170, 223, 0.8)';

                    } else {

                        fillColor = '#fbb03b';

                        lineColor = 'rgba(251, 176, 59, 0.8)';

                    }

                    if (self.layerIndex.indexOf(layerId) < 0) {

                        self.layerIndex.push(layerId);

                        map.addLayer({
                            'id': layerId,
                            'type': 'fill',
                            'source': {
                                'type': 'geojson',
                                'data': geojson
                            },
                            'layout': {
                                'visibility': 'visible'
                            },
                            'paint': {
                                'fill-color': fillColor,
                                'fill-opacity': 0.4
                            }
                        });

                        map.addLayer({
                            'id': collection + '-collection-outline-' + Date.now(),
                            'type': 'line',
                            'source': {
                                'type': 'geojson',
                                'data': geojson
                            },
                            'layout': {
                                'visibility': 'visible'
                            },
                            'paint': {
                                'line-color': lineColor,
                                'line-width': 2
                            }
                        });

                        map.on('click', layerId, function (e) {

                            // 
                            // Remove open popups
                            // 

                            self.removePopups();

                            var tpl = self.popupTemplate(collection, e.features[0]);

                            var popup = new mapboxgl.Popup()
                                .setLngLat(e.lngLat)
                                .setHTML(tpl)
                                .addTo(map);

                            self.popupIndex.push(popup);

                            self.setActiveFeature(collection, e.features[0]);

                        });

                    }

                }

            }

        };

        self.toggleLayer = function(layer) {

            console.log('self.toggleLayer --> layer', layer);

            var layerId = layer.spec.id;

            var visibility = self.map.getLayoutProperty(layerId, 'visibility');

            if (visibility === 'visible') {

                self.map.setLayoutProperty(layerId, 'visibility', 'none');

            } else {

                self.map.setLayoutProperty(layerId, 'visibility', 'visible');

            }

        };

        self.switchMapStyle = function(styleId, index) {

            console.log('self.switchMapStyle --> styleId', styleId);

            console.log('self.switchMapStyle --> index', index);

            var center = self.map.getCenter();

            var zoom = self.map.getZoom();

            if (center.lng && center.lat) {

                self.mapOptions.center = [center.lng, center.lat];

            }

            if (zoom) {

                self.mapOptions.zoom = zoom;

            }

            self.mapOptions.style = self.mapStyles[index].url;

            self.map.remove();

            self.createMap(self.mapOptions);

        };

        self.getMapOptions = function() {

            self.mapStyles = mapbox.baseStyles;

            console.log(
                'self.createMap --> mapStyles',
                self.mapStyles);

            self.activeStyle = 0;

            mapboxgl.accessToken = mapbox.accessToken;

            console.log(
                'self.createMap --> accessToken',
                mapboxgl.accessToken);

            self.mapOptions = JSON.parse(JSON.stringify(mapbox.defaultOptions));

            self.mapOptions.container = 'primary--map';

            self.mapOptions.style = self.mapStyles[0].url;

            return self.mapOptions;

        };

        self.createMap = function(options) {

            if (!options) return;

            console.log('self.createMap --> Starting...');

            var tgt = document.querySelector('.map');

            console.log(
                'self.createMap --> tgt',
                tgt);

            console.log('self.createMap --> options', options);

            self.map = new mapboxgl.Map(options);

            self.map.on('load', function() {

                var geocoder = new MapboxGeocoder({
                    accessToken: mapboxgl.accessToken,
                    mapboxgl: mapboxgl
                });

                self.map.addControl(geocoder, 'top-left');

                var nav = new mapboxgl.NavigationControl();

                self.map.addControl(nav, 'top-left');

                var fullScreen = new mapboxgl.FullscreenControl();

                self.map.addControl(fullScreen, 'top-left');

                // 
                // Add geography layer first
                // 

                self.addGeographyLayer(self.map, self.geographies);

                // 
                // Add project markers
                // 

                self.populateMap(
                    self.map,
                    'project',
                    null,
                    self.projectCollection,
                    null,
                    true);

                self.inspectSearchParams();

            });

        };

        self.loadDashboard();

        self.inspectSearchParams = function(params) {

            console.log(
                'self.inspectSearchParams --> params',
                params);

            params = params || $location.search();

            var keys = Object.keys(params);

            if (keys.indexOf('project') >= 0) {

                var projectId = +params.project;

                console.log(
                    'self.inspectSearchParams --> projectId',
                    projectId);

                if (Number.isInteger(projectId)) {

                    if (self.projectIndex.hasOwnProperty(projectId)) {

                        var activeProject = self.projectIndex[projectId];

                        self.setActiveFeature('project', activeProject);

                        self.loadProjectSites(projectId);

                    }

                    // self.loadProjectSites(projectId);

                }

            } else if (keys.indexOf('site') >= 0) {

                var siteId = +params.site;

                console.log(
                    'self.inspectSearchParams --> siteId',
                    siteId);

                if (Number.isInteger(siteId)) {

                    if (!self.siteIndex.hasOwnProperty(siteId)) {

                        self.loadSite(siteId);

                    } else {

                        self.loadSitePractices(siteId);

                    }

                }

            } else if (keys.indexOf('practice') >= 0) {

                var practiceId = +params.practice;

                console.log(
                    'self.inspectSearchParams --> practiceId',
                    practiceId);

                if (Number.isInteger(practiceId)) {

                    // var activePractice = self.practiceIndex(practiceId);

                    if (!self.practiceIndex.hasOwnProperty(practiceId)) {

                        self.loadPractice(practiceId);

                    } else {

                        var activePractice = self.practiceIndex[practiceId];

                        self.setActiveFeature('practice', activePractice);

                        var featureCollection = turf.featureCollection([
                            activePractice]);

                        self.populateMap(
                            self.map,
                            'practice',
                            practiceId,
                            featureCollection,
                            null,
                            true);

                        if (self.markerIndex.length) {

                            self.removeMarkers();

                        }

                    }

                }

            } else if (keys.indexOf('geography') >= 0) {

                var geoId = +params.geography;

                console.log(
                    'self.inspectSearchParams --> geoId',
                    geoId);

                if (Number.isInteger(geoId)) {

                    // var activePractice = self.practiceIndex(practiceId);

                    if (!self.geographyIndex.hasOwnProperty(geoId)) {

                        // self.loadPractice(practiceId);

                    } else {

                        var activeGeography = self.geographyIndex[geoId];

                        self.setActiveFeature('geography', activeGeography);

                        var featureCollection = turf.featureCollection([
                            activeGeography]);

                        self.populateMap(
                            self.map,
                            'geography',
                            geoId,
                            featureCollection,
                            null,
                            true);

                        if (self.markerIndex.length) {

                            self.removeMarkers();

                        }

                    }

                }

            } else {

                if (self.map &&
                    self.extentHistory.length) {

                    var bounds;

                    if (self.extentHistory.length === 1) {

                        bounds = self.extentHistory[0];

                    } else {

                        bounds = self.extentHistory.pop();

                    }

                    self.map.fitBounds(bounds, {
                        padding: 40
                    });

                    console.log(
                        'self.inspectSearchParams --> self.extentHistory',
                        self.extentHistory)

                    if (self.baseProjects &&
                        self.baseProjects.length) {

                        console.log(
                            'self.inspectSearchParams -->',
                            ' Reset to base projects.',
                            self.baseProjects);

                        // self.processLocations(
                        //     self.map,
                        //     'project',
                        //     self.baseProjects);

                        self.populateMap(
                            self.map,
                            'project',
                            null,
                            self.projectCollection,
                            null,
                            true);

                        self.clearAllFilters();

                        if (self.baseMetrics) {

                            console.log(
                                'self.inspectSearchParams -->',
                                ' Reset to base metrics.',
                                self.baseMetrics);

                            self.processMetrics(self.baseMetrics);

                        }

                    }

                }

            }

        };

        // 
        // Observe internal route changes. Note that `reloadOnSearch`
        // must be set to `false`.
        // 
        // See: https://stackoverflow.com/questions/15093916
        // 

        $scope.$on('$routeUpdate', function() {

            var params = $location.search();

            self.inspectSearchParams(params);

        });

    });
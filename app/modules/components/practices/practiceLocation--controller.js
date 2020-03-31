'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeLocationController',
        function(Account, Image, $location, $log, mapbox, Media,
            Site, Practice, practice, $q, $rootScope, $route,
            $scope, $timeout, $interval, site, Site, user, Shapefile,
            Utility, Task, LayerService, MapManager) {

            var self = this;

            $rootScope.toolbarState = {
                'editLocation': true
            };

            self.status = {
                loading: true
            };

            self.map = undefined;

            $rootScope.page = {};

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                    $timeout(function() {

                        if (!self.mapOptions) {

                            self.mapOptions = self.getMapOptions();

                        }

                        if (self.map) {

                            self.populateMap(self.map, self.practice);

                        } else {

                            self.createMap(self.mapOptions);

                        }

                    }, 500);

                }, 1000);

            };

            self.loadSite = function() {

                var exclude = [
                    'allocations',
                    'creator',
                    'counties',
                    'geographies',
                    'last_modified_by',
                    'watersheds',
                    'partnerships',
                    'practices',
                    'project',
                    'tags',
                    'tasks'
                ].join(',');

                Practice.site({
                    id: $route.current.params.practiceId,
                    format: 'geojson',
                    exclude: exclude
                }).$promise.then(function(successResponse) {

                    console.log("THIS IS A CONSOLE LOG");

                    console.log('self.site', successResponse);

                    self.site = successResponse;

                    self.loadPractice();

                }, function(errorResponse) {

                    //

                });

            };

            self.loadSiteDirect = function(){

                 var exclude = [
                    'allocations',
                    'creator',
                    'counties',
                    'geographies',
                    'last_modified_by',
                    'watersheds',
                    'partnerships',
                    'practices',
                    'project',
                    'tags',
                    'tasks'
                ].join(',');

                site({
                    id: self.practice.properties.site.id,
                    format: 'geojson'
                  //  exclude: exclude
                }).$promise.then(function(successResponse) {

                    console.log('self.site YES', successResponse);

                    self.site = successResponse;

                    self.loadPractice();

                }, function(errorResponse) {

                    //

                });
            }


            self.loadPractice = function() {

                Practice.get({
                    id: $route.current.params.practiceId,
                    format: 'geojson'
                }).$promise.then(function(successResponse) {

                    console.log('self.practice', successResponse);

                    self.practice = successResponse;

                    self.practiceType = successResponse.properties.category  || successResponse.category;

                    console.log('self.practiceType',  self.practiceType);

                    if (!successResponse.permissions.read &&
                        !successResponse.permissions.write) {

                        self.makePrivate = true;

                        return;

                    }

                    self.permissions.can_edit = successResponse.permissions.write;
                    self.permissions.can_delete = successResponse.permissions.write;

                    $rootScope.page.title = self.practice.name ? self.practice.name : 'Un-named Practice';

                    self.showElements();

                }, function(errorResponse) {

                    self.showElements();

                });

            };

            self.fetchTasks = function(taskId) {

                if (taskId &&
                    typeof taskId === 'number') {

                    return Task.get({
                        id: taskId
                    }).$promise.then(function(response) {

                        console.log('Task.get response', response);

                        if (response.status &&
                            response.status === 'complete') {

                            self.hideTasks();

                        }

                    });

                } else {

                    return Practice.tasks({
                        id: $route.current.params.practiceId
                    }).$promise.then(function(response) {

                        console.log('Task.get response', response);

                        self.pendingTasks = response.features;

                        if (self.pendingTasks.length < 1) {

                            self.loadSite();

                        //   self.loadSiteDirect();

                            $interval.cancel(self.taskPoll);

                        }

                    });

                }

            };

            self.hideTasks = function() {

                self.pendingTasks = [];

                if (typeof self.taskPoll !== 'undefined') {

                    $interval.cancel(self.taskPoll);

                }

                // self.loadSiteDirect();
                self.loadSite();

            };

            self.uploadShapefile = function() {

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

                self.progressMessage = 'Uploading your file...';

                var fileData = new FormData();

                fileData.append('file', self.fileImport[0]);

                fileData.append('feature_type', 'practice');

                fileData.append('feature_id', self.practice.id);

                console.log('fileData', fileData);

                try {

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

                        self.taskPoll = $interval(function() {

                            self.fetchTasks(successResponse.task.id);

                        }, 1000);

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

                } catch (error) {

                    console.log('Shapefile upload error', error);

                }

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
                    'allocations',
                    'creator',
                    'dashboards',
                    'geographies',
                    // 'geometry',
                    'last_modified_by',
                    'members',
                    'metrics',
                    'metric_types',
                    'organization',
                    'partners',
                    'partnerships',
                    'practices',
                    'practice_types',
                    'program',
                    'project',
                    'reports',
                    'sites',
                    'status',
                    'tags',
                    'tasks',
                    'users'
                ];

                var reservedProperties = [
                    'links',
                    'map_options',
                    'permissions',
                    '$promise',
                    '$resolved'
                ];

                excludedKeys.forEach(function(key) {

                    if (feature.properties) {

                        delete feature.properties[key];

                    } else {

                        delete feature[key];

                    }

                });

                reservedProperties.forEach(function(key) {

                    delete feature[key];

                });

            };

            self.savePractice = function() {

                self.status.processing = true;

                self.scrubFeature(self.practice);

                self.practice.$update().then(function(successResponse) {

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Practice location saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);

                    self.practiceType = successResponse.category;

                    self.showElements();

                }, function(errorResponse) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong and the location could not be saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);

                    self.showElements();

                });

            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            function closeRoute() {

                $location.path(self.practice.links.site.html);

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
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this practice.',
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

            self.populateMap = function(map, practice) {

                console.log('practice.geometry', practice.geometry);

                if (self.drawControls) {

                    self.drawControls.deleteAll();

                }

                if (practice.geometry !== null &&
                    typeof practice.geometry !== 'undefined') {

                    var bounds = turf.bbox(practice.geometry);

                    map.fitBounds(bounds, {
                        padding: 40
                    });

                    if (self.drawControls) {

                        var feature = {
                            id: 'practice-' + practice.id,
                            type: 'Feature',
                            properties: {},
                            geometry: practice.geometry,
                            paint: {
                                    'fill-color': '#df063e',
                                    'fill-opacity': 0.4
                                }
                        };

                        self.drawControls.add(feature);

                        self.drawControls.changeMode(
                            'simple_select',
                            {
                                featureId: 'practice-' + practice.id
                            });

                    }

                }

          /*      if(self.site.geometry !== null &&
                    self.site.geometry !== 'undefined'){

                    console.log("ADDING SITE TO MAP");

                    MapManager.addFeature(
                                self.map,
                                self.site,
                                'geometry',
                                true,
                                false,
                                "site");

                }else{
                    console.log("No Site can be added to Map");
                }
            */
            };

            self.updateGeometry = function updateArea(e) {

                var data = self.drawControls.getAll();

                console.log('self.updateGeometry --> data', data);

                if (data.features.length > 0) {

                    var area = turf.area(data);

                    // Convert area to square meters (acres?)
                    // restrict to area to 2 decimal points

                    self.roundedArea = Math.round(area*100)/100;

                    var feature = data.features[0];

                    if (feature.geometry) {

                        self.practice.geometry = feature.geometry;

                    }

                } else {

                    self.roundedArea = null;

                    self.practice.geometry = null;

                    if (e.type !== 'draw.delete') {

                        alert('Use the draw tools to draw a polygon!');

                    };

                }

            };

            self.switchMapStyle = function(styleId, index) {

                console.log('self.switchMapStyle --> styleId', styleId);

                console.log('self.switchMapStyle --> index', index);

                self.map.setStyle(self.mapStyles[index].url);

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

                if (self.practice &&
                    self.practice.map_options) {

                    var mapOptions = self.practice.map_options;

                    if (mapOptions.hasOwnProperty('centroid') &&
                        mapOptions.centroid !== null) {

                        self.mapOptions.center = self.practice.map_options.centroid.coordinates;

                    }

                }

                return self.mapOptions;

            };

            self.createMap = function(options) {

                if (!options) return;

                console.log('self.createMap --> Starting...');

                self.map = new mapboxgl.Map(options);

                self.map.on('load', function () {

                    self.drawControls = new MapboxDraw({
                        displayControlsDefault: false,
                        controls: {
                            line_string: true,
                            point: true,
                            polygon: true,
                            trash: true
                        },


                    });

                    console.log('drawControls', self.drawControls);

                    self.map.addControl(self.drawControls);

                    var nav = new mapboxgl.NavigationControl();

                    self.map.addControl(nav, 'top-left');

                    var fullScreen = new mapboxgl.FullscreenControl();

                    self.map.addControl(fullScreen, 'top-left');

                    // 
                    // Add geocoder
                    // 

                    var geocoder = new MapboxGeocoder({
                        accessToken: mapboxgl.accessToken,
                        mapboxgl: mapboxgl
                    });
 
                    document.getElementById('geocoder').appendChild(geocoder.onAdd(self.map));


                   console.log("ADDING THE MAP");

                    console.log("SITE",self.site);


                    self.populateMap(self.map, self.practice);


                     if(self.site != null){
                        console.log("There is a site");
                        console.log("site",self.site);
                         MapManager.addFeature(

                                self.map,
                                self.site,
                                'geometry',
                                true,
                                false,
                                'site'
                                );
                    }

                    self.map.on('draw.create', self.updateGeometry);
                    self.map.on('draw.delete', self.updateGeometry);
                    self.map.on('draw.update', self.updateGeometry);

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

                    // self.createMap();

                //    self.loadSite();

                    self.loadPractice();

                    self.fetchTasks();

                    // self.fetchLayers();

                });

            }

        });
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
            $scope, $timeout, $interval, site, user, Shapefile,
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

                    self.practiceType = successResponse.properties.practice_type  || successResponse.practice_type;

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

                    self.practiceType = successResponse.practice_type;

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

                    if(self.practice.site != null){
                         $location.path(self.practice.links.site.html);
                    }else{

                    } $location.path("/projects/"+self.practice.project.id);

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

/*COPY LOGIC*/

            self.confirmCopy = function(obj, targetCollection) {

                console.log('self.confirmCopy', obj, targetCollection);

                if (self.copyTarget &&
                    self.copyTarget.collection === 'project') {

                    self.cancelCopy();

                } else {

                    self.copyTarget = {
                        'collection': targetCollection,
                        'feature': obj
                    };

                }

            };

            self.cancelCopy = function() {

                self.copyTarget = null;

            };

            self.copyFeature = function(featureType, index) {

                var targetCollection,
                    targetId;

                switch (featureType) {

                    case 'practice':

                        targetCollection = Practice;

                        break;

                    case 'site':

                        targetCollection = Site;

                        break;

                    default:

                        targetCollection = Project;

                        break;

                }

                if (self.copyTarget.feature.properties) {

                    targetId = self.copyTarget.feature.properties.id;

                } else {

                    targetId = self.copyTarget.feature.id;

                }

                Practice.copy({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully copied this ' + featureType + '.',
                        'prompt': 'OK'
                    });

                    console.log("COPIED PRACTICE DATA", data)

                        self.cancelCopy();

                        $timeout(closeAlerts, 2000);


                }).catch(function(errorResponse) {

                    console.log('self.copyFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to copy “' + self.copyTarget.feature.name + '”. There are pending tasks affecting this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to copy this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to copy this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };
/*END COPY LOGIC*/

            self.populateMap = function(map, practice) {

                console.log('practice.geometry', practice.geometry);

                if (self.drawControls) {

                    self.drawControls.deleteAll();

                }

                if (practice.geometry !== null &&
                    typeof practice.geometry !== 'undefined') {

                  //  if(self.site.geometry == null
                  //      || self.site.geometry == 'undefined'){
                            var bounds = turf.bbox(practice.geometry);

                            map.fitBounds(bounds, {
                                padding: 40
                            });
                  //  }

                    if (self.drawControls) {

                        var feature = {
                            id: 'practice-' + practice.id,
                            type: 'Feature',
                            properties: {

                            },
                            paint: {
                                    'fill-color': '#df063e',
                                    'fill-opacity': 0.4
                            },
                            geometry: practice.geometry

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

                      if(self.site != null && self.site.geometry != null){

                        if(self.practice.geometry == null
                           || self.practice.geometry == 'undefined'
                        ){
                             var bounds = turf.bbox(self.site.geometry);

                             self.map.fitBounds(bounds, {
                                padding: 40
                             });
                        }
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


                    var map_ctrl_linestring = false;
                    var map_ctrl_point = false;
                    var map_ctrl_polygon = false;

                    console.log("self.practiceType.unit.dimension",self.practiceType.unit.dimension);

                    if(self.practiceType.unit.dimension == 'area'){
                        map_ctrl_polygon = true;
                    }
                    else if(self.practiceType.unit.dimension == 'length'){
                        map_ctrl_linestring = true;
                    }else{
                        map_ctrl_polygon = true;
                        map_ctrl_linestring = true;
                        map_ctrl_point = true;
                    }



                    self.drawControls = new MapboxDraw({
                        displayControlsDefault: false,
                        controls: {
                            line_string: map_ctrl_linestring,
                            point: map_ctrl_point,
                            polygon: map_ctrl_polygon,
                            trash: true
                        },
                        userProperties: true,
                        styles: [
                                    {
                                        'id': 'gl-draw-polygon-fill-inactive',
                                        'type': 'fill',
                                        'filter': ['all', ['==', 'active', 'false'],
                                            ['==', '$type', 'Polygon'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'paint': {
                                            'fill-color': '#df063e',
                                            'fill-outline-color': '#df063e',
                                            'fill-opacity': 0.5
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-fill-active',
                                        'type': 'fill',
                                        'filter': ['all', ['==', 'active', 'true'],
                                            ['==', '$type', 'Polygon']
                                        ],
                                        'paint': {
                                            'fill-color': '#df063e',
                                            'fill-outline-color': '#df063e',
                                            'fill-opacity': 0.1
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-midpoint',
                                        'type': 'circle',
                                        'filter': ['all', ['==', '$type', 'Point'],
                                            ['==', 'meta', 'midpoint']
                                        ],
                                        'paint': {
                                            'circle-radius': 3,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-stroke-inactive',
                                        'type': 'line',
                                        'filter': ['all', ['==', 'active', 'false'],
                                            ['==', '$type', 'Polygon'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#df063e',
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-stroke-active',
                                        'type': 'line',
                                        'filter': ['all', ['==', 'active', 'true'],
                                            ['==', '$type', 'Polygon']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#df063e',
                                            'line-dasharray': [0.2, 2],
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-line-inactive',
                                        'type': 'line',
                                        'filter': ['all', ['==', 'active', 'false'],
                                            ['==', '$type', 'LineString'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#df063e',
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-line-active',
                                        'type': 'line',
                                        'filter': ['all', ['==', '$type', 'LineString'],
                                            ['==', 'active', 'true']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#df063e',
                                            'line-dasharray': [0.2, 2],
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-and-line-vertex-stroke-inactive',
                                        'type': 'circle',
                                        'filter': ['all', ['==', 'meta', 'vertex'],
                                            ['==', '$type', 'Point'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'paint': {
                                            'circle-radius': 5,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-and-line-vertex-inactive',
                                        'type': 'circle',
                                        'filter': ['all', ['==', 'meta', 'vertex'],
                                            ['==', '$type', 'Point'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'paint': {
                                            'circle-radius': 3,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-point-point-stroke-inactive',
                                        'type': 'circle',
                                        'filter': ['all', ['==', 'active', 'false'],
                                            ['==', '$type', 'Point'],
                                            ['==', 'meta', 'feature'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'paint': {
                                            'circle-radius': 5,
                                            'circle-opacity': 1,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-point-inactive',
                                        'type': 'circle',
                                        'filter': ['all', ['==', 'active', 'false'],
                                            ['==', '$type', 'Point'],
                                            ['==', 'meta', 'feature'],
                                            ['!=', 'mode', 'static']
                                        ],
                                        'paint': {
                                            'circle-radius': 3,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-point-stroke-active',
                                        'type': 'circle',
                                        'filter': ['all', ['==', '$type', 'Point'],
                                            ['==', 'active', 'true'],
                                            ['!=', 'meta', 'midpoint']
                                        ],
                                        'paint': {
                                            'circle-radius': 7,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-point-active',
                                        'type': 'circle',
                                        'filter': ['all', ['==', '$type', 'Point'],
                                            ['!=', 'meta', 'midpoint'],
                                            ['==', 'active', 'true']
                                        ],
                                        'paint': {
                                            'circle-radius': 5,
                                            'circle-color': '#df063e'
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-fill-static',
                                        'type': 'fill',
                                        'filter': ['all', ['==', 'mode', 'static'],
                                            ['==', '$type', 'Polygon']
                                        ],
                                        'paint': {
                                            'fill-color': '#404040',
                                            'fill-outline-color': '#404040',
                                            'fill-opacity': 0.1
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-polygon-stroke-static',
                                        'type': 'line',
                                        'filter': ['all', ['==', 'mode', 'static'],
                                            ['==', '$type', 'Polygon']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#404040',
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-line-static',
                                        'type': 'line',
                                        'filter': ['all', ['==', 'mode', 'static'],
                                            ['==', '$type', 'LineString']
                                        ],
                                        'layout': {
                                            'line-cap': 'round',
                                            'line-join': 'round'
                                        },
                                        'paint': {
                                            'line-color': '#404040',
                                            'line-width': 2
                                        }
                                    },
                                    {
                                        'id': 'gl-draw-point-static',
                                        'type': 'circle',
                                        'filter': ['all', ['==', 'mode', 'static'],
                                            ['==', '$type', 'Point']
                                        ],
                                        'paint': {
                                            'circle-radius': 5,
                                            'circle-color': '#404040'
                                        }
                                    }
                            ]



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
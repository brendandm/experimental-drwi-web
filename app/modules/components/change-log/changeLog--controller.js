'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('ChangeLogController',
        function(ChangeLog, Account, $location, $log, Notifications, $rootScope,
            $route, $routeParams, user, User, Organization, SearchService, $timeout, Utility) {

            var self = this;

            $rootScope.viewState = {
                'changeLog': true
            };

            self.status = {
                loading: true,
                processing: false
            };

            self.alerts = [];

            function closeAlerts() {

                self.alerts = [];

            }

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                }, 250);

            };

            self.parseRouteParams = function() {

                self.featureId = $routeParams.id;

                var featureType = $routeParams.feature_type;

                var lastChar = featureType.slice(-1);

                if (lastChar === 's') {

                    featureType = featureType.slice(0, -1);

                }

                self.featureType = featureType;

                $rootScope.viewState = {
                    featureType: true
                };

                console.log('featureId-->', self.featureId);

                console.log('featureType-->', self.featureType);

            };

            /*START Pagniation vars*/
            self.limit = 25;
            self.page = 1;

            self.defaultPaginationLimits = true;
            self.limitLow = 25;
            self.limitMedium = 50;
            self.limitHigh = 100;

            self.viewCountLow = self.page;
            self.viewCountHigh = self.limit;

            self.calculateViewCount = function() {

                if (self.page > 1) {

                    if (self.page == 1) {
                        self.viewCountHigh = self.limit;
                        self.viewCountLow = ((self.page - 1) * self.limit);
                    } else if (self.summary.feature_count > ((self.page - 1) * self.limit) + self.limit) {
                        self.viewCountHigh = ((self.page - 1) * self.limit) + self.limit;
                        self.viewCountLow = ((self.page - 1) * self.limit) + 1;

                    } else {
                        self.viewCountHigh = self.summary.feature_count;
                        self.viewCountLow = ((self.page - 1) * self.limit) + 1;
                    }
                } else {
                    if (self.summary.feature_count > ((self.page - 1) * self.limit) + self.limit) {
                        self.viewCountLow = 1;
                        self.viewCountHigh = self.limit;
                    } else {
                        self.viewCountLow = 1;
                        self.viewCountHigh = self.summary.feature_count;

                    }

                }

            };

            self.changeLimit = function(limit) {
                self.limit = limit;
                self.page = 1;
                self.loadHistory();
            };

            self.getPage = function(page) {
                console.log('PAGE', page);

                if (page < 1) {
                    self.page = 1;
                } else if (page > self.summary.page_count) {
                    self.page = self.summary.page_count;
                } else {
                    self.page = page;

                    self.loadHistory();
                }

            };
            /*START Pagniation vars*/

            self.buildFilter = function() {

                console.log(
                    'self.buildFilter --> Starting...');

                var data = {
                    id: self.featureId,
                    type: self.featureType,
                    limit: self.limit,
                    page: self.page
                };

                //  $location.search(data);

                return data;
            };

            self.loadHistory = function() {

                ChangeLog.query({
                    id: self.featureId,
                    type: self.featureType,
                    limit: self.limit,
                    page: self.page,
                    tz_offset: self.tzOffset
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.feature = successResponse.feature;

                    self.feature_type = successResponse.feature_type;

                    self.changeLog = successResponse.history;

                    self.summary = successResponse.summary;

                    self.calculateViewCount();

                    if (!self.feature.permissions.write) {

                        self.makePrivate = true;

                        self.showElements(false);

                    } else {

                        self.permissions.can_edit = self.feature.permissions.write;
                        self.permissions.can_delete = self.feature.permissions.write;

                    }

                    self.parseResponse();

                    self.showElements();

                    console.log(
                        "self.feature_type",
                        self.feature_type );

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            self.parseResponse = function() {

                console.log('self.changeLog-->', self.changeLog);

                self.changeLog.forEach(function(group) {

                    group.changes.forEach(function(change) {

                        var separatorIdx = change.action.indexOf('_');

                        var op = change.action.substring(0, separatorIdx);

                        var featureType = change.action.substring(separatorIdx + 1);

                        console.log(
                            'self.parseResponse.op:',
                            op
                        );

                        console.log(
                            'self.parseResponse.featureType:',
                            featureType
                        );

                        if (change.diff &&
                            typeof change.diff !== 'undefined') {

                            for (var item in change.diff) {

                                console.log('A', item);

                                console.log('change.diff[item].type', change.diff[item].type);

                                if (change.diff[item].type === 'geometry') {

                                    console.log('E');

                                    if (change.diff[item].new_value != null) {

                                        console.log('F');

                                        change.diff[item].new_staticURL = Utility.buildStaticMapURL(
                                            change.diff[item].new_value, self.featureType);

                                    }

                                    if (change.diff[item].previous_value != null) {

                                        console.log('G');

                                        change.diff[item].previous_staticURL = Utility.buildStaticMapURL(
                                            change.diff[item].previous_value, self.featureType);

                                    }

                                }

                            }

                        } else {

                            if (op.indexOf('create') >= 0) {

                                var link;

                                var linkTxt;

                                switch(featureType) {

                                    case 'organization':

                                        link = 'organizations/' + change.data.id;

                                        linkTxt = change.data.name;

                                        break;

                                    case 'practice':

                                        link = 'practices/' + change.data.id;

                                        if (typeof change.data.name == 'string') {

                                            linkTxt = change.data.name;

                                        } else {

                                            linkTxt = 'Un-named practice (' + change.data.id + ')';

                                        }

                                        break;

                                    case 'program':

                                        link = 'programs/' + change.data.id;

                                        linkTxt = change.data.name;

                                        break;

                                    case 'project':

                                        link = 'projects/' + change.data.id;

                                        linkTxt = change.data.name;

                                        break;

                                    case 'project_member':

                                        link = 'profile/' + change.data.user.id;

                                        linkTxt = change.data.user.first_name + ' ' + change.data.user.last_name;

                                        break;

                                    case 'report':

                                        link = 'reports/' + change.data.id;

                                        linkTxt = change.data.report_date;

                                        break;

                                    case 'site':

                                        link = 'sites/' + change.data.id;

                                        if (typeof change.data.name == 'string') {

                                            linkTxt = change.data.name;

                                        } else {

                                            linkTxt = 'Un-named site (' + change.data.id + ')';

                                        }

                                        break;

                                    case 'tag':

                                        link = 'tags/' + change.data.id;

                                        linkTxt = change.data.name;

                                        break;

                                }

                                change.link = link;

                                change.linkTxt = linkTxt;

                            } else {

                                if (featureType === 'project_member') {

                                    change.deletedName = change.data.user.first_name + ' ' + change.data.user.last_name;

                                } else if (featureType.indexOf('target') >= 0) {

                                    change.deletedName = change.data.metric.name;
                                    
                                } else {

                                    change.deletedName = change.data.name;

                                }

                            }

                        }

                        change.op = op;

                        console.log(
                            'self.parseResponse.change:',
                            change
                        );

                    });

                });

                console.log('parsedResponse', self.changeLog);

            };

            /*
            createStaticMapUrls:
                takes self.sites as self.sites as argument
                iterates of self.sites
                checks if project extent exists
                checks if site geometry exists, if so, calls Utility.buildStateMapURL, pass geometry
                adds return to site[] as staticURL property
                if no site geometry, adds default URL to site[].staticURL
            */
            self.createStaticMapURLs = function(arr, feature_type) {

                console.log('createStaticMapURLS -> arr', arr);

                arr.forEach(function(feature, index) {

                    if (feature.geometry != null) {

                        feature.staticURL = Utility.buildStaticMapURL(feature.geometry, feature_type);

                        if (feature.staticURL.length >= 4096) {

                            feature.staticURL = ['https://api.mapbox.com/styles/v1',
                                '/mapbox/streets-v11/static/-76.4034,38.7699,3.67/400x200?access_token=',
                                'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                            ].join('');
                        }

                        console.log('feature.staticURL', feature.staticURL);

                        if (feature_type == 'site') {

                            self.changeLog[index].staticURL = feature.staticURL;

                            console.log('self.sites' + index + '.staticURL', self.changeLog[index].staticURL);

                        }
                        if (feature_type == 'practice') {
                            self.changeLog[index].staticURL = feature.staticURL;

                            console.log('self.practices' + index + '.staticURL', self.changeLog[index].staticURL);

                        }

                    } else {

                        if (feature_type == 'site') {
                            self.sites[index].staticURL = ['https://api.mapbox.com/styles/v1',
                                '/mapbox/streets-v11/static/0,0,3,0/400x200?access_token=',
                                'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                            ].join('');


                        }
                        if (feature_type == 'practice') {
                            self.practices[index].staticURL = ['https://api.mapbox.com/styles/v1',
                                '/mapbox/streets-v11/static/0,0,3,0/400x200?access_token=',
                                'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                            ].join('');

                        }

                    }

                });

            };

            // 
            // Verify Account information for proper UI element display
            //

            self.parseRouteParams();

            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.user = Account.userObject = userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                        can_edit: false,
                        is_manager: false,
                        is_admin: false
                    };

                    // 
                    // Retrieve the system's time zone offset.
                    // 

                    self.tzOffset = new Date().getTimezoneOffset();

                    self.loadHistory();

                });


            } else {

                $location.path('/logout');

            }

        });
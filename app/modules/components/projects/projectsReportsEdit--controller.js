(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name FieldDoc.controller:SiteEditController
     * @description
     * # SiteEditController
     * Controller of the FieldDoc
     */
    angular.module('FieldDoc')
        .controller('ProjectsReportsEditController',
            function(Account, environment, $http, $location, mapbox,
                Notifications, Project, project, $rootScope, $route, $scope,
                $timeout, $interval, user, Utility, Batch, Report) {

                var self = this;

                self.params;

                self.reportId = $route.current.params.reportId;

                self.date = {

                    year: 0000,
                    month: 00,
                    day: 00,
                    time: 00

                };


                $rootScope.toolbarState = {
                    'edit': true
                };

                $rootScope.page = {
                    title: 'Edit Report'
                };

                self.status = {
                    loading: true,
                    processing: false
                };

                self.alerts = [];

                self.closeAlerts = function() {

                        self.alerts = [];

                    };

                self.showElements = function() {

                    $timeout(function() {

                        self.status.loading = false;

                        self.status.processing = false;

                        $timeout(function() {

                            console.log("YES A");

                            console.log("self.practices", self.practices);
                            console.log("self.practices.length",self.practices.length);

                            if (self.practices && self.practices.length) {

                                console.log("YES B");

                                self.createStaticMapURLs(self.practices);

                            }

                        }, 500);

                    }, 1000);

                };

                self.loadProject = function() {

                    project.$promise.then(function(successResponse) {

                        console.log('self.project', successResponse);

                         self.project = successResponse;

                      //   self.practices = self.project.practices;



                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                            self.showElements(false);

                        } else {

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                            $rootScope.page.title = 'Project Batch Delete';

                            self.loadBundle();

                        }

                        self.tags = Utility.processTags(self.project.tags);

                        // self.showElements();

                         self.loadBundle ();

                    }).catch(function(errorResponse) {

                        console.log('loadProject.errorResponse', errorResponse);

                        self.showElements(false);

                    });

                };

                self.loadReport = function(){

                };

                self.loadBundle = function(){

                    console.log("Loading Report");

                    Report.reportBundle({id:self.reportId}).$promise.then(function(successResponse) {

                        console.log("reportBundle successResponse");

                        console.log(successResponse);

                        self.bundle = successResponse;

                        self.practices = self.bundle.practices;

                        console.log("self.practices", self.practices);

                        self.showElements();

                    }, function(errorResponse){

                        console.log("errorResponse");

                        console.log(errorResponse);

                        self.showElements(false);

                    });

                };

                self.loadPractices = function(){

                    console.log("Load Practices");




                };

            /*  createStaticMapUrls:
                takes self.sites as self.practices as argument
                iterates of self.practices
                checks if project extent exists
                checks if practice geometry exists, if so, calls Utility.buildStateMapURL, pass geometry
                adds return to practices[] as staticURL property
                if no site geometry, adds default URL to practices[].staticURL
            */
                self.createStaticMapURLs = function(arr){

                    console.log("ONE");

                    arr.forEach(function(feature, index) {

                           console.log("TWO");

                         if (feature.project.extent) {

                              console.log("THREE");

                            if(feature.geometry != null){

                                console.log("FOUR");

                                feature.staticURL = Utility.buildStaticMapURL(feature.geometry);

                                self.practices[index].staticURL = feature.staticURL;

                            }else{

                                 console.log("FIVE");

                                self.practices[index].staticURL = ['https://api.mapbox.com/styles/v1',
                                                            '/mapbox/streets-v11/static/0,0,3,0/400x200?access_token=',
                                                            'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                                                        ].join('');
                            }

                        }

                    });
                }

                self.inspectSearchParams = function(params) {

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
                            can_edit: false,
                            can_delete: false
                        };

                        project.$promise.then(function(successResponse) {
                            console.log('self.project', successResponse);
                            self.project = successResponse;
                            if (successResponse.permissions.read && successResponse.permissions.write) {
                                self.makePrivate = false;
                            } else {
                                self.makePrivate = true;
                            }
                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;
                            $rootScope.page.title = self.project.name;
                            self.loadProject();



                          //  self.showElements();

                        }, function(errorResponse) {

                            self.showElements();

                        });

                    });

                } else {

                    $location.path('/logout');

                }




       });

}());
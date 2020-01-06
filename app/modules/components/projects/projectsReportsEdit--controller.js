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


                              //
                // Setup all of our basic date information so that we can use it
                // throughout the page
                //
                self.today = new Date();

                self.days = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday'
                ];

                self.months = [{
                        'shortName': 'Jan',
                        'name': 'January',
                        'numeric': '01'
                    },
                    {
                        'shortName': 'Feb',
                        'name': 'February',
                        'numeric': '02'
                    },
                    {
                        'shortName': 'Mar',
                        'name': 'March',
                        'numeric': '03'
                    },
                    {
                        'shortName': 'Apr',
                        'name': 'April',
                        'numeric': '04'
                    },
                    {
                        'shortName': 'May',
                        'name': 'May',
                        'numeric': '05'
                    },
                    {
                        'shortName': 'Jun',
                        'name': 'June',
                        'numeric': '06'
                    },
                    {
                        'shortName': 'Jul',
                        'name': 'July',
                        'numeric': '07'
                    },
                    {
                        'shortName': 'Aug',
                        'name': 'August',
                        'numeric': '08'
                    },
                    {
                        'shortName': 'Sep',
                        'name': 'September',
                        'numeric': '09'
                    },
                    {
                        'shortName': 'Oct',
                        'name': 'October',
                        'numeric': '10'
                    },
                    {
                        'shortName': 'Nov',
                        'name': 'November',
                        'numeric': '11'
                    },
                    {
                        'shortName': 'Dec',
                        'name': 'December',
                        'numeric': '12'
                    }
                ];

                function parseISOLike(s) {
                    var b = s.split(/\D/);
                    return new Date(b[0], b[1] - 1, b[2]);
                }

                $scope.$watch(angular.bind(this, function() {

                    return this.date;

                }), function(response) {
                        if (response) {

                            var _new = response.year + '-' + response.month.numeric + '-' + response.date,
                                _date = new Date(_new);
                            self.date.day = self.days[_date.getDay()];

                        }


                }, true);


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

                            if (self.bundle.date) {

                                self.today = parseISOLike(self.bundle.date);

                            }

                            //
                            // Check to see if there is a valid date
                            //
                            self.date = {
                                month: self.months[self.today.getMonth()],
                                date: self.today.getDate(),
                                day: self.days[self.today.getDay()],
                                year: self.today.getFullYear()
                            };



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

                 self.addReading = function(measurementPeriod) {

                    var newReading = new Report({
                        'measurement_period'    : 'Installation',
                        'report_date'           : new Date(),
                        'practice_id'           : self.selectedPractice.id,
                        'organization_id'       : self.selectedPractice.organization_id,
                        'bundle_id'             : self.bundle.id
                    });

                    newReading.$save().then(function(successResponse) {

                     //   $location.path('/reports/' + successResponse.id + '/edit');

                            console.log("Report Created",successResponse.id);

                        self.loadMatrix(successResponse.id);

                          //  self.loadMetrics(successResponse.id);

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

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


                self.showPracticeModal = function(p_id){

                    console.log("SHOW PRACTICE "+p_id);

                    self.selectedPractice = {};

                    self.practices.forEach(function(practice){

                        if(practice.id == p_id){

                            self.selectedPractice = practice;

                            self.addReading("Installation");



                            console.log("SELECTED PRACTICE", practice)

                        }

                    });

                    self.displayModal = true;

                };

                self.loadMatrix = function(report_id) {

                    //
                    // Assign practice to a scoped variable
                    //
                    Report.targetMatrix({
                        id: report_id,
                        simple_bool: 'true'
                    }).$promise.then(function(successResponse) {

                        self.targets = successResponse;

                        console.log("self.targets",self.targets);

                        self.showElements();

                    }).catch(function(errorResponse) {

                        console.error('Unable to load report target matrix.');

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to load report metric targets.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                    });

                };

                 self.loadMetrics = function(report_id) {

                    Report.metrics({
                        id: report_id
                    }).$promise.then(function(successResponse) {

                        console.log('Report metrics', successResponse);

                        var _reportMetrics = [];

                        successResponse.features.forEach(function(metric) {

                            var datum = self.processMetric(metric);

                            _reportMetrics.push(datum);

                        });

                        self.reportMetrics = _reportMetrics;

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                    });

                };


                 self.closePracticeModal = function(){

                    console.log("CLOSE PRACTICE ");

                    self.displayModal = false;

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

                //    console.log("ONE");

                    arr.forEach(function(feature, index) {

                        //   console.log("TWO");

                         if (feature.project.extent) {

                       //       console.log("THREE");

                            if(feature.geometry != null){

                      //          console.log("FOUR");

                                feature.staticURL = Utility.buildStaticMapURL(feature.geometry);

                                self.practices[index].staticURL = feature.staticURL;

                            }else{

                      //           console.log("FIVE");

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
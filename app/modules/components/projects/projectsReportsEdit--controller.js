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

                             //   self.today = self.b

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

                    self.report = successResponse;

                        self.loadMatrix(successResponse.id);

                          //  self.loadMetrics(successResponse.id);

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                };

                self.loadBundle = function(){

                    console.log("Loading Report");

                    Report.reportBundle({
                        id:self.reportId
                    }).$promise.then(function(successResponse) {

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

                function parseISOLike(s) {
                    var b = s.split(/\D/);
                    return new Date(b[0], b[1] - 1, b[2]);
                }

                self.formatDate = function(rawDate){
                    var formattedDate = {
                                month: self.months[rawDate.getMonth()],
                                date: rawDate.getDate(),
                                day: self.days[rawDate.getDay()],
                                year: rawDate.getFullYear()
                    }

                    return formattedDate;
                }


                self.showPracticeModal = function(p_id){

                    console.log("SHOW PRACTICE "+p_id);

                    self.selectedPractice = {};

                    self.practices.forEach(function(practice){

                        if(practice.id == p_id){

                            self.selectedPractice = practice;

                            self.report = self.selectedPractice.report;

                            console.log("I AM A REPORT", self.report);

                            if(self.selectedPractice.date == undefined){
                                if(self.selectedPractice.report != undefined){
                                    self.selectedPractice.date = parseISOLike(self.selectedPractice.report.report_date);
                                }else{
                                    self.selectedPractice.date = new Date();
                                }

                            }

                            console.log("SELECTED PRACTICE YO YO YO", self.selectedPractice);



                            self.reportDate = {
                                month: self.months[self.selectedPractice.date.getMonth()],
                                date: self.selectedPractice.date.getDate(),
                                day: self.days[self.selectedPractice.date.getDay()],
                                year: self.selectedPractice.date.getFullYear()
                            };

                    //        self.reportDate = self.formatDate(self.selectedPractice.date);

                            console.log("self.reportDate",self.reportDate);

                            if(self.selectedPractice.report != undefined ){

                                console.log("SHOW EXISTING REPORT:",self.selectedPractice.report);

                                self.loadMatrix(self.selectedPractice.report.id);

                            }else{

                                 console.log("CREATE REPORT");

                                self.addReading("Installation");

                            }





                            console.log("SELECTED PRACTICE", practice)

                        }

                    });

                    self.displayModal = true;

                };


                self.loadMatrix = function(report_id) {

                    console.log("Report_id", report_id);
                    //
                    // Assign practice to a scoped variable
                    //
                    Report.targetMatrix({
                        id: report_id,
                        simple_bool: 'true'
                    }).$promise.then(function(successResponse) {

                        self.targets = successResponse;

                        console.log("self.targets",self.targets);

                         console.log("targetMatrix", successResponse);

                     //    console.log()

               /*         if(self.targets.inactive.length > 0){
                            self.targets.inactive.forEach(function(target){
                                self.targets.active.push(target);
                            });
                            self.targets.inactive = [];
                        }
                */
                        console.log("self.targets",self.targets);

                         console.log("targetMatrix", successResponse);

                // HERE - HERE
                 //        self.report = successResponse;

                         self.report.id = report_id;

                        console.log("self.report",self.report);

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

                    console.log("Loading Metrics !!!!");

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


                self.processReport = function(data) {

                    self.report = data;

                    console.log("PROCESS REPORT", data);


             //       self.loadMatrix(self.report.id);
            //        self.loadMetrics(self.report.id);

                };


                self.addTarget = function(item, idx) {

                    if (!item.value ||
                        typeof item.value !== 'number') {

                        item.value = 0;

                    };

                    if (typeof idx === 'number') {

                        item.action = 'add';

                        if (!item.metric ||
                            typeof item.metric === 'undefined') {

                            item.metric_id = item.id;

                            delete item.id;

                        }

                        self.targets.inactive.splice(idx, 1);

                        self.targets.active.push(item);

                    }

                    console.log('Updated targets (addition)');

                };

                self.removeAll = function() {

                    self.targets.active.forEach(function(item) {

                        self.targets.inactive.unshift(item);

                    });

                    self.targets.active = [];

                };

                 self.removeTarget = function(item, idx) {

                    if (typeof idx === 'number') {

                        self.targets.active.splice(idx, 1);

                        item.action = 'remove';

                        item.value = null;

                        self.targets.inactive.unshift(item);

                    }

                    console.log('Updated targets (removal)');

                };


                self.saveTargets = function() {

                    self.status.processing = true;

                    // self.scrubFeature(self.report);

                    console.log("self.targets",self.targets);
                    console.log("self.targets.active",self.targets.active);

                    var data = {
                        targets: self.targets.active.slice(0)
                    };

                    self.targets.inactive.forEach(function(item) {

                        if (item.action &&
                            item.action === 'remove') {

                            data.targets.push(item);

                        }

                    });

                    console.log("TIGER",self.report);
                    console.log("data",data);

                    Report.updateMatrix({
                        id: self.report.id
                    }, data).$promise.then(function(successResponse) {

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Target changes saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.status.processing = false;

                        console.log("data Success",successResponse)
                     //   console.log(successResponse);

                    }).catch(function(error) {

                        console.log('saveReport.error', error);

                        // Do something with the error

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Something went wrong and the target changes were not saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.status.processing = false;

                    });

                };



                self.saveReport = function() {

                    console.log("REPORT", self.report);

                    console.log("REPORT_ID", self.report.id);

                    self.status.processing = true;

                 //   self.scrubFeature(self.report);

                    if (self.reportDate.month.numeric !== null &&
                        typeof self.reportDate.month.numeric === 'string') {

                        console.log("AAAAA");

                        self.report.report_date = self.reportDate.year + '-' + self.reportDate.month.numeric + '-' + self.reportDate.date;

                        self.selectedPractice.date =   parseISOLike(self.report.report_date);

                    } else {

                        console.log("BBBBB");

                        self.report.report_date = self.reportDate.year + '-' + self.reportDate.month + '-' + self.reportDate.date;

                        self.selectedPractice.date =  parseISOLike(self.report.report_date);

                    }

                    self.reportDate = {
                                month: self.months[self.selectedPractice.date.getMonth()],
                                date: self.selectedPractice.date.getDate(),
                                day: self.days[self.selectedPractice.date.getDay()],
                                year: self.selectedPractice.date.getFullYear()
                            };

                    console.log("UPDATE REPORT DATE",self.reportDate);

                    console.log(self.report.id);
                    console.log(self.report);

                    Report.update({
                        id: self.report.id
                    }, self.report).$promise.then(function(successResponse) {

                        console.log("YO YO YO");

                        console.log("REPORT UPDATE", successResponse);

                        self.processReport(successResponse);

                 //       self.reportDate = self.formatDate(self.selectedPractice.date);



                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Report changes saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                 //       self.saveTargets();

                 //       self.loadMatrix(self.report.id);
                 //       self.loadMetrics(self.report.id);

                        self.showElements();

                    }).catch(function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Report changes could not be saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(self.closeAlerts, 2000);

                        self.showElements();

                    });
                }

                self.saveBundle = function(){

                    console.log("SAVE THAT BUNDLE !!!");
                    console.log("BundleTitle",self.bundle.title);
                    console.log("BundleNotes",self.bundle.notes);
                    console.log("self.bundle.date",self.bundle.date);
                    console.log("self.date",self.date);
                    console.log(self.bundle);

                    Report.reportBundleUpdate({
                        id: self.bundle.id
                    }, self.bundle).then(function(successResponse) {

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Changes saved.',
                                'prompt': 'OK'
                            }];

                            $timeout(self.closeAlerts, 2000);

                            self.status.processing = false;

                            console.log("data Success",successResponse)
                         //   console.log(successResponse);

                        }).catch(function(error) {

                            console.log('saveReport.error', error);

                            // Do something with the error

                            self.alerts = [{
                                'type': 'success',
                                'flag': 'Success!',
                                'msg': 'Something went wrong and the changes were not saved.',
                                'prompt': 'OK'
                            }];

                            $timeout(self.closeAlerts, 2000);

                            self.status.processing = false;

                        });

                    }







                self.scrubFeature = function(feature) {

                    var excludedKeys = [
                        'creator',
                        'geometry',
                        'last_modified_by',
                        'organization',
                        'practice',
                        'program',
                        'project',
                        'properties',
                        'site',
                        'status',
                        'tags',
                        'targets',
                        'tasks',
                        'users'
                    ];

                    var reservedProperties = [
                        'links',
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
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
        .controller('ProjectsReportsController',
            function(Account, environment, $http, $location, mapbox,
                Notifications, Project, project, $rootScope, $route, $scope,
                $timeout, $interval, user, Utility, Report) {

                var self = this;

                self.params;

                self.confirmBatchDelete = false;
                self.toggleConfirmDelete = false;

                self.unselectedFeatures = [];
                self.selectedFeatures = [];

                $rootScope.toolbarState = {
                    'edit': true
                };

                $rootScope.page = {
                    title: 'Select or Create Reports'
                };

                self.status = {
                    loading: true,
                    processing: false
                };

                self.alerts = [];

                self.closeAlerts = function() {

                        self.alerts = [];

                    };


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


                 self.formatDate = function(rawDate){
                    var formattedDate = {
                                month: self.months[rawDate.getMonth()],
                                date: rawDate.getDate(),
                                day: self.days[rawDate.getDay()],
                                year: rawDate.getFullYear()
                    }

                    return formattedDate;
                }



                 self.showElements = function() {

                    $timeout(function() {

                        self.status.loading = false;

                        self.status.processing = false;

                        $timeout(function() {

                        //    if (self.sites && self.sites.length) {

                        //        self.createStaticMapURLs(self.sites);

                        //    }

                        }, 500);

                    }, 1000);

                };



                self.loadProject = function() {

                    project.$promise.then(function(successResponse) {

                        console.log('self.project', successResponse);

                         self.project = successResponse;

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                            self.showElements(false);

                        } else {

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                      //      $rootScope.page.title = 'Project Batch Delete';

                        self.mapReportsToPrograms();

                           // self.loadReports();

                        }

                        self.tags = Utility.processTags(self.project.tags);

                        // self.showElements();

                    }).catch(function(errorResponse) {

                        console.log('loadProject.errorResponse', errorResponse);

                        self.showElements(false);

                    });

                };

                self.mapReportsToPrograms = function(){

                    self.reports = self.project.reports;

                    self.reports.forEach(function(r){
                            console.log("BUNDLE", r);

                        //    var f_date = self.formatDate(r.date);

                            if(r.date == undefined){
                            //    if(self.selectedPractice.report != undefined){
                             var r_iso_date parseISOLike(r.date);
                            //    }else{
                            //        self.selectedPractice.date = new Date();
                            //    }

                            }

                           var f_date = {
                                month: self.months[r_iso_date.getMonth()],
                                date: r_iso_date.getDate(),
                                day: self.days[r_iso_date.getDay()],
                                year: r_iso_date.getFullYear()
                            };


                            console.log("f_date", f_date);

                            self.reports[i].formatted_date = f_date;

                        });


                    self.programs = self.project.programs;

                    self.matrix = [];

                    var i = 0;

                    self.programs.forEach(function(program,p_i){

                        self.matrix[i] = program;

                        self.matrix[i].reports = [];

                        var i2 = 0;

                        self.reports.forEach(function(report,r_i){

                            if(program.id == report.program_id){

                                self.matrix[i].reports.push(report);

                            }

                            i2 = i2+1;

                        });

                        i = i+1;
                    });

                    console.log(self.matrix);

                     self.showElements();
                };


                self.loadReports = function(){
                    console.log("Loading Reports");

                    Report.projectReport({id:self.project.id}).$promise.then(function(successResponse) {

                        console.log("self.loadReports",successResponse);

                        self.showElements();

                        self.reports = successResponse.features;

                        var i = 0;

                        self.reports.forEach(function(r){
                            console.log("BUNDLE", r);

                            var f_date = self.formatDate(r.date);

                            console.log("f_date", f_date);

                            self.reports[i].formatted_date = f_date;

                        });

                        console.log("self.reports",self.reports)

                    }, function(errorResponse){

                        console.log(errorResponse);

                        self.showElements(false);
                    });

                };


                self.testMe = function(program_id){
                    console.log("TEST ME", program_id);
                };

                self.createReportBundle = function(program_id){

                    console.log("Add Report to program id# "+program_id);

                    console.log("DATE NOW",Date.now());

                   var d = new Date();
                   var n = d.toISOString();

                    console.log(d);
                    console.log(n);


                    Report.createReportBundle(
                        {
                          //  "title": "I eat food",
                           // "notes": "Cats are super",
                           // "date": "2019-12-09",
                            "date": n,
                            "organization_id": self.project.organization_id,
                            "project_id": self.project.id,
                            "program_id": program_id
                        }
                    )
                    .$promise.then(function(successResponse) {

                        console.log(successResponse);

                        self.newReport = successResponse;

                        $location.path('/projects/'+self.project.id+"/reports/"+self.newReport.id);

                    }, function(errorResponse){

                        console.log(errorResponse);

                    });


                };

              
                self.inspectSearchParams = function(params) {

                };

                self.deleteBundle = function(report_id)

                /*
                Please write me, I don't want to exist
                */

                {};

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

                        console.log("$rootScope.user",$rootScope.user);

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
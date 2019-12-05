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

                    self.programs = self.project.programs;

                    self.matrix = [];

                    var i = 0;

                    self.programs.forEach(function(program,p_i){

                        self.matrix[i] = program;

                        var i2 = 0;

                        self.reports.forEach(function(report,r_i){

                            if(program.id == reports.id){

                            self.matrix[i].reports[i2] = report;

                            }

                            i2 = i2+1;

                        });

                        i = i+1;
                    });
                };


                self.loadReports = function(){
                    console.log("Loading Reports");

                    Report.projectReport({id:self.project.id}).$promise.then(function(successResponse) {

                        console.log("self.loadReports",successResponse);

                        self.showElements();

                        self.reports = successResponse.features;

                        console.log("self.reports",self.reports)

                    }, function(errorResponse){

                        console.log(errorResponse);

                        self.showElements(false);
                    });

                };



              
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
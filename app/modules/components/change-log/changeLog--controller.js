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

            self.featureId = $routeParams.id;
            console.log("featureId-->",self.featureId);
            self.featureType = $routeParams.feature_type;
            console.log("featureType-->",self.featureType);

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                }, 250);

            };

      /*START Pagniation vars*/
            self.limit = 12;
            self.page = 1;

            self.viewCountLow = self.page;
            self.viewCountHigh =  self.limit;

            self.calculateViewCount = function(){
               if(self.page > 1){

                    if(self.page == 1){
                        self.viewCountHigh = self.limit;
                         self.viewCountLow = ((self.page-1) * self.limit);
                    }else if( self.summary.feature_count > ((self.page-1) * self.limit) + self.limit ){
                        self.viewCountHigh = ((self.page-1) * self.limit) +self.limit;
                         self.viewCountLow = ((self.page-1) * self.limit)+1;

                    }else{
                        self.viewCountHigh = self.summary.feature_count;
                         self.viewCountLow = ((self.page-1) * self.limit)+1;
                    }
               }else{
                    if( self.summary.feature_count > ((self.page-1) * self.limit) + self.limit ){
                          self.viewCountLow = 1;
                          self.viewCountHigh = self.limit;
                    }else{
                        self.viewCountLow = 1;
                        self.viewCountHigh = self.summary.feature_count;

                    }

               }

            }

            self.changeLimit = function(limit){
                self.limit = limit;
                self.page = 1;
                self.loadProjects();
            }

             self.getPage = function(page){
                console.log("PAGE",page);

                if(page < 1){
                    self.page = 1;
                }else if(page > self.summary.page_count){
                    self.page = self.summary.page_count;
                }else{
                     self.page   = page;

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
                    limit:  self.limit,
                    page:   self.page
                };

              //  $location.search(data);

                return data;
            }

            self.loadHistory = function() {

           //     var params = self.buildFilter();

                ChangeLog.history({
                    id: self.featureId,
                    type: self.featureType,
                    limit:  self.limit,
                    page:   self.page
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    successResponse.features.forEach(function(feature) {

                    });

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = self.user = userResponse;
                    console.log('userResponse',userResponse);
                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                    };
                    console.log(" self.permissions", self.permissions);
                    //
                    // Setup page meta data
                    //
                    $rootScope.page = {
                        'title': 'Change Log'
                    };

                    //
                    // Load history data
                    //
                     self.loadHistory();



                });


            } else {

                $location.path('/logout');

            }



        });
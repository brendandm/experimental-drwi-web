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

            self.parseRouteParams = function(){
                  self.featureId = $routeParams.id;

                    if($routeParams.feature_type){
                            if($routeParams.feature_type == 'projects'){
                                self.featureType = 'project';
                            }else if($routeParams.feature_type == 'sites'){
                                self.featureType = 'site';
                            }else if($routeParams.feature_type == 'practices'){
                                self.featureType = 'practice';
                            }else if($routeParams.feature_type == 'programs'){
                                self.featureType = 'program';
                            }else if($routeParams.feature_type == 'organization'){
                                self.featureType = 'organization';
                            }
                        }


                         console.log("featureId-->",self.featureId);
                        console.log("featureType-->",self.featureType);
            }

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

                ChangeLog.query({
                    id: self.featureId,
                    type: self.featureType,
                    limit:  self.limit,
                    page:   self.page
                }).$promise.then(function(successResponse) {

                    console.log('successResponse', successResponse);

                    self.subjectFeature = successResponse.feature;

                    self.changeLog = successResponse.history;

                    self.parseResponse();

                    self.showElements();

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                    self.showElements();

                });

            };

            self.parseResponse = function(){
                  //  var changeLogTemp = changeLog;
                    var i =0;
                    console.log("self.changeLog-->",self.changeLog);
                    self.changeLog.forEach(function(group){

                          var c = 0;
                          group.changes.forEach(function(change){

                              if(change.diff != null){
                                 if(change.diff.hasOwnProperty('geometry')){
                                    self.changeLog[i].changes[c].diff.geometry.new_staticURL =Utility.buildStaticMapURL(change.diff.geometry.new_value,self.featureType);;

                                 }
                             }
                             c = c+1;
                          });
                        i = i+1;
                    });
                    console.log("parsedResponce",self.changeLog);
            }

            /*
            createStaticMapUrls:
                takes self.sites as self.sites as argument
                iterates of self.sites
                checks if project extent exists
                checks if site geometry exists, if so, calls Utility.buildStateMapURL, pass geometry
                adds return to site[] as staticURL property
                if no site geometry, adds default URL to site[].staticURL
            */
            self.createStaticMapURLs = function(arr, feature_type){
                console.log("createStaticMapURLS -> arr", arr)

                arr.forEach(function(feature, index) {

                            if(feature.geometry != null){

                                feature.staticURL = Utility.buildStaticMapURL(feature.geometry,feature_type);

                                if(feature.staticURL.length >= 4096){

                                       feature.staticURL = ['https://api.mapbox.com/styles/v1',
                                                            '/mapbox/streets-v11/static/-76.4034,38.7699,3.67/400x200?access_token=',
                                                            'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                                                        ].join('');
                                }

                                console.log('feature.staticURL',feature.staticURL);

                                if(feature_type == "site"){

                                    self.changeLog[index].staticURL = feature.staticURL;

                                     console.log("self.sites"+index+".staticURL",self.changeLog[index].staticURL);

                                }
                                if(feature_type == "practice"){
                                     self.changeLog[index].staticURL = feature.staticURL;

                                     console.log("self.practices"+index+".staticURL",self.changeLog[index].staticURL);

                                }



                            }else{

                                 if(feature_type == "site"){
                                    self.sites[index].staticURL = ['https://api.mapbox.com/styles/v1',
                                                                '/mapbox/streets-v11/static/0,0,3,0/400x200?access_token=',
                                                                'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                                                            ].join('');


                                 }
                                 if(feature_type == "practice"){
                                     self.practices[index].staticURL = ['https://api.mapbox.com/styles/v1',
                                                                '/mapbox/streets-v11/static/0,0,3,0/400x200?access_token=',
                                                                'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                                                            ].join('');

                                 }

                            }

                    //    }else{
                     //      console.log("A 7");
                     //   }

                });

            }


            // Verify Account information for proper UI element display
            //

            self.parseRouteParams();

            if (Account.userObject && user) {

                user.$promise.then(function(userResponse) {

                    $rootScope.user = Account.userObject = userResponse;

                    self.user = Account.userObject = userResponse;

                    console.log("$rootScope.user-->",$rootScope.user);

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[0],
                        account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                       // can_edit:
                    };
                    //
                     self.loadHistory();



                });


            } else {

                $location.path('/logout');

            }



          //  var params = $location.search();
         //   self.inspectSearchParams(params);



        });
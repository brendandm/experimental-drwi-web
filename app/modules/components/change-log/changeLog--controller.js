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

            var featureId = $routeParams.id;
            console.log("featureId-->",featureId);
            var featureType = $routeParams.feature_type;
            console.log("featureType-->",featureType);

            self.showElements = function() {

                $timeout(function() {

                    self.status.loading = false;

                    self.status.processing = false;

                }, 250);

            };


            self.loadHistory = function() {

                var params = self.buildFilter();

                Project.collection(params).$promise.then(function(successResponse) {

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
                    // Load organization data
                    //



                });


            } else {

                $location.path('/logout');

            }



        });
(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('ProgramPracticeListController', [
            'Account',
            '$location',
            '$timeout',
            '$log',
            '$rootScope',
            '$route',
            'Utility',
            'user',
            '$window',
            'mapbox',
            'Model',
            'Project',
            'Program',
            function(Account, $location, $timeout, $log, $rootScope,
                $route, Utility, user, $window, mapbox, Model,
                Project, Program) {

                 console.log("YES");

                var self = this;

                self.modelId = $route.current.params.modelId;

                $rootScope.viewState = {
                    'model': true
                };

                $rootScope.toolbarState = {
                    'dashboard': true
                };

                $rootScope.page = {};

                self.status = {
                    loading: true
                };

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path(self.model.links.site.html);

                }

                self.loadProgram = function() {

                    Program.$promise.then(function(successResponse) {

                        console.log('self.program', successResponse);

                        self.model = successResponse;

                        $rootScope.model = successResponse;

                        $rootScope.page.title = self.model.name ? self.model.name : 'Un-named Model';

                        self.status.loading = false;

                        self.loadPractices();

                    }, function(errorResponse) {



                    });

                };

                self.loadTags = function() {

                    //

                };

                self.loadMetrics = function() {

                    //

                };

                self.loadProjects = function() {

                    //

                };

                self.loadPractices = function() {

                    Model.practiceTypes({
                        id: self.model.id
                    }).$promise.then(function(successResponse) {

                        console.log('Model.practiceTypes successResponse', successResponse);

                        var practiceTypes = [];

                        successResponse.features.forEach(function(feature) {

                            if(feature.model_practice_type.model_id == self.model.id){

                                practiceTypes.push(feature.practice_type);

                            }

                        });

                        self.practiceTypes = practiceTypes;

                    }, function(errorResponse) {

                        console.log('Model.practiceTypes errorResponse', errorResponse);

                    });

                };

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {

                    user.$promise.then(function(userResponse) {

                        console.log("DRIVE");

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0],
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                            can_edit: true
                        };

                        self.loadProgram();

                    });
                }

            }
        ]);

}());
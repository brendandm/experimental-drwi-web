(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomSummaryController', function(Account, $location,
            $log, PracticeCustom, $rootScope, $route, $scope, summary,
            Utility, user, $window) {

            var self = this,
                projectId = $route.current.params.projectId,
                siteId = $route.current.params.siteId,
                practiceId = $route.current.params.practiceId;

            $rootScope.page = {};

            self.practiceType = null;

            self.project = {
                'id': projectId
            };

            self.status = {
                loading: true
            };

            summary.$promise.then(function(successResponse) {

                self.data = successResponse;

                console.log('self.summary', successResponse);

                self.summary = successResponse;

                //
                // Determine if the actions should be shown or hidden depending on
                // whether of not this practice has planning data
                //
                if (self.summary.practice.properties.has_planning_data) {
                    $rootScope.page.hideActions = false;
                } else {
                    $rootScope.page.hideActions = true;
                }

                $rootScope.page.title =
                    "Other Conservation Practice";

                self.practiceType = Utility.machineName(self.summary
                    .practice.properties.practice_type);

                $rootScope.page.links = [{
                        text: 'Projects',
                        url: '/projects'
                    },
                    {
                        text: self.summary.site.properties.project
                            .properties.name,
                        url: '/projects/' + projectId
                    },
                    {
                        text: self.summary.site.properties.name,
                        url: '/projects/' + projectId +
                            '/sites/' + siteId
                    },
                    {
                        text: "Other Conservation Practice",
                        url: '/projects/' + projectId +
                            '/sites/' + siteId +
                            '/practices/' + practiceId,
                        type: 'active'
                    }
                ];

                $rootScope.page.actions = [{
                        type: 'button-link',
                        action: function() {
                            $window.print();
                        },
                        hideIcon: true,
                        text: 'Print'
                    },
                    {
                        type: 'button-link',
                        action: function() {
                            $scope.$emit('saveToPdf');
                        },
                        hideIcon: true,
                        text: 'Save as PDF'
                    },
                    {
                        type: 'button-link new',
                        action: function() {
                            self.addReading();
                        },
                        text: 'Add Measurement Data'
                    }
                ];

                self.status.loading = false;
            }, function() {});

            //
            // Verify Account information for proper UI element display
            //
            if (Account.userObject && user) {
                user.$promise.then(function(userResponse) {
                    $rootScope.user = Account.userObject =
                        userResponse;

                    self.permissions = {
                        isLoggedIn: Account.hasToken(),
                        role: $rootScope.user.properties.roles[
                            0].properties.name,
                        account: ($rootScope.account &&
                                $rootScope.account.length) ?
                            $rootScope.account[0] : null,
                        can_edit: true
                    };
                });
            }

            self.addReading = function(measurementPeriod) {

                if (measurementPeriod === "Planning") {
                    var newReading = new PracticeCustom({
                        'measurement_period': measurementPeriod,
                        'report_date': new Date(),
                        'practice_id': practiceId,
                        'account_id': self.summary.site.properties
                            .project.properties.account_id
                    });
                } else {

                    var defaults = angular.copy(self.summary.practice
                        .properties.defaults.properties);

                    defaults.measurement_period = "Installation";

                    var newReading = new PracticeCustom(defaults);
                }

                newReading.$save().then(function(successResponse) {
                    $location.path('/projects/' + projectId +
                        '/sites/' + siteId +
                        '/practices/' + practiceId +
                        '/' + self.practiceType + '/' +
                        successResponse.id + '/edit');
                }, function(errorResponse) {
                    console.error('ERROR: ', errorResponse);
                });
            };

        });

}());
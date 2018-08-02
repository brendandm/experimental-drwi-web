(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomFormController', function(Account, leafletData, $location, metric_types,
            monitoring_types, practice, PracticeCustom, PracticeCustomReading, PracticeCustomMetric,
            PracticeCustomMonitoring, practice_types, report, $rootScope, $route, site, $scope,
            unit_types, user, Utility) {

            var self = this,
                projectId = $route.current.params.projectId,
                siteId = $route.current.params.siteId,
                practiceId = $route.current.params.practiceId;

            $rootScope.page = {};

            self.status = {
                loading: true,
                readings: {
                    loading: false
                },
                metrics: {
                    loading: false
                },
                monitoring: {
                    loading: false
                }
            };

            self.practiceType = null;
            self.practiceTypes = practice_types;

            self.unitTypes = unit_types;

            self.metricType = null;
            self.metricTypes = metric_types;

            self.monitoringType = null;
            self.monitoringTypes = monitoring_types;

            self.project = {
                'id': projectId
            };

            self.custom_practice_type = [];

            self.custom_metric_type = [];

            self.custom_monitoring_type = [];

            self.actions = {
                addNewPracticeType: function(existingReading) {

                    angular.forEach(self.report.properties.readings, function(reading, index) {
                        if (existingReading.id === reading.id) {
                            self.report.properties.readings[index].properties.practice_type = {
                                "properties": {
                                    "name": "",
                                    "group": "Other",
                                    "source": "Add by user_id " + $rootScope.user.id
                                }
                            }
                        }
                    })

                    // Mark the field as visible.
                    self.custom_practice_type[existingReading.id] = true;
                },
                cancelAddNewPracticeType: function(reading_) {
                    self.custom_practice_type[reading_.id] = false;
                },
                addNewMetricType: function(existingMetric) {

                    angular.forEach(self.report.properties.metrics, function(metric, index) {
                        if (existingMetric.id === metric.id) {
                            self.report.properties.metrics[index].properties.metric_type = {
                                "properties": {
                                    "name": "",
                                    "group": "Other",
                                    "source": "Add by user_id " + $rootScope.user.id
                                }
                            }
                        }
                    })

                    // Mark the field as visible.
                    self.custom_metric_type[existingMetric.id] = true;
                },
                cancelAddNewMetricType: function(metric_) {
                    self.custom_metric_type[metric_.id] = false;
                },
                addNewMonitoringCheckType: function(existingMonitoring) {

                    angular.forEach(self.report.properties.monitoring, function(monitoring, index) {
                        if (existingMonitoring.id === monitoring.id) {
                            self.report.properties.monitoring[index].properties.monitoring_type = {
                                "properties": {
                                    "name": "",
                                    "group": "Other",
                                    "source": "Add by user_id " + $rootScope.user.id
                                }
                            }
                        }
                    })

                    // Mark the field as visible.
                    self.custom_monitoring_type[existingMonitoring.id] = true;
                },
                cancelAddMonitoringCheckType: function(monitoring_) {
                    self.custom_monitoring_type[monitoring_.id] = false;
                }
            }

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

            self.months = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec'
            ];

            function parseISOLike(s) {
                var b = s.split(/\D/);
                return new Date(b[0], b[1] - 1, b[2]);
            }

            practice.$promise.then(function(successResponse) {

                self.practice = successResponse;

                self.practiceType = Utility.machineName(self.practice.properties.practice_type);

                //
                //
                //
                self.template = {
                    path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
                };

                //
                //
                //
                site.$promise.then(function(successResponse) {
                    self.site = successResponse;

                    //
                    // Assign project to a scoped variable
                    //
                    report.$promise.then(function(successResponse) {
                        self.report = successResponse;

                        if (self.report.properties.report_date) {
                            self.today = parseISOLike(self.report.properties.report_date);
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

                        $rootScope.page.title = "Other Conservation Practice";
                        $rootScope.page.links = [{
                                text: 'Projects',
                                url: '/projects'
                            },
                            {
                                text: self.site.properties.project.properties.name,
                                url: '/projects/' + projectId
                            },
                            {
                                text: self.site.properties.name,
                                url: '/projects/' + projectId + '/sites/' + siteId
                            },
                            {
                                text: "Other Conservation Practice",
                                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                            },
                            {
                                text: 'Edit',
                                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                                type: 'active'
                            }
                        ];
                    }, function(errorResponse) {
                        console.error('ERROR: ', errorResponse);
                    });

                }, function(errorResponse) {
                    //
                });

                //
                // Verify Account information for proper UI element display
                //
                if (Account.userObject && user) {
                    user.$promise.then(function(userResponse) {
                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };
                    });
                }
            });

            $scope.$watch(angular.bind(this, function() {
                return this.date;
            }), function(response) {
                if (response) {
                    var _new = response.month + ' ' + response.date + ' ' + response.year,
                        _date = new Date(_new);
                    self.date.day = self.days[_date.getDay()];
                }
            }, true);

            self.saveReport = function() {

                self.report.properties.report_date = self.date.month + ' ' + self.date.date + ' ' + self.date.year;

                self.report.$update().then(function(successResponse) {
                    $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
                }, function(errorResponse) {
                    console.error('ERROR: ', errorResponse);
                });

            };

            self.deleteReport = function() {
                self.report.$delete().then(function(successResponse) {
                    $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
                }, function(errorResponse) {
                    console.error('ERROR: ', errorResponse);
                });
            };

            self.addReading = function(reading_) {

                self.status.readings.loading = true;

                //
                // Step 1: Show a new row with a "loading" indiciator
                //

                //
                // Step 2: Create empty Reading to post to the system
                //
                var newReading = new PracticeCustomReading({
                    "geometry": null,
                    "properties": {
                        "bmp_custom_id": self.report.id,
                        "practice_type_id": null,
                        "practice_extent": 0,
                        "practice_unit_id": null,
                        "practice_description": "",
                        "practice_nutrient_reductions": {
                            "properties": {
                                "nitrogen": 0,
                                "phosphorus": 0,
                                "sediment": 0,
                                "protocol": ""
                            }
                        }
                    }
                })

                //
                // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                //
                newReading.$save().then(function(successResponse) {

                    console.log('A new reading has been created for this report', successResponse);

                    var reading_ = successResponse;

                    //
                    // Step 4: Add the new reading to the existing report
                    //
                    self.report.properties.readings.push(reading_);

                    //
                    // Step 6: Hide Loading Indicator and display the form to the user
                    //
                    self.status.readings.loading = false;

                }, function(errorResponse) {
                    console.log('An error occurred while trying to create a new reading', errorResponse);
                    self.status.readings.loading = false;
                });

            };

            self.addMetric = function() {

                //
                // Step 1: Show a new row with a "loading" indiciator
                //
                self.status.metrics.loading = true;

                //
                // Step 2: Create empty Reading to post to the system
                //
                var newMetric = new PracticeCustomMetric({
                    "geometry": null,
                    "properties": {
                        "metric_type_id": null,
                        "metric_value": 0,
                        "metric_unit_id": null,
                        "metric_description": ""
                    }
                })

                //
                // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                //
                newMetric.$save().then(function(successResponse) {

                    console.log('A new reading has been created for this report', successResponse);

                    var metric_ = successResponse;

                    //
                    // Step 4: Add the new reading to the existing report
                    //
                    self.report.properties.metrics.push(metric_);

                    //
                    // Step 5: Hide Loading Indicator and display the form to the user
                    //
                    self.status.metrics.loading = false;

                }, function(errorResponse) {
                    console.log('An error occurred while trying to create a new metric', errorResponse);
                    self.status.metrics.loading = false;
                });

            }

            self.addMonitoringCheck = function() {

                //
                // Step 1: Show a new row with a "loading" indiciator
                //
                self.status.monitoring.loading = true;

                //
                // Step 2: Create empty Reading to post to the system
                //
                var newMetric = new PracticeCustomMonitoring({
                    "geometry": null,
                    "properties": {
                        "monitoring_type_id": null,
                        "monitoring_value": 0,
                        "was_verified": false,
                        "monitoring_description": ""
                    }
                })

                //
                // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                //
                newMetric.$save().then(function(successResponse) {

                    console.log('A new reading has been created for this report', successResponse);

                    var monitoring_ = successResponse;

                    //
                    // Step 4: Add the new reading to the existing report
                    //
                    self.report.properties.monitoring.push(monitoring_);

                    //
                    // Step 5: Hide Loading Indicator and display the form to the user
                    //
                    self.status.monitoring.loading = false;

                }, function(errorResponse) {
                    console.log('An error occurred while trying to create a new metric', errorResponse);
                    self.status.monitoring.loading = false;
                });

            }

            self.deleteSubPractice = function(reading_id) {

                var readings_ = []

                angular.forEach(self.report.properties.readings, function(reading_, index_) {
                    if (reading_id !== reading_.id) {
                        readings_.push(reading_);
                    }
                })

                self.report.properties.readings = readings_;
            };

            self.deleteMetric = function(metric_id) {

                var metrics_ = []

                angular.forEach(self.report.properties.metrics, function(metric_, index_) {
                    if (metric_id !== metric_.id) {
                        metrics_.push(metric_);
                    }
                })

                self.report.properties.metrics = metrics_;
            };

            self.deleteMonitoringCheck = function(monitoring_id) {

                var monitorings_ = []

                angular.forEach(self.report.properties.monitoring, function(monitoring_, index_) {
                    if (monitoring_id !== monitoring_.id) {
                        monitorings_.push(monitoring_);
                    }
                })

                self.report.properties.monitoring = monitorings_;
            };

            //
            // IF NUTRIENTS UPDATE FOR ANY PRACTICE, UPDATE THE NUTRIENT ROLLUP
            // AT THE TOP OF THE PAGE.
            //
            $scope.$watch(angular.bind(this, function() {
                return this.report;
            }), function(response) {
                if (response) {
                    var totals = {
                        "nitrogen": 0,
                        "phosphorus": 0,
                        "sediment": 0
                    }

                    if (self.report && self.report.properties) {
                        angular.forEach(self.report.properties.readings, function(reading_, index_) {

                            var nutrients_ = reading_.properties.practice_nutrient_reductions;

                            if (nutrients_ && nutrients_.properties) {
                                totals.nitrogen += nutrients_.properties.nitrogen;
                                totals.phosphorus += nutrients_.properties.phosphorus;
                                totals.sediment += nutrients_.properties.sediment;
                            }

                            return;

                        });

                        self.report.properties.custom_model_nitrogen_total = totals.nitrogen;
                        self.report.properties.custom_model_phosphorus_total = totals.phosphorus;
                        self.report.properties.custom_model_sediment_total = totals.sediment;

                        return;
                    }

                }
            }, true);

        });

}());
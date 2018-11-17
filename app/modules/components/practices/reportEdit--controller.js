(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('ReportEditController',
            function(Account, $location, MetricType, monitoring_types,
                Practice, Report, ReportMetric, ReportMonitoring, report,
                $rootScope, $route, $scope, unit_types, user, Utility,
                $timeout, report_metrics, $filter, $interval, Program) {

                var self = this;

                self.measurementPeriods = [{
                        'name': 'Installation',
                        'description': null
                    },
                    {
                        'name': 'Planning',
                        'description': null
                    },
                    {
                        'name': 'Monitoring',
                        'description': null
                    }
                ];

                $rootScope.page = {};

                self.status = {
                    loading: true,
                    processing: true,
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

                self.alerts = [];

                function closeAlerts() {

                    self.alerts = [];

                }

                function closeRoute() {

                    $location.path('/practices/' + self.practice.id);

                }

                self.confirmDelete = function(obj) {

                    console.log('self.confirmDelete', obj);

                    self.deletionTarget = self.deletionTarget ? null : obj;

                };

                self.cancelDelete = function() {

                    self.deletionTarget = null;

                };

                self.showElements = function() {

                    $timeout(function() {

                        self.status.loading = false;

                        self.status.processing = false;

                    }, 1000);

                };

                unit_types.$promise.then(function(successResponse) {

                    console.log('Unit types', successResponse);

                    var _unitTypes = [];

                    successResponse.features.forEach(function(datum) {

                        datum.name = datum.plural;

                        _unitTypes.push(datum);

                    });

                    self.unitTypes = _unitTypes;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                self.loadMetrics = function() {

                    Report.metrics({
                        id: $route.current.params.reportId
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

                    self.loadMetrics();

                };

                self.processMetric = function(metric) {

                    var datum = metric.properties || metric;

                    if (datum.category !== null) {

                        datum.category = datum.category.properties;

                    } else {

                        datum.category = null;

                    }

                    // if (datum.metric_unit !== null) {

                    //     datum.metric_unit = datum.metric_unit.properties;

                    //     datum.metric_unit.name = datum.metric_unit.plural;

                    // } else {

                    //     datum.metric_unit = null;

                    // }

                    return datum;

                };

                self.loadMetricTypes = function(datum) {

                    Program.metricTypes({
                        id: datum.properties.program_id
                    }).$promise.then(function(successResponse) {

                        console.log('Metric types', successResponse);

                        self.metricTypes = successResponse.features;

                        self.showElements();

                    }, function(errorResponse) {

                        console.log('errorResponse', errorResponse);

                        self.showElements();

                    });

                };

                self.monitoringType = null;
                self.monitoringTypes = monitoring_types;

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

                function convertPracticeArea(data) {

                    var area = data.properties.area,
                        acres;

                    if (area !== null &&
                        area > 0) {

                        acres = $filter('convertArea')(area, 'acre');

                        return Utility.precisionRound(acres, 4);

                    }

                }

                self.loadPractice = function(practiceId) {

                    Practice.get({
                        id: practiceId
                    }).$promise.then(function(successResponse) {

                        console.log('loadPractice.successResponse', successResponse);

                        self.practice = successResponse;

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                        } else {

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                            if (!self.report.properties.practice_extent) {

                                self.report.properties.practice_extent = convertPracticeArea(self.practice);

                            }

                        }

                        self.loadMetricTypes(self.practice.properties.project);

                    }).catch(function(errorResponse) {

                        //

                    });

                };

                $scope.$watch(angular.bind(this, function() {

                    return this.date;

                }), function(response) {

                    if (response) {

                        var _new = response.year + '-' + response.month.numeric + '-' + response.date,
                            _date = new Date(_new);
                        self.date.day = self.days[_date.getDay()];

                    }

                }, true);

                self.saveReport = function(metricArray) {

                    self.status.processing = true;

                    console.log('self.saveReport.metricArray', metricArray);

                    if (self.report.properties.measurement_period.name) {

                        self.report.properties.measurement_period = self.report.properties.measurement_period.name;

                    }

                    self.report.properties.metrics = metricArray;

                    if (self.date.month.numeric !== null &&
                        typeof self.date.month.numeric === 'string') {

                        self.report.properties.report_date = self.date.year + '-' + self.date.month.numeric + '-' + self.date.date;

                    } else {

                        self.report.properties.report_date = self.date.year + '-' + self.date.month + '-' + self.date.date;

                    }

                    self.report.$update().then(function(successResponse) {

                        self.processReport(successResponse);

                        self.alerts = [{
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Report changes saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        self.loadMetrics();

                        self.showElements();

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Report changes could not be saved.',
                            'prompt': 'OK'
                        }];

                        $timeout(closeAlerts, 2000);

                        self.showElements();

                    });

                };

                self.saveMetrics = function() {

                    console.log('self.saveMetrics.reportMetrics', self.reportMetrics);

                    var _modifiedMetrics = [];

                    if (self.reportMetrics.length) {

                        self.reportMetrics.forEach(function(metric) {

                            console.log('Updating metric...', metric);

                            var datum = metric;

                            if (datum.category !== null) {

                                datum.category_id = datum.category.id;

                            }

                            // if (datum.metric_unit !== null) {

                            //     datum.metric_unit_id = datum.metric_unit.id;

                            // }

                            // delete datum.id;
                            delete datum.category;
                            delete datum.metric_unit;

                            ReportMetric.update({
                                id: metric.id
                            }, datum).$promise.then(function(successResponse) {

                                _modifiedMetrics.push(successResponse.properties);

                                if (_modifiedMetrics.length === self.reportMetrics.length) {

                                    self.saveReport(_modifiedMetrics);

                                }

                            }, function(errorResponse) {

                                console.error('ERROR: ', errorResponse);

                            });

                        });

                    } else {

                        self.saveReport(_modifiedMetrics);

                    }

                };

                self.addReading = function(reading_) {

                    self.status.readings.loading = true;

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newReading = new ReportReading({
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
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/report-readings` endpoint
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

                    console.log('addMetric');

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //
                    self.status.metrics.loading = true;

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newMetric = new ReportMetric({
                        "category_id": null,
                        "value": null,
                        "description": null,
                        "report_id": self.report.id
                    });

                    console.log('addMetric', newMetric);

                    //
                    // Step 3: POST this empty reading to the `/v1/data/report-readings` endpoint
                    //
                    newMetric.$save().then(function(successResponse) {

                        console.log('A new reading has been created for this report', successResponse);

                        //
                        // Step 4: Add the new reading to the existing report
                        //
                        // self.reportMetrics.push(metric_);

                        if (successResponse.properties.category !== null) {
                            successResponse.properties.category.properties = successResponse.properties.category;
                        }

                        // if (successResponse.properties.metric_unit !== null) {
                        //     successResponse.properties.metric_unit.properties = successResponse.properties.metric_unit;
                        // }

                        var datum = self.processMetric(successResponse);

                        self.reportMetrics.push(datum);

                        //
                        // Step 5: Hide Loading Indicator and display the form to the user
                        //
                        self.status.metrics.loading = false;

                    }, function(errorResponse) {

                        console.log('An error occurred while trying to create a new metric', errorResponse);

                        self.status.metrics.loading = false;

                    });

                };

                self.addMonitoringCheck = function() {

                    //
                    // Step 1: Show a new row with a "loading" indiciator
                    //
                    self.status.monitoring.loading = true;

                    //
                    // Step 2: Create empty Reading to post to the system
                    //
                    var newMetric = new ReportMonitoring({
                        "geometry": null,
                        "properties": {
                            "monitoring_type_id": null,
                            "monitoring_value": 0,
                            "was_verified": false,
                            "monitoring_description": ""
                        }
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/report-readings` endpoint
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

                };

                self.deleteSubPractice = function(reading_id) {

                    var readings_ = [];

                    angular.forEach(self.report.properties.readings, function(reading_, index_) {
                        if (reading_id !== reading_.id) {
                            readings_.push(reading_);
                        }
                    });

                    self.report.properties.readings = readings_;

                };

                self.deleteMetric = function(metric_id) {

                    var metrics_ = [];

                    angular.forEach(self.reportMetrics, function(metric_, index_) {

                        if (metric_id !== metric_.id) {

                            metrics_.push(metric_);

                        }

                    });

                    self.reportMetrics = metrics_;

                };

                self.deleteMonitoringCheck = function(monitoring_id) {

                    var monitorings_ = [];

                    angular.forEach(self.report.properties.monitoring, function(monitoring_, index_) {
                        if (monitoring_id !== monitoring_.id) {
                            monitorings_.push(monitoring_);
                        }
                    });

                    self.report.properties.monitoring = monitorings_;

                };

                self.deleteFeature = function() {

                    Report.delete({
                        id: +self.deletionTarget.id
                    }).$promise.then(function(data) {

                        self.alerts.push({
                            'type': 'success',
                            'flag': 'Success!',
                            'msg': 'Successfully deleted this report.',
                            'prompt': 'OK'
                        });

                        $timeout(closeRoute, 2000);

                    }).catch(function(errorResponse) {

                        console.log('self.deleteFeature.errorResponse', errorResponse);

                        if (errorResponse.status === 409) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this report.',
                                'prompt': 'OK'
                            }];

                        } else if (errorResponse.status === 403) {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'You don’t have permission to delete this report.',
                                'prompt': 'OK'
                            }];

                        } else {

                            self.alerts = [{
                                'type': 'error',
                                'flag': 'Error!',
                                'msg': 'Something went wrong while attempting to delete this report.',
                                'prompt': 'OK'
                            }];

                        }

                        $timeout(closeAlerts, 2000);

                    });

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
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        //
                        // 
                        //
                        report.$promise.then(function(successResponse) {

                            console.log('self.report', successResponse);

                            self.processReport(successResponse);

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

                            // $rootScope.page.title = "Other Conservation Practice";

                            $rootScope.page.title = 'Edit measurement data';

                            self.loadPractice(self.report.properties.practice.id);

                        }, function(errorResponse) {

                            console.error('ERROR: ', errorResponse);

                        });

                    });

                } else {

                    $location.path('/login');

                }

            });

}());
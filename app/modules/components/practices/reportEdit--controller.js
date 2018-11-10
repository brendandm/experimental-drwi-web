(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('CustomFormController',
            function(Account, leafletData, $location, metric_types,
                monitoring_types, Practice, PracticeCustom, PracticeCustomReading, PracticeCustomMetric,
                PracticeCustomMonitoring, practice_types, report, $rootScope, $route, $scope,
                unit_types, user, Utility, $timeout, report_metrics, $filter, $interval) {

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

                self.fillMeter = undefined;

                self.showProgress = function() {

                    if (!self.fillMeter) {

                        self.fillMeter = $interval(function() {

                            var tempValue = (self.progressValue || 10) * Utility.meterCoefficient();

                            if (!self.progressValue) {

                                self.progressValue = tempValue;

                            } else if ((self.progressValue + tempValue) < 85) {

                                self.progressValue += tempValue;

                            } else {

                                $interval.cancel(self.fillMeter);

                                self.fillMeter = undefined;

                                $timeout(function() {

                                    self.progressValue = 100;

                                    self.showElements(1000, self.practice, self.progressValue);

                                }, 1000);

                            }

                            // console.log('tempValue', tempValue);
                            // console.log('progressValue', self.progressValue);

                        }, 100);

                    }

                };

                self.showElements = function(delay, object, progressValue) {

                    if (object && progressValue > 75) {

                        $timeout(function() {

                            self.status.loading = false;

                            self.progressValue = 0;

                        }, delay);

                    } else {

                        self.showProgress();

                    }

                };

                unit_types.$promise.then(function(successResponse) {

                    console.log('Unit types', successResponse);

                    var _unitTypes = [];

                    successResponse.features.forEach(function(unit) {

                        var datum = unit.properties;

                        datum.name = datum.plural;

                        _unitTypes.push(datum);

                    });

                    self.unitTypes = _unitTypes;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                self.processMetric = function(metric) {

                    var datum = metric.properties;

                    if (metric.properties.metric_type !== null) {

                        datum.metric_type = metric.properties.metric_type.properties;

                    } else {

                        datum.metric_type = null;

                    }

                    if (metric.properties.metric_unit !== null) {

                        datum.metric_unit = metric.properties.metric_unit.properties;

                        datum.metric_unit.name = datum.metric_unit.plural;

                    } else {

                        datum.metric_unit = null;

                    }

                    return datum;

                };

                metric_types.$promise.then(function(successResponse) {

                    console.log('Metric types', successResponse);

                    var _metricTypes = [];

                    successResponse.features.forEach(function(metric) {

                        var datum = metric.properties;

                        _metricTypes.push(datum);

                    });

                    self.metricTypes = _metricTypes;

                }, function(errorResponse) {

                    console.log('errorResponse', errorResponse);

                });

                report_metrics.$promise.then(function(successResponse) {

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

                        self.practice = successResponse;

                        if (!successResponse.permissions.read &&
                            !successResponse.permissions.write) {

                            self.makePrivate = true;

                        } else {

                            self.permissions.can_edit = successResponse.permissions.write;
                            self.permissions.can_delete = successResponse.permissions.write;

                            self.practiceType = Utility.machineName(self.practice.properties.practice_type);

                            if (!self.report.properties.practice_extent) {

                                self.report.properties.practice_extent = convertPracticeArea(self.practice);

                            }

                        }

                        // self.showElements(1000, self.practice, self.progressValue);

                    }).catch(function(errorResponse) {

                        // self.showElements(1000, self.practice, self.progressValue);

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

                        $location.path('/practices/' + self.practice.id);

                    }, function(errorResponse) {

                        console.error('ERROR: ', errorResponse);

                    });

                };

                self.saveMetrics = function() {

                    console.log('self.saveMetrics.reportMetrics', self.reportMetrics);

                    var _modifiedMetrics = [];

                    if (self.reportMetrics.length) {

                        self.reportMetrics.forEach(function(metric) {

                            console.log('Updating metric...', metric);

                            var datum = metric;

                            if (datum.metric_type !== null) {

                                datum.metric_type_id = datum.metric_type.id;

                            }

                            if (datum.metric_unit !== null) {

                                datum.metric_unit_id = datum.metric_unit.id;

                            }

                            // delete datum.id;
                            delete datum.metric_type;
                            delete datum.metric_unit;

                            PracticeCustomMetric.update({
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
                    });

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

                    // var datum = {
                    //     "metric_type_id": null,
                    //     "metric_value": 0,
                    //     "metric_unit_id": null,
                    //     "metric_description": ""
                    // };

                    // self.reportMetrics.push(datum);

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
                    });

                    //
                    // Step 3: POST this empty reading to the `/v1/data/bmp-custom-readings` endpoint
                    //
                    newMetric.$save().then(function(successResponse) {

                        console.log('A new reading has been created for this report', successResponse);

                        //
                        // Step 4: Add the new reading to the existing report
                        //
                        // self.reportMetrics.push(metric_);

                        if (successResponse.properties.metric_type !== null) {
                            successResponse.properties.metric_type.properties = successResponse.properties.metric_type;
                        }
                        if (successResponse.properties.metric_unit !== null) {
                            successResponse.properties.metric_unit.properties = successResponse.properties.metric_unit;
                        }

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
                    var newMetric = new PracticeCustomMonitoring({
                        "geometry": null,
                        "properties": {
                            "monitoring_type_id": null,
                            "monitoring_value": 0,
                            "was_verified": false,
                            "monitoring_description": ""
                        }
                    });

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

                self.deleteFeature = function() {

                    PracticeCustom.delete({
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

                    self.showProgress();

                    user.$promise.then(function(userResponse) {

                        $rootScope.user = Account.userObject = userResponse;

                        self.permissions = {
                            isLoggedIn: Account.hasToken(),
                            role: $rootScope.user.properties.roles[0].properties.name,
                            account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                        };

                        //
                        // 
                        //
                        report.$promise.then(function(successResponse) {

                            console.log('self.report', successResponse);

                            self.report = successResponse;

                            if (self.report.properties.practice_unit !== null) {

                                var _unit = self.report.properties.practice_unit.properties;

                                _unit.name = _unit.plural;

                                self.report.properties.practice_unit = _unit;

                            }

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

                    $location.path('/account/login');

                }

            });

}());
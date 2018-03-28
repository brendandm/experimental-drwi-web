(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('CustomFormController', function (Account, leafletData, $location, Map, mapbox, metric_types, practice, PracticeCustom, practice_types, report, $rootScope, $route, site, $scope, unit_types, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};


      //
      // Setup Map Requirements
      //
      self.map = {};
      self.mapActiveGeocoder = null;

      self.showData = true;

      self.practiceType = null;
      self.practiceTypes = practice_types;

      self.unitTypes = unit_types;

      self.metricType = null;
      self.metricTypes = metric_types;

      self.project = {
        'id': projectId
      };

      self.custom_practice_type = [];

      self.custom_metric_type = [];

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
        addNewMonitoringType: function(existingMonitoring) {

          angular.forEach(self.report.properties.monitoring, function(monitoring, index) {
            if (existingMonitoring.id === monitoring.id) {
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
          self.custom_monitoring_type[existingMonitoring.id] = true;
        },
        cancelAddNewMonitoringType: function(monitoring_) {
          self.custom_monitoring_type[metric_.id] = false;
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
          return new Date(b[0], b[1]-1, b[2]);
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
            // Preprocess the individual Practice Readings before display
            //
            if (self.report.properties.readings.length) {

              angular.forEach(self.report.properties.readings, function(reading_, index_) {
                self.map[reading_.id] = angular.copy(Map);
                self.map[reading_.id] = self.buildSingleMap(reading_);
              });

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

            $rootScope.page.title = "Custom Practices";
            $rootScope.page.links = [
                {
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
                  text: "Custom Practice",
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
      }), function (response) {
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
        var reading = {
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
        };

        self.report.properties.readings.push(reading);

        self.report.properties.report_date = self.date.month + ' ' + self.date.date + ' ' + self.date.year;

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
        });

      }

      self.addMetric = function() {
        var metric = {
          "geometry": null,
          "properties": {
            "metric_type_id": null,
            "metric_value": 0,
            "metric_unit_id": null,
            "metric_description": ""
          }
        };

        self.report.properties.metrics.push(metric);

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
        });

      }

      self.addMonitoring = function() {
        var monitoring = {
          "geometry": null,
          "properties": {
            "monitoring_type_id": null,
            "monitoring_value": 0,
            "was_verified": false,
            "monitoring_description": ""
          }
        };

        self.report.properties.monitoring.push(monitoring);

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
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


      //
      // MAPS
      //

      //
      // We use this function for handle any type of geographic change, whether
      // through the map or through the fields
      //
      self.processPin = function(coordinates, zoom, map_) {

        if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
          return;
        }

        //
        // Move the map pin/marker and recenter the map on the new location
        //
        map_.markers = {
          projectLocation: {
            lng: coordinates.lng,
            lat: coordinates.lat,
            focus: false,
            draggable: true
          }
        };

        //
        // Update the visible pin on the map
        //
        map_.center = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: (zoom < 10) ? 10 : zoom
        };
      };

      self.activateGeocoderForReading = function(reading_id) {

        //
        // RESET ALL GEOCODERS TO HIDDEN AND EMPTY
        //
        angular.forEach(self.map, function(map_, index) {

          var is_matching = reading_id === parseInt(index);
          console.log('is_matching', is_matching);
          if (is_matching) {
            self.map[reading_id].showGeocoder = true;
          }
          else {
            self.map[index].showGeocoder = false;
            self.map[index].geocode = {};
          }
        });

        console.log('self.map', self.map)

        return;
      };


      self.buildSingleMap = function(reading_) {

        return {
          showGeocoder: null,
          geocode : {},
          defaults: {
            scrollWheelZoom: false,
            zoomControl: true,
            maxZoom: 19
          },
          layers: {
            baselayers: {
              basemap: {
                name: 'Satellite Imagery',
                url: 'https://{s}.tiles.mapbox.com/v3/rdawes1.0dg4d3gd/{z}/{x}/{y}.png',
                type: 'xyz',
                layerOptions: {
                  attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
                }
              }
            }
          },
          center: {
            lat: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[1] : 38.362,
            lng: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[0] : -81.119,
            zoom: (reading_.geometry !== null && reading_.geometry !== undefined) ? 16 : 6
          },
          markers: {
            projectLocation: {
              lat: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[1] : 38.362,
              lng: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[0] : -81.119,
              focus: false,
              draggable: true
            }
          }
        }
      }



        //
        // IF NUTRIENTS UPDATE FOR ANY PRACTICE, UPDATE THE NUTRIENT ROLLUP
        // AT THE TOP OF THE PAGE.
        //
        $scope.$watch(angular.bind(this, function() {
          return this.report;
        }), function (response) {
          if (response) {
            console.log('Custom Practice: Nutrients updated in sub-practice.');

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

      //
      // IF NUTRIENTS UPDATE FOR ANY PRACTICE, UPDATE THE NUTRIENT ROLLUP
      // AT THE TOP OF THE PAGE.
      //
      $scope.$watch(angular.bind(this, function() {
        return this.map;
      }), function (response) {
        if (response) {
          console.log('Custom Practice: Map updated.');

          if (self.report && self.report.properties) {
            angular.forEach(self.report.properties.readings, function(reading_, index_) {

              var coordinates = response[reading_.id].markers.projectLocation;

              self.processPin({
                lat: coordinates.lat,
                lng: coordinates.lng
              }, 16, response[reading_.id]);

              // reading_.geometry = {
              //   type: 'GeometryCollection',
              //   geometries: []
              // };
              //
              // reading_.geometry.geometries.push({
              //   type: 'Point',
              //   coordinates: [
              //     coordinates.lng,
              //     coordinates.lat
              //   ]
              // });

            });

            angular.forEach(response, function(response_, index) {
              console.log('response_', index, response_);

              //
              // Only execute the following block of code if the user has geocoded an
              // address. This block of code expects this to be a single feature from a
              // Carmen GeoJSON object.
              //
              // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
              //
              if (response_ && response_.geocode && response_.geocode.response) {

                var r_ = response_.geocode.response;

                self.processPin({
                  lat: r_.geometry.coordinates[1],
                  lng: r_.geometry.coordinates[0]
                }, 16, self.map[index]);

                self.map[index].geocode = {
                  query: null,
                  response: null
                };
              }
            });

          }
        }
      }, true);


    });

}());

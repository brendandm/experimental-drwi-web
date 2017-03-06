(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('AgricultureGenericReportController', function (Account, Calculate, CalculateAgricultureGeneric, Efficiency, LoadData, $location, $log, Notifications, practice, PracticeAgricultureGeneric, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId,
          practicePlanningData = null;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      self.calculate = Calculate;

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

          $rootScope.page.title = self.practice.properties.practice_type;
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
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                type: 'active'
              }
          ];

          $rootScope.page.actions = [
            {
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

          readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            //
            // Setup and Find Existing Landuse and BMP Short Name Data
            //
            var existingLanduseType = "",
                landRiverSegmentCode = self.site.properties.segment.properties.hgmr_code,
                planningData = null;

            angular.forEach(self.readings.features, function(reading, $index) {
              if (reading.properties.measurement_period === 'Planning') {
                planningData = practicePlanningData = reading;
                existingLanduseType = (reading.properties.existing_riparian_landuse) ?  reading.properties.existing_riparian_landuse : "";
              }
            });

            // Existing Landuse and Land River Segment Code MUST BE TRUTHY
            if (existingLanduseType && landRiverSegmentCode && planningData) {

              LoadData.query({
                  q: {
                    filters: [
                      {
                        name: 'land_river_segment',
                        op: 'eq',
                        val: landRiverSegmentCode
                      },
                      {
                        name: 'landuse',
                        op: 'eq',
                        val: existingLanduseType
                      }
                    ]
                  }
                }).$promise.then(function(successResponse) {
                  if (successResponse.features.length === 0) {
                    console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                    $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                  }
                  else {
                    //
                    // Begin calculating nutrient reductions
                    //
                    self.calculateAgricultureGeneric = CalculateAgricultureGeneric;

                    self.calculateAgricultureGeneric.loadData = successResponse.features[0];
                    self.calculateAgricultureGeneric.readings = self.readings;

                    self.calculateAgricultureGeneric.getUAL(planningData);

                    console.log('self.calculateAgricultureGeneric.ual', self.calculateAgricultureGeneric.ual);
                  }

                },
                function(errorResponse) {
                  console.debug('LoadData::errorResponse', errorResponse)
                  console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                  $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                });
            }
            else {
              console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
            }

          }, function(errorResponse) {

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
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: true
                };
            });
        }
      });

      self.addReading = function(measurementPeriod) {

        if (measurementPeriod === "Planning") {
          var newReading = new PracticeAgricultureGeneric({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id
            });
        }
        else {
          var newReading = new PracticeAgricultureGeneric({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id,
              'generic_agriculture_efficiency_id': practicePlanningData.properties.generic_agriculture_efficiency_id,
              'model_type': practicePlanningData.properties.model_type,
              'existing_riparian_landuse': practicePlanningData.properties.existing_riparian_landuse,
              'custom_model_name': practicePlanningData.properties.custom_model_name,
              'custom_model_source': practicePlanningData.properties.custom_model_source,
              'custom_model_nitrogen': practicePlanningData.properties.custom_model_nitrogen,
              'custom_model_phosphorus': practicePlanningData.properties.custom_model_phosphorus,
              'custom_model_sediment': practicePlanningData.properties.custom_model_sediment
            });

        }

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:WetlandsNonTidalFormController
   * @description
   */
  angular.module('FieldDoc')
    .controller('WetlandsNonTidalFormController', function (Account, Efficiency, landuse, LoadData, $location, Notifications, practice, PracticeWetlandsNonTidal, report, $rootScope, $route, site, $scope, $timeout, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      landuse.$promise.then(function(successResponse) {
        self.landuse = successResponse;

        self.getLanduseById = function(landuseId) {

          var _landuse = {};

          angular.forEach(self.landuse.features, function(thisLanduse) {
            if (thisLanduse.id === landuseId) {
              _landuse = thisLanduse;
            }
          });

          return _landuse;
        };
      });

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

          self.segment = self.site.properties.segment.properties.hgmr_code;

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
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: Account.canEdit(self.site.properties.project)
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

      /**
       * Get Load Data for specified landuse and assign it to the appropriate
       * report fields
       *
       * @param landuse (object) A fully qualitified Landuse object
       * @param objectField (string)
       * @param idField (string)
       */
      self.getLoadData = function(report, landuseField, idField) {

        console.log('report', report);

        var landuse = self.getLanduseById(report.properties[landuseField]);

        LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: self.segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                }
              ]
            }
          }, function(successResponse) {
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
          });
      };

      self.getEfficiencyData = function(report, landuseIdField, landuseField, idField) {

        var landuse = self.getLanduseById(report.properties[landuseIdField]);

        console.log('report', report);

        Efficiency.query({
            q: {
              filters: [
                {
                  name: 'type',
                  op: 'eq',
                  val: 'Efficiency'
                },
                {
                  name: 'best_management_practice_short_name',
                  op: 'eq',
                  val: (landuse.properties.landuse_type === 'urban') ? 'WetPondWetland': 'WetlandRestore'
                },
                {
                  name: 'cbwm_lu',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                },
                {
                  name: 'hydrogeomorphic_region',
                  op: 'eq',
                  val: self.site.properties.segment.properties.hgmr_name
                }
              ]
            }
          }, function(successResponse) {
            console.log('Efficiency::successResponse', successResponse);
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
          });
      };


    });

}());

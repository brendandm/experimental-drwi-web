(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('StormwaterFormController', function (Account, $location, practice, PracticeStormwater, report, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

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

      self.stormwater_practices = [
        'All ESD practices in MD 2007 (RR)',
        'Bioretention or Rain Garden (Standard or Enhanced) (RR)',
        'Dry Channel Regenerative Stormwater Conveyance (aka Step Pool Storm Conveyance) (RR)',
        'Dry Swale (RR)',
        'Expanded Tree Pits (RR)',
        'Grass Channels (w/ Soil Amendments, aka Bioswale, Vegetated Swale) (RR)',
        'Green Roof (aka Vegetated Roof) (RR)',
        'Green Streets (RR)',
        'Infiltration (aka Infiltration Basin, Infiltration Bed, Infiltration Trench, Dry Well/Seepage Pit, Landscape Infiltration) (RR)',
        'Landscape Restoration/Reforestation (RR)',
        'Non-Structural BMPs, PA 2006 BMP Manual, Chapter 5 (RR)',
        'Permeable Pavement (aka Porous Pavement) (RR)',
        'Rainwater Harvesting (aka Capture and Re-use) (RR)',
        'Riparian Buffer Restoration (RR)',
        'Rooftop Disconnection (aka Simple Disconnection to Amended Soils, to a Conservation Area, to a Pervious Area, Non-Rooftop Disconnection) (RR)',
        'Sheetflow to Filter/Open Space* (aka Sheetflow to Conservation Area, Vegetated Filter Strip) (RR)',
        'Constructed Wetlands (ST)',
        'Filtering Practices (aka Constructed Filters, Sand Filters, Stormwater Filtering Systems) (ST)',
        'Proprietary Practices (aka Manufactured BMPs) (ST)',
        'Wet Ponds (aka Retention Basin) (ST)',
        'Wet Swale (ST)'
      ];

      self.stormwater_project_types = [
        'New Development',
        'Re-development'
      ];

      self.stormwater_site_classifications = [
        'Runoff Reduction',
        'Stormwater Treatment'
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
            // Check to see if there is a valid date
            //
            self.date = {
                month: self.months[self.today.getMonth()],
                date: self.today.getDate(),
                day: self.days[self.today.getDay()],
                year: self.today.getFullYear()
            };

            $rootScope.page.title = "Stormwater Management";
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
                  text: "Stormwater Management",
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

    });

}());

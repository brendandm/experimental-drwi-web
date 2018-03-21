(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('CustomSummaryController', function (Account, $location, $log, PracticeCustom, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.showData = false;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.data = successResponse;
        self.summary = successResponse;

        $rootScope.page.title = "Custom Practice";

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: "Custom Practice",
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

          if (measurementPeriod === "Planning") {
            var newReading = new PracticeCustom({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {

            var defaults = angular.copy(self.summary.practice.properties.defaults.properties),
                readings = [];

            angular.forEach(defaults.readings, function(reading, index) {
              delete reading.properties.id;

              var r_ = reading.properties;

              //
              // TODO Need to make sure that we are copying nutrients
              // and not linking them ...
              //
              // TODO Need to copy over geometry
              //

              // r_['geometry'] = reading.geometry;
              readings.push(r_);
            });

            delete defaults.id;
            delete defaults.account;
            delete defaults.practice;

            delete defaults.metrics;
            delete defaults.monitoring;
            delete defaults.created_by;
            delete defaults.last_modified_by;

            defaults.measurement_period = "Installation";
            defaults.readings = readings;

            var newReading = new PracticeCustom(defaults);
          }

          newReading.$save().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('ERROR: ', errorResponse);
            });
        };

    });

}());

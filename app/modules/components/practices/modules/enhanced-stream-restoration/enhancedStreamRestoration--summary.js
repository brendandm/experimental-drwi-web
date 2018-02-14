(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('EnhancedStreamRestorationSummaryController', function (Account, $location, Practice, PracticeEnhancedStreamRestoration, $rootScope, $route, $scope, summary, user, Utility, $window) {

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

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

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
              text: self.summary.practice.properties.practice_type,
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

          if (measurementPeriod === "Pre-Project") {
            var newReading = new PracticeEnhancedStreamRestoration({
                'measurement_period': measurementPeriod,
                'report_date': moment().format('YYYY-MM-DD'),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {
            var newReading = new PracticeEnhancedStreamRestoration({
                'measurement_period': measurementPeriod,
                'report_date': moment().format('YYYY-MM-DD'),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id,
                'has_majority_design_completion': self.summary.practice.properties.defaults.properties.has_majority_design_completion,
                'override_linear_feet_in_coastal_plain': self.summary.practice.properties.defaults.properties.override_linear_feet_in_coastal_plain,
                'override_linear_feet_in_noncoastal_plain': self.summary.practice.properties.defaults.properties.override_linear_feet_in_noncoastal_plain,
                'override_linear_feet_in_total': self.summary.practice.properties.defaults.properties.override_linear_feet_in_total
              });
          }

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

      self.createBankStabilizationPractice = function() {
          self.practice = new Practice({
              'practice_type': 'Bank Stabilization',
              'site_id': self.summary.site.id,
              'account_id': self.summary.site.properties.project.properties.account_id
          });

          self.practice.$save(function(successResponse) {
              $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('Unable to create your site, please try again later');
            });
      };


    });

}());

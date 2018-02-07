(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('AgricultureGenericSummaryController', function (Account, $location, $log, PracticeAgricultureGeneric, $rootScope, $route, $scope, summary, Utility, user, $window) {

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
        self.summary = successResponse;

        $rootScope.page.title = "Other Agricultural Practices";

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
              text: "Other Agricultural Practices",
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
            var newReading = new PracticeAgricultureGeneric({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {
            var newReading = new PracticeAgricultureGeneric({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
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

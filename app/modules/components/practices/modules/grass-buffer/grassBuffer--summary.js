(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('GrassBufferSummaryController', function (Account, $location, $log, Nutrient, PracticeGrassBuffer, $q, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.showNutrientForm = [];
      self.showNutrientFormSaved = [];
      self.showNutrientFormUpdated = [];
      self.showNutrientFormDeleted = [];


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

        var newReading = new PracticeGrassBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };


      self.addCustomNutrients = function(report_id) {
        self.showNutrientForm[report_id] = true;
      }

      self.cancelCustomNutrients = function(report_id) {
        self.showNutrientForm[report_id] = false;
      }

      self.saveCustomNutrients = function(report_) {
        self.showNutrientForm[report_.id] = false;

        var newNutrient = new Nutrient({
          "practice": [
            {
              "id": report_.id
            }
          ],
          "nitrogen": report_.properties.custom_nutrient_reductions.nitrogen,
          "phosphorus": report_.properties.custom_nutrient_reductions.phosphorus,
          "sediment": report_.properties.custom_nutrient_reductions.sediment
        });

        newNutrient.$save().then(
          function(successResponse) {
            console.log('successResponse', successResponse)
          },
          function(errorResponse) {
            console.log('errorResponse', errorResponse)
          }
        );

        self.showNutrientFormSaved[report_.id] = true;
      };

      self.updateCustomNutrients = function(report_) {
        self.showNutrientForm[report_.id] = false;

        var existingNutrient = new Nutrient({
          "nitrogen": report_.properties.custom_nutrient_reductions.nitrogen,
          "phosphorus": report_.properties.custom_nutrient_reductions.phosphorus,
          "sediment": report_.properties.custom_nutrient_reductions.sediment
        });

        existingNutrient.$update({
          "id": report_.properties.custom_nutrient_reductions.id
        }).then(
          function(successResponse) {
            console.log('successResponse', successResponse)
          },
          function(errorResponse) {
            console.log('errorResponse', errorResponse)
          }
        );

        self.showNutrientFormUpdated[report_.id] = true;
      };

      self.deleteCustomNutrients = function(report_) {
        self.showNutrientForm[report_.id] = false;

        var nutrient_ = new Nutrient({
          "id": report_.properties.custom_nutrient_reductions.id
        });

        nutrient_.$delete({
          "id": report_.properties.custom_nutrient_reductions.id
        }).then(
          function(successResponse) {
            console.log('successResponse', successResponse);
            report_.properties.custom_nutrient_reductions = null;
          },
          function(errorResponse) {
            console.log('errorResponse', errorResponse)
          }
        );

        self.showNutrientFormDeleted[report_.id] = true;
      };

    });

}());

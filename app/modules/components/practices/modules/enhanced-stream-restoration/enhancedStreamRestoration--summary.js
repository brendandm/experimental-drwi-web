(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('EnhancedStreamRestorationSummaryController', function (Account, $location, practice, Practice, PracticeEnhancedStreamRestoration, $rootScope, $route, site, $scope, summary, UALStateLoad, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

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

          //
          // After we have returned the Site.$promise we can look up our Site
          // specific load data
          //
          if (self.site.properties.state) {
            UALStateLoad.query({
              q: {
                filters: [
                  {
                    name: 'state',
                    op: 'eq',
                    val: self.site.properties.state
                  }
                ]
              }
            }, function(successResponse) {

              self.loaddata = {};

              angular.forEach(successResponse.features, function(feature, $index) {
                self.loaddata[feature.properties.developed_type] = {
                  tn_ual: feature.properties.tn_ual,
                  tp_ual: feature.properties.tp_ual,
                  tss_ual: feature.properties.tss_ual
                };
              });

            }, function(errorResponse) {
              console.log('errorResponse', errorResponse);
            });
          } else {
            console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
          }

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

        var newReading = new PracticeEnhancedStreamRestoration({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

      self.createBankStabilizationPractice = function() {
          self.practice = new Practice({
              'practice_type': 'Bank Stabilization',
              'site_id': self.site.id,
              'account_id': self.site.properties.project.properties.account_id
          });

          self.practice.$save(function(successResponse) {
              $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('Unable to create your site, please try again later');
            });
      };


    });

}());

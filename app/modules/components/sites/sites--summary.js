(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:SiteSummaryCtrl
   * @description
   */
  angular.module('FieldDoc')
    .controller('SiteSummaryCtrl', function (Account, $location, mapbox, Practice, project, $rootScope, $route, summary, user) {

      var self = this;

      $rootScope.page = {};

      self.mapbox = mapbox;

      self.status = {
        "loading": true
      }

      summary.$promise.then(function(successResponse) {

        self.data = successResponse;

        self.site = successResponse.site;
        self.practices = successResponse.practices;

        //
        // Add rollups to the page scope
        //
        self.rollups = successResponse.rollups;

        //
        // Set the default tab to "All"
        //
        self.rollups.active = "all";

        self.status.loading = false;

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {
            user.$promise.then(function(userResponse) {
                $rootScope.user = Account.userObject = userResponse;

                self.project = project;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: Account.canEdit(self.project)
                };

                $rootScope.page.title = self.site.properties.name;
                $rootScope.page.links = [
                    {
                        text: 'Projects',
                        url: '/projects'
                    },
                    {
                        text: self.project.properties.name,
                        url: '/projects/' + $route.current.params.projectId
                    },
                    {
                      text: self.site.properties.name,
                      url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id,
                      type: 'active'
                    }
                ];

            });
        }

      }, function(errorResponse) {

      });

      self.createPractice = function() {

          self.practice = new Practice({
              'practice_type': 'Grass Buffer',
              'site_id': self.site.id,
              'account_id': self.site.properties.project.properties.account_id
          });

          self.practice.$save(function(successResponse) {
              $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('Unable to create your site, please try again later');
            });

      };

      //
      // Setup basic page variables
      //
      $rootScope.page.actions = [
        {
          type: 'button-link new',
          action: function() {
            self.createPractice();
          },
          text: 'Create practice'
        }
      ];


    });

})();

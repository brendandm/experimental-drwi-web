'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('InstreamHabitatFormController', function (Account, $location, practice, PracticeInstreamHabitat, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.options = {
      structureTypes: [
        'Drop Structure',
        'Vanes',
        'Porous Weirs',
        'Roughened Channels/Constructed Riffles',
        'Boulder Placement',
        'Rootwad Revetment'
      ],
      habitatAssessmentTypes: [
        'Rapid Bioassessment Protocol II',
        'SaveOurStreams',
        'Maryland Biological Stream Survey',
        'Unified Stream Assessment'
      ]
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

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

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

    self.saveReport = function() {
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

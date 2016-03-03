'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('PracticeEditController', function (Account, Image, $location, $log, Media, Practice, practice, $q, $rootScope, $route, site, user) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId;

    self.files = Media;

    $rootScope.page = {};

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

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
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id
            },
            {
              text: 'Edit',
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id + '/edit',
              type: 'active'
            }
        ];
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

    self.savePractice = function() {

      if (self.files.images.length) {

        var savedQueries = self.files.preupload(self.files.images);

        $q.all(savedQueries).then(function(successResponse) {

            $log.log('Images::successResponse', successResponse);

            angular.forEach(successResponse, function(image){
                self.practice.properties.images.push({
                    id: image.id
                });
            });

            self.practice.$update().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
            }, function(errorResponse) {
              // Error message
            });

        }, function(errorResponse) {
            $log.log('errorResponse', errorResponse);
        });

      }
      else {
        self.practice.$update().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
        }, function(errorResponse) {
          // Error message
        });
      }
    };

    self.deletePractice = function() {
      self.practice.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId);
      }, function(errorResponse) {
        // Error message
      });
    };

  });

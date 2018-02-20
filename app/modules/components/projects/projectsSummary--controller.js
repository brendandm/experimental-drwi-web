'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('ProjectSummaryCtrl', function (Account, Notifications, $rootScope, Project, $route, $scope, $location, mapbox, summary, Site, user, $window) {

    var self = this;

    $rootScope.page = {};

    self.mapbox = mapbox;

    self.status = {
      "loading": true
    }

    //
    // Assign project to a scoped variable
    //
    summary.$promise.then(function(successResponse) {

        self.data = successResponse;
        self.project = successResponse.project;

        self.sites = successResponse.sites;

        self.practices = successResponse.practices;

        //
        // Add rollups to the page scope
        //
        self.rollups = successResponse.rollups;

        self.status.loading = false;

        $rootScope.page.title = self.project.properties.name;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.project.properties.name,
                url: '/projects/' + $route.current.params.projectId,
                type: 'active'
            }
        ];

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
                    can_edit: Account.canEdit(self.project),
                    is_manager: (Account.hasRole('manager') || Account.inGroup(self.project.properties.account_id, Account.userObject.properties.account)),
                    is_admin: Account.hasRole('admin')
                };
            });
        }

    });

    self.submitProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Submitted"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.fundProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Funded"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.completeProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Completed"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.rollbackProjectSubmission = function() {
      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Draft"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.createSite = function() {
        self.site = new Site({
            'name': 'Untitled Site',
            'project_id': self.project.id,
            'account_id': self.project.properties.account_id
        });

        self.site.$save(function(successResponse) {
            $location.path('/projects/' + self.project.id + '/sites/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('Unable to create your site, please try again later');
          });
    };

    //
    // Setup basic page variables
    //
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
          self.createSite();
        },
        text: 'Create site'
      }
    ];

  });

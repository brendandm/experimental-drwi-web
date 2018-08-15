'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:DashboardCtrl
 * @description
 * # DashboardCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
    .controller('DashboardCtrl', function(Account, Notifications, $rootScope, Project,
        $route, $scope, $location, mapbox, summary, Site, user, $window) {

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
            $rootScope.page.links = [{
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

        //
        // Setup basic page variables
        //
        $rootScope.page.actions = [{
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
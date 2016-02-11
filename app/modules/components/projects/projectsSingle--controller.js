'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('ProjectViewCtrl', function (Account, $rootScope, $route, $location, mapbox, project, Site, user) {

    var self = this;
    $rootScope.page = {};

    //
    // Assign project to a scoped variable
    //
    project.$promise.then(function(projectResponse) {
        self.project = projectResponse;

        $rootScope.page.title = self.project.properties.name,
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
                    can_edit: Account.canEdit(project)
                };
            });
        }

    });


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
        type: 'button-link new',
        action: function() {
          self.createSite();
        },
        text: 'Create site'
      }
    ];

    // self.$watch('project.sites.list', function(processedSites, existingSites) {
    //  // console.log('self.project.sites.list,', self.project.sites.list)
    //  angular.forEach(processedSites, function(feature, $index) {
    //    var coords = [0,0];
    //
    //    if (feature.geometry !== null) {
    //      console.log('feature.geometry', feature.geometry);
    //      if (feature.geometry.geometries[0].type === 'Point') {
    //        coords = feature.geometry.geometries[0].coordinates;
    //      }
    //    }
    //
    //    self.project.sites.list[$index].site_thumbnail = 'https://api.tiles.mapbox.com/v4/' + mapbox.satellite + '/pin-s+b1c11d(' + coords[0] + ',' + coords[1] + ',17)/' + coords[0] + ',' + coords[1] + ',17/80x80@2x.png?access_token=' + mapbox.access_token;
    //  });
    //});


  });

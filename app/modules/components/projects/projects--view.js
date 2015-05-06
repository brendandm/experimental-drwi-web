'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$anchorScroll', 'mapbox', 'Template', 'Feature', 'project', 'storage', 'user', 'template', 'site', 'sites', function ($rootScope, $scope, $route, $location, $anchorScroll, mapbox, Template, Feature, project, storage, user, template, site, sites) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.project.sites = {
      list: sites,
      create: function() {
        //
        // Creating a site is a two step process.
        //
        //  1. Create the new site record, including the owner and a new UserFeatures entry
        //     for the Site table
        //  2. Update the Project to create a relationship with the Site created in step 1 
        //
        Feature.CreateFeature({
          storage: site.storage,
          data: {
            site_number: 'Untitled Site',
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(siteId) {

          console.log('New Site', siteId);

          //
          // Create the relationship with the parent, Project, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: storage,
            featureId: $route.current.params.projectId,
            data: {
              type_646f23aa91a64f7c89a008322f4f1093: $scope.GetAllChildren(siteId),
            }
          }).then(function() {
            //
            // Forward the user along to the new site now that it has been associated with the Project
            //
            $location.path('/projects/' + $route.current.params.projectId + '/sites/' + siteId + '/edit');
          });
        });
      }
    };

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--view.html',
      title: $scope.project.project_title,
      display_title: false,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $route.current.params.projectId,
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.project.sites.create();
          },
          text: 'Create site'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllChildren = function(siteId) {

      var existingSites = $scope.project.sites.list,
          updatedSites = [{
            id: siteId // Start by adding the newest relationships, then we'll add the existing sites
          }];

      angular.forEach(existingSites, function(site, $index) {
        updatedSites.push({
          id: site.id
        });
      });

      return updatedSites;
    };


    $scope.$watch('project.sites.list', function(processedSites, existingSites) {
      // console.log('$scope.project.sites.list,', $scope.project.sites.list)
      angular.forEach(processedSites, function(feature, $index) {
        var coords = [0,0];
        
        if (feature.geometry !== null) {
          console.log('feature.geometry', feature.geometry);
          if (feature.geometry.geometries[0].type === 'Point') {
            coords = feature.geometry.geometries[0].coordinates;
          }
        }
        
        $scope.project.sites.list[$index].site_thumbnail = 'https://api.tiles.mapbox.com/v4/' + mapbox.satellite + '/pin-s+b1c11d(' + coords[0] + ',' + coords[1] + ',17)/' + coords[0] + ',' + coords[1] + ',17/80x80@2x.png?access_token=' + mapbox.access_token;
      });      
    });


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }
    
  }]);




'use strict';

/**
 * @ngdoc function
 * @name FieldStack.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the FieldStack
 */
angular.module('FieldStack')
  .controller('SiteViewCtrl', function (Account, leafletData, $location, site, practices, $rootScope, $route, user) {

    var self = this;

    $rootScope.page = {};

    self.practices = practices;

    site.$promise.then(function(successResponse) {

      self.site = successResponse;

      $rootScope.page.title = self.site.properties.name;
      $rootScope.page.links = [
          {
              text: 'Projects',
              url: '/projects'
          },
          {
              text: self.site.properties.project.properties.name,
              url: '/projects/' + $route.current.params.projectId
          },
          {
            text: self.site.properties.name,
            url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id,
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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }

    }, function(errorResponse) {

    });


    // $scope.site = site;
    // $scope.site.practices = {
    //   list: practices,
    //   cleanName: function(name) {
    //     return Feature.MachineReadable(name);
    //   },
    //   create: function() {
    //     //
    //     // Creating a practice is a two step process.
    //     //
    //     //  1. Create the new Practice record, including the owner and a new UserFeatures entry
    //     //     for the Practice table
    //     //  2. Update the Site to create a relationship with the Practice created in step 1
    //     //
    //     Feature.CreateFeature({
    //       storage: variables.practice.storage,
    //       data: {
    //         practice_type: 'Forest Buffer',
    //         description: '',
    //         owner: $scope.user.id,
    //         status: 'private'
    //       }
    //     }).then(function(practiceId) {
    //       //
    //       // Create the relationship with the parent, Project, to ensure we're doing this properly we need
    //       // to submit all relationships that are created and should remain. If we only submit the new
    //       // ID the system will kick out the sites that were added previously.
    //       //
    //       Feature.UpdateFeature({
    //         storage: variables.site.storage,
    //         featureId: $route.current.params.siteId,
    //         data: {
    //           type_77f5c44516674e8da2532939619759dd: $scope.GetAllChildren(practiceId),
    //         }
    //       }).then(function(response) {
    //         $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + practiceId + '/edit');
    //       });
    //     });
    //   }
    // };
    //
    // $rootScope.page = {
    //   title: $scope.site.site_number,
    //   links: [
    //     {
    //       text: 'Projects',
    //       url: '/projects'
    //     },
    //     {
    //       text: $scope.project.project_title,
    //       url: '/projects/' + $scope.project.id,
    //     },
    //     {
    //       text: $scope.site.site_number,
    //       url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
    //       type: 'active'
    //     }
    //   ]
    // };
    //
    // $scope.map = {
    //   defaults: {
    //     scrollWheelZoom: false,
    //     zoomControl: false,
    //     maxZoom: 19
    //   },
    //   layers: {
    //     baselayers: {
    //       basemap: {
    //         name: 'Satellite Imagery',
    //         url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.satellite + '/{z}/{x}/{y}.png',
    //         type: 'xyz',
    //         layerOptions: {
    //           attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
    //         }
    //       }
    //     }
    //   },
    //   center: {},
    //   markers: {
    //     LandRiverSegment: {
    //       lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
    //       lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119,
    //       icon: {
    //         iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
    //         iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
    //         iconSize: [38, 90],
    //         iconAnchor: [18, 44],
    //         popupAnchor: [0, 0]
    //       }
    //     }
    //   },
    //   geojsonToLayer: function (geojson, layer, options) {
    //
    //     //
    //     // Make sure the GeoJSON object is added to the layer with appropriate styles
    //     //
    //     layer.clearLayers();
    //
    //     if (options === undefined || options === null) {
    //       options = {
    //         stroke: true,
    //         fill: false,
    //         weight: 1,
    //         opacity: 1,
    //         color: 'rgb(255,255,255)',
    //         lineCap: 'square'
    //       };
    //     }
    //
    //     L.geoJson(geojson, {
    //       style: options
    //     }).eachLayer(function(l) {
    //       l.addTo(layer);
    //     });
    //
    //   },
    //   drawPolygon: function(geojson, fitBounds, options) {
    //
    //     leafletData.getMap().then(function(map) {
    //       var featureGroup = new L.FeatureGroup();
    //
    //
    //       //
    //       // Convert the GeoJSON to a layer and add it to our FeatureGroup
    //       //
    //       $scope.map.geojsonToLayer(geojson, featureGroup, options);
    //
    //       //
    //       // Add the FeatureGroup to the map
    //       //
    //       map.addLayer(featureGroup);
    //
    //       //
    //       // If we can getBounds then we can zoom to a specific level, we need to check to see
    //       // if the FeatureGroup has any bounds first though, otherwise we'll get an error.
    //       //
    //       if (fitBounds === true) {
    //         var bounds = featureGroup.getBounds();
    //
    //         if (bounds.hasOwnProperty('_northEast')) {
    //           map.fitBounds(featureGroup.getBounds());
    //         }
    //       }
    //     });
    //
    //   },
    //   setupMap: function() {
    //     //
    //     // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
    //     // selected their property, so we just need to display it on the map for them again.
    //     //
    //     if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {
    //
    //       //
    //       // Draw the Land River Segment
    //       //
    //       $scope.map.drawPolygon({
    //         type: 'Feature',
    //         geometry: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].geometry
    //       }, false, {
    //         stroke: false,
    //         fill: true,
    //         fillOpacity: 0.65,
    //         color: 'rgb(25,166,215)'
    //       });
    //
    //       //
    //       // Load Land river segment details
    //       //
    //       Feature.GetFeature({
    //         storage: variables.land_river_segment.storage,
    //         featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    //       }).then(function(response) {
    //         $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    //       });
    //
    //       //
    //       // Draw the county
    //       //
    //       if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8.length) {
    //         $scope.map.drawPolygon({
    //           type: 'Feature',
    //           geometry: $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].geometry
    //         }, true);
    //       }
    //
    //     }
    //   }
    // };
    //
    // //
    // // Once the page has loaded we need to load in all Reading Features that are associated with
    // // the Practices related to the Site being viewed
    // //
    // $scope.map.setupMap();

  });

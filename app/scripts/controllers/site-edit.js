'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteEditCtrl
 * @description
 * # SiteEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteEditCtrl', ['$rootScope', '$scope', '$route', '$timeout', '$http', '$location', 'Template', 'Feature', 'Site', 'user', 'template', 'fields', 'project', 'site', 'storage', 'variables', 'leafletData', function ($rootScope, $scope, $route, $timeout, $http, $location, Template, Feature, Site, user, template, fields, project, site, storage, variables, leafletData) {

    var timeout;

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.site = site;
    $scope.site.geolocation = null;
    $scope.site.save = function() {

      //
      // Make sure we've assigned a state to the state field based on user selections in the
      // site county field.
      //
      if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8.length) {
        if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].state_name) {
          $scope.site.site_state = $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].state_name;
        }
      }

      // if ($scope.site.site_city) {

      // }

      console.log('site.geolocation', $scope.site.site_city);

      Feature.UpdateFeature({
        storage: variables.storage,
        featureId: $scope.site.id,
        data: $scope.site
      }).then(function(response) {
        //
        // Refresh the page so that those things update appropriately.
        //
        $rootScope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };
    $scope.site.delete = function() {

      //
      // Before we can remove the Site we need to remove the relationship it has with the Project
      //
      //
      // Drop the siteId from the list of 
      //
      angular.forEach($scope.project.type_646f23aa91a64f7c89a008322f4f1093, function(feature, $index) {
        if (feature.id === $scope.site.id) {
          $scope.project.type_646f23aa91a64f7c89a008322f4f1093.splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: variables.storage,
          featureId: $scope.site.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id);
        });

      });

    };


    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/site-edit.html',
      title: $scope.site.site_number,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
        },
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/edit',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.site.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Site'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.site.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    //
    // Define a layer to add geometries to later
    //
    var featureGroup = new L.FeatureGroup();

    $scope.map = {
      defaults: {
        scrollWheelZoom: false,
        zoomControl: false,
        maxZoom: 19
      },
      layers: {
        baselayers: {
          basemap: {
            name: 'Satellite Imagery',
            url: 'https://{s}.tiles.mapbox.com/v3/' + Site.settings.services.mapbox.satellite + '/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
            }
          }
        }
      },
      center: {
        lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
        lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
        zoom: 6
      },
      markers: {
        LandRiverSegment: {
          lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
          lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
          focus: false,
          draggable: true,
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        }
      }
    };


    //
    // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
    //
    $scope.geojsonToLayer = function (geojson, layer) {
      layer.clearLayers();
      function add(l) {
        l.addTo(layer);
      }

      //
      // Make sure the GeoJSON object is added to the layer with appropriate styles
      //
      L.geoJson(geojson, {
        style: {
          stroke: true,
          fill: false,
          weight: 2,
          opacity: 1,
          color: 'rgb(255,255,255)',
          lineCap: 'square'
        }
      }).eachLayer(add);
    };

    $scope.geolocation = {
      drawSegment: function(geojson) {
          
        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          $scope.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);

          //
          // If we can getBounds then we can zoom to a specific level, we need to check to see
          // if the FeatureGroup has any bounds first though, otherwise we'll get an error.
          //
          var bounds = featureGroup.getBounds();

          if (bounds.hasOwnProperty('_northEast')) {
            map.fitBounds(featureGroup.getBounds());
          }
        });

      },
      getSegment: function(coordinates) {

        $http({
          method: 'GET', 
          url: '//api.commonscloud.org/v2/type_f9d8609090494dac811e6a58eb8ef4be/intersects.geojson',
          params: {
            geometry: coordinates.lng + ' ' + coordinates.lat
          }
        }).
          success(function(data, status, headers, config) {
            console.log('LandRiverSegment Request', data);
            $scope.geolocation.drawSegment(data);
            if (data.features.length > 0) {
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be = [];
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be.push(data.features[0].properties);
            }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log('error', data);

            return data;
          });
      },
      search: function() {
        $timeout.cancel(timeout);

        timeout = $timeout(function () {
          $scope.geolocation.initGeocoder();
        }, 800);
      },
      initGeocoder: function() {
        var requested_location = $scope.site.geolocation;

        if (requested_location.length >= 3) {
          var geocode_service_url = '//api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/' + requested_location + '.json';
          $http({
            method: 'get',
            url: geocode_service_url,
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': Site.settings.services.mapbox.access_token
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data) {
            $scope.geocode_features = data.features;
          }).error(function(data, status, headers, config) {
            console.log('ERROR: ', data);
          });
        }
      },
      select: function(geocode) {

        $scope.site.site_city = geocode.place_name;

        //
        // Move the draggable marker to the newly selected address
        //
        $scope.map.markers.LandRiverSegment = {
          lat: geocode.center[1],
          lng: geocode.center[0], 
          focus: false,
          draggable: true,
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        };

        //
        // Center the map view on the newly selected address
        //
        $scope.map.center = {
          lat: geocode.center[1],
          lng: geocode.center[0], 
          zoom: 12
        };

        //
        // Get the parcel for the property if one exists
        //
        $scope.geolocation.getSegment($scope.map.center);

        //
        // Since an address has been select, we should clear the drop down so the user
        // can focus on the map.
        //
        $scope.geocode_features = [];

        //
        // We should also make sure we save this information to the
        // User's Site object, that way if we come back later it is
        // retained within the system
        //
        $scope.site.geometry = {
          type: 'GeometryCollection',
          geometries: []
        };
        $scope.site.geometry.geometries.push(geocode.geometry);


        $timeout(function () {
          leafletData.getMap().then(function(map) {
            map.invalidateSize();
          });
        }, 200);

      }
    };
    


    //
    // Define our map interactions via the Angular Leaflet Directive
    //
    leafletData.getMap().then(function(map) {

      //
      // Move Zoom Control position to bottom/right
      //
      new L.Control.Zoom({
        position: 'bottomright'
      }).addTo(map);

      //
      // Listen for when the user drops the pin on a new geography
      //
      $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
        $scope.geolocation.getSegment(args.leafletEvent.target._latlng);

        $scope.site.geometry = {
          type: 'GeometryCollection',
          geometries: []
        };
        $scope.site.geometry.geometries.push({
          type: 'Point',
          coordinates: [
            args.leafletEvent.target._latlng.lng,
            args.leafletEvent.target._latlng.lat
          ]
        });


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

    //
    // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
    // selected their property, so we just need to display it on the map for them again.
    //
    if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {
      var json = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0];
      var geojson = {
        type: 'Feature',
        geometry: json.geometry
      };
      $scope.geolocation.drawSegment(geojson);
    }

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'user', 'Site', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practices', 'variables', 'leafletData', function ($rootScope, $scope, $route, $location, $timeout, user, Site, Template, Feature, template, fields, project, site, practices, variables, leafletData) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = {};

    $scope.readings = {
      "Forest Buffers": {
        installation: 'type_ed657deb908b483a9e96d3a05e420c50',
        monitoring: 'type_ed657deb908b483a9e96d3a05e420c50'
      }
    };

    $scope.site = site;
    $scope.site.practices = {
      list: practices,
      readingType: function(practice_type, reading_type) {
        return $scope.readings[practice_type][reading_type];
      },
      readings: function(options, $index) {
        Feature.GetRelatedFeatures({
          storage: options.storage,
          relationship: options.relationship,
          featureId: options.featureId
        }).then(function(response) {
          $scope.site.practices.list[$index].readings[options.readingType] = response;
        });
      },
      process: function() {

        var readings = [];

        //
        // Get Readings for all practices
        //
        angular.forEach($scope.site.practices.list, function(practice, $index) {
          

          $scope.site.practices.list[$index].readings = {};

          //
          // Get installation readings
          //
          $scope.site.practices.readings({
            storage: variables.practice.storage,
            relationship: $scope.readings[practice.practice_type]['installation'],
            featureId: practice.id,
            readingType: 'installation'
          }, $index);

          //
          // Get monitoring readings
          //
          $scope.site.practices.readings({
            storage: variables.practice.storage,
            relationship: $scope.readings[practice.practice_type]['monitoring'],
            featureId: practice.id,
            readingType: 'monitoring'
          }, $index);

        });

        console.log('$scope.site.practices', $scope.site.practices);
      },
      create: function() {
        //
        // Creating a practice is a two step process.
        //
        //  1. Create the new Practice record, including the owner and a new UserFeatures entry
        //     for the Practice table
        //  2. Update the Site to create a relationship with the Practice created in step 1 
        //
        Feature.CreateFeature({
          storage: variables.practice.storage,
          data: {
            practice_type: $scope.practice.practice_type,
            description: $scope.practice.description,
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(practiceId) {
          //
          // Create the relationship with the parent, Project, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: variables.site.storage,
            featureId: $route.current.params.siteId,
            data: {
              type_77f5c44516674e8da2532939619759dd: $scope.GetAllChildren(practiceId),
            }
          }).then(function() {
            //
            // Once the users have been added to the project, close the modal
            // and refresh the page
            //
            $scope.modals.close('createPractice');
            $scope.page.refresh();
          });
        });
      }
    };


    //
    // Modal Windows
    //
    $scope.modals = {
      open: function($index) {
        $rootScope.page.class = 'modal-open';
        $scope.modals.windows[$index].visible = true;
      },
      close: function($index) {
        $rootScope.page.class = null;
        $scope.modals.windows[$index].visible = false;
      },
      windows: {
        createPractice: {
          title: 'Add a practice',
          body: '',
          visible: false
        }
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
      template: 'views/site-view.html',
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
          text: 'Sites',
          url: '/projects/' + $scope.project.id + '#sites',
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.modals.open('createPractice');
          },
          text: 'Add a practice'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

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
      center: {},
      markers: {
        LandRiverSegment: {
          lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
          lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + Site.settings.services.mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        }
      },
      geojsonToLayer: function (geojson, layer, options) {
        layer.clearLayers();
        function add(l) {
          l.addTo(layer);
        }

        if (options === undefined || options === null) {
          var options = {
            stroke: true,
            fill: false,
            weight: 1,
            opacity: 1,
            color: 'rgb(255,255,255)',
            lineCap: 'square'
          };
        }

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojson, {
          style: options
        }).eachLayer(add);

      },
      drawPolygon: function(geojson, fitBounds, options) {
          
        leafletData.getMap().then(function(map) {
          var featureGroup = new L.FeatureGroup();


          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          $scope.map.geojsonToLayer(geojson, featureGroup, options);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);

          //
          // If we can getBounds then we can zoom to a specific level, we need to check to see
          // if the FeatureGroup has any bounds first though, otherwise we'll get an error.
          //
          if (fitBounds === true) {
            var bounds = featureGroup.getBounds();

            if (bounds.hasOwnProperty('_northEast')) {
              map.fitBounds(featureGroup.getBounds());
            }
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
            $scope.map.drawPolygon(data, true);
            if (data.features.length > 0) {
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be = [];
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be.push(data.features[0].properties);
            }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            return data;
          });
      },
      setupMap: function() {
        //
        // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
        // selected their property, so we just need to display it on the map for them again.
        //
        if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {

          //
          // Draw the Land River Segment
          //
          $scope.map.drawPolygon({
            type: 'Feature',
            geometry: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].geometry
          }, true, {
            stroke: false,
            fill: true,
            fillOpacity: 0.65,
            color: 'rgb(25,166,215)'
          });

          //
          // Load Land river segment details
          //
          Feature.GetFeature({
            storage: variables.land_river_segment.storage,
            featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
          }).then(function(response) {
            $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
          });

          //
          // Draw the county
          //          
          $scope.map.drawPolygon({
            type: 'Feature',
            geometry: $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].geometry
          }, true);

        }
      }
    };
    

    $scope.GetAllChildren = function(practiceId) {

      var existingSites = $scope.site.practices.list,
          updatedSites = [{
            id: practiceId // Start by adding the newest relationships, then we'll add the existing sites
          }];

      angular.forEach(existingSites, function(site, $index) {
        updatedSites.push({
          id: site.id
        });
      });

      return updatedSites;
    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: variables.project.storage,
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
            storage: variables.project.storage,
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
    // Once the page has loaded we need to load in all Reading Features that are associated with
    // the Practices related to the Site being viewed
    //
    $scope.site.practices.process();
    $scope.map.setupMap();

  }]);

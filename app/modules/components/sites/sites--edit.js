(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldStack.controller:SiteEditCtrl
   * @description
   * # SiteEditCtrl
   * Controller of the FieldStack
   */
  angular.module('FieldStack')
    .controller('SiteEditCtrl', function (Account, environment, $http, leafletData, $location, mapbox, Site, site, $rootScope, $route, $scope, Segment, $timeout, user) {

      var self = this,
          timeout;

      $rootScope.page = {};

      site.$promise.then(function(successResponse) {

        self.site = successResponse;

        self.site.geolocation = null;

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
              url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id
            },
            {
              text: 'Edit',
              type: 'active'
            }
        ];

        //
        // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
        // selected their property, so we just need to display it on the map for them again.
        //
        if (self.site && self.site.properties && self.site.properties.segment) {
          self.geolocation.drawSegment(self.site.properties.segment);
        }

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

        self.map = {
          defaults: {
            scrollWheelZoom: false,
            zoomControl: false,
            maxZoom: 19
          },
          layers: {
            baselayers: {
              basemap: {
                name: 'Satellite Imagery',
                url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.satellite + '/{z}/{x}/{y}.png',
                type: 'xyz',
                layerOptions: {
                  attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
                }
              }
            }
          },
          center: {
            lat: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[1] : 38.362,
            lng: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[0] : -81.119,
            zoom: (self.site.geometry !== null && self.site.geometry !== undefined) ? 16 : 6
          },
          markers: {
            LandRiverSegment: {
              lat: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[1] : 38.362,
              lng: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[0] : -81.119,
              focus: false,
              draggable: true,
              icon: {
                iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
                iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
                iconSize: [38, 90],
                iconAnchor: [18, 44],
                popupAnchor: [0, 0]
              }
            }
          }
        };

      }, function(errorResponse) {

      });

      self.saveSite = function() {

        //
        // Prior to saving the Site we need to make sure the user has specified
        // their county and state.
        //
        if (self.site.properties.county) {
          self.site.properties.county_id = self.site.properties.county.id;
          self.site.properties.state = self.site.properties.county.properties.state_name;
        } else {
          console.error('Couldn\'t save your Site because you didn\'t select a county and state');
          return;
        }

        self.site.$update().then(function(successResponse) {
          $location.path('/projects/' + $route.current.params.projectId + '/sites/' + $route.current.params.siteId);
        }, function(errorResponse) {

        });
      };

      self.deleteSite = function() {
        self.site.$delete().then(function(successResponse) {
          $location.path('/projects/' + $route.current.params.projectId);
        }, function(errorResponse) {

        });
      };

      /**
       * Mapping functionality
       *
       *
       *
       *
       *
       *
       */

      //
      // Define a layer to add geometries to later
      //
      var featureGroup = new L.FeatureGroup();

      //
      // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
      //
      self.geojsonToLayer = function (geojson, layer) {
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

      self.geolocation = {
        drawSegment: function(geojson) {

          leafletData.getMap().then(function(map) {
            //
            // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
            //
            map.removeLayer(featureGroup);

            //
            // Convert the GeoJSON to a layer and add it to our FeatureGroup
            //
            self.geojsonToLayer(geojson, featureGroup);

            //
            // Add the FeatureGroup to the map
            //
            map.addLayer(featureGroup);
          });

        },
        getSegment: function(coordinates) {

          leafletData.getMap().then(function(map) {

            Segment.query({
                 q: {
                   filters: [
                     {
                       name: 'geometry',
                       op: 'intersects',
                       val: 'SRID=4326;POINT(' + coordinates.lng + ' ' + coordinates.lat + ')'
                     }
                   ]
                 }
               }).$promise.then(function(successResponse) {

                 var segments = successResponse;

                 self.geolocation.drawSegment(segments);

                 if (segments.features.length) {
                   self.site.properties.segment_id = segments.features[0].id;
                   self.site.properties.segment = segments.features[0];
                 }

               }, function(errorResponse) {
                 console.error('Error', errorResponse);
               });

          });

        },
        search: function() {
          $timeout.cancel(timeout);

          timeout = $timeout(function () {
            self.geolocation.initGeocoder();
          }, 800);
        },
        initGeocoder: function() {
          var requested_location = self.site.geolocation;

          if (requested_location.length >= 3) {
            var geocode_service_url = '//api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/' + requested_location + '.json';
            $http({
              method: 'get',
              url: geocode_service_url,
              params: {
                'callback': 'JSON_CALLBACK',
                'access_token': mapbox.access_token
              },
              headers: {
                'Authorization': 'external'
              }
            }).success(function(data) {
              self.geocode_features = data.features;
            }).error(function(data, status, headers, config) {
              console.log('ERROR: ', data);
            });
          }
        },
        select: function(geocode) {

          //
          // Move the draggable marker to the newly selected address
          //
          self.map.markers.LandRiverSegment = {
            lat: geocode.center[1],
            lng: geocode.center[0],
            focus: false,
            draggable: true,
            icon: {
              iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
              iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
              iconSize: [38, 90],
              iconAnchor: [18, 44],
              popupAnchor: [0, 0]
            }
          };

          //
          // Center the map view on the newly selected address
          //
          self.map.center = {
            lat: geocode.center[1],
            lng: geocode.center[0],
            zoom: 16
          };

          //
          // Get the parcel for the property if one exists
          //
          self.geolocation.getSegment(self.map.center);

          //
          // Since an address has been select, we should clear the drop down so the user
          // can focus on the map.
          //
          self.geocode_features = [];

          //
          // We should also make sure we save this information to the
          // User's Site object, that way if we come back later it is
          // retained within the system
          //
          self.site.geometry = {
            type: 'GeometryCollection',
            geometries: []
          };
          self.site.geometry.geometries.push(geocode.geometry);


          $timeout(function () {
            leafletData.getMap().then(function(map) {
              map.invalidateSize();
            });
          }, 200);

        }
      };

      self.processPin = function(coordinates, zoom) {

        //
        // Update the LandRiver Segment
        //
        self.geolocation.getSegment(coordinates);

        //
        // Update the geometry for this Site
        //
        self.site.geometry = {
          type: 'GeometryCollection',
          geometries: []
        };
        self.site.geometry.geometries.push({
          type: 'Point',
          coordinates: [
            coordinates.lng,
            coordinates.lat
          ]
        });

        //
        // Update the visible pin on the map
        //
        self.map.markers.LandRiverSegment.lat = coordinates.lat;
        self.map.markers.LandRiverSegment.lng = coordinates.lng;

        //
        // Update the map center and zoom level
        //
        self.map.center = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: (zoom < 10) ? 10 : zoom
        };
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
        // Update the pin and segment information when the user clicks on the map
        // or drags the pin to a new location
        //
        $scope.$on('leafletDirectiveMap.click', function(event, args) {
          self.processPin(args.leafletEvent.latlng, map._zoom);
        });

        $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
          self.processPin(args.leafletEvent.latlng, map._zoom+1);
        });

        $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
          self.processPin(args.leafletEvent.target._latlng, map._zoom);
        });

        $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
          var zoom = map._zoom+1;
          map.setZoom(zoom);
        });

      });

    });

}());

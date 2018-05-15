'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('Mapbox')
  .service('Map', function (mapbox) {

    var Map = {
      defaults: {
        scrollWheelZoom: false,
        maxZoom: 19
      },
      layers: {
        baselayers: {
          basemap: {
            name: 'Streets',
            url: 'https://{s}.tiles.mapbox.com/v3/{mapid}/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              mapid: mapbox.street
            }
          },
          satellite: {
            name: 'Satellite',
            url: 'https://{s}.tiles.mapbox.com/v3/{mapid}/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              mapid: mapbox.map_id
            }
          }
        }
      },
      center: {
        lng: -77.534,
        lat: 40.834,
        zoom: 7
      },
      markers: {
         projectLocation: {
           lng: -77.534,
           lat: 40.834,
           message: 'Drag me to your project location',
           focus: true,
           draggable: true
         }
       },
      styles: {
        icon: {
          parcel: {
            iconUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000@2x.png?access_token=' + mapbox.access_token,
            iconSize: [35, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        }
      },
      geojson: {}
    };

    return Map;
  });

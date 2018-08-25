'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('Mapbox')
    .service('Map', function(mapbox) {

        var Map = {
            defaults: {
                scrollWheelZoom: false,
                maxZoom: 19
            },
            layers: {
                baselayers: {
                    streets: {
                        name: 'Streets',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets'
                        }
                    },
                    terrain: {
                        name: 'Terrain',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.run-bike-hike'
                        }
                    },
                    satellite: {
                        name: 'Satellite',
                        url: 'http://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        options: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.satellite'
                        }
                    }
                }
            },
            center: {
                lat: 39.828175,
                lng: -98.5795,
                zoom: 4
            },
            markers: {},
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

        var southWest = L.latLng(25.837377, -124.211606),
            northEast = L.latLng(49.384359, -67.158958),
            bounds = L.latLngBounds(southWest, northEast);

        console.log('United States bounds', bounds);

        Map.bounds = bounds;

        return Map;
    });
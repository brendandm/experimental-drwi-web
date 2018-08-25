'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('FieldDoc')
    .service('Map', ['mapbox', function(mapbox) {

        var self = this;

        var Map = {
            defaults: {
                scrollWheelZoom: false,
                maxZoom: 19
            },
            layers: {
                baselayers: {
                    satellite: {
                        name: 'Satellite',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets-satellite',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    },
                    streets: {
                        name: 'Streets',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.streets',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    },
                    terrain: {
                        name: 'Terrain',
                        type: 'xyz',
                        url: 'https://api.tiles.mapbox.com/v4/{mapid}/{z}/{x}/{y}.png?access_token={apikey}',
                        layerOptions: {
                            apikey: mapbox.access_token,
                            mapid: 'mapbox.run-bike-hike',
                            attribution: '© <a href=\"https://www.mapbox.com/about/maps/\">Mapbox</a> © <a href=\"http://www.openstreetmap.org/copyright\">OpenStreetMap</a> <strong><a href=\"https://www.mapbox.com/map-feedback/\" target=\"_blank\">Improve this map</a></strong>'
                        }
                    }
                }
            },
            center: {
                lat: 39.828175,
                lng: -98.5795,
                zoom: 4
            },
            styles: {
                icon: {
                    parcel: {
                        iconUrl: '/images/pin-l+cc0000.png?access_token=' + mapbox.access_token,
                        iconRetinaUrl: '/images/pin-l+cc0000@2x.png?access_token=' + mapbox.access_token,
                        iconSize: [35, 90],
                        iconAnchor: [18, 44],
                        popupAnchor: [0, 0]
                    }
                },
                polygon: {
                    parcel: {
                        stroke: true,
                        fill: false,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(255,255,255)',
                        lineCap: 'square'
                    },
                    canopy: {
                        stroke: false,
                        fill: true,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(0,204,34)',
                        lineCap: 'square',
                        fillOpacity: 0.6
                    },
                    impervious: {
                        stroke: false,
                        fill: true,
                        weight: 3,
                        opacity: 1,
                        color: 'rgb(204,0,0)',
                        lineCap: 'square',
                        fillOpacity: 0.6
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

    }]);
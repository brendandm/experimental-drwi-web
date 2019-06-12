'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('MapboxGL')
    .constant('MapboxGLSettings', {
        geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
        access_token: 'pk.eyJ1IjoiZmllbGRkb2MiLCJhIjoiY2p1MW8zOHNyMDNwZTQ0bXlhMjNxaXVpMSJ9.0tUMQt2s0zd6DAthnmJItg',
        style: 'mapbox://styles/mapbox/mapbox.mapbox-streets-v7'
    });
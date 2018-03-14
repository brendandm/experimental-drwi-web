'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('Mapbox')
  .constant('mapbox', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoicmRhd2VzMSIsImEiOiJjaXBneGlqNG8wMHR5dWduajloZXhyZnZ5In0.mPworUdqIVGkNWGnFRGz9A',
    map_id: 'rdawes1.0dg4d3gd',
    terrain: '',
    street: 'mapbox.mapbox-streets-v7'
  });

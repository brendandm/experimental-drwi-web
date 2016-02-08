'use strict';

/**
 * @ngdoc service
 * @name FieldStack.Site
 * @description
 * # Site
 * Service in the FieldStack.
 */
angular.module('FieldStack')
  .constant('mapbox', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoiZGV2ZWxvcGVkc2ltcGxlIiwiYSI6IlZGVXhnM3MifQ.Q4wmA49ggy9i1rLr8-Mc-w',
    satellite: 'developedsimple.k105bd34',
    terrain: 'developedsimple.k1054a50',
    street: 'developedsimple.k1057ndn',
  });

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
    .service('MapManager', function() {

        return {
            addLayers: function(map, arr) {

                arr.forEach(function(feature) {

                    console.log(
                        'MapManager.addLayers --> feature',
                        feature);

                    var spec = feature.layer_spec || {};

                    console.log(
                        'MapManager.addLayers --> spec',
                        spec);

                    feature.spec = spec;

                    console.log(
                        'MapManager.addLayers --> feature.spec',
                        feature.spec);

                    if (!feature.selected ||
                        typeof feature.selected === 'undefined') {

                        feature.selected = false;

                    } else {

                        feature.spec.layout.visibility = 'visible';

                    }

                    if (feature.spec.id) {

                        try {

                            map.addLayer(feature.spec);

                        } catch (error) {

                            console.log(
                                'MapManager.addLayers --> error',
                                error);

                        }

                    }

                });

                return arr;

            },
            addFeature: function(map, feature, attribute, addToMap, fitBounds) {

                if (fitBounds === null ||
                    typeof fitBounds === 'undefined') {

                    fitBounds = true;

                }

                console.log('MapManager.populateMap --> feature', feature);

                var geojson = attribute ? feature[attribute] : feature;

                console.log('MapManager.populateMap --> geojson', geojson);

                if (geojson !== null &&
                    typeof geojson !== 'undefined') {

                    var geometryType = geojson.geometry ? geojson.geometry.type : geojson.type;

                    console.log(
                        'MapManager.populateMap --> geometryType',
                        geometryType);

                    var bounds = turf.bbox(geojson);

                    if (geometryType === 'Point') {

                        var buffer = turf.buffer(
                            geojson,
                            0.5, {
                                units: 'kilometers'
                            });

                        bounds = turf.bbox(buffer);

                    }

                    if (fitBounds) {

                        map.fitBounds(bounds, {
                            padding: 40
                        });

                    }

                    if (addToMap) {

                        if (geometryType === 'Point') {

                            map.addLayer({
                                'id': 'feature-circle-' + Date.now(),
                                'type': 'circle',
                                'source': {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'Feature',
                                        'geometry': geojson
                                    }
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'circle-radius': 8,
                                    'circle-color': '#06aadf',
                                    'circle-stroke-color': 'rgba(6, 170, 223, 0.5)',
                                    'circle-stroke-opacity': 1,
                                    'circle-stroke-width': 4
                                }
                            });

                        } else if (geometryType.indexOf('Line') >= 0) {

                            map.addLayer({
                                'id': 'feature-line-' + Date.now(),
                                'type': 'line',
                                'source': {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'Feature',
                                        'geometry': geojson
                                    }
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'line-color': 'rgba(6, 170, 223, 0.8)',
                                    'line-width': 2
                                }
                            });

                        } else {

                            map.addLayer({
                                'id': 'feature-' + Date.now(),
                                'type': 'fill',
                                'source': {
                                    'type': 'geojson',
                                    'data': geojson
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'fill-color': '#06aadf',
                                    'fill-opacity': 0.4
                                }
                            });

                            map.addLayer({
                                'id': 'feature-outline-' + Date.now(),
                                'type': 'line',
                                'source': {
                                    'type': 'geojson',
                                    'data': geojson
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'line-color': 'rgba(6, 170, 223, 0.8)',
                                    'line-width': 2
                                }
                            });

                        }

                    }

                }

            },
            populateMap: function(map, feature, attribute, addToMap, fitBounds) {

                if (fitBounds === null ||
                    typeof fitBounds === 'undefined') {

                    fitBounds = true;

                }

                console.log('MapManager.populateMap --> feature', feature);

                var geojson = attribute ? feature[attribute] : feature;

                console.log('MapManager.populateMap --> geojson', geojson);

                if (geojson !== null &&
                    typeof geojson !== 'undefined') {

                    var bounds = turf.bbox(geojson);

                    if (fitBounds) {

                        map.fitBounds(bounds, {
                            padding: 40
                        });

                    }

                    if (!addToMap) {

                        return;

                    } else {

                        var geometryType = geojson.geometry ? geojson.geometry.type : geojson.type;

                        console.log(
                            'MapManager.populateMap --> geometryType',
                            geometryType);

                        if (geometryType === 'Point') {

                            var buffer = turf.buffer(
                                geojson,
                                0.5, {
                                    units: 'kilometers'
                                });

                            bounds = turf.bbox(buffer);

                            if (fitBounds) {

                                map.fitBounds(bounds, {
                                    padding: 40
                                });

                            }

                            map.addLayer({
                                'id': 'feature-circle-' + Date.now(),
                                'type': 'circle',
                                'source': {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'Feature',
                                        'geometry': geojson
                                    }
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'circle-radius': 8,
                                    'circle-color': '#06aadf',
                                    'circle-stroke-color': 'rgba(6, 170, 223, 0.5)',
                                    'circle-stroke-opacity': 1,
                                    'circle-stroke-width': 4
                                }
                            });

                        } else if (geometryType.indexOf('Line') >= 0) {

                            map.addLayer({
                                'id': 'feature-line-' + Date.now(),
                                'type': 'line',
                                'source': {
                                    'type': 'geojson',
                                    'data': {
                                        'type': 'Feature',
                                        'geometry': geojson
                                    }
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'line-color': 'rgba(6, 170, 223, 0.8)',
                                    'line-width': 2
                                }
                            });

                        } else {

                            map.addLayer({
                                'id': 'feature-' + Date.now(),
                                'type': 'fill',
                                'source': {
                                    'type': 'geojson',
                                    'data': geojson
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'fill-color': '#06aadf',
                                    'fill-opacity': 0.4
                                }
                            });

                            map.addLayer({
                                'id': 'feature-outline-' + Date.now(),
                                'type': 'line',
                                'source': {
                                    'type': 'geojson',
                                    'data': geojson
                                },
                                'layout': {
                                    'visibility': 'visible'
                                },
                                'paint': {
                                    'line-color': 'rgba(6, 170, 223, 0.8)',
                                    'line-width': 2
                                }
                            });

                        }

                    }

                }

            }
        };

    });
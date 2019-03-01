'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
    .service('Utility', function(leafletBoundsHelpers, Map) {

        return {
            machineName: function(name) {

                if (name) {

                    var removeDashes = name.replace(/-/g, ''),
                        removeSpaces = removeDashes.replace(/ /g, '-'),
                        convertLowerCase = removeSpaces.toLowerCase();

                    return convertLowerCase;
                }

                return null;

            },
            camelName: function(name) {

                if (name) {

                    return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
                        return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
                    }).replace(/\s+/g, '');

                }

                return null;

            },
            precisionRound: function(value, decimals, base) {

                var pow = Math.pow(base || 10, decimals);

                return Math.round(value * pow) / pow;

            },
            meterCoefficient: function() {

                var range = [
                    0.04,
                    0.08,
                    0.12,
                    0.16,
                    0.20,
                    0.24,
                    0.28,
                    0.32,
                    0.36,
                    0.40
                ];

                return range[Math.floor(Math.random() * range.length)];

            },
            transformBounds: function(obj) {

                var xRange = [],
                    yRange = [],
                    southWest,
                    northEast,
                    bounds;

                if (obj &&
                    obj.coordinates &&
                    Array.isArray(obj.coordinates)) {

                    try {

                        obj.coordinates[0].forEach(function(coords) {

                            xRange.push(coords[0]);

                            yRange.push(coords[1]);

                        });

                    } catch (error) {

                        xRange.push(obj.coordinates[0]);

                        yRange.push(obj.coordinates[1]);

                    }

                    southWest = [
                        Math.min.apply(null, yRange),
                        Math.min.apply(null, xRange)
                    ];

                    northEast = [
                        Math.max.apply(null, yRange),
                        Math.max.apply(null, xRange)
                    ];

                    bounds = leafletBoundsHelpers.createBoundsFromArray([
                        southWest,
                        northEast
                    ]);

                } else {

                    bounds = Map.bounds;

                }

                return bounds;

            },
            buildStaticMapURL: function(geometry) {

                var styledFeature = {
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "marker-size": "small",
                        "marker-color": "#2196F3",
                        "stroke": "#2196F3",
                        "stroke-opacity": 1.0,
                        "stroke-width": 2,
                        "fill": "#2196F3",
                        "fill-opacity": 0.5
                    }
                };

                // Build static map URL for Mapbox API

                return [
                    'https://api.mapbox.com/styles/v1',
                    '/mapbox/streets-v10/static/geojson(',
                    encodeURIComponent(JSON.stringify(styledFeature)),
                    ')/auto/400x200@2x?access_token=',
                    'pk.eyJ1IjoiYm1jaW50eXJlIiwiYSI6IjdST3dWNVEifQ.ACCd6caINa_d4EdEZB_dJw'
                ].join('');

            },
            processMetrics: function(arr) {

                arr.forEach(function(datum) {

                    datum.contextProgress = {
                        value: 0,
                        arcValue: 0
                    };

                    datum.selfProgress = {
                        value: 0,
                        arcValue: 0
                    };

                    if (datum.context_target) {

                        datum.contextProgress.value = datum.current_value / datum.context_target;

                    } else {

                        datum.contextProgress.value = datum.current_value / datum.target;

                    }

                    if (datum.self_target) {

                        datum.selfProgress.value = datum.current_value / datum.self_target;

                    }

                    datum.contextProgress.arcValue = datum.contextProgress.value > 1 ? 1 : datum.contextProgress.value;

                    datum.selfProgress.arcValue = datum.selfProgress.value > 1 ? 1 : datum.selfProgress.value;

                });

                return arr;

            },
            groupByModel: function(arr) {

                var index = {
                    'has_models': false,
                    'generic': [],
                    'models': {}
                };

                arr.forEach(function(datum) {

                    if (!datum.model || typeof datum.model === 'undefined') {

                        index.generic.push(datum);

                    } else {

                        var key = 'model_' + datum.model.id;

                        if (index.models.hasOwnProperty(key) &&
                            Array.isArray(index.models[key].collection)) {

                            index.models[key].collection.push(datum);

                        } else {

                            index.has_models = true;

                            index.models[key] = {
                                'datum': datum.model,
                                'collection': [
                                    datum
                                ]
                            }

                        }

                    }

                });

                return index;

            }
        };

    });
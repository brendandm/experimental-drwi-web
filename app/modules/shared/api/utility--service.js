'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
    .service('Utility', function() {

        Number.isInteger = Number.isInteger || function(value) {

            return (typeof value === 'number' && 
                    isFinite(value) && 
                    Math.floor(value) === value);
            
        };

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

                return [];

            },
            buildStaticMapURL: function(geometry, colorScheme = null) {

                var color = "#06aadf";

                if(colorScheme != null){
                  //  console.log('COLOR 0');
                    if(colorScheme == 'practice'){
                        color = "#df063e";
                     //    console.log('COLOR 1');
                    }else{
                    //     console.log('COLOR 2');
                    }
                }else{
                  //   console.log('COLOR 3');
                }

                var styledFeature = {
                    "type": "Feature",
                    "geometry": geometry,
                    "properties": {
                        "marker-size": "small",
                        "marker-color": color,
                        "stroke": color,
                        "stroke-opacity": 1.0,
                        "stroke-width": 2,
                        "fill": color,
                        "fill-opacity": 0.5
                    }
                };
                // Build static map URL for Mapbox API
             //   console.log('buildStaticMapURL->styledFeature',styledFeature);
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
                            };

                        }

                    }

                });

                return index;

            },
            groupByCategory: function(arr) {

                var index = {
                    'has_categories': false,
                    'generic': [],
                    'categories': {}
                };

                arr.forEach(function(datum) {

                    if (!datum.category || typeof datum.category === 'undefined') {

                        index.generic.push(datum);

                    } else {

                        var key = datum.category;

                        if (index.categories.hasOwnProperty(key) &&
                            Array.isArray(index.categories[key].collection)) {

                            index.categories[key].collection.push(datum);

                        } else {

                            index.has_categories = true;

                            index.categories[key] = {
                                'name': datum.category,
                                'collection': [
                                    datum
                                ]
                            };

                        }

                    }

                });

                return index;

            },
            sortCollection: function(arr, key) {

                arr.sort(function compare(a, b) {

                    if (a[key] < b[key]) {

                        return -1;

                    }

                    if (a[key] > b[key]) {

                        return 1;

                    }

                    return 0;

                });

                return arr;

            },
            scrubFeature: function(feature, excludedKeys) {

                var reservedProperties = [
                    'links',
                    'permissions',
                    '$promise',
                    '$resolved'
                ];

                excludedKeys.forEach(function(key) {

                    if (feature.properties) {

                        delete feature.properties[key];

                    } else {

                        delete feature[key];

                    }

                });

                reservedProperties.forEach(function(key) {

                    delete feature[key];

                });

            },
            extractUserPrograms: function(user) {

                var _programs = [];

                user.properties.programs.forEach(function(program) {

                    _programs.push(program.properties);

                });

                _programs.sort(function(a, b) {

                    return a.id > b.id;

                });

                return _programs;

            },
            processTags: function(arr) {

                arr.forEach(function(tag) {

                    if (tag.color &&
                        tag.color.length) {

                        tag.lightColor = tinycolor(tag.color).lighten(5).toString();

                    }

                });

                return arr;

            }
        };

    });
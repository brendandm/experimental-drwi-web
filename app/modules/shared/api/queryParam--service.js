'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
    .service('QueryParamManager', [
        '$location',
        function($location) {

            var reservedKeys = [
                'limit',
                'page'
            ];

            var defaults = {
                limit: 12,
                page: 1,
                archived: false
            };

            return {
                adjustParams: function (params, extras, set) {

                    console.log(
                        'adjustParams:params:',
                        params
                    );

                    console.log(
                        'adjustParams:extras:',
                        extras
                    );

                    console.log(
                        'adjustParams:set:',
                        set
                    );

                    set = (typeof set === 'boolean') ? set : true;

                    console.log(
                        'adjustParams:set:2:',
                        set
                    );

                    if (!params || typeof params === 'undefined') {

                        params = this.getDefaults();

                        console.log(
                            'adjustParams:params:defaults:',
                            defaults
                        );

                        //
                        // Remove params that may have persisted on
                        // the base `defaults` object.
                        //

                        for (var key in params) {

                            if (params.hasOwnProperty(key) &&
                                reservedKeys.indexOf(key) < 0) {

                                delete params[key];

                            }

                        }

                        console.log(
                            'adjustParams:params:defaults:2:',
                            defaults
                        );

                    }

                    //
                    // Ensure that a `page` parameter is always present.
                    //

                    if (!params.hasOwnProperty('page')) {

                        params.page = 1;
                    }

                    //
                    // Ensure that a `limit` parameter is always present.
                    //

                    if (!params.hasOwnProperty('limit')) {

                        params.limit = 12;

                    }

                    //
                    // Add optional keys to `params` object.
                    //

                    if (extras) {

                        for (var key in extras) {

                            if (extras.hasOwnProperty(key)) {

                                params[key] = extras[key];

                            }

                        }

                    }

                    console.log(
                        'adjustParams:params:2:',
                        params
                    );

                    if (set) this.setParams(params);

                    return params;

                },
                getDefaults: function () {

                    return JSON.parse(JSON.stringify(defaults));

                },
                getParams: function () {

                    var params = $location.search();

                    console.log(
                        'getParams:params:',
                        params
                    );

                    //
                    // Parse query params and convert from string
                    // to desired types.
                    //

                    for (var key in params) {

                        if (params.hasOwnProperty(key)) {

                            var paramVal = params[key];

                            if (Number.isInteger(+paramVal)) {

                                params[key] = +paramVal;

                            }

                            if (paramVal === 'true') {

                                params[key] = true;

                            }

                            if (paramVal === 'false') {

                                params[key] = false;

                            }

                        }

                    }

                    return params;

                },
                setParams: function (params, override, callback) {

                    console.log(
                        'setParams:params:',
                        params
                    );

                    var keys = [];

                    try {

                        keys = Object.keys(params);

                    } catch (e) {

                        return;

                    }

                    //
                    // If params are empty and defaults WERE NOT
                    // requested (`override`), abort.
                    //

                    if (!keys.length && !override) return;

                    //
                    // If params are empty and defaults WERE
                    // requested (`override`), fall back to
                    // default settings.
                    //

                    if (!keys.length && override) {

                        params = this.getDefaults();

                    }

                    //
                    // Convert param values to strings.
                    //

                    for (var key in params) {

                        if (params.hasOwnProperty(key)) {

                            var paramVal = params[key];

                            if (paramVal && typeof paramVal !== 'undefined') {

                                params[key] = paramVal.toString();

                            } else {

                                delete params[key];

                            }

                        }

                    }

                    $location.search(params);

                    if (typeof callback === 'function') {

                        callback(params);

                    }

                }
            };

        }]);
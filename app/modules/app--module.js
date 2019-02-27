'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular
    .module('FieldDoc', [
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ngTouch',
        'ipCookie',
        'leaflet-directive',
        'angularFileUpload',
        'geolocation',
        'monospaced.elastic',
        'angularMoment',
        'config',
        'MapboxGL',
        'MapboxGLGeocoding',
        'Mapbox',
        'save2pdf',
        'collaborator',
        'ui.bootstrap',
        'angular-progress-arc'
    ]).config(function($sceDelegateProvider) {

        $sceDelegateProvider.resourceUrlWhitelist([
            // Allow same origin resource loads.
            'self',
            // Allow loading from our assets domain.  Notice the difference between * and **.
            'http://localhost:8000/**',
            // Allow loading from API endpoints.
            'http://localhost:4000/v1/tpl/**',
            'https://dev.dnr.fielddoc.chesapeakecommons.org/**',
            'https://dnr.fielddoc.org/**',
        ]);

        // The blacklist overrides the whitelist so the open redirect here is blocked.
        $sceDelegateProvider.resourceUrlBlacklist([
            'http://myapp.example.com/clickThru**'
        ]);

    });
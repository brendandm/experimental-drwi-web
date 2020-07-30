(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('estExtent', [
            'environment',
            '$window',
            '$rootScope',
            '$routeParams',
            '$filter',
            '$parse',
            '$location',
            'Practice',
            '$timeout',
            function (environment, $window, $rootScope, $routeParams, $filter,
                      $parse, $location, Practice, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'options': '=?',
                        'featureType': '@'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/mapboxgl/extent/estimatedExtent--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        //
                        // Additional scope vars.
                        //

                    }

                };

            }

        ]);

}());
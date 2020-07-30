(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('estExtent', [
            '$window',
            '$rootScope',
            '$routeParams',
            '$filter',
            '$parse',
            '$location',
            'Practice',
            '$timeout',
            function ($window, $rootScope, $routeParams, $filter,
                      $parse, $location, Practice, $timeout) {
                return {
                    restrict: 'EA',
                    scope: {
                        'options': '=?',
                        'featureType': '@'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/mapboxgl/extent/estimatedExtent--view.html';

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
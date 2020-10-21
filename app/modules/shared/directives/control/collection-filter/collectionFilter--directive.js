(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('collectionFilter', [
            '$window',
            'environment',
            function($window, environment) {
                return {
                    restrict: 'EA',
                    scope: {
                        'features': '=?',
                        'filters': '=?',
                        'displayStates': '=?',
                        'type': '@',
                        'update': '&'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/control/collection-filter/collectionFilter--view.html?t=' + environment.version;

                    },
                    link: function(scope, element, attrs) {

                        //

                    }

                };

            }

        ]);

}());
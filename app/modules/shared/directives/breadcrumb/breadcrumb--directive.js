(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('breadcrumb', [
            'environment',
            function (environment) {
                return {
                    restrict: 'EA',
                    scope: {
                        'pad': '@',
                        'practice': '=?',
                        'project': '=?',
                        'site': '=?',
                        'tail': '@'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/breadcrumb/breadcrumb--view.html?t=' + environment.version;

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
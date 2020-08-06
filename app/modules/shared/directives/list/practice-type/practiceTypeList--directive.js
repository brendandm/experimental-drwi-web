(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('practiceTypeList', [
            'environment',
            function (environment) {
                return {
                    restrict: 'EA',
                    scope: {
                        'index': '=?',
                        'letters': '=?',
                        'link': '@',
                        'program': '=?',
                        'summary': '=?',
                        'visible': '=?'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/list/practice-type/practiceTypeList--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        //
                        // Additional scope vars.
                        //

                        scope.queryToken = undefined;

                        scope.addLink = (scope.link === 'true');

                    }

                };

            }

        ]);

}());
(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('alphabetCtrl', [
            '$window',
            'environment',
            'AnchorScroll',
            function($window, environment, AnchorScroll) {
                return {
                    restrict: 'EA',
                    scope: {
                        'forceTop': '@',
                        'hiddenKeys': '=?',
                        'letters': '=?',
                        'orientation': '@orientation',
                        'visible': '=?'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/control/alphabet/alphabetControl--view.html?t=' + environment.version;

                    },
                    link: function(scope, element, attrs) {

                        scope.scrollManager = AnchorScroll;

                        scope.scrollTop = (scope.forceTop === 'true');

                        scope.resetScroll = function () {

                            $window.scrollTo(0, 0);

                        };

                    }

                };

            }

        ]);

}());
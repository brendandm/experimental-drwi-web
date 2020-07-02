(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('alphabetCtrl', [
            'AnchorScroll',
            function(AnchorScroll) {
                return {
                    restrict: 'EA',
                    scope: {
                        'letters': '=?',
                        'orientation': '@orientation'
                    },
                    templateUrl: function(elem, attrs) {

                        return 'modules/shared/directives/control/alphabet/alphabetControl--view.html';

                    },
                    link: function(scope, element, attrs) {

                        scope.scrollManager = AnchorScroll;

                    }

                };

            }

        ]);

}());
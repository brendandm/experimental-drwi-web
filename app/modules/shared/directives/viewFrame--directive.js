(function() {

    'use strict';

    angular.module('FieldDoc')
        .directive('viewFrame', ['$window',
            function($window) {
                return {
                    restrict: 'A',
                    scope: {
                        base: '='
                    },
                    link: function(scope, element, attrs) {

                        var winHeight = $window.innerHeight,
                            map = document.getElementById('map--wrapper'),
                            contentHeight = (!map || typeof map === 'undefined') ? winHeight : (winHeight - map.clientHeight);

                        console.log('winHeight', winHeight);
                        console.log('map', map);
                        console.log('contentHeight', contentHeight);

                        element.css('min-height', contentHeight + 'px');

                    }

                };
            }
        ]);

}());
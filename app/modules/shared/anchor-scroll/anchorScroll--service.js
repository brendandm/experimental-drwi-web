(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name FieldDoc.AnchorScroll
     * @description
     * # template
     * Provider in the FieldDoc.
     */
    angular.module('FieldDoc')
        .service('AnchorScroll', [
            '$anchorScroll',
            '$location',
            '$timeout',
            function($anchorScroll, $location, $timeout) {

                console.log('AnchorScroll service initializing.');

                return {
                    scrollToAnchor: function(letter) {

                        console.log(
                            'AnchorScroll.scrollToAnchor.letter',
                            letter);

                        $timeout(function() {

                            var hash;

                            try {

                                hash = letter.toLowerCase();

                                $location.hash(hash);

                            } catch (e) {

                                hash = $location.hash();

                            }

                            console.log(
                                'AnchorScroll.scrollToAnchor.hash',
                                hash);

                            if (typeof hash === 'string' && hash.length) {

                                console.log(
                                    'Scrolling to anchor: ',
                                    hash);

                                $anchorScroll(hash);

                            }

                        }, 10);

                    }
                };

            }
        ]);

}());
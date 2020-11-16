(function() {

    'use strict';

    angular.module('FieldDoc')
        .filter('fileSize', ['$filter', function($filter) {

            return function(value) {

                var size;

                var precision = 0;

                var notation = 'kB';

                if (value >= 1e6) {

                    size = value / 1e6;

                    precision = 1;

                    notation = 'MB';

                } else if (value >= 1e9) {

                    size = value / 1e9;

                    precision = 2;

                    notation = 'GB';

                } else {

                    size = value / 1e3;

                }

                size = $filter('number')(size, precision);

                return size + ' ' + notation;

            };

        }]);

}());
(function () {

    'use strict';

    angular.module('FieldDoc')
        .directive('batchUpload', [
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
                        'featureType': '@',
                        'model': '=?',
                        'formAction': '&',
                        'uploadError': '=?'
                    },
                    templateUrl: function (elem, attrs) {

                        return 'modules/shared/directives/batch-upload/batchUpload--view.html?t=' + environment.version;

                    },
                    link: function (scope, element, attrs) {

                        //
                        // Additional scope vars.
                        //

                        scope.uploadFile = function() {

                            scope.formAction({
                                _page: scope.page
                            });

                        };

                    }

                };

            }

        ]);

}());
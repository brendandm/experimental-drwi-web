(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name WaterReporter.report.controller:SingleReportController
   * @description
   *     Display a single report based on the current `id` provided in the URL
   * Controller of the waterReporterApp
   */
  angular.module('FieldDoc')
    .directive('fileUpload', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);

                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    });

}());

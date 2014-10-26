'use strict';

/**
 * @ngdoc directive
 * @name practiceMonitoringAssessmentApp.directive:contenteditable
 * @description
 * # contenteditable
 */
angular.module('practiceMonitoringAssessmentApp')
  .directive('contenteditable', ['$sce', function ($sce) {
  return {
    restrict: "A",
    require: "ngModel",
    link: function(scope, element, attrs, ngModel) {

      function read() {
        ngModel.$setViewValue(element.html());
      }

      ngModel.$render = function() {
        // element.html(ngModel.$viewValue || "");
        element.html($sce.getTrustedHtml(ngModel.$viewValue || ''));

      };

      element.bind("blur keyup change", function() {
        scope.$apply(read);
      });
    }
  };
}]);
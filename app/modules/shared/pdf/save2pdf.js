/**
 * angular-save2pdf - angular jsPDF wrapper
 * Copyright (c) 2015 John Daily Jr.,
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

(function() {
    'use strict';

    angular
        .module('save2pdf', [])
        .directive('save2pdf', function() {
            return {
              link: function($scope, element, Attrs, controller) {
                $scope.$on('saveToPdf', function(event, mass) {

                  if (!element[0]) {
                    return;
                  }
                  var pdf = new jsPDF('p', 'pt', 'letter');

                  //
                  // Make sure we modify the scale of the images.
                  //
                  pdf.internal.scaleFactor = 2.25;

                  pdf.addHTML(element[0], 0, 0, {
                    pagesplit: true
                  }, function() {
                    pdf.save('FieldStack-PracticeMetrics-' + new Date() + '.pdf');
                  });
                });
            }
          }
        });
    }
)();

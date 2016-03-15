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
                if (!element[0]) { return;}

                $scope.$on('saveToPdf', function(event, mass) {

                    var pdf = new jsPDF('p','px','letter');

                    //
                    // All units are in the set measurement for the document
                    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
                    pdf.addHTML(document.body, {
                      pagesplit: true,
                      height: document.body.offsetHeight,
                      width: document.body.offsetWidth
                    }, function(dispose) {
                        pdf.save('FieldStack-PracticeMetrics-' + new Date() + '.pdf');
                    });
             });
            }
          }
        });
    }
)();

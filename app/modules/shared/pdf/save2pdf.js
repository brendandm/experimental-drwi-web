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
            .value('ngHtmlPdfConfig', {
                pagesplit : true,
                height : null,
                pdfName : 'exportedPDF'
            })
        .directive('save2pdf', function() {
            return {
              link: function($scope, element, Attrs, controller) {
                if (!element[0]) { return;}

                var pagesplit = true,
                height = pagesplit || element[0].offsetHeight,
                pdfName = Attrs.pdfName;

                $scope.$on('saveToPdf', function(event, mass) {

                    var pdf = new jsPDF('p','px','letter');

                    // We'll make our own renderer to skip this editor
                    var specialElementHandlers = {
                        '#editor': function(element, renderer){
                            return true;
                        }
                    };

                    var interior_margins = {
                      top: 5,
                      bottom: 5,
                      left: 5,
                      width: 532
                    };

                    // All units are in the set measurement for the document
                    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
                    pdf.addHTML(element[0], interior_margins.left, interior_margins.top, {
                      'pagesplit': pagesplit,
                      'height': height,
                      'elementHandlers': specialElementHandlers
                    }, function(dispose) {
                        pdf.save(pdfName + '.pdf');
                    });
             });
            }
          }
        });
    }
)();

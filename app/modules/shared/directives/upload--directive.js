'use strict';

angular.module('FieldDoc')
    .directive('fileModel', function($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function() {

                    scope.$apply(function() {

                        modelSetter(scope, element[0].files[0]);

                        var fileObject = element[0].files[0];

                        // Only process image files.
                        if (fileObject && fileObject.type.match('image.*')) {

                            var reader = new FileReader();

//                            // Closure to capture the file information.
//                            reader.onload = (function(theFile) {
//                                return function(e) {
//                                    var target = document.getElementById('image--preview');
//                                    target.src = e.target.result;
//                                };
//                            })(fileObject);

                            // Read in the image file as a data URL.
                            reader.readAsDataURL(fileObject);

                        }

                    });
                });
            }
        };
    });
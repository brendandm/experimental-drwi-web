(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name Media Service
     * @description Enable consistent, system-wide handling of images
     */
    angular.module('FieldDoc')
        .service('Media', function(Image, $q) {
            return {
                images: new Array(), // empty image array for handling files
                preupload: function(filesList, fieldName) {
                    /**Process all media prior to uploading to server.

                    Create a usable array of deferred requests that will allow
                    us to keep tabs on uploads, so that we know when all
                    uploads have completed with an HTTP Response.

                    @param (array) filesList
                        A list of files to process

                    @return (array) savedQueries
                        A list of deferred upload requests
                    */

                    var self = this,
                        savedQueries = [],
                        field = (fieldName) ? fieldName : 'image';

                    angular.forEach(filesList, function(_file) {
                        savedQueries.push(self.upload(_file, field));
                    });

                    return savedQueries;
                },
                upload: function(file, field) {
                    /**Upload a single file to the server.

                    Create a single deferred request that enables us to keep
                    better track of all of the things that are happening so
                    that we are defining in what order things happen.

                    @param (file) file
                        A qualified Javascript `File` object

                    @return (object) defer.promise
                        A promise
                    */

                    var defer = $q.defer(),
                        fileData = new FormData();

                    fileData.append(field, file);

                    var request = Image.upload({}, fileData, function() {
                        defer.resolve(request);
                    });

                    return defer.promise;
                },
                remove: function(fileIndex) {
                    this.images.splice(fileIndex, 1);
                }
            };
        });

}());

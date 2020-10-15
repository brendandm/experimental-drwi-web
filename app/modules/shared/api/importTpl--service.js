(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .service('ImportTpl', function(environment, $resource, $window) {

            return $resource(environment.apiUrl.concat('/v1/:collection/import-tpl'), {
                collection: '@collection'
            }, {
                query: {
                    isArray: false
                },
                download: {
                    method: 'GET',
                    isArray: false,
                    url: environment.apiUrl.concat('/v1/:collection/import-tpl'),
                    transformResponse: function(data, headersGetter, status) {
                        console.log('data', data);
                        if ($window.navigator.msSaveOrOpenBlob) {
                            var blob = new Blob([decodeURIComponent(encodeURI(data))], {
                                type: 'text/csv;charset=utf-8;'
                            });
                            $window.navigator.msSaveBlob(blob, 'import-template.csv');
                        } else {
                            var a = document.createElement('a');
                            a.href = 'data:text/csv;charset=utf-8,' + escape(data);
                            a.target = '_blank';
                            a.download = 'import-template.csv';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                        }
                        return data;
                    }
                }
            });

        });

}());
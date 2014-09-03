'use strict';

angular.module('app')

.factory('Project', ['$resource', function($resource){

	var url = '//api.commonscloud.org/v2/type_061edec30db54fa0b96703b40af8d8ca.json';
  var singleURL = '//api.commonscloud.org/v2/type_061edec30db54fa0b96703b40af8d8ca/:id.json';

	return $resource(singleURL, {},
    {
      query: {
        method: 'GET',
        isArray: false,
        url: url
      },
      save: {
        method: 'POST',
        url: url
      },
      update: {
        method: 'PATCH',
        url: singleURL
      },
      delete: {
        method: 'DELETE',
        url: singleURL
      }
    });
}]);
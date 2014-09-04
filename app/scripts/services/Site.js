'use strict';

angular.module('app')

.factory('Site', ['$resource', function($resource){

	return $resource('//api.commonscloud.org/v2/type_061edec30db54fa0b96703b40af8d8ca/:id.json', {},
    {
      query: {
        method: 'GET',
        isArray: false
      }
    });
}]);
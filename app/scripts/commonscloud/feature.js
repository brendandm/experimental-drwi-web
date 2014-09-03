'use strict';

angular.module('commons.feature', [])

.factory('Feature', ['$resource', 'API_CONFIG', function($resource, API_CONFIG){

	var url = API_CONFIG.baseURL + API_CONFIG.featureURL;
  var singleURL = API_CONFIG.baseURL + API_CONFIG.singleFeatureURL;

	return $resource(url, {}, 
    {
      query: {
        method: 'GET',
        isArray: false,
        transformResponse: function (data, headersGetter) {
          return angular.fromJson(data);
        }
      },
      postFiles: {
        method: 'PUT',
        url: singleURL,
        transformRequest: angular.identity,
        headers: {
          'Content-Type': undefined
        }
      },
      get: {
        method: 'GET',
        url: singleURL
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
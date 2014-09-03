'use strict';

angular.module('commons.template', [])

.factory('Template', ['$resource', 'API_CONFIG', function($resource, API_CONFIG){

	var url = API_CONFIG.baseURL + API_CONFIG.templateURL;
  var singleURL = API_CONFIG.baseURL + API_CONFIG.singleTemplateURL;

	return $resource(singleURL, {}, 
    {
      get: {
        method: 'GET',
        url: singleURL
      },
      query: {
        method: 'GET',
        isArray: true,
        url: url,
        transformResponse: function (data, headersGetter) {
          var templates = angular.fromJson(data);

          return templates.response.templates;
        }
      },
      save: {
        method: 'POST',
        url: url
      },
      update: {
        method: 'PATCH'
      }
    });
}]);
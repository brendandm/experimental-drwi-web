'use strict';

angular.module('commons.field', [])

.factory('Field', ['$resource', 'API_CONFIG', function($resource, API_CONFIG){

	var url = API_CONFIG.baseURL + API_CONFIG.fieldsURL;
  var singleURL = API_CONFIG.baseURL + API_CONFIG.singleFieldURL;

  //fields & stats are set up a little differently than the other resources for reasons having to do with URL construction and the ability to save them to the database
	return $resource(singleURL, {}, 
    {
      query: {
        method: 'GET',
        isArray: true,
        url: url,
        transformResponse: function (data, headersGetter) {

          var fields = angular.fromJson(data);

          return fields.response.fields;
        }
      },
      save: {
        method: 'POST',
        url: url
      },
      update: {
        method: 'PATCH'
      },
      delete: {
        method: 'DELETE',
        url: singleURL
      }
    });
}]);
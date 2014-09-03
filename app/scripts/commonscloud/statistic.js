'use strict';

angular.module('commons.statistic', [])

.factory('Statistic', ['$resource', 'API_CONFIG', function($resource, API_CONFIG){

	var url = API_CONFIG.baseURL + API_CONFIG.statsURL;
  var singleURL = API_CONFIG.baseURL + API_CONFIG.singleStatURL;

  //fields & statistics are set up a little differently than the other resources for reasons having to do with URL construction and the ability to save them to the database
	return $resource(singleURL, {}, 
    {
      get: {
        method: 'GET',
        transformResponse: function (data, headersGetter) {

          var statistic = angular.fromJson(data);

          return statistic.response;
        }

      },
      query: {
        method: 'GET',
        isArray: true,
        url: url,
        transformResponse: function (data, headersGetter) {

          var statistics = angular.fromJson(data);

          return statistics.response.statistics;
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
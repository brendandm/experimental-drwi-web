'use strict';

angular.module('commons', [
	'ngRoute',
	'ngResource',
	'commons.config',
	'commons.application',
	'commons.feature',
	'commons.field',
	'commons.statistic',
	'commons.template']);

//basic API configuration constants that can be used throughout the application
angular.module('commons.config', [])
.constant('API_CONFIG', {
	baseURL: '//api.commonscloud.org/v2/',
	applicationURL: 'applications/:id.json',
	featureURL: ':storage.json',
	singleFeatureURL: ':storage/:featureId.json',
	fieldsURL: 'templates/:templateId/fields.json',
	singleFieldURL: 'templates/:templateId/fields/:fieldId.json',
	statsURL: 'templates/:templateId/statistics.json',
	singleStatURL: 'templates/:templateId/statistics/:statisticId.json',
	templateURL: 'applications/:id/templates.json',
	singleTemplateURL: 'templates/:templateId.json'
});

angular.module('commons.application', [])
.factory('Application', ['$log', '$resource', 'API_CONFIG', function($log, $resource, API_CONFIG){
//a factory returns a constructor function, which, when using resources, is taken care of for us by the built-in $resource service
//$resource takes as arguments a url, an object which can contain parameters (both variable parameters for dynamic url creation and normal parameters such as for queries) and, optionally, an object declaring custom methods. in this case, we've added a custom update method
//custom methods are generically defined as: action: {method:?, params:?, isArray:?, headers:?}; other keys that can be used are transformRequest, transformResponse, cache, timeout, withCredentials, responseType and interceptor
//resources have 4 default class-level methods: query(), get(), save(), and delete(). they all take (params, successcb, errorcb) as arguments with save also taking a (payloadData) argument
//resources also have the same methods at an instance-level (i.e. application.$save() as compared to Application.save({}, application))
  var config = {
    url: API_CONFIG.baseURL + API_CONFIG.applicationURL
  };

  var Application = $resource(config.url, {}, {
    update: {
      method: 'PATCH'
    }
  });

  Application.getApplication = function(applicationID){
    return Application.get({
      id: applicationID
    }, function(data){
      return data;
    }, function(error){
      $log.log('error', error);
    });
  };

	return Application;

}]);

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
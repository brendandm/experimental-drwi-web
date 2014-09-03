'use strict';

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
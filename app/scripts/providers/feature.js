'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.feature
 * @description
 * # feature
 * Provider in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Feature', function () {


    this.$get = ['$resource', '$rootScope', 'Template', function ($resource, $rootScope, Template) {

      var Feature = $resource('//api.commonscloud.org/v2/:storage.json', {

      }, {
        query: {
          method: 'GET',
          isArray: false,
          transformResponse: function (data, headersGetter) {
            return angular.fromJson(data);
          }
        },
        postFiles: {
          method: 'PUT',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json',
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        },
        get: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        },
        update: {
          method: 'PATCH',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        },
        delete: {
          method: 'DELETE',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        }
      });

      Feature.GetPaginatedFeatures = function(templateId, page) {
        
        var promise = Feature.GetTemplate(templateId, page).then(function(options) {
          return Feature.GetFeatures(options);
        });
        
        return promise;     
      };

      Feature.GetSingleFeatures = function(templateId, featureId) {
        
        var promise = Feature.GetTemplateSingleFeature(templateId, featureId).then(function(options) {
          return Feature.GetFeature(options);
        });
        
        return promise;     
      };

      Feature.GetTemplate = function(templateId, page) {
  
        var promise = Template.get({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return {
              storage: response.response.storage,
              page: page
            };
          });

        return promise;
      };

      Feature.GetTemplateSingleFeature = function(templateId, featureId) {
  
        var promise = Template.get({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return {
              storage: response.response.storage,
              featureId: featureId
            };
          });

        return promise;
      };

      Feature.GetFeatures = function(options) {

        var promise = Feature.query({
            storage: options.storage,
            page: (options.page === undefined || options.page === null) ? 1: options.page,
            q: {
              'order_by': [
                {
                  'field': 'id',
                  'direction': 'desc'
                }
              ]
            },
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      //
      // Search a specified Feature Collection
      //
      //    storage (string) The storage string for the Feature Collection you wish to search
      //    criteria (object) An object of filters, order by, and other statements
      //    page (integer) The page number
      //    
      //
      Feature.SearchFeatures = function(storage, criteria, page) {

        var promise = Feature.query({
            storage: storage,
            page: (page === undefined || page === null) ? 1: page,
            q: criteria,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Feature.GetFeature = function(options) {
        var promise = Feature.get({
            storage: options.storage,
            featureId: options.featureId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };

      Feature.CreateFeature = function(options) {

        console.log(options);

        var promise = Feature.save({
            storage: options.storage
          }, options.data).$promise.then(function(response) {
            return response.resource_id;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };


      Feature.UpdateFeature = function(options) {

        var promise = Feature.update({
            storage: options.storage,
            featureId: options.featureId
          }, options.data).$promise.then(function(response) {
            return response;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };

      return Feature;
    }];

  });

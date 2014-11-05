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
        relationship: {
          method: 'GET',
          isArray: false,
          url: '//api.commonscloud.org/v2/:storage/:featureId/:relationship.json',
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
        user: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        createUser: {
          method: 'POST',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        removeUser: {
          method: 'DELETE',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        users: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users.json'
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

        var defaults = options.location;
        var getFilters = Feature.buildFilters(options.fields, defaults);

        var filters = {
          page: (defaults.page) ? defaults.page : null,
          results_per_page: (defaults.results_per_page) ? defaults.results_per_page : null,
          callback: (defaults.callback) ? defaults.callback : null,
          selected: getFilters,
          available: getFilters
        };

        var promise = Feature.query({
            storage: options.storage,
            page: (options.page === undefined || options.page === null) ? 1: options.page,
            q: {
              filters: Feature.getFilters(filters),
              order_by: [
                {
                  field: 'created',
                  direction: 'desc'
                }
              ]
            },
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Feature.GetRelatedFeatures = function(options) {



        var promise = Feature.relationship({
            storage: options.storage,
            relationship: options.relationship,
            featureId: options.featureId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response.features;
          });

        return promise;
      };

      Feature.MachineReadable = function(name) {
        name = name.replace(' ', '-');
        return name.toLowerCase();
      };

      Feature.HumanReadable = function(name) {
        return Feature.CapitalizeEachWord(name.replace('-', ' '));
      };

      Feature.CapitalizeEachWord = function(str) {
        return str.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
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

            var feature_id = response.resource_id;

            //
            // Before we return the values we should also add the owner of the new Feature
            // to the Users list by given them project specific permissions
            //
            Feature.AddUser({
              storage: options.storage,
              featureId: feature_id,
              userId: options.data.owner,
              data: {
                read: true,
                write: true,
                is_admin: true
              }
            });

            return feature_id;
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

      Feature.DeleteFeature = function(options) {

        var promise = Feature.delete({
            storage: options.storage,
            featureId: options.featureId
          }).$promise.then(function(response) {
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

      //
      // User Specific Permissions or User Lists for a specific Feature
      //
      Feature.GetFeatureUsers = function(options) {

        var promise = Feature.users({
          storage: options.storage,
          featureId: options.featureId
        }).$promise.then(function(response) {
          return response.response.users;
        });

        return promise;

      };

      Feature.GetFeatureUser = function(options) {

        var promise = Feature.user({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }).$promise.then(function(response) {
          return response.response;
        });

        return promise;

      };

      Feature.AddUser = function(options) {

        var promise = Feature.createUser({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }, options.data).$promise.then(function(response) {
          return response;
        });

        return promise;

      };

      Feature.RemoveUser = function(options) {

        var promise = Feature.removeUser({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }).$promise.then(function(response) {
          return response;
        });

        return promise;

      };

      //
      // From an Angular $location.search() object we need to parse it
      // so that we can produce an appropriate URL for our API
      //
      // Our API can accept a limited number of keywords and values this
      // functions is meant to act as a middleman to process it before
      // sending it along to the API. This functionality will grant us the
      // ability to use 'saved searches' and direct URL input from the user
      // and retain appropriate search and pagination functionality
      //
      // Keywords:
      // 
      // results_per_page (integer) The number of results per page you wish to return, not to be used like limit/offset
      // page (integer) The page number of results to return
      // callback (string) Wrap response in a Javascript function with the name of the string
      // q (object) An object containing the following attributes and values
      //   filters (array) An array of filters (i.e., {"name": <fieldname>, "op": <operatorname>, "val": <argument>})
      //   disjunction (boolean) Processed as AND or OR statement, default is False or AND
      //   limit (integer) Number of Features to limit a single call to return
      //   offset (integer) Number of Features to offset the current call
      //   order_by (array) An array of order by clauses (i.e., {"field": <fieldname>, "direction": <directionname>})
      //
      //
      // Feature.getSearchParameters = function(search_parameters) {
      //   console.log('search_parameters', search_parameters);

      //   //
      //   // We need to convert the JSON from a string to a JSON object that our application can use
      //   //
      //   var q_ = angular.fromJson(search_parameters.q);

      //   return {
      //     results_per_page: search_parameters.results_per_page,
      //     page: search_parameters.page,
      //     callback: search_parameters.callback,
      //     q: q_
      //   };
      // };


      //
      // Prepare Filters for submission via an HTTP request
      //
      Feature.getFilters = function(filters) {

        var filters_ = [];

        angular.forEach(filters.available, function(filter, $index) {

          //
          // Each Filter can have multiple criteria such as single ilike, or
          // a combination of gte and lte. We need to create an individual filter
          // for each of the criteria, even if it's for the same field.
          //
          angular.forEach(filter.filter, function(criteria, $index) {
            if (criteria.value !== null) {
              filters_.push({
                name: filter.field,
                op: criteria.op,
                val: (criteria.op === 'ilike') ? '%' + criteria.value + '%' : criteria.value
              });
            }
          });          
        
        });

        return filters_;
      };


      //
      // Build a list of Filters based on a Template Field list passed in through the fields parameter
      //
      // fields (array) An array of fields specific to a template, these need to be in the default
      //                CommonsCloudAPI's Field list format [1]
      //
      // @see [1] https://api.commonscloud.org/v2/templates/:templateId/fields.json for an example
      //
      Feature.buildFilters = function(fields, defaults) {

        //
        // Default, empty Filters list
        //
        var filters = [],
            types = {
              text: ['text', 'textarea', 'list', 'email', 'phone', 'url'],
              number: ['float', 'whole_number'],
              date: ['date', 'time']
            },
            q_ = angular.fromJson(defaults.q);

        angular.forEach(fields, function(field, $index) {
          if (Feature.inList(field.data_type, types.text)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'text',
              active: (Feature.getDefault(field, 'ilike', q_)) ? true: false,
              filter: [
                {
                  op: 'ilike',
                  value: Feature.getDefault(field, 'ilike', q_)
                }
              ]
            });
          }
          else if (Feature.inList(field.data_type, types.number)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'number',
              active: false,
              filter: [
                {
                  op: 'gte',
                  value: Feature.getDefault(field, 'gte', q_)
                },
                {
                  op: 'lte',
                  value: Feature.getDefault(field, 'lte', q_)
                }
              ]
            });
          }
          else if (Feature.inList(field.data_type, types.date)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'date',
              active: false,
              filter: [
                {
                  op: 'gte',
                  value: Feature.getDefault(field, 'gte', q_)
                },
                {
                  op: 'lte',
                  value: Feature.getDefault(field, 'lte', q_)
                }
              ]
            });
          }
        });

        return filters;
      };

      //
      // Check if a property is in an object and then select a default value
      //
      Feature.getDefault = function(field, op, defaults) {

        var value = null;

        if (defaults && defaults.filters !== undefined) {
          angular.forEach(defaults.filters, function(default_value, $index) {
            if (field.name === default_value.name && op === default_value.op) {
              if (default_value.op === 'ilike') {
                // Remove the % from the string
                value = default_value.val.replace(/%/g, '');
              } else {
                value = default_value.val;
              }
              // console.log('default found for', default_value.name, default_value.op, default_value.val);
            }
          });
        }

        return value;
      };

      //
      // Check if a value is in a list of values
      //
      Feature.inList = function(search_value, list) {
        
        var $index;

        for ($index = 0; $index < list.length; $index++) {
          if (list[$index] === search_value) {
            return true;
          }
        }

        return false;
      };

      return Feature;
    }];

  });

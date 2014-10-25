'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.search
 * @description
 * # search
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Search', function search() {
    
    var Search_ = {};

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
    Search_.getSearchParameters = function(search_parameters) {
      console.log('search_parameters', search_parameters);

      //
      // We need to convert the JSON from a string to a JSON object that our application can use
      //
      var q_ = angular.fromJson(search_parameters.q);

      return {
        results_per_page: search_parameters.results_per_page,
        page: search_parameters.page,
        callback: search_parameters.callback,
        q: q_
      };
    };

    //
    //
    //
    Search_.buildFilters = function() {

    };

    //
    // Prepare Filters for submission via an HTTP request
    //
    Search_.getFilters = function(filters) {

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
    Search_.buildFilters = function(fields, defaults) {

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
        if (Search_.inList(field.data_type, types.text)) {
          filters.push({
            label: field.label,
            field: field.name,
            type: 'text',
            active: false,
            filter: [
              {
                op: 'ilike',
                value: Search_.getDefault(field, 'ilike', q_)
              }
            ]
          });
        }
        else if (Search_.inList(field.data_type, types.number)) {
          filters.push({
            label: field.label,
            field: field.name,
            type: 'number',
            active: false,
            filter: [
              {
                op: 'gte',
                value: Search_.getDefault(field, 'gte', q_)
              },
              {
                op: 'lte',
                value: Search_.getDefault(field, 'lte', q_)
              }
            ]
          });
        }
        else if (Search_.inList(field.data_type, types.date)) {
          filters.push({
            label: field.label,
            field: field.name,
            type: 'date',
            active: false,
            filter: [
              {
                op: 'gte',
                value: Search_.getDefault(field, 'gte', q_)
              },
              {
                op: 'lte',
                value: Search_.getDefault(field, 'lte', q_)
              }
            ]
          });
        }
      });

      console.log('filters', filters);
      return filters;
    };

    //
    // Check if a property is in an object and then select a default value
    //
    Search_.getDefault = function(field, op, defaults) {

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
    Search_.inList = function(search_value, list) {
      
      var $index;

      for ($index = 0; $index < list.length; $index++) {
        if (list[$index] === search_value) {
          return true;
        }
      }

      return false;
    };

    return Search_;
  });

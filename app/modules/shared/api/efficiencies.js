'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Efficiency', function () {
    this.$get = ['$resource', function ($resource) {
      return $resource('//api.commonscloud.org/v2/type_056e01e3bbf44359866b4861cde24808.json', {}, {
        query: {
          method: 'GET',
          isArray: false,
        }
      });
    }];
  });

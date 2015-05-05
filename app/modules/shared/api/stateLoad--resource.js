'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.ImperviousSurfaceResource
 * @description
 * # ImperviousSurfaceResource
 * Service in the managerApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('StateLoad', ['$resource', 'commonscloud', function ($resource, commonscloud) {
    return $resource(commonscloud.baseurl + commonscloud.collections.stateloaddata.storage + '/:id.json', {
      id: '@id'
    }, {
      query: {
        isArray: false
      },
    });
  }]);

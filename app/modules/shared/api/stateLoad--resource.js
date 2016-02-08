'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.ImperviousSurfaceResource
 * @description
 * # ImperviousSurfaceResource
 * Service in the managerApp.
 */
angular.module('FieldStack')
  .service('StateLoad', function ($resource, commonscloud) {

    var __url = commonscloud.baseurl + commonscloud.collections.stateloaddata.storage;

    return $resource(__url + '/:id.json', {
      id: '@id'
    }, {
      query: {
        method: 'GET',
        isArray: false
      },
    });
  });

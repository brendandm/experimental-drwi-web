'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.ImperviousSurfaceResource
 * @description
 * # ImperviousSurfaceResource
 * Service in the managerApp.
 */
angular.module('FieldStack')
  .service('Load', ['$resource', 'commonscloud', function ($resource, commonscloud) {
    return $resource(commonscloud.baseurl + commonscloud.collections.loaddata.storage + '/:id.geojson', {
      id: '@id'
    }, {
      query: {
        isArray: false
      },
    });
  }]);

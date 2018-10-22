'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeViewController', function($location, practice, $route, Utility) {

        var self = this,
            projectId = $route.current.params.projectId,
            siteId = $route.current.params.siteId,
            practiceId = $route.current.params.practiceId,
            practiceType;

        practice.$promise.then(function(successResponse) {

            self.practice = successResponse;

            practiceType = Utility.machineName(self.practice.properties.practice_type);

            $location.path('/practices/' + practiceId + '/' + practiceType);

        });

    });
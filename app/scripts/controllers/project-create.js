'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectcreateCtrl
 * @description
 *    The purpose of this Controller is to create a new Project stub with the resolve front matter
 *    at the routing level and then forward the user along to this new Project once it has been
 *    successfully created
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectCreateCtrl', ['$scope', '$route', '$location', 'project', function ($scope, $route, $location, project) {

    //
    // Forward the user along to the new project
    //
    $location.path('/projects/' + project);

  }]);

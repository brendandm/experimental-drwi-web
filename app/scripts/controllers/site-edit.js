'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteEditCtrl
 * @description
 * # SiteEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteEditCtrl', ['$rootScope', '$scope', '$route', 'user', 'users', 'template', 'fields', 'site', 'variables', function ($rootScope, $scope, $route, user, users, template, fields, site, variables) {
  
    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: 'views/site-edit.html',
      // title: $scope.project.project_title,
      // display_title: false,
      // back: '/',
      // links: [
      //   {
      //     text: 'Projects',
      //     url: '/projects'
      //   },
      //   {
      //     text: $scope.project.project_title,
      //     url: '/projects/' + $scope.project.id,
      //     type: 'active'
      //   }
      // ],
      // actions: [
      //   {
      //     type: 'button-link new',
      //     action: function() {
      //       $scope.project.sites.create();
      //     },
      //     text: 'Create site'
      //   }
      // ],
      refresh: function() {
        $route.reload();
      }
    };

  }]);

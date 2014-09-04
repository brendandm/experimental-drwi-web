(function () {
  'use strict';
  angular.module('app')

  .controller('ProjectCreateCtrl', function($scope, $http, $routeParams, $log, Project, Field){
    var app = 147;
    var temp = 121;
    $scope.templateUrl = '/partials/project-create.html';
    $scope.image = 'assets/wetlands.jpg';
    $scope.goBack = true;
    $scope.page = {
      name: "BMP Monitoring and Assessment Collection"
    };

    var id = $routeParams.projectId;
    $log.log('id', id);

    $scope.back = function(){
      window.history.back();
    };

    $scope.edit = function(){
      $scope.showFields = true;
    };

    $scope.filterh5 = function(weight){
      var ok = [3, 4, 5, 6, 7, 8, 9, 10];

      return ok.indexOf(weight) > -1;
    };

    Project.get({id:id}, function(data){
      $scope.project = data.response;
      $log.log('project', data.response);
    });

    Field.query({templateId:temp}, function(data){
      $scope.fields = data;
      $log.log('fields', data);
    });

  });
}());
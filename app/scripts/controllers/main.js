(function () {
  'use strict';

  angular.module('app')

    .controller('MainCtrl', function($scope, $http, $location, $log, Project){
      $scope.templateUrl = '/partials/front.html';
      $scope.gravatar = 'http://www.gravatar.com/avatar/11800567938b3ec912c283bbc9c23938?s=80';

      $scope.page = {
        name: "Monitoring and Assessment"
      };

  	var getListData = function(){
  		Project.query({}, function(data){
  			$scope.projects = data.response.features;
  			$log.log('projects', data.response.features);
  		});
  	};

    $scope.getProject = function(project_id){
      $location.url('/projects/' + project_id);
    };

    getListData();
  });
}());
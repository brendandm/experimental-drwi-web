'use strict';

angular.module('app')

.controller('MainCtrl', function($scope, $http, $location, $log){
	$scope.templateUrl = '/partials/front.html';
	$scope.gravatar = 'http://www.gravatar.com/avatar/11800567938b3ec912c283bbc9c23938?s=80';

	$scope.getProject = function(){
		$location.url('/project');
	};

	var getListData = function(){
		$http.get('/data/project.json')
			.success(function(data){
				$scope.projects = data.response.features;
			})
			.error(function(e){
				$log.log('error: ', e);
			});
	};

	getListData();
});
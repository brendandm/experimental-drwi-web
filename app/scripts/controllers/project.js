'use strict';

angular.module('app')

.controller('ProjectCtrl', function($scope, $http, $log){
	$scope.templateUrl = '/partials/project.html';
	$scope.image = 'assets/wetlands.jpg';
	$scope.goBack = true;

	$scope.back = function(){
		window.history.back();
	};

	var getListData = function(){
		$http.get('/data/project.json')
			.success(function(data){
				$scope.project = data.response.features[0];
			})
			.error(function(e){
				$log.log('error: ', e);
			});
	};

	getListData();
});
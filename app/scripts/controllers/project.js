(function () {
	'use strict';
	angular.module('app')

	.controller('ProjectCtrl', function($scope, $http, $log, Project, Field){
		var app = 147;
		var temp = 121;
		$scope.templateUrl = '/partials/project.html';
		$scope.image = 'assets/wetlands.jpg';
		$scope.goBack = true;
		$scope.page = {
 			name: "BMP Monitoring and Assessment Collection"
		};

		$scope.back = function(){
			window.history.back();
		};

		$scope.edit = function(){
			$scope.showKeys = true;
		};

		Project.get({id:1}, function(data){
			$scope.project = data.response;
			$log.log('project', data.response);
		});

		Field.query({templateId:temp}, function(data){
			$scope.fields = data;
			$log.log('fields', data);
		});
	});
}());
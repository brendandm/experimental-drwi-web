(function () {

	'use strict';
	angular.module('app')

	.controller('ProjectCtrl', function($scope, $http, $log, Project, Template, Field){
		var app = 147;
		var temp = 121;
		$scope.templateUrl = '/partials/project.html';
		$scope.image = 'assets/wetlands.jpg';
		$scope.goBack = true;

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

		// Template.query({id:app}, function(data){
		// 	$log.log('templates', data);
		// });

		Field.query({templateId:temp}, function(data){
			$scope.fields = data;
			$log.log('fields', data);
		});

		// var getListData = function(){
		// 	$http.get('/data/project.json')
		// 		.success(function(data){
		// 			$scope.project = data.response.features[0];
		// 		})
		// 		.error(function(e){
		// 			$log.log('error: ', e);
		// 		});
		// };

		// getListData();
	});
}());
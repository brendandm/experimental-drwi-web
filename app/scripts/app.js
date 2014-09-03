(function () {
	
	'use strict';

	angular.module('app', [
		'ngResource',
		'ngRoute',
		'ngAnimate',
		'ngMaterial'
	])

	.config(function($routeProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/partials/main.html',
				controller: 'MainCtrl'
			})
			.when('/project', {
				templateUrl: '/partials/main.html',
				controller: 'ProjectCtrl'
			})
			.otherwise({
				redirectTo: '/'
			});
	});
	
}());
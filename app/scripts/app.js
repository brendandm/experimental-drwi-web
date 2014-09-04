(function () {

	'use strict';

	angular.module('app', [
		'ngResource',
		'ngRoute',
		'ngAnimate',
		'ngMaterial',
		'commons',
		'leaflet-directive'
	])

	.config(function($routeProvider, $locationProvider) {
		$routeProvider
			.when('/', {
				templateUrl: '/partials/main.html',
				controller: 'LoginCtrl'
			})
			.when('/projects', {
				templateUrl: '/partials/main.html',
				controller: 'MainCtrl'
			})
			.when('/projects/:projectId', {
				templateUrl: '/partials/main.html',
				controller: 'ProjectCtrl'
			})
			.when('/projects/:projectId/sites', {
				redirectTo: '/projects/:projectId'
			})
			.when('/projects/:projectId/sites/:siteId', {
				templateUrl: '/partials/main.html',
				controller: 'SiteCtrl'
			})
			.when('/projects/:projectId/sites/:siteId/practices', {
				redirectTo: '/projects/:projectId/sites/:siteId'
			})
			.when('/projects/:projectId/sites/:siteId/practices/:practiceId', {
				templateUrl: '/partials/main.html',
				controller: 'PracticeCtrl'
			})
			.when('/projects/:projectId/sites/:siteId/practices/:practiceId/metrics', {
				redirectTo: '/projects/:projectId/sites/:siteId/practices/:practiceId'
			})
			.when('/projects/:projectId/sites/:siteId/practices/:practiceId/metrics/:metricId', {
				templateUrl: '/partials/main.html',
				controller: 'MetricCtrl'
			});

	    // $locationProvider.html5Mode(true).hashPrefix('!');

	});

}());
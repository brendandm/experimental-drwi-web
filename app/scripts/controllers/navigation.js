(function () {
	
	'use strict';
	
	angular.module('app')

	.controller('NavigationCtrl', function($scope, $log, $materialSidenav){

		$scope.toggleMenu = function() {
    		$materialSidenav('left').toggle();
		};

	});
}());
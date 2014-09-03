(function () {

	'use strict';

	angular.module('app')

	.filter('key', function(){
		return function(input){
			var formatted = function(string){
				var str = string.replace(/_/g, ' ');

				return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
			};

			return formatted(input);
		};
	});

}());
(function () {
	
	'use strict';

	angular.module('app')

	.filter('key', function(){
		return function(input){
			var capitalizeFirstLetter = function(string){
				var str = string.replace(/_/g, ' ');
				return str.charAt(0).toUpperCase() + str.slice(1);
			};

			var output = capitalizeFirstLetter(input);

			return output;
		};
	});
	
}());
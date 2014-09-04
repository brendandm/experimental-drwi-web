(function () {
	'use strict';
	angular.module('app')

	.controller('ProjectCtrl', function($scope, $http, $routeParams, $location, $log, Project, Field){
		var temp = 121;
		var id = $routeParams.projectId;

		$scope.templateUrl = '/partials/project.html';
		$scope.goBack = true;
		$scope.showEdit = false;
		$scope.page = {
 			name: "BMP Monitoring and Assessment Collection"
		};
		$scope.project = {
			title: 'Expanding Brook Trout Habitat in the Shenandoah Valley, VA',
			organization: 'Trout Unlimited, Inc.',
			start: '2013-10-01',
			end: '2015-09-30',
			id: 40267,
			grantType: 'Small Watershed Grant',
			funders: 'Massanutten TU Embrace A Stream grant, Virginia Department of Game and Inland Fisheries, Landowner Cost Share, Landowner Donations of Rootwads and Logs, Trout Unlimited Grassroots Volunteers, WCS Climate Change Adaptation Grant',
			award: 'Pending',
			match: 128426,
			abstract: 'This project will increase the number of and size of Eastern brook trout patches in the Shenandoah Valley, focusing on extirpated and less-than-intact spring fed streams. TU will provide enhanced technical assistance to landowners on cold-water spring creeks in an effort to drive down the cost of repairing degraded streams. TU\'s stream restoration expertise and offer of restoring native brook trout are incentives for landowner participation and help leverage state and federal cost share. TU will restore base level stream functions such as flood plain connectivity, stream bank stability and habitat diversity, resulting in 8 new acres of riparian buffer, 7,500 feet of stream banks stabilized and a 95-ton annual reduction in sedimentation from stream bank erosion. TU will partner with the Virginia Department of Game and Inland Fisheries and local TU grassroots volunteers to monitor restoration projects and reintroduce native brook trout to restored streams. TU will also partner with the Natural Resources Conservation Service and Soil and Water Conservation Districts to assist landowners participating in cost share programs.',
			location: 'Shenandoah Valley counties of Augusta, Rockingham, Clarke, Shenandoah, Frederick and Page. Watersheds include Smith Creek, Mossy Creek, Spout Run, Passage Creek, Beaver Creek and Meadowbrook.'
		};

		$scope.back = function(){
			window.history.back();
		};

		$scope.edit = function(){
			$scope.showEdit = true;
		};

		$scope.save = function(){
			$scope.showEdit = false;
		};

		$scope.getSite = function(siteId) {
			$location.url('/projects/' + $routeParams.projectId + '/sites/' + siteId);
		};

		// $scope.filterh5 = function(weight){
		// 	var ok = [3, 4, 5, 6, 7, 8, 9, 10];

		// 	return ok.indexOf(weight) > -1;
		// };

		// Project.get({id:id}, function(data){
		// 	$scope.project = data.response;
		// 	$log.log('project', data.response);
		// });

		// Field.query({templateId:temp}, function(data){
		// 	$scope.fields = data;
		// 	$log.log('fields', data);
		// });
	});
}());
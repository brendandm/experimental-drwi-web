(function () {

  'use strict';

  angular.module('app')

  .controller('SiteCtrl', function($scope, $routeParams, $http, $location, $log){
    var default_icon = {
      iconUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-l+B1C11D.png',
      iconRetinaUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-l+B1C11D@2x.png',
      iconSize: [38, 90],
      iconAnchor: [18, 44],
      popupAnchor: [-3, -76]
    };
    $scope.templateUrl = '/partials/site.html';
    $scope.goBack = true;
    $scope.showEdit = false;

    $scope.page = {
      name: "Sites"
    };

    $scope.map = {
      center: {
        lat: 38.649135,
        lng: -78.709399,
        zoom: 18,
      },
      defaults: {
        tileLayer: 'https://{s}.tiles.mapbox.com/v3/developedsimple.hl46o07c/{z}/{x}/{y}.png',
        tileLayerOptions: {
          detectRetina: true,
          reuseTiles: true,
        },
        scrollWheelZoom: false,
        zoomControl: false
      },
      markers: {
        marker_1: {
          lat: 38.649135,
          lng: -78.709399,
          message: "",
          icon: default_icon
        }
      }
    };

    $scope.site = {
      project: 'Expanding Brook Trout Habitat in the Shenandoah Valley, VA',
      number: "Habitat Restoration",
      description: 'Two barriers on headwater streams in Passage Creek and Mountain Run will be removed, opening up 5 miles of habitat.',
      city: 'Harrisonburg',
      county: 'Rockingham',
      district: 'VA-6'
    };

    $scope.getBMP = function(practice_id) {
      $location.url('/projects/' + $routeParams.projectId + '/sites/' + $routeParams.siteId + '/practices/' + practice_id);
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

  });
}());
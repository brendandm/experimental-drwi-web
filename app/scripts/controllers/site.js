(function () {
  
  'use strict';
  
  angular.module('app')

  .controller('SiteCtrl', function($scope, $routeParams, $http, $location, $log){

    $scope.templateUrl = '/partials/site.html';
    $scope.goBack = true;

    $scope.page = {
      name: "Sites"
    };

    $scope.map = {};

    $scope.map.center = {
      lat: 38.93779385450555,
      lng: -78.21406781673431,
      zoom: 18,
    }

    $scope.map.defaults = {
      tileLayer: 'https://{s}.tiles.mapbox.com/v3/developedsimple.hl46o07c/{z}/{x}/{y}.png',
      tileLayerOptions: {
        detectRetina: true,
        reuseTiles: true,
      },
      scrollWheelZoom: false,
      zoomControl: false
    };

    var default_icon = {
      iconUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-l+B1C11D.png',
      iconRetinaUrl: 'https://api.tiles.mapbox.com/v3/marker/pin-l+B1C11D@2x.png',
      iconSize: [38, 90],
      iconAnchor: [18, 44],
      popupAnchor: [-3, -76]
    }

    $scope.map.markers = {
      marker_1: {
        lat: 38.93779385450555,
        lng: -78.21406781673431,
        message: "",
        icon: default_icon
      }
    }

    $scope.getBMP = function(practice_id) {
      $location.url('/projects/' + $routeParams.projectId + '/sites/' + $routeParams.siteId + '/practices/' + practice_id);
    };

    $scope.back = function(){
      window.history.back();
    };

    $scope.edit = function(){
      $scope.showFields = true;
    };

  });
}());
'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular.module('FieldDoc')
    .config(function($routeProvider, $locationProvider) {

        $routeProvider
            .otherwise({
                templateUrl: '/modules/shared/errors/error404--view.html'
            });

        $locationProvider.html5Mode(true);
        $locationProvider.hashPrefix('!');

    })
    .run(['$rootScope', '$window', '$location', '$anchorScroll', function($rootScope, $window, $location, $anchorScroll) {

        $rootScope.$on('$routeChangeSuccess', function() {

            $anchorScroll();

        });

    }]);
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
    .run([
        '$rootScope',
        '$window',
        '$location',
        '$anchorScroll',
        '$document',
        function($rootScope, $window, $location, $anchorScroll, $document) {

            $rootScope.$on('$routeChangeSuccess', function() {

                $anchorScroll();

                $rootScope.collapseSidebar = false;

            });

            $document.on('click', function(event) {

                console.log(
                    'globalClick:event:',
                    event
                );

                $rootScope.$broadcast('globalClick', event.target);

            });

        }]);
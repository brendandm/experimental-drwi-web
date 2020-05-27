(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, environment) {

            $routeProvider
                .when('/organizationEdit', {
                    templateUrl: '/modules/components/organization/views/organizationEdit--view.html?t=' + environment.version,
                    controller: 'OrganizationEditViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                }),
            $routeProvider
                .when('/organization', {
                    templateUrl: '/modules/components/organization/views/organizationProfile--view.html?t=' + environment.version,
                    controller: 'OrganizationProfileViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                }),
             $routeProvider
                .when('/organization/:id', {
                    templateUrl: '/modules/components/organization/views/organizationProfile--view.html?t=' + environment.version,
                    controller: 'OrganizationProfileViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                });

        });

}());
(function() {

    'use strict';

    /**
     * @ngdoc
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .config(function($routeProvider, commonscloud) {

            $routeProvider
                .when('/organization', {
                    templateUrl: '/modules/components/organization/views/organizationEdit--view.html',
                    controller: 'OrganizationEditViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                });

        });

}());
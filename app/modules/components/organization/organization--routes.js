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
                .when('/organizations', {
                    templateUrl: '/modules/components/organization/views/organizationList--view.html',
                    controller: 'OrganizationListViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        },
                        snapshots: function(Snapshot) {
                            return Snapshot.query();
                        }
                    }
                })
                .when('/organizations/:organizationId', {
                    templateUrl: '/modules/components/organization/views/organizationEdit--view.html',
                    controller: 'OrganizationEditViewController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        },
                        snapshots: function(Snapshot) {
                            return Snapshot.query();
                        }
                    }
                });

        });

}());
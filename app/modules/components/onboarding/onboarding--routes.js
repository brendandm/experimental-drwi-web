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
                .when('/onboarding/organization', {
                    templateUrl: '/modules/components/onboarding/views/onboardingOrganization--view.html?t=' + environment.version,
                    controller: 'OnboardingOrganizationController',
                    controllerAs: 'page',
                    resolve: {
                        user: function(Account) {
                            return Account.getUser();
                        }
                    }
                });

        });

}());
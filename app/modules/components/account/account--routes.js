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
        .when('/account', {
          redirectTo: '/projects'
        })
       .when('/account/:userId', {
          redirectTo: '/account/:userId/edit'
        })
        .when('/account/:userId/edit', {
          templateUrl: '/modules/components/account/views/accountEdit--view.html',
          controller: 'AccountEditViewController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            }
          }
        });

    });

}());

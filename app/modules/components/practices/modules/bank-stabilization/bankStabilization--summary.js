'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('BankStabilizationSummaryController', function (Account, $log, $rootScope, summary, user) {

    var self = this;

    self.summary = summary;

    //
    // Verify Account information for proper UI element display
    //
    if (Account.userObject && user) {
        user.$promise.then(function(userResponse) {
            $rootScope.user = Account.userObject = userResponse;

            self.permissions = {
                isLoggedIn: Account.hasToken(),
                role: $rootScope.user.properties.roles[0].properties.name,
                account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                can_edit: true
            };
        });
    }


  });

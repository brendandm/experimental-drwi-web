'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('BankStabilizationSummaryController', function (Account, $log, $rootScope, summary, user) {

    var self = this;

    $rootScope.page = {};

    summary.$promise.then(
      function(successResponse) {
        $log.log('[SUCCESS] BankStabilizationSummaryController Summary', successResponse);
        self.summary = summary;
      },
      function(errorResponse) {
        $log.log('[ERROR] BankStabilizationSummaryController Summary', errorResponse);
      }
    );

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

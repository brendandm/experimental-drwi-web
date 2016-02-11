(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name 
   * @description
   */
  angular.module('FieldStack')
    .service('Account', function (ipCookie, User) {

      var Account = {
        userObject: {}
      };

      Account.getUser = function() {

        var userId = ipCookie('FIELDSTACKIO_CURRENTUSER');

        if (!userId) {
          return false;
        }

        var $promise = User.get({
          id: userId
        });

        return $promise;
      };

      Account.setUserId = function() {
        var $promise = User.me(function(accountResponse) {

          ipCookie('FIELDSTACKIO_CURRENTUSER', accountResponse.id, {
            path: '/',
            expires: 2
          });

          return accountResponse.id;
        });

        return $promise;
      };

      Account.hasToken = function() {
        if (ipCookie('FIELDSTACKIO_CURRENTUSER') && ipCookie('FIELDSTACKIO_SESSION')) {
          return true;
        }

        return false;
      };

      Account.hasRole = function(roleNeeded) {

        var roles = this.userObject.properties.roles;

        if (!roles) {
          return false;
        }

        for (var index = 0; index < roles.length; index++) {
          if (roleNeeded === roles[index].properties.name) {
            return true;
          }
        }

        return false;
      };

      Account.inGroup = function(userId, group) {

            var return_ = false;

            angular.forEach(group, function(member) {
                console.log(member.id, userId);

                if (member.id === userId) {
                    return_ = true;
                }
            });

            return return_;
      };

      Account.canEdit = function(resource) {
        if (Account.userObject && !Account.userObject.id) {
            console.log('Account.userObject', Account.userObject);
            return false;
        }
        
        if (Account.hasRole('admin')) {
            console.log('admin');
            return true;
        } else if (Account.hasRole('manager') && Account.inGroup(resource.properties.account_id, Account.userObject.properties.account)) {
            console.log('manager');
            return true;
        } else if (Account.hasRole('grantee') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
            console.log('grantee');
            return true;
        }

        return false;
      };

      return Account;
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
    angular.module('FieldDoc')
        .controller('SecurityResetPasswordController',
            function($location, Security, $timeout, $rootScope) {

                var self = this;

                function closeAlerts() {

                    $rootScope.alerts = null;

                }

                self.showError = function(msg) {

                    console.log('showError', Date.now());

                    self.reset.processing = false;
                    self.reset.success = false;

                    $rootScope.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': msg,
                        'prompt': 'OK'
                    }];

                    console.log('$rootScope.alerts', $rootScope.alerts);

                    $timeout(closeAlerts, 2000);

                };

                self.reset = {
                    success: false,
                    processing: false,
                    visible: true,
                    submit: function() {

                        self.reset.processing = true;

                        var credentials = new Security({
                            email: self.reset.email
                        });

                        credentials.$reset().then(function(response) {

                            //
                            // Check to see if there are any errors by checking for the existence
                            // of response.response.errors
                            //
                            if (response.response && response.response.errors) {

                                self.reset.errors = response.response.errors;
                                
                                self.showError(self.reset.errors.email[0]);

                            } else {

                                self.reset.processing = false;
                                self.reset.success = true;

                            }

                        }).catch(function(errorResponse) {

                            console.log('self.reset.errorResponse', errorResponse);

                            self.showError();

                        });
                    }
                };

            });

}());
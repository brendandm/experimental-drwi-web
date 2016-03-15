'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular
  .module('FieldDoc', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ipCookie',
    'leaflet-directive',
    'angularFileUpload',
    'geolocation',
    'monospaced.elastic',
    'angularMoment',
    'config',
    'Mapbox',
    'save2pdf',
    'collaborator'
  ]);

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

  });

"use strict";

 angular.module('config', [])

.constant('environment', {
            name: 'production',
            apiUrl: 'https://api.fielddoc.org',
            siteUrl: 'https://www.fielddoc.org',
            clientId: 'lynCelX7eoAV1i7pcltLRcNXHvUDOML405kXYeJ1'
          })

;
/**
 * angular-save2pdf - angular jsPDF wrapper
 * Copyright (c) 2015 John Daily Jr.,
 *
 * Licensed under the MIT License.
 * http://opensource.org/licenses/mit-license
 */

(function() {
    'use strict';

    angular
        .module('save2pdf', [])
        .directive('save2pdf', function() {
            return {
              link: function($scope, element, Attrs, controller) {
                if (!element[0]) { return;}

                $scope.$on('saveToPdf', function(event, mass) {

                    var pdf = new jsPDF('p','px','letter');

                    //
                    // All units are in the set measurement for the document
                    // This can be changed to "pt" (points), "mm" (Default), "cm", "in"
                    pdf.addHTML(document.body, {}, function(dispose) {
                        pdf.save('FieldStack-PracticeMetrics-' + new Date() + '.pdf');
                    });
             });
            }
          }
        });
    }
)();

(function() {

    'use strict';

    /**
     * @ngdoc overview
     * @name FieldDoc
     * @description
     * # FieldDoc
     *
     * Main module of the application.
     */
    angular.module('FieldDoc')
      .config(function ($routeProvider) {
        $routeProvider
          .when('/', {
            redirectTo: '/account/login'
          })
          .when('/user', {
            redirectTo: '/account/login'
          })
          .when('/user/login', {
            redirectTo: '/account/login'
          })
          .when('/account/login', {
            templateUrl: '/modules/shared/security/views/securityLogin--view.html',
            controller: 'SecurityController',
            controllerAs: 'page'
          })
          .when('/account/register', {
            templateUrl: '/modules/shared/security/views/securityRegister--view.html',
            controller: 'SecurityRegisterController',
            controllerAs: 'page'
          })
          .when('/account/reset', {
            templateUrl: '/modules/shared/security/views/securityResetPassword--view.html',
            controller: 'SecurityResetPasswordController',
            controllerAs: 'page'
          })
          .when('/logout', {
            redirectTo: '/user/logout'
          })
          .when('/user/logout', {
            template: 'Logging out ...',
            controller: 'SecurityLogoutController',
            controllerAs: 'page'
          });
      });

}());

(function() {

    'use strict';

    /**
     * @ngdoc controller
     * @name
     * @description
     */
     angular.module('FieldDoc')
        .controller('SecurityController', function(Account, $location, Security, ipCookie, Notifications, $route, $rootScope, $timeout) {

            var self = this;

            self.cookieOptions = {
                'path': '/',
                'expires': 7
            };

            //
            // Before showing the user the login page,
            //
            if (ipCookie('FIELDSTACKIO_SESSION')) {
                $location.path('/projects');
            }

            self.login = {
              processing: false,
              submit: function(firstTime) {

                self.login.processing = true;

                var credentials = new Security({
                  email: self.login.email,
                  password: self.login.password,
                });

                credentials.$save(function(response) {

                  //
                  // Check to see if there are any errors by checking for the existence
                  // of response.response.errors
                  //
                  if (response.response && response.response.errors) {
                    self.login.errors = response.response.errors;
                    self.register.processing = false;
                    self.login.processing = false;

                    $timeout(function() {
                      self.login.errors = null;
                    }, 3500);
                  } else {
                    //
                    // Make sure our cookies for the Session are being set properly
                    //
                    ipCookie.remove('FIELDSTACKIO_SESSION');
                    ipCookie('FIELDSTACKIO_SESSION', response.access_token, self.cookieOptions);

                    //
                    // Make sure we also set the User ID Cookie, so we need to wait to
                    // redirect until we're really sure the cookie is set
                    //
                    Account.setUserId().$promise.then(function() {
                      Account.getUser().$promise.then(function(userResponse) {

                        Account.userObject = userResponse;

                        $rootScope.user = Account.userObject;
                        $rootScope.isLoggedIn = Account.hasToken();
                        $rootScope.isAdmin = Account.hasRole('admin');

                        $location.path('/projects');
                      });
                    });

                  }
                }, function(){
                  self.login.processing = false;

                  var messageTitle = 'Incorrect Credentials',
                      messageDescription = ['The email or password you provided was incorrect'];

                  $rootScope.notifications.error(messageTitle, messageDescription);

                  $timeout(function() {
                    $rootScope.notifications.objects = [];
                  }, 3500);
                });
              }
            };
        });

}());

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .controller('SecurityRegisterController', function (Account, $location, Security, ipCookie, $rootScope, $timeout, User) {

             var self = this,
                 userId = null;

             self.cookieOptions = {
               path: '/',
               expires: 2
             };

             //
             // We have a continuing problem with bad data being placed in the URL,
             // the following fixes that
             //
             $location.search({
               q: undefined,
               results_per_page: undefined
             });

             self.register = {
               visible: false,
               login: function(userId) {

                 var credentials = new Security({
                   email: self.register.email,
                   password: self.register.password,
                 });

                 credentials.$save(function(response) {

                   //
                   // Check to see if there are any errors by checking for the existence
                   // of response.response.errors
                   //
                   if (response.response && response.response.errors) {

                     if (response.response.errors.email) {
                       $rootScope.notifications.error('', response.response.errors.email);
                     }
                     if (response.response.errors.password) {
                       $rootScope.notifications.error('', response.response.errors.password);
                     }

                     self.register.processing = false;

                     $timeout(function() {
                       $rootScope.notifications.objects = [];
                     }, 3500);

                     return;
                   } else {

                     ipCookie.remove('FIELDSTACKIO_SESSION');

                     ipCookie('FIELDSTACKIO_SESSION', response.access_token, self.cookieOptions);

                     self.newUser = new User({
                       id: userId,
                       properties: {
                         first_name: self.register.first_name,
                         last_name: self.register.last_name
                       }
                     });

                     //
                     // Make sure we also set the User ID Cookie, so we need to wait to
                     // redirect until we're really sure the cookie is set
                     //
                     Account.setUserId().$promise.then(function() {
                       Account.getUser().$promise.then(function(userResponse) {

                         Account.userObject = userResponse;

                         $rootScope.user = Account.userObject;

                         $rootScope.isLoggedIn = Account.hasToken();

                         self.newUser = new User({
                           id: $rootScope.user.id,
                           first_name: self.register.first_name,
                           last_name: self.register.last_name
                         });

                         self.newUser.$update().then(function (updateUserSuccessResponse) {
                           $location.path('/projects');
                         }, function(updateUserErrorResponse) {
                           console.log('updateUserErrorResponse', updateUserErrorResponse);
                         });

                       });
                     });

                   }
                 }, function(response){

                   if (response.response.errors.email) {
                     $rootScope.notifications.error('', response.response.errors.email);
                   }
                   if (response.response.errors.password) {
                     $rootScope.notifications.error('', response.response.errors.password);
                   }

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 });

               },
               submit: function() {

                 self.register.processing = true;

                 //
                 // Check to see if Username and Password field are valid
                 //
                 if (!self.register.email) {
                   $rootScope.notifications.warning('Email', 'field is required');

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 }
                 else if (!self.register.password) {
                   $rootScope.notifications.warning('Password', 'field is required');

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 }

                 //
                 // If all fields have values move on to the next step
                 //
                 Security.register({
                   email: self.register.email,
                   password: self.register.password
                 }, function(response) {

                   //
                   // Check to see if there are any errors by checking for the
                   // existence of response.response.errors
                   //
                   if (response.response && response.response.errors) {

                     if (response.response.errors.email) {
                       $rootScope.notifications.error('', response.response.errors.email);
                     }
                     if (response.response.errors.password) {
                       $rootScope.notifications.error('', response.response.errors.password);
                     }

                     self.register.processing = false;

                     $timeout(function() {
                       $rootScope.notifications.objects = [];
                     }, 3500);

                     return;
                   } else {

                     self.register.processing = false;

                     self.register.processingLogin = true;

                     self.register.login(response.response.user.id);
                   }
                 });
               }
             };

       });

}());

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .controller('SecurityLogoutController', function (Account, ipCookie, $location, $rootScope) {

         /**
          * Remove all cookies present for authentication
          */
         ipCookie.remove('FIELDSTACKIO_SESSION');
         ipCookie.remove('FIELDSTACKIO_SESSION', { path: '/' });

         ipCookie.remove('FIELDSTACKIO_CURRENTUSER');
         ipCookie.remove('FIELDSTACKIO_CURRENTUSER', { path: '/' });

         /**
          * Remove all data from the User and Account objects, this is really just
          * for display purposes and has no bearing on the actual session
          */
         $rootScope.user = $rootScope.page.links = $rootScope.page.actions = Account.userObject = null;

         /**
          * Redirect individuals back to the activity list
          */
         $location.path('/');
       });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('SecurityResetPasswordController', function ($location, Security, $timeout) {

      var self = this;

      self.reset = {
        success: false,
        processing: false,
        visible: true,
        submit: function() {

          self.reset.processing = true;

          var credentials = new Security({
            email: self.reset.email
          });

          credentials.$reset(function(response) {

            //
            // Check to see if there are any errors by checking for the existence
            // of response.response.errors
            //
            if (response.response && response.response.errors) {
              self.reset.errors = response.response.errors;
              self.register.processing = false;
              self.reset.processing = false;

              $timeout(function() {
                self.reset.errors = null;
              }, 3500);
            } else {
              self.reset.processing = false;
              self.reset.success = true;
            }
          }, function(){
            self.reset.processing = false;

            self.reset.errors = {
              email: ['The email or password you provided was incorrect']
            };

            $timeout(function() {
              self.reset.errors = null;
            }, 3500);
          });
        }
      };

    });

} ());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name FieldDoc.authorizationInterceptor
     * @description
     * # authorizationInterceptor
     * Service in the FieldDoc.
     */
    angular.module('FieldDoc')
      .factory('AuthorizationInterceptor', function($location, $q, ipCookie, $log) {

        return {
          request: function(config) {

            var sessionCookie = ipCookie('FIELDSTACKIO_SESSION');

            //
            // Configure our headers to contain the appropriate tags
            //
            config.headers = config.headers || {};

            if (config.headers['Authorization-Bypass'] === true) {
              delete config.headers['Authorization-Bypass'];
              return config || $q.when(config);
            }

            if (sessionCookie) {
              config.headers.Authorization = 'Bearer ' + sessionCookie;
            } else if (!sessionCookie && $location.path() !== '/account/register' && $location.path() !== '/account/reset') {
              /**
               * Remove all cookies present for authentication
               */
              ipCookie.remove('FIELDSTACKIO_SESSION');
              ipCookie.remove('FIELDSTACKIO_SESSION', { path: '/' });

              ipCookie.remove('FIELDSTACKIO_CURRENTUSER');
              ipCookie.remove('FIELDSTACKIO_CURRENTUSER', { path: '/' });

              $location.path('/account/login').search('');
            }

            config.headers['Cache-Control'] = 'no-cache, max-age=0, must-revalidate';

            //
            // Configure or override parameters where necessary
            //
            config.params = (config.params === undefined) ? {} : config.params;

            console.debug('SecurityInterceptor::Request', config || $q.when(config));

            return config || $q.when(config);
          },
          response: function(response) {
            $log.info('AuthorizationInterceptor::Response', response || $q.when(response));
            return response || $q.when(response);
          },
          responseError: function (response) {
            $log.info('AuthorizationInterceptor::ResponseError', response || $q.when(response));
            return $q.reject(response);
          }
        };
      }).config(function ($httpProvider) {
        $httpProvider.interceptors.push('AuthorizationInterceptor');
      });

}());

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Navigation
 * @description
 * # Navigation
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('token', ['$location', 'ipCookie', function ($location, ipCookie) {

    return {
      get: function() {
        return ipCookie('COMMONS_SESSION');
      },
      remove: function() {
        //
        // Clear out existing COMMONS_SESSION cookies that may be invalid or
        // expired. This may happen when a user closes the window and comes back
        //
        ipCookie.remove('COMMONS_SESSION');
        ipCookie.remove('COMMONS_SESSION', { path: '/' });
      },
      save: function() {
        var locationHash = $location.hash(),
            accessToken = locationHash.substring(0, locationHash.indexOf('&')).replace('access_token=', '');

        ipCookie('COMMONS_SESSION', accessToken, {
              path: '/',
              expires: 2
            });

        $location.hash(null);

        $location.path('/projects');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects', {
        templateUrl: '/modules/components/projects/views/projectsList--view.html',
        controller: 'ProjectsCtrl',
        controllerAs: 'page',
        reloadOnSearch: true,
        resolve: {
          projects: function($location, Project) {

            //
            // Get all of our existing URL Parameters so that we can
            // modify them to meet our goals
            //
            var search_params = $location.search();

            //
            // Prepare any pre-filters to append to any of our user-defined
            // filters in the browser address bar
            //
            search_params.q = (search_params.q) ? angular.fromJson(search_params.q) : {};

            search_params.q.filters = (search_params.q.filters) ? search_params.q.filters : [];

            search_params.q.order_by = [{
              field: 'created_on',
              direction: 'desc'
            }];

            //
            // Execute our query so that we can get the Reports back
            //
            return Project.query(search_params);
          },
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: '/modules/components/projects/views/projectsSingle--view.html',
        controller: 'ProjectViewCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          },
          sites: function(Project, $route) {
            return Project.sites({
                'id': $route.current.params.projectId
            });
          }
        }
      })
      .when('/projects/:projectId/edit', {
        templateUrl: '/modules/components/projects/views/projectsEdit--view.html',
        controller: 'ProjectEditCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          }
        }
      })
      .when('/projects/:projectId/users', {
        templateUrl: '/modules/components/projects/views/projectsUsers--view.html',
        controller: 'ProjectUsersCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
                'id': $route.current.params.projectId
            });
          },
          members: function(Project, $route) {
            return Project.members({
                'id': $route.current.params.projectId
            });
          }
        }
      });

  });

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('ProjectsCtrl', function (Account, $location, $log, Project, projects, $rootScope, $scope, Site, user) {

    var self = this;

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      title: 'Projects',
      links: [
        {
          text: 'Projects',
          url: '/projects',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          action: function() {
            self.createPlan();
          },
          text: 'Create Pre-Project Plan'
        },
        {
          type: 'button-link new',
          action: function() {
            self.createProject();
          },
          text: 'Create project'
        }
      ]
    };

    //
    // Project functionality
    //
    self.projects = projects;

    self.search = {
      query: '',
      execute: function() {

        //
        // Get all of our existing URL Parameters so that we can
        // modify them to meet our goals
        //
        var q = {
          filters: [{
            "and": [
              {
                name: 'name',
                op: 'ilike',
                val: '%' + self.search.query + '%'
              }
            ]
          }],
          order_by: [{
            field: 'created_on',
            direction: 'desc'
          }]
        };

        $location.path('/projects/').search({
          q: angular.toJson(q),
          page: 1
        });

      },
      paginate: function(pageNumber) {

        //
        // Get all of our existing URL Parameters so that we can
        // modify them to meet our goals
        //
        var searchParams = $location.search();

        searchParams.page = pageNumber;

        $location.path('/projects/').search(searchParams);
      },
      clear: function() {
        $location.path('/projects/').search('');
      }
    };

    //
    // Set Default Search Filter value
    //
    if (self.search && self.search.query === '') {

      var searchParams = $location.search(),
          q = angular.fromJson(searchParams.q);

      if (q && q.filters && q.filters.length) {
        angular.forEach(q.filters[0].and, function(filter) {
            if (filter.name === 'name') {
              self.search.query = filter.val.replace(/%/g, '');;
            }
        });
      }
    };

    self.createProject = function() {
        self.project = new Project({
            'name': 'Untitled Project'
        });

        self.project.$save(function(successResponse) {
            $location.path('/projects/' + successResponse.id + '/edit');
        }, function(errorResponse) {
            $log.error('Unable to create Project object');
        });
    };

    self.createPlan = function() {
      self.project = new Project({
          'name': 'Project Plan',
          'program_type': 'Pre-Project Plan',
          'description': 'This project plan was created to estimate the potential benefits of a project\'s site and best management practices.'
      });

      self.project.$save(function(successResponse) {

          self.site = new Site({
            'name': 'Planned Site',
            'project_id': successResponse.id
          });

          self.site.$save(function(siteSuccessResponse) {
            $location.path('/projects/' + successResponse.id + '/sites/' + siteSuccessResponse.id + '/edit');
          }, function(siteErrorResponse) {
            console.error('Could not save your new Project Plan');
          });

      }, function(errorResponse) {
          $log.error('Unable to create Project object');
      });
    };

    //
    // Verify Account information for proper UI element display
    //
    if (Account.userObject && user) {
        user.$promise.then(function(userResponse) {
            $rootScope.user = Account.userObject = userResponse;
            self.permissions = {
                isLoggedIn: Account.hasToken()
            };
        });
    }

  });

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('ProjectViewCtrl', function (Account, $rootScope, $route, $location, mapbox, project, Site, sites, user) {

    var self = this;
    $rootScope.page = {};

    self.sites = sites;
    self.mapbox = mapbox;

    //
    // Assign project to a scoped variable
    //
    project.$promise.then(function(projectResponse) {
        self.project = projectResponse;

        $rootScope.page.title = self.project.properties.name;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.project.properties.name,
                url: '/projects/' + $route.current.params.projectId,
                type: 'active'
            }
        ];

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
                    can_edit: Account.canEdit(project)
                };
            });
        }

    });


    self.createSite = function() {
        self.site = new Site({
            'name': 'Untitled Site',
            'project_id': self.project.id,
            'account_id': self.project.properties.account_id
        });

        self.site.$save(function(successResponse) {
            $location.path('/projects/' + self.project.id + '/sites/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('Unable to create your site, please try again later');
          });
    };

    //
    // Setup basic page variables
    //
    $rootScope.page.actions = [
      {
        type: 'button-link new',
        action: function() {
          self.createSite();
        },
        text: 'Create site'
      }
    ];

    // self.$watch('project.sites.list', function(processedSites, existingSites) {
    //  // console.log('self.project.sites.list,', self.project.sites.list)
    //  angular.forEach(processedSites, function(feature, $index) {
    //    var coords = [0,0];
    //
    //    if (feature.geometry !== null) {
    //      console.log('feature.geometry', feature.geometry);
    //      if (feature.geometry.geometries[0].type === 'Point') {
    //        coords = feature.geometry.geometries[0].coordinates;
    //      }
    //    }
    //
    //    self.project.sites.list[$index].site_thumbnail = 'https://api.tiles.mapbox.com/v4/' + mapbox.satellite + '/pin-s+b1c11d(' + coords[0] + ',' + coords[1] + ',17)/' + coords[0] + ',' + coords[1] + ',17/80x80@2x.png?access_token=' + mapbox.access_token;
    //  });
    //});


  });

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('ProjectEditCtrl', function (Account, $location, $log, Project, project, $rootScope, $route, user) {

    var self = this;
    $rootScope.page = {};

    //
    // Assign project to a scoped variable
    //
    project.$promise.then(function(successResponse) {
        self.project = successResponse;

        $rootScope.page.title = self.project.properties.name;
        $rootScope.page.links = [
            {
              text: 'Projects',
              url: '/projects'
            },
            {
              text: self.project.properties.name,
              url: '/projects/' + self.project.id
            },
            {
              text: 'Edit',
              url: '/projects/' + self.project.id + '/edit',
              type: 'active'
            }
        ];
        $rootScope.page.actions = [];

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
                    can_edit: Account.canEdit(project)
                };
            });
        }

    }, function(errorResponse) {
        $log.error('Unable to load request project');
    });

    //
    //
    //
    self.saveProject = function() {
      self.project.$update().then(function(response) {

        $location.path('/projects/' + self.project.id);

      }).then(function(error) {
        // Do something with the error
      });

    };

    self.deleteProject = function() {
      self.project.$delete().then(function(response) {

        $location.path('/projects/');

      }).then(function(error) {
        // Do something with the error
      });
    };

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:ProjectUsersCtrl
   * @description
   * # ProjectUsersCtrl
   * Controller of the FieldDoc
   */
  angular.module('FieldDoc')
    .controller('ProjectUsersCtrl', function (Account, Collaborators, $rootScope, $scope, $route, $location, project, user, members) {

      var self = this;
      $rootScope.page = {};

      //
      // Assign project to a scoped variable
      //
      project.$promise.then(function(successResponse) {
          self.project = successResponse;

          $rootScope.page.title = self.project.properties.name;
          $rootScope.page.links = [
              {
                text: 'Projects',
                url: '/projects'
              },
              {
                text: self.project.properties.name,
                url: '/projects/' + self.project.id
              },
              {
                text: 'Edit',
                url: '/projects/' + self.project.id + '/edit',
                type: 'active'
              },
              {
                text: 'Collaborators',
                url: '/projects/' + self.project.id + '/users'
              }
          ];
          $rootScope.page.actions = [];

          self.project.users = members;
          self.project.users_edit = false;

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
                      can_edit: Account.canEdit(project)
                  };
              });
          }

      }, function(errorResponse) {
          console.error('Unable to load request project');
      });

      //
      // Empty Collaborators object
      //
      // We need to have an empty geocode object so that we can fill it in later
      // in the address geocoding process. This allows us to pass the results along
      // to the Form Submit function we have in place below.
      //
      self.collaborator = {
        invitations: [],
        sendInvitations: function() {
          Collaborators.invite({
            'collaborators': self.collaborator.invitations,
            'project_id': self.project.id
          }).$promise.then(function(successResponse) {
            $route.reload();
          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        }
      };

      //
      // When the user has selected a response, we need to perform a few extra
      // tasks so that our scope is updated properly.
      //
      $scope.$watch(angular.bind(this, function() {
        return this.collaborator.response;
      }), function (response) {

        if (response) {

          // Reset the fields we are done using
          self.collaborator.query = null;
          self.collaborator.response = null;

          // Add the selected user value to the invitations list
          self.collaborator.invitations.push(response);
        }

      });

      self.users = {
        list: members,
        search: null,
        invite: function(user) {
          self.invite.push(user); // Add selected User object to invitation list
          this.search = null; // Clear search text
        },
        add: function() {
          angular.forEach(self.invite, function(user_, $index) {
            Feature.AddUser({
              storage: storage,
              featureId: $scope.project.id,
              userId: user_.id,
              data: {
                read: true,
                write: true,
                is_admin: false
              }
            }).then(function(response) {
              //
              // Once the users have been added to the project refresh the page
              //
              self.page.refresh();
            });
          });
        },
        remove: function() {
          self.project.$update().then(function(response) {
            $route.reload();
          }).then(function(error) {
            // Do something with the error
          });
        },
        remove_confirm: false
      };

    });

}());

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites', {
        redirectTo: '/projects/:projectId'
      })
      .when('/projects/:projectId/sites/:siteId', {
        templateUrl: '/modules/components/sites/views/sites--view.html',
        controller: 'SiteViewCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          project: function(Project, $route) {
            return Project.get({
              id: $route.current.params.projectId
            });
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practices: function(Site, $route) {
            return Site.practices({
              id: $route.current.params.siteId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/edit', {
        templateUrl: '/modules/components/sites/views/sites--edit.html',
        controller: 'SiteEditCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          }
        }
      });

  }]);

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('SiteViewCtrl', function (Account, leafletData, $location, site, Practice, practices, project, $rootScope, $route, user) {

    var self = this;

    $rootScope.page = {};

    self.practices = practices;

    site.$promise.then(function(successResponse) {

      self.site = successResponse;

      $rootScope.page.title = self.site.properties.name;
      $rootScope.page.links = [
          {
              text: 'Projects',
              url: '/projects'
          },
          {
              text: self.site.properties.project.properties.name,
              url: '/projects/' + $route.current.params.projectId
          },
          {
            text: self.site.properties.name,
            url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id,
            type: 'active'
          }
      ];

      //
      // Verify Account information for proper UI element display
      //
      if (Account.userObject && user) {
          user.$promise.then(function(userResponse) {
              $rootScope.user = Account.userObject = userResponse;

              project.$promise.then(function(projectResponse) {
                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: Account.canEdit(projectResponse)
                };
              });

          });
      }

    }, function(errorResponse) {

    });

    self.createPractice = function() {
        self.practice = new Practice({
            'practice_type': 'Grass Buffer',
            'site_id': self.site.id,
            'account_id': self.site.properties.project.properties.account_id
        });

        self.practice.$save(function(successResponse) {
            $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('Unable to create your site, please try again later');
          });
    };

    //
    // Setup basic page variables
    //
    $rootScope.page.actions = [
      {
        type: 'button-link new',
        action: function() {
          self.createPractice();
        },
        text: 'Create practice'
      }
    ];

    //
    // $scope.map = {
    //   defaults: {
    //     scrollWheelZoom: false,
    //     zoomControl: false,
    //     maxZoom: 19
    //   },
    //   layers: {
    //     baselayers: {
    //       basemap: {
    //         name: 'Satellite Imagery',
    //         url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.satellite + '/{z}/{x}/{y}.png',
    //         type: 'xyz',
    //         layerOptions: {
    //           attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
    //         }
    //       }
    //     }
    //   },
    //   center: {},
    //   markers: {
    //     LandRiverSegment: {
    //       lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
    //       lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119,
    //       icon: {
    //         iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
    //         iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
    //         iconSize: [38, 90],
    //         iconAnchor: [18, 44],
    //         popupAnchor: [0, 0]
    //       }
    //     }
    //   },
    //   geojsonToLayer: function (geojson, layer, options) {
    //
    //     //
    //     // Make sure the GeoJSON object is added to the layer with appropriate styles
    //     //
    //     layer.clearLayers();
    //
    //     if (options === undefined || options === null) {
    //       options = {
    //         stroke: true,
    //         fill: false,
    //         weight: 1,
    //         opacity: 1,
    //         color: 'rgb(255,255,255)',
    //         lineCap: 'square'
    //       };
    //     }
    //
    //     L.geoJson(geojson, {
    //       style: options
    //     }).eachLayer(function(l) {
    //       l.addTo(layer);
    //     });
    //
    //   },
    //   drawPolygon: function(geojson, fitBounds, options) {
    //
    //     leafletData.getMap().then(function(map) {
    //       var featureGroup = new L.FeatureGroup();
    //
    //
    //       //
    //       // Convert the GeoJSON to a layer and add it to our FeatureGroup
    //       //
    //       $scope.map.geojsonToLayer(geojson, featureGroup, options);
    //
    //       //
    //       // Add the FeatureGroup to the map
    //       //
    //       map.addLayer(featureGroup);
    //
    //       //
    //       // If we can getBounds then we can zoom to a specific level, we need to check to see
    //       // if the FeatureGroup has any bounds first though, otherwise we'll get an error.
    //       //
    //       if (fitBounds === true) {
    //         var bounds = featureGroup.getBounds();
    //
    //         if (bounds.hasOwnProperty('_northEast')) {
    //           map.fitBounds(featureGroup.getBounds());
    //         }
    //       }
    //     });
    //
    //   },
    //   setupMap: function() {
    //     //
    //     // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
    //     // selected their property, so we just need to display it on the map for them again.
    //     //
    //     if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {
    //
    //       //
    //       // Draw the Land River Segment
    //       //
    //       $scope.map.drawPolygon({
    //         type: 'Feature',
    //         geometry: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].geometry
    //       }, false, {
    //         stroke: false,
    //         fill: true,
    //         fillOpacity: 0.65,
    //         color: 'rgb(25,166,215)'
    //       });
    //
    //       //
    //       // Load Land river segment details
    //       //
    //       Feature.GetFeature({
    //         storage: variables.land_river_segment.storage,
    //         featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    //       }).then(function(response) {
    //         $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    //       });
    //
    //       //
    //       // Draw the county
    //       //
    //       if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8.length) {
    //         $scope.map.drawPolygon({
    //           type: 'Feature',
    //           geometry: $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].geometry
    //         }, true);
    //       }
    //
    //     }
    //   }
    // };
    //
    // //
    // // Once the page has loaded we need to load in all Reading Features that are associated with
    // // the Practices related to the Site being viewed
    // //
    // $scope.map.setupMap();

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:SiteEditCtrl
   * @description
   * # SiteEditCtrl
   * Controller of the FieldDoc
   */
  angular.module('FieldDoc')
    .controller('SiteEditCtrl', function (Account, environment, $http, leafletData, $location, Map, mapbox, Notifications, Site, site, $rootScope, $route, $scope, Segment, $timeout, user) {

      var self = this,
          timeout;

      $rootScope.page = {};

      self.map = Map;

      //
      // We use this function for handle any type of geographic change, whether
      // through the map or through the fields
      //
      self.processPin = function(coordinates, zoom) {

        if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
          return;
        }

        self.geolocation.getSegment(coordinates);

        //
        // Move the map pin/marker and recenter the map on the new location
        //
        self.map.markers = {
          reportGeometry: {
            lng: coordinates.lng,
            lat: coordinates.lat,
            focus: false,
            draggable: true
          }
        };

        // //
        // // Update the coordinates for the Report
        // //
        self.site.geometry = {
          type: 'GeometryCollection',
          geometries: []
        };
        self.site.geometry.geometries.push({
          type: 'Point',
          coordinates: [
            coordinates.lng,
            coordinates.lat
          ]
        });

        //
        // Update the visible pin on the map
        //

        self.map.center = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: (zoom < 10) ? 10 : zoom
        };

        self.showGeocoder = false;
      };

      //
      // Empty Geocode object
      //
      // We need to have an empty geocode object so that we can fill it in later
      // in the address geocoding process. This allows us to pass the results along
      // to the Form Submit function we have in place below.
      //
      self.geocode = {};

      //
      // When the user has selected a response, we need to perform a few extra
      // tasks so that our scope is updated properly.
      //
      $scope.$watch(angular.bind(this, function() {
        return this.geocode.response;
      }), function (response) {

        //
        // Only execute the following block of code if the user has geocoded an
        // address. This block of code expects this to be a single feature from a
        // Carmen GeoJSON object.
        //
        // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
        //
        if (response) {

          self.processPin({
            lat: response.geometry.coordinates[1],
            lng: response.geometry.coordinates[0]
          }, 16);

          self.geocode = {
            query: null,
            response: null
          };
        }

      });

      site.$promise.then(function(successResponse) {

        self.site = successResponse;

        $rootScope.page.title = self.site.properties.name;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + $route.current.params.projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + $route.current.params.projectId + '/sites/' + self.site.id
            },
            {
              text: 'Edit',
              type: 'active'
            }
        ];

        //
        // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
        // selected their property, so we just need to display it on the map for them again.
        //
        if (self.site && self.site.properties && self.site.properties.segment) {
          self.geolocation.drawSegment(self.site.properties.segment);
        }

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
                    can_edit: Account.canEdit(self.site.properties.project)
                };
            });
        }

        self.map = {
          defaults: {
            scrollWheelZoom: false,
            zoomControl: false,
            maxZoom: 19
          },
          layers: {
            baselayers: {
              basemap: {
                name: 'Satellite Imagery',
                url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.satellite + '/{z}/{x}/{y}.png',
                type: 'xyz',
                layerOptions: {
                  attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
                }
              }
            }
          },
          center: {
            lat: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[1] : 38.362,
            lng: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[0] : -81.119,
            zoom: (self.site.geometry !== null && self.site.geometry !== undefined) ? 16 : 6
          },
          markers: {
            LandRiverSegment: {
              lat: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[1] : 38.362,
              lng: (self.site.geometry !== null && self.site.geometry !== undefined) ? self.site.geometry.geometries[0].coordinates[0] : -81.119,
              focus: false,
              draggable: true
            }
          }
        };

      }, function(errorResponse) {

      });

      self.saveSite = function() {

        //
        // Prior to saving the Site we need to make sure the user has specified
        // their county and state.
        //
        if (self.site.properties.county) {
          self.site.properties.county_id = self.site.properties.county.id;
          self.site.properties.state = self.site.properties.county.properties.state_name;
        } else if (!self.site.properties.county || !self.site.properties.state) {
          $rootScope.notifications.error('Missing County and State Information', 'Please add a county and state to continue saving your site');

          $timeout(function() {
            $rootScope.notifications.objects = [];
          }, 3500);

          return;
        }

        if (!self.site.properties.segment) {
          $rootScope.notifications.error('Missing Land River Segment', 'Please add a land river segment to continue saving your site');

          $timeout(function() {
            $rootScope.notifications.objects = [];
          }, 3500);

          return;
        }

        self.site.$update().then(function(successResponse) {
          $location.path('/projects/' + $route.current.params.projectId + '/sites/' + $route.current.params.siteId);
        }, function(errorResponse) {

        });
      };

      self.deleteSite = function() {
        self.site.$delete().then(function(successResponse) {
          $location.path('/projects/' + $route.current.params.projectId);
        }, function(errorResponse) {

        });
      };

      /**
       * Mapping functionality
       *
       *
       *
       *
       *
       *
       */

      //
      // Define a layer to add geometries to later
      //
      var featureGroup = new L.FeatureGroup();

      //
      // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
      //
      self.geojsonToLayer = function (geojson, layer) {
        layer.clearLayers();
        function add(l) {
          l.addTo(layer);
        }

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojson, {
          style: {
            stroke: true,
            fill: false,
            weight: 2,
            opacity: 1,
            color: 'rgb(255,255,255)',
            lineCap: 'square'
          }
        }).eachLayer(add);
      };

      self.geolocation = {
        drawSegment: function(geojson) {

          leafletData.getMap().then(function(map) {
            //
            // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
            //
            map.removeLayer(featureGroup);

            //
            // Convert the GeoJSON to a layer and add it to our FeatureGroup
            //
            self.geojsonToLayer(geojson, featureGroup);

            //
            // Add the FeatureGroup to the map
            //
            map.addLayer(featureGroup);
          });

        },
        getSegment: function(coordinates) {

          leafletData.getMap().then(function(map) {

            Segment.query({
                 q: {
                   filters: [
                     {
                       name: 'geometry',
                       op: 'intersects',
                       val: 'SRID=4326;POINT(' + coordinates.lng + ' ' + coordinates.lat + ')'
                     }
                   ]
                 }
               }).$promise.then(function(successResponse) {

                 var segments = successResponse;

                 if (segments.features.length) {
                   self.geolocation.drawSegment(segments);

                   if (segments.features.length) {
                     self.site.properties.segment_id = segments.features[0].id;
                     self.site.properties.segment = segments.features[0];
                   }
                 } else {
                   $rootScope.notifications.error('Outside Chesapeake Bay Watershed', 'Please select a project site that falls within the Chesapeake Bay Watershed');

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);
                 }


               }, function(errorResponse) {
                 console.error('Error', errorResponse);
               });

          });

        }
      };

      //
      // Define our map interactions via the Angular Leaflet Directive
      //
      leafletData.getMap().then(function(map) {

        //
        // Update the pin and segment information when the user clicks on the map
        // or drags the pin to a new location
        //
        $scope.$on('leafletDirectiveMap.click', function(event, args) {
          self.processPin(args.leafletEvent.latlng, map._zoom);
        });

        $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
          self.processPin(args.leafletEvent.latlng, map._zoom+1);
        });

        $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
          self.processPin(args.leafletEvent.target._latlng, map._zoom);
        });

        $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
          var zoom = map._zoom+1;
          map.setZoom(zoom);
        });

      });

    });

}());

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
        .when('/projects/:projectId/sites/:siteId/practices', {
          redirectTo: '/projects/:projectId/sites/:siteId'
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId', {
          templateUrl: '/modules/components/practices/views/practices--view.html',
          controller: 'PracticeViewController',
          controllerAs: 'page',
          resolve: {
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/edit', {
          templateUrl: '/modules/components/practices/views/practices--edit.html',
          controller: 'PracticeEditController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            }
          }
        });

    });

}());

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .constant('Storage', {
    'forest-buffer': {
      landuse: 'for',
      storage: 'type_ed657deb908b483a9e96d3a05e420c50',
      templateId: 141,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/forest-buffer/views/report--view.html',
        form: '/modules/components/practices/modules/forest-buffer/views/form--view.html'
      }
    },
    'grass-buffer': {
      landuse: 'hyo',
      storage: 'type_a1ee0564f2f94eda9c0ca3d6c277cf14',
      templateId: 373,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/grass-buffer/views/report--view.html',
        form: '/modules/components/practices/modules/grass-buffer/views/form--view.html'
      }
    },
    'livestock-exclusion': {
      landuse: 'hyo',
      storage: 'type_035455995db040158f5a4a107b5d8a6c',
      templateId: 375,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/livestock-exclusion/views/report--view.html',
        form: '/modules/components/practices/modules/livestock-exclusion/views/form--view.html'
      }
    },
    'urban-homeowner': {
      landuse: null,
      storage: 'type_6da15b74f6564feb90c3d581d97700fd',
      templateId: 377,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/urban-homeowner/views/report--view.html',
        form: '/modules/components/practices/modules/urban-homeowner/views/form--view.html'
      }
    },
    'bioretention': {
      landuse: null,
      storage: 'type_64d08a6ba8874ed5a76ae3f4abeb68ca',
      templateId: 380,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/bioretention/views/report--view.html',
        form: '/modules/components/practices/modules/bioretention/views/form--view.html'
      }
    },
    'instream-habitat': {
      landuse: null,
      storage: 'type_6800a0c907494118b9a8872a70ee26da',
      templateId: 381,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/instream-habitat/views/report--view.html',
        form: '/modules/components/practices/modules/instream-habitat/views/form--view.html'
      }
    },
    'bank-stabilization': {
      landuse: null,
      storage: 'type_907ba68d848c4131a0cf58a3682ff50e',
      templateId: 382,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/bank-stabilization/views/report--view.html',
        form: '/modules/components/practices/modules/bank-stabilization/views/form--view.html'
      }
    },
    'enhanced-stream-restoration': {
      landuse: null,
      storage: 'type_ff74e5abd79f4b2fbf04bf28168eaf97',
      templateId: 383,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/enhanced-stream-restoration/views/report--view.html',
        form: '/modules/components/practices/modules/enhanced-stream-restoration/views/form--view.html'
      }
    }
  });

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Calculate', function(LoadData, $q) {
      return {
        getExistingLanduse: function(measurementPeriod, readings) {

          var landuse;

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === measurementPeriod) {
              landuse = reading.properties.existing_riparian_landuse;
            }
          });

          return landuse;
        },
        getUplandLanduse: function(measurementPeriod, readings) {

          var landuse;

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === measurementPeriod) {
              landuse = reading.properties.upland_landuse;
            }
          });

          return landuse;
        },
        getLoadPromise: function(landuse, segment) {

          var defer = $q.defer();

          var request = LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: landuse
                }
              ],
              single: true
            }
          }, function() {
            defer.resolve(request);
          });

          return defer.promise;
        },
        getLoadTotals: function(area, efficiency) {
          return {
            nitrogen: (area*(efficiency.eos_totn/efficiency.eos_acres)),
            phosphorus: (area*(efficiency.eos_totp/efficiency.eos_acres)),
            sediment: ((area*(efficiency.eos_tss/efficiency.eos_acres))/2000)
          };
        },
        getTotalReadingsByCategory: function(period, readings) {
          var total = 0;

          for (var i = 0; i < readings.length; i++) {
            if (readings[i].properties.measurement_period === period) {
              total++;
            }
          }

          return total;
        }
      };
    });

}());

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('PracticeEditController', function (Account, Image, $location, $log, Media, Practice, practice, $q, $rootScope, $route, site, user) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId;

    self.files = Media;

    $rootScope.page = {};

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id
            },
            {
              text: 'Edit',
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id + '/edit',
              type: 'active'
            }
        ];
      }, function(errorResponse) {
        //
      });

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

    self.savePractice = function() {

      if (self.files.images.length) {

        var savedQueries = self.files.preupload(self.files.images);

        $q.all(savedQueries).then(function(successResponse) {

            $log.log('Images::successResponse', successResponse);

            angular.forEach(successResponse, function(image){
                self.practice.properties.images.push({
                    id: image.id
                });
            });

            self.practice.$update().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
            }, function(errorResponse) {
              // Error message
            });

        }, function(errorResponse) {
            $log.log('errorResponse', errorResponse);
        });

      }
      else {
        self.practice.$update().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id);
        }, function(errorResponse) {
          // Error message
        });
      }
    };

    self.deletePractice = function() {
      self.practice.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId);
      }, function(errorResponse) {
        // Error message
      });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('PracticeViewController', function ($location, practice, $route, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId,
        practiceType;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      practiceType = Utility.machineName(self.practice.properties.practice_type);

      $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + practiceType);

    });

  });

'use strict';

/**
 * @ngdoc service
 * @name.
 * @description
 */
angular.module('FieldDoc')
  .constant('AnimalType', {
      beef: {
        average_weight: 877.19,
        manure: 58,
        total_nitrogen: 0.0059,
        total_phosphorus: 0.0016,
      },
      dairy: {
        average_weight: 1351.35,
        manure: 86,
        total_nitrogen: 0.0052,
        total_phosphorus: 0.001,
      },
      'other cattle': {
        average_weight: 480.77,
        manure: 64.39,
        total_nitrogen: 0.0037,
        total_phosphorus: 0.001,
      },
      broilers: {
        average_weight: 2.2,
        manure: 85,
        total_nitrogen: 0.0129,
        total_phosphorus: 0.0035
      },
      layers: {
        average_weight: 4,
        manure: 64,
        total_nitrogen: 0.0131,
        total_phosphorus: 0.0047
      },
      pullets: {
        average_weight: 2.84,
        manure: 45.56,
        total_nitrogen: 0.0136,
        total_phosphorus: 0.0053
      },
      turkeys: {
        average_weight: 14.93,
        manure: 47,
        total_nitrogen: 0.0132,
        total_phosphorus: 0.0049
      },
      'hogs and pigs for breeding': {
        average_weight: 374.53,
        manure: 33.46,
        total_nitrogen: 0.0066,
        total_phosphorus: 0.0021
      },
      'hogs for slaughter': {
        average_weight: 110.01,
        manure: 84,
        total_nitrogen: 0.0062,
        total_phosphorus: 0.0021
      },
      horses: {
        average_weight: 1000,
        manure: 51,
        total_nitrogen: 0.0059,
        total_phosphorus: 0.0014
      },
      'angora goats': {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      'milk goats': {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      'sheep and lambs': {
        average_weight: 100,
        manure: 40,
        total_nitrogen: 0.0105,
        total_phosphorus: 0.0022
      },
      biosolids: {
        average_weight: null,
        manure: null,
        total_nitrogen: 0.039,
        total_phosphorus: 0.025
      }
  });

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer', {
        templateUrl: '/modules/components/practices/modules/forest-buffer/views/report--view.html',
        controller: 'ForestBufferReportController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          readings: function(Practice, $route) {
            return Practice.forestBuffer({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/forest-buffer/views/form--view.html',
        controller: 'ForestBufferFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeForestBuffer, $route) {
            return PracticeForestBuffer.get({
              id: $route.current.params.reportId
            });
          },
          landuse: function(Landuse) {
            return Landuse.query({
              results_per_page: 50
            });
          }
        }
      });

  });

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.Storage
   * @description
   *    Provides site/application specific variables to the entire application
   * Service in the FieldDoc.
   */
  angular.module('FieldDoc')
    .service('CalculateForestBuffer', function(LoadData, $q) {
      return {
        getPreInstallationLoad: function(bufferArea, loaddata) {

          var bufferAreaAcres = (bufferArea/43560);

          console.log('bufferAreaAcres', bufferAreaAcres);

          if (loaddata) {
            console.log('loaddata', loaddata);

            var uplandPreInstallationLoad = {
              nitrogen: ((bufferAreaAcres * 4)*(loaddata.properties.eos_totn/loaddata.properties.eos_acres)),
              phosphorus: ((bufferAreaAcres * 2)*(loaddata.properties.eos_totp/loaddata.properties.eos_acres)),
              sediment: (((bufferAreaAcres * 2)*(loaddata.properties.eos_tss/loaddata.properties.eos_acres))/2000)
            };

            console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

            var existingPreInstallationLoad = {
              nitrogen: (bufferAreaAcres*(loaddata.properties.eos_totn/loaddata.properties.eos_acres)),
              phosphorus: (bufferAreaAcres*(loaddata.properties.eos_totp/loaddata.properties.eos_acres)),
              sediment: ((bufferAreaAcres*(loaddata.properties.eos_tss/loaddata.properties.eos_acres))/2000)
            };

            console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

            return {
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };
          }
        }

        // $scope.calculate.GetPlannedLoad = function(period) {
        //
        //   var existingLanduseType;
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Planning') {
        //       existingLanduseType = $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];
        //     }
        //   }
        //
        //   $scope.calculate.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
        //     $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(newLoaddata) {
        //
        //       Efficiency.query({
        //         q: {
        //           filters: [
        //             {
        //               name: 'cbwm_lu',
        //               op: 'eq',
        //               val: existingLanduseType
        //             },
        //             {
        //               name: 'hydrogeomorphic_region',
        //               op: 'eq',
        //               val: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].hgmr_nme
        //             },
        //             {
        //               name: 'best_management_practice_short_name',
        //               op: 'eq',
        //               val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'ForestBuffersTrp': 'ForestBuffers'
        //             }
        //           ]
        //         }
        //       }).$promise.then(function(efficiencyResponse) {
        //         var efficiency = efficiencyResponse.response.features[0];
        //         $scope.practice_efficiency = efficiency;
        //
        //         //
        //         // EXISTING CONDITION — LOAD VALUES
        //         //
        //         var uplandPlannedInstallationLoad = {
        //           sediment: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.sediment*(efficiency.s_efficiency/100),
        //           nitrogen: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(efficiency.n_efficiency/100),
        //           phosphorus: $scope.calculate.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(efficiency.p_efficiency/100)
        //         };
        //
        //         console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);
        //
        //         var existingPlannedInstallationLoad = {
        //           sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
        //           nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
        //           phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
        //         };
        //
        //         console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);
        //
        //         //
        //         // PLANNED CONDITIONS — LANDUSE VALUES
        //         //
        //         var totals = {
        //           efficiency: {
        //             new: newLoaddata,
        //             existing: existingLoaddata
        //           },
        //           nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen,
        //           phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus,
        //           sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
        //         };
        //
        //         $scope.calculate.results.totalPlannedLoad = totals;
        //
        //       });
        //     });
        //   });
        //
        // }

        //
        // $scope.calculate.quantityInstalled = function(values, element, format) {
        //
        //   var planned_total = 0,
        //       installed_total = 0,
        //       percentage = 0;
        //
        //   // Get readings organized by their Type
        //   angular.forEach(values, function(reading, $index) {
        //     if (reading.measurement_period === 'Planning') {
        //       planned_total += $scope.calculate.GetSingleInstalledLoad(reading)[element];
        //     } else if (reading.measurement_period === 'Installation') {
        //       installed_total += $scope.calculate.GetSingleInstalledLoad(reading)[element];
        //     }
        //
        //   });
        //
        //   // Divide the Installed Total by the Planned Total to get a percentage of installed
        //   if (planned_total) {
        //     console.log('something to show');
        //     if (format === '%') {
        //       percentage = (installed_total/planned_total);
        //       console.log('percentage', (percentage*100));
        //       return (percentage*100);
        //     } else {
        //       console.log('installed_total', installed_total);
        //       return installed_total;
        //     }
        //   }
        //
        //   return 0;
        //
        // };
        //
        // //
        // // The purpose of this function is to return a percentage of the total installed versus the amount
        // // that was originally planned on being installed:
        // //
        // // (Installation+Installation+Installation) / Planned = % of Planned
        // //
        // //
        // // @param (string) field
        // //    The `field` parameter should be the field that you would like to get the percentage for
        // //
        // $scope.calculate.GetPercentageOfInstalled = function(field, format) {
        //
        //   var planned_total = 0,
        //       installed_total = 0,
        //       percentage = 0;
        //
        //   // Get readings organized by their Type
        //   angular.forEach($scope.practice.readings, function(reading, $index) {
        //
        //     if (reading.measurement_period === 'Planning') {
        //       planned_total += reading[field];
        //     } else if (reading.measurement_period === 'Installation') {
        //       installed_total += reading[field];
        //     }
        //
        //   });
        //
        //   // Divide the Installed Total by the Planned Total to get a percentage of installed
        //   if (planned_total >= 1) {
        //     if (format === 'percentage') {
        //       percentage = (installed_total/planned_total);
        //       return (percentage*100);
        //     } else {
        //       return installed_total;
        //     }
        //   }
        //
        //   return null;
        // };
        //
        // $scope.calculate.GetSingleInstalledLoad = function(value) {
        //
        //   var reduction = 0,
        //       bufferArea = ((value.length_of_buffer * value.average_width_of_buffer)/43560),
        //       landuse = (value.existing_riparian_landuse) ? $scope.landuse[value.existing_riparian_landuse.toLowerCase()] : null,
        //       preExistingEfficieny = $scope.calculate.results.totalPreInstallationLoad.efficieny,
        //       landuseEfficiency = ($scope.calculate.results.totalPlannedLoad && $scope.calculate.results.totalPlannedLoad.efficiency) ? $scope.calculate.results.totalPlannedLoad.efficiency : null,
        //       uplandPreInstallationLoad = null,
        //       existingPreInstallationLoad = null;
        //
        //   if ($scope.practice_efficiency) {
        //     uplandPreInstallationLoad = {
        //       sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*$scope.practice_efficiency.s_efficiency/100),
        //       nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*$scope.practice_efficiency.n_efficiency/100),
        //       phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*$scope.practice_efficiency.p_efficiency/100)
        //     };
        //   }
        //
        //   if (landuseEfficiency) {
        //     existingPreInstallationLoad = {
        //       sediment: ((bufferArea*((landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_tss/landuseEfficiency.new.efficieny.eos_acres)))/2000),
        //       nitrogen: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totn/landuseEfficiency.new.efficieny.eos_acres))),
        //       phosphorus: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totp/landuseEfficiency.new.efficieny.eos_acres)))
        //     };
        //   }
        //
        //   if (uplandPreInstallationLoad && existingPreInstallationLoad) {
        //     return {
        //       nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
        //       phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
        //       sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
        //     };
        //   } else {
        //     return {
        //       nitrogen: null,
        //       phosphorus: null,
        //       sediment: null
        //     };
        //   }
        // };
        //
        // $scope.calculate.GetTreeDensity = function(trees, length, width) {
        //   return (trees/(length*width/43560));
        // };
        //
        // $scope.calculate.GetPercentage = function(part, total) {
        //   return ((part/total)*100);
        // };
        //
        // $scope.calculate.GetConversion = function(part, total) {
        //   return (part/total);
        // };
        //
        // $scope.calculate.GetConversionWithArea = function(length, width, total) {
        //   return ((length*width)/total);
        // };
        //
        // $scope.calculate.GetRestorationTotal = function(unit, area) {
        //
        //   var total_area = 0;
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Installation') {
        //       if (area) {
        //         total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
        //       } else {
        //         total_area += $scope.practice.readings[i].length_of_buffer;
        //       }
        //     }
        //   }
        //
        //   // console.log('GetRestorationTotal', total_area, unit, (total_area/unit));
        //
        //
        //   return (total_area/unit);
        // };
        //
        // $scope.calculate.GetRestorationPercentage = function(unit, area) {
        //
        //   var planned_area = 0,
        //       total_area = $scope.calculate.GetRestorationTotal(unit, area);
        //
        //   for (var i = 0; i < $scope.practice.readings.length; i++) {
        //     if ($scope.practice.readings[i].measurement_period === 'Planning') {
        //       if (area) {
        //         planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
        //       } else {
        //         planned_area = $scope.practice.readings[i].length_of_buffer;
        //       }
        //     }
        //   }
        //
        //   planned_area = (planned_area/unit);
        //
        //   return ((total_area/planned_area)*100);
        // };

      };
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('ForestBufferReportController', function (Account, Calculate, CalculateForestBuffer, Efficiency, LoadData, $location, $log, practice, PracticeForestBuffer, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };
      self.newLanduse = 'for';

      self.calculate = Calculate;

      practice.$promise.then(function(successResponse) {

        self.practice = successResponse;

        self.practiceType = Utility.machineName(self.practice.properties.practice_type);

        //
        //
        //
        self.template = {
          path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
        };

        //
        //
        //
        site.$promise.then(function(successResponse) {
          self.site = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                type: 'active'
              }
          ];

          $rootScope.page.actions = [
            {
              type: 'button-link',
              action: function() {
                $window.print();
              },
              hideIcon: true,
              text: 'Print'
            },
            {
              type: 'button-link',
              action: function() {
                $scope.$emit('saveToPdf');
              },
              hideIcon: true,
              text: 'Save as PDF'
            },
            {
              type: 'button-link new',
              action: function() {
                self.addReading();
              },
              text: 'Add Measurement Data'
            }
          ];

          readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            // self.existingLanduse = self.calculateForestBuffer.getExistingLanduse('Planning', self.readings.features);
            //
            // self.uplandLanduse = self.calculateForestBuffer.getExistingLanduse('Planning', self.readings.features);
            //
            // self.segment = self.site.properties.segment.properties.hgmr_code;
            //
            // self.calculateForestBuffer.getLoadPromise(self.existingLanduse, self.segment).then(function(successResponse) {
            //   self.loadData = successResponse;
            // });

            self.calculateForestBuffer = {};

            self.calculateForestBuffer.GetLoadVariables = function(period, landuse) {

              var planned = {
                width: 0,
                length: 0,
                area: 0,
                landuse: '',
                segment: self.site.properties.segment.properties.hgmr_code,
                efficieny: null
              };

              var deferred = $q.defer();

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === period) {
                  planned.length = reading.properties.length_of_buffer;
                  planned.width = reading.properties.average_width_of_buffer;
                  planned.area = ((planned.length*planned.width)/43560);
                  planned.landuse = (landuse) ? landuse : reading.properties.existing_riparian_landuse;

                  var promise = LoadData.query({
                      q: {
                        filters: [
                          {
                            name: 'land_river_segment',
                            op: 'eq',
                            val: planned.segment
                          },
                          {
                            name: 'landuse',
                            op: 'eq',
                            val: planned.landuse
                          }
                        ]
                      }
                    }).$promise.then(function(successResponse) {
                      planned.efficieny = successResponse.features[0].properties;
                      deferred.resolve(planned);
                    });
                }
              });

              return deferred.promise;
            };

            self.calculateForestBuffer.GetPreInstallationLoad = function(period) {

              //
              // Existing Landuse
              //
              self.calculateForestBuffer.GetLoadVariables(period).then(function(loaddata) {

                var uplandPreInstallationLoad = {
                  nitrogen: ((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: ((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

                var existingPreInstallationLoad = {
                  nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

                self.calculateForestBuffer.results.totalPreInstallationLoad = {
                  efficieny: loaddata.efficieny,
                  uplandLanduse: uplandPreInstallationLoad,
                  existingLanduse: existingPreInstallationLoad,
                  nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
                  phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
                  sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                };

              });


            };

            self.calculateForestBuffer.GetPlannedLoad = function(period) {

              var existingLanduseType;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  existingLanduseType = reading.properties.existing_riparian_landuse;
                }
              });

              if (!period && !existingLanduseType) {
                return;
              }

              self.calculateForestBuffer.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
                self.calculateForestBuffer.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

                  Efficiency.query({
                    q: {
                      filters: [
                        {
                          name: 'cbwm_lu',
                          op: 'eq',
                          val: existingLanduseType
                        },
                        {
                          name: 'hydrogeomorphic_region',
                          op: 'eq',
                          val: self.site.properties.segment.properties.hgmr_name
                        },
                        {
                          name: 'best_management_practice_short_name',
                          op: 'eq',
                          val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'ForestBuffersTrp': 'ForestBuffers'
                        }
                      ]
                    }
                  }).$promise.then(function(efficiencyResponse) {

                    self.practice_efficiency = efficiencyResponse.features[0].properties;

                    //
                    // EXISTING CONDITION — LOAD VALUES
                    //
                    console.log('uplandPlannedInstallationLoad', self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.nitrogen, self.practice_efficiency.n_efficiency)
                    var uplandPlannedInstallationLoad = {
                      sediment: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                      nitrogen: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                      phosphorus: self.calculateForestBuffer.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
                    };

                    console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                    var existingPlannedInstallationLoad = {
                      sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                      nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                      phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                    };

                    console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

                    //
                    // PLANNED CONDITIONS — LANDUSE VALUES
                    //
                    var totals = {
                      efficiency: {
                        new: newLoaddata,
                        existing: existingLoaddata
                      },
                      nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen,
                      phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus,
                      sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
                    };

                    self.calculateForestBuffer.results.totalPlannedLoad = totals;

                  });
                });
              });

            };


            self.calculateForestBuffer.quantityInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += self.calculateForestBuffer.GetSingleInstalledLoad(reading)[element];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += self.calculateForestBuffer.GetSingleInstalledLoad(reading)[element];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total) {
                if (format === '%') {
                  percentage = (installed_total/planned_total);
                  return (percentage*100);
                } else {
                  return installed_total;
                }
              }

              return 0;

            };

            //
            // The purpose of this function is to return a percentage of the total installed versus the amount
            // that was originally planned on being installed:
            //
            // (Installation+Installation+Installation) / Planned = % of Planned
            //
            //
            // @param (string) field
            //    The `field` parameter should be the field that you would like to get the percentage for
            //
            self.calculateForestBuffer.GetPercentageOfInstalled = function(field, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(self.readings.features, function(reading, $index) {

                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += reading.properties[field];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += reading.properties[field];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total >= 1) {
                if (format === 'percentage') {
                  percentage = (installed_total/planned_total);
                  return (percentage*100);
                } else {
                  return installed_total;
                }
              }

              return null;
            };

            self.calculateForestBuffer.GetSingleInstalledLoad = function(value) {

              var reduction = 0,
                  bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
                  landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
                  preExistingEfficieny = self.calculateForestBuffer.results.totalPreInstallationLoad.efficieny,
                  landuseEfficiency = (self.calculateForestBuffer.results.totalPlannedLoad && self.calculateForestBuffer.results.totalPlannedLoad.efficiency) ? self.calculateForestBuffer.results.totalPlannedLoad.efficiency : null,
                  uplandPreInstallationLoad = null,
                  existingPreInstallationLoad = null;

              if (self.practice_efficiency) {
                uplandPreInstallationLoad = {
                  sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*self.practice_efficiency.s_efficiency),
                  nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.n_efficiency),
                  phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.p_efficiency)
                };
              }

              if (landuseEfficiency) {
                existingPreInstallationLoad = {
                  sediment: ((bufferArea*((landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_tss/landuseEfficiency.new.efficieny.eos_acres)))/2000),
                  nitrogen: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totn/landuseEfficiency.new.efficieny.eos_acres))),
                  phosphorus: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totp/landuseEfficiency.new.efficieny.eos_acres)))
                };
              }

              if (uplandPreInstallationLoad && existingPreInstallationLoad) {
                return {
                  nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
                  phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
                  sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                };
              } else {
                return {
                  nitrogen: null,
                  phosphorus: null,
                  sediment: null
                };
              }
            };

            self.calculateForestBuffer.GetTreeDensity = function(trees, length, width) {
              return (trees/(length*width/43560));
            };

            self.calculateForestBuffer.GetPercentage = function(part, total) {
              return ((part/total)*100);
            };

            self.calculateForestBuffer.GetConversion = function(part, total) {
              return (part/total);
            };

            self.calculateForestBuffer.GetConversionWithArea = function(length, width, total) {
              return ((length*width)/total);
            };

            self.calculateForestBuffer.GetRestorationTotal = function(unit, area) {

              var total_area = 0;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Installation') {
                  if (area) {
                    total_area += (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
                  } else {
                    total_area += reading.properties.length_of_buffer;
                  }
                }
              });

              return (total_area/unit);
            };

            self.calculateForestBuffer.GetRestorationPercentage = function(unit, area) {

              var planned_area = 0,
                  total_area = self.calculateForestBuffer.GetRestorationTotal(unit, area);

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  if (area) {
                    planned_area = (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
                  } else {
                    planned_area = reading.properties.length_of_buffer;
                  }
                }
              });

              planned_area = (planned_area/unit);

              return ((total_area/planned_area)*100);
            };

            self.calculateForestBuffer.results = {
              percentageLengthOfBuffer: {
                percentage: self.calculateForestBuffer.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
                total: self.calculateForestBuffer.GetPercentageOfInstalled('length_of_buffer')
              },
              percentageTreesPlanted: {

                percentage: self.calculateForestBuffer.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
                total: self.calculateForestBuffer.GetPercentageOfInstalled('number_of_trees_planted')
              },
              totalPreInstallationLoad: self.calculateForestBuffer.GetPreInstallationLoad('Planning'),
              totalPlannedLoad: self.calculateForestBuffer.GetPlannedLoad('Planning'),
              totalMilesRestored: self.calculateForestBuffer.GetRestorationTotal(5280),
              percentageMilesRestored: self.calculateForestBuffer.GetRestorationPercentage(5280, false),
              totalAcresRestored: self.calculateForestBuffer.GetRestorationTotal(43560, true),
              percentageAcresRestored: self.calculateForestBuffer.GetRestorationPercentage(43560, true)
            };

          }, function(errorResponse) {

          });

        }, function(errorResponse) {
          //
        });

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeForestBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('ForestBufferFormController', function (Account, landuse, $location, practice, PracticeForestBuffer, report, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      self.landuse = landuse;

      practice.$promise.then(function(successResponse) {

        self.practice = successResponse;

        self.practiceType = Utility.machineName(self.practice.properties.practice_type);

        //
        //
        //
        self.template = {
          path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
        };

        //
        //
        //
        site.$promise.then(function(successResponse) {
          self.site = successResponse;

          //
          // Assign project to a scoped variable
          //
          report.$promise.then(function(successResponse) {
            self.report = successResponse;

            $rootScope.page.title = self.practice.properties.practice_type;
            $rootScope.page.links = [
                {
                    text: 'Projects',
                    url: '/projects'
                },
                {
                    text: self.site.properties.project.properties.name,
                    url: '/projects/' + projectId
                },
                {
                  text: self.site.properties.name,
                  url: '/projects/' + projectId + '/sites/' + siteId
                },
                {
                  text: self.practice.properties.practice_type,
                  url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                },
                {
                  text: 'Edit',
                  url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                  type: 'active'
                }
            ];
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });

        }, function(errorResponse) {
          //
        });

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
                    can_edit: Account.canEdit(self.site.properties.project)
                };
            });
        }
      });

      self.saveReport = function() {
        self.report.$update().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
      };

      self.deleteReport = function() {
        self.report.$delete().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
      };

    //   Feature.GetFeature({
    //     storage: $scope.storage.storage,
    //     featureId: $route.current.params.reportId
    //   }).then(function(report) {
    //
    //     //
    //     // Load the reading into the scope
    //     //
    //     $scope.report = report;
    //     $scope.report.template = $scope.storage.templates.form;
    //
    //     //
    //     // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
    //     //
    //     $scope.calculateBufferComposition = function() {
    //
    //       var running_total = $scope.report.buffer_composition_woody + $scope.report.buffer_composition_shrub + $scope.report.buffer_composition_bare + $scope.report.buffer_composition_grass;
    //
    //       var remainder = 100-running_total;
    //
    //       $scope.report.buffer_composition_other = remainder;
    //     };
    //
    //     $scope.$watch('report.buffer_composition_woody', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_shrub', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_bare', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_grass', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //
    });

}());

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer', {
        templateUrl: '/modules/components/practices/modules/grass-buffer/views/report--view.html',
        controller: 'GrassBufferReportController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          readings: function(Practice, $route) {
            return Practice.grassBuffer({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/grass-buffer/views/form--view.html',
        controller: 'GrassBufferFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeGrassBuffer, $route) {
            return PracticeGrassBuffer.get({
              id: $route.current.params.reportId
            });
          },
          landuse: function(Landuse) {
            return Landuse.query({
              results_per_page: 50
            });
          }
        }
      });

  });

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateGrassBuffer', function() {
    return {

    };
  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('GrassBufferReportController', function (Account, Calculate, CalculateGrassBuffer, Efficiency, LoadData, $location, $log, practice, PracticeGrassBuffer, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };
      self.newLanduse = 'hyo';

      self.calculate = Calculate;

      practice.$promise.then(function(successResponse) {

        self.practice = successResponse;

        self.practiceType = Utility.machineName(self.practice.properties.practice_type);

        //
        //
        //
        self.template = {
          path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
        };

        //
        //
        //
        site.$promise.then(function(successResponse) {
          self.site = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                type: 'active'
              }
          ];

          $rootScope.page.actions = [
            {
              type: 'button-link',
              action: function() {
                $window.print();
              },
              hideIcon: true,
              text: 'Print'
            },
            {
              type: 'button-link',
              action: function() {
                $scope.$emit('saveToPdf');
              },
              hideIcon: true,
              text: 'Save as PDF'
            },
            {
              type: 'button-link new',
              action: function() {
                self.addReading();
              },
              text: 'Add Measurement Data'
            }
          ];

          readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            self.calculateGrassBuffer = {};

            self.calculateGrassBuffer.GetLoadVariables = function(period, landuse) {

              var planned = {
                width: 0,
                length: 0,
                area: 0,
                landuse: '',
                segment: self.site.properties.segment.properties.hgmr_code,
                efficieny: null
              };

              var deferred = $q.defer();

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === period) {
                  planned.length = reading.properties.length_of_buffer;
                  planned.width = reading.properties.average_width_of_buffer;
                  planned.area = ((planned.length*planned.width)/43560);
                  planned.landuse = (landuse) ? landuse : reading.properties.existing_riparian_landuse;

                  var promise = LoadData.query({
                      q: {
                        filters: [
                          {
                            name: 'land_river_segment',
                            op: 'eq',
                            val: planned.segment
                          },
                          {
                            name: 'landuse',
                            op: 'eq',
                            val: planned.landuse
                          }
                        ]
                      }
                    }).$promise.then(function(successResponse) {
                      planned.efficieny = successResponse.features[0].properties;
                      deferred.resolve(planned);
                    });
                }
              });

              return deferred.promise;
            };

            self.calculateGrassBuffer.GetPreInstallationLoad = function(period) {

              //
              // Existing Landuse
              //
              self.calculateGrassBuffer.GetLoadVariables(period).then(function(loaddata) {

                var uplandPreInstallationLoad = {
                  nitrogen: ((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: ((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                // console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

                var existingPreInstallationLoad = {
                  nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
                  phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
                  sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
                };

                // console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

                self.calculateGrassBuffer.results.totalPreInstallationLoad = {
                  efficieny: loaddata.efficieny,
                  uplandLanduse: uplandPreInstallationLoad,
                  existingLanduse: existingPreInstallationLoad,
                  nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
                  phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
                  sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                };

              });


            };

            self.calculateGrassBuffer.GetPlannedLoad = function(period) {

              var existingLanduseType;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  existingLanduseType = reading.properties.existing_riparian_landuse;
                }
              });

              if (!period && !existingLanduseType) {
                return;
              }

              self.calculateGrassBuffer.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
                self.calculateGrassBuffer.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

                  Efficiency.query({
                    q: {
                      filters: [
                        {
                          name: 'cbwm_lu',
                          op: 'eq',
                          val: existingLanduseType
                        },
                        {
                          name: 'hydrogeomorphic_region',
                          op: 'eq',
                          val: self.site.properties.segment.properties.hgmr_name
                        },
                        {
                          name: 'best_management_practice_short_name',
                          op: 'eq',
                          val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'GrassBuffersTrp': 'GrassBuffers'
                        }
                      ]
                    }
                  }).$promise.then(function(efficiencyResponse) {

                    if (efficiencyResponse.features && efficiencyResponse.features.length) {
                      self.practice_efficiency = efficiencyResponse.features[0].properties;

                      //
                      // EXISTING CONDITION — LOAD VALUES
                      //
                      var uplandPlannedInstallationLoad = {
                        sediment: self.calculateGrassBuffer.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                        nitrogen: self.calculateGrassBuffer.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                        phosphorus: self.calculateGrassBuffer.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
                      };

                      // console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                      var existingPlannedInstallationLoad = {
                        sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                        nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                        phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                      };

                      // console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

                      //
                      // PLANNED CONDITIONS — LANDUSE VALUES
                      //
                      var totals = {
                        efficiency: {
                          new: newLoaddata,
                          existing: existingLoaddata
                        },
                        nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen,
                        phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus,
                        sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
                      };

                      self.calculateGrassBuffer.results.totalPlannedLoad = totals;
                    }

                  });
                });
              });

            };


            self.calculateGrassBuffer.quantityInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += self.calculateGrassBuffer.GetSingleInstalledLoad(reading)[element];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += self.calculateGrassBuffer.GetSingleInstalledLoad(reading)[element];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total) {
                if (format === '%') {
                  percentage = (installed_total/planned_total);
                  return (percentage*100);
                } else {
                  return installed_total;
                }
              }

              return 0;

            };

            //
            // The purpose of this function is to return a percentage of the total installed versus the amount
            // that was originally planned on being installed:
            //
            // (Installation+Installation+Installation) / Planned = % of Planned
            //
            //
            // @param (string) field
            //    The `field` parameter should be the field that you would like to get the percentage for
            //
            self.calculateGrassBuffer.GetPercentageOfInstalled = function(field, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(self.readings.features, function(reading, $index) {

                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += reading.properties[field];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += reading.properties[field];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total >= 1) {
                if (format === 'percentage') {
                  percentage = (installed_total/planned_total);
                  return (percentage*100);
                } else {
                  return installed_total;
                }
              }

              return null;
            };

            self.calculateGrassBuffer.GetSingleInstalledLoad = function(value) {

              var reduction = 0,
                  bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
                  landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
                  preExistingEfficieny = self.calculateGrassBuffer.results.totalPreInstallationLoad.efficieny,
                  landuseEfficiency = (self.calculateGrassBuffer.results.totalPlannedLoad && self.calculateGrassBuffer.results.totalPlannedLoad.efficiency) ? self.calculateGrassBuffer.results.totalPlannedLoad.efficiency : null,
                  uplandPreInstallationLoad = null,
                  existingPreInstallationLoad = null;

              if (self.practice_efficiency) {
                uplandPreInstallationLoad = {
                  sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*self.practice_efficiency.s_efficiency),
                  nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.n_efficiency),
                  phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.p_efficiency)
                };
              }

              if (landuseEfficiency) {
                existingPreInstallationLoad = {
                  sediment: ((bufferArea*((landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_tss/landuseEfficiency.new.efficieny.eos_acres)))/2000),
                  nitrogen: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totn/landuseEfficiency.new.efficieny.eos_acres))),
                  phosphorus: (bufferArea*((landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres)-(landuseEfficiency.new.efficieny.eos_totp/landuseEfficiency.new.efficieny.eos_acres)))
                };
              }

              if (uplandPreInstallationLoad && existingPreInstallationLoad) {
                return {
                  nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
                  phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
                  sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                };
              } else {
                return {
                  nitrogen: null,
                  phosphorus: null,
                  sediment: null
                };
              }
            };

            self.calculateGrassBuffer.GetTreeDensity = function(trees, length, width) {
              return (trees/(length*width/43560));
            };

            self.calculateGrassBuffer.GetPercentage = function(part, total) {
              return ((part/total)*100);
            };

            self.calculateGrassBuffer.GetConversion = function(part, total) {
              return (part/total);
            };

            self.calculateGrassBuffer.GetConversionWithArea = function(length, width, total) {
              return ((length*width)/total);
            };

            self.calculateGrassBuffer.GetRestorationTotal = function(unit, area) {

              var total_area = 0;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Installation') {
                  if (area) {
                    total_area += (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
                  } else {
                    total_area += reading.properties.length_of_buffer;
                  }
                }
              });

              return (total_area/unit);
            };

            self.calculateGrassBuffer.GetRestorationPercentage = function(unit, area) {

              var planned_area = 0,
                  total_area = self.calculateGrassBuffer.GetRestorationTotal(unit, area);

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  if (area) {
                    planned_area = (reading.properties.length_of_buffer*reading.properties.average_width_of_buffer);
                  } else {
                    planned_area = reading.properties.length_of_buffer;
                  }
                }
              });

              planned_area = (planned_area/unit);

              return ((total_area/planned_area)*100);
            };

            self.calculateGrassBuffer.results = {
              percentageLengthOfBuffer: {
                percentage: self.calculateGrassBuffer.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
                total: self.calculateGrassBuffer.GetPercentageOfInstalled('length_of_buffer')
              },
              percentageTreesPlanted: {

                percentage: self.calculateGrassBuffer.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
                total: self.calculateGrassBuffer.GetPercentageOfInstalled('number_of_trees_planted')
              },
              totalPreInstallationLoad: self.calculateGrassBuffer.GetPreInstallationLoad('Planning'),
              totalPlannedLoad: self.calculateGrassBuffer.GetPlannedLoad('Planning'),
              totalMilesRestored: self.calculateGrassBuffer.GetRestorationTotal(5280),
              percentageMilesRestored: self.calculateGrassBuffer.GetRestorationPercentage(5280, false),
              totalAcresRestored: self.calculateGrassBuffer.GetRestorationTotal(43560, true),
              percentageAcresRestored: self.calculateGrassBuffer.GetRestorationPercentage(43560, true)
            };

          }, function(errorResponse) {

          });

        }, function(errorResponse) {
          //
        });

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeGrassBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('GrassBufferFormController', function (Account, landuse, $location, practice, PracticeGrassBuffer, report, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      self.landuse = landuse;

      //
      // Setup all of our basic date information so that we can use it
      // throughout the page
      //
      self.today = new Date();

      self.days = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
      ];

      self.months = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec'
      ];

      function parseISOLike(s) {
          var b = s.split(/\D/);
          return new Date(b[0], b[1]-1, b[2])
      }

      practice.$promise.then(function(successResponse) {

        self.practice = successResponse;

        self.practiceType = Utility.machineName(self.practice.properties.practice_type);

        //
        //
        //
        self.template = {
          path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
        };

        //
        //
        //
        site.$promise.then(function(successResponse) {
          self.site = successResponse;

          //
          // Assign project to a scoped variable
          //
          report.$promise.then(function(successResponse) {
            self.report = successResponse;

            if (self.report.properties.report_date) {
                console.log('self.report.propertiesreport_date', self.report.properties.report_date);
                self.today = parseISOLike(self.report.properties.report_date);
            }

            //
            // Check to see if there is a valid date
            //
            self.date = {
                month: self.months[self.today.getMonth()],
                date: self.today.getDate(),
                day: self.days[self.today.getDay()],
                year: self.today.getFullYear()
            };

            $rootScope.page.title = self.practice.properties.practice_type;
            $rootScope.page.links = [
                {
                    text: 'Projects',
                    url: '/projects'
                },
                {
                    text: self.site.properties.project.properties.name,
                    url: '/projects/' + projectId
                },
                {
                  text: self.site.properties.name,
                  url: '/projects/' + projectId + '/sites/' + siteId
                },
                {
                  text: self.practice.properties.practice_type,
                  url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
                },
                {
                  text: 'Edit',
                  url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                  type: 'active'
                }
            ];
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });

        }, function(errorResponse) {
          //
        });

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
                    can_edit: Account.canEdit(self.site.properties.project)
                };
            });
        }
      });

      $scope.$watch(angular.bind(this, function() {
          return this.date;
      }), function (response) {
        console.log('response', response)
          if (response) {
              var _new = response.month + ' ' + response.date + ' ' + response.year,
              _date = new Date(_new);
              self.date.day = self.days[_date.getDay()];
          }
      }, true);

      self.saveReport = function() {

        self.report.properties.report_date = self.date.month + ' ' + self.date.date + ' ' + self.date.year;

        self.report.$update().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
      };

      self.deleteReport = function() {
        self.report.$delete().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
      };

    //   Feature.GetFeature({
    //     storage: $scope.storage.storage,
    //     featureId: $route.current.params.reportId
    //   }).then(function(report) {
    //
    //     //
    //     // Load the reading into the scope
    //     //
    //     $scope.report = report;
    //     $scope.report.template = $scope.storage.templates.form;
    //
    //     //
    //     // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
    //     //
    //     $scope.calculateBufferComposition = function() {
    //
    //       var running_total = $scope.report.buffer_composition_woody + $scope.report.buffer_composition_shrub + $scope.report.buffer_composition_bare + $scope.report.buffer_composition_grass;
    //
    //       var remainder = 100-running_total;
    //
    //       $scope.report.buffer_composition_other = remainder;
    //     };
    //
    //     $scope.$watch('report.buffer_composition_woody', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_shrub', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_bare', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //     $scope.$watch('report.buffer_composition_grass', function() {
    //       $scope.calculateBufferComposition();
    //     });
    //
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion', {
          templateUrl: '/modules/components/practices/modules/livestock-exclusion/views/report--view.html',
          controller: 'LivestockExclusionReportController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            readings: function(Practice, $route) {
              return Practice.livestockExclusion({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/livestock-exclusion/views/form--view.html',
          controller: 'LivestockExclusionFormController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            report: function(PracticeLivestockExclusion, $route) {
              return PracticeLivestockExclusion.get({
                id: $route.current.params.reportId
              });
            },
            animals: function(AnimalManure) {
              return AnimalManure.query();
            },
            landuse: function(Landuse) {
              return Landuse.query({
                results_per_page: 50
              });
            }
          }
        });

    });


}());

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.LivestockExclusionCalculate
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateLivestockExclusion', ['Calculate', 'Landuse', function(Calculate, Landuse) {
    return {
      toMiles: function(feet) {
        return (feet/5280);
      },
      animalUnits: function(quantity, multiplier) {
        return ((quantity*multiplier)/1000);
      },
      totalDaysPerYearInStream: function(values) {
        return values.instream_dpmjan+values.instream_dpmfeb+values.instream_dpmmar+values.instream_dpmapr+values.instream_dpmmay+values.instream_dpmjun+values.instream_dpmjul+values.instream_dpmaug+values.instream_dpmsep+values.instream_dpmoct+values.instream_dpmnov+values.instream_dpmdec;
      },
      averageHoursPerYearInStream: function(values) {
        var totalHoursPerYearInStream = values.instream_hpdjan+values.instream_hpdfeb+values.instream_hpdmar+values.instream_hpdapr+values.instream_hpdmay+values.instream_hpdjun+values.instream_hpdjul+values.instream_hpdaug+values.instream_hpdsep+values.instream_hpdoct+values.instream_hpdnov+values.instream_hpddec;
        return totalHoursPerYearInStream;
      },
      averageDaysPerYearInStream: function(values) {
        var sumproduct = (values.instream_hpdjan*values.instream_dpmjan)+(values.instream_hpdfeb*values.instream_dpmfeb)+(values.instream_hpdmar*values.instream_dpmmar)+(values.instream_hpdapr*values.instream_dpmapr)+(values.instream_hpdmay*values.instream_dpmmay)+(values.instream_hpdjun*values.instream_dpmjun)+(values.instream_hpdjul*values.instream_dpmjul)+(values.instream_hpdaug*values.instream_dpmaug)+(values.instream_hpdsep*values.instream_dpmsep)+(values.instream_hpdoct*values.instream_dpmoct)+(values.instream_hpdnov*values.instream_dpmnov)+(values.instream_hpddec*values.instream_dpmdec);

        return (sumproduct/24);
      },
      quantityInstalled: function(values, field, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += reading.properties[field];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += reading.properties[field];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total >= 1) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      milesInstalled: function(values, field, format) {

        var installed_length = 0,
            planned_length = 0,
            feetInMiles = 5280;

        angular.forEach(values, function(value, $index) {
          if (value.properties.measurement_period === 'Planning') {
            planned_length += value.properties[field];
          }
          else if (value.properties.measurement_period === 'Installation') {
            installed_length += value.properties[field];
          }
        });

        var miles_installed = installed_length/feetInMiles,
            percentage_installed = installed_length/planned_length;

        return (format === '%') ? (percentage_installed*100) : miles_installed;
      },
      getPrePlannedLoad: function(segment, landuse, area) {

        var promise = Calculate.getLoadVariables(segment, Landuse[landuse.toLowerCase()]).$promise.then(function(efficiency) {
          console.log('Efficienies selected', area, efficiency);
          return Calculate.getLoadTotals(area, efficiency.features[0].properties);
        });

        return promise;
      }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('LivestockExclusionReportController', function (Account, Calculate, CalculateLivestockExclusion, Efficiency, LoadData, $location, practice, PracticeLivestockExclusion, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.newLanduse = 'hyo';

    //
    // Temporary Fix
    //
    self.practice_efficiency = {
      s_efficiency: 30/100,
      n_efficiency: 9/100,
      p_efficiency: 24/100
    };

    self.grass_efficiency = {
      s_efficiency: 60/100,
      n_efficiency: 21/100,
      p_efficiency: 45/100
    };

    self.forest_efficiency = {
      s_efficiency: 60/100,
      n_efficiency: 21/100,
      p_efficiency: 45/100
    };

    self.calculate = Calculate;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            self.calculateLivestockExclusion = CalculateLivestockExclusion;

            self.calculateLivestockExclusion.GetLoadVariables = function(period, landuse) {

              var planned = {
                width: 0,
                length: 0,
                area: 0,
                landuse: '',
                segment: self.site.properties.segment.properties.hgmr_code,
                efficieny: null
              };

              var deferred = $q.defer();

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === period) {

                  planned.length = reading.properties.length_of_fencing;
                  planned.width = reading.properties.average_buffer_width;
                  planned.area = ((planned.length*planned.width)/43560);
                  planned.landuse = (landuse) ? landuse : reading.properties.existing_riparian_landuse;

                  var promise = LoadData.query({
                      q: {
                        filters: [
                          {
                            name: 'land_river_segment',
                            op: 'eq',
                            val: planned.segment
                          },
                          {
                            name: 'landuse',
                            op: 'eq',
                            val: planned.landuse
                          }
                        ]
                      }
                    }).$promise.then(function(successResponse) {
                      planned.efficieny = successResponse.features[0].properties;
                      deferred.resolve(planned);
                    });
                }
              });

              return deferred.promise;
            };

            self.calculateLivestockExclusion.GetPreInstallationLoad = function() {

              var rotationalGrazingArea, existingLanduseType, uplandLanduseType, animal, auDaysYr;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                   rotationalGrazingArea = (reading.properties.length_of_fencing*200/43560);
                   existingLanduseType = reading.properties.existing_riparian_landuse;
                   uplandLanduseType = reading.properties.upland_landuse;
                   animal = reading.properties.animal_type;
                   auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
                }
              });

              self.calculateLivestockExclusion.GetLoadVariables('Planning', existingLanduseType).then(function(existingLoaddata) {
                self.calculateLivestockExclusion.GetLoadVariables('Planning', uplandLanduseType).then(function(loaddata) {

                  console.log('loaddata', loaddata, 'existingLoaddata', existingLoaddata)

                  //
                  // =X38*2*AA$10/2000 + Z34*(AA$10/2000)*(AE$5/100)
                  //
                  var uplandPreInstallationLoad = {
                    sediment: (((loaddata.area * 2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000) + rotationalGrazingArea*((loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres)/2000)*(self.practice_efficiency.s_efficiency),
                    nitrogen: (((loaddata.area * 4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres))) + rotationalGrazingArea*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)*(self.practice_efficiency.n_efficiency),
                    phosphorus: (((loaddata.area * 2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres))) + rotationalGrazingArea*((loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres))*(self.practice_efficiency.p_efficiency)
                  };

                  console.log('PRE uplandPreInstallationLoad', uplandPreInstallationLoad);

                  var existingPreInstallationLoad = {
                    sediment: ((loaddata.area*(existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres))/2000),
                    nitrogen: (loaddata.area*(existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)),
                    phosphorus: (loaddata.area*(existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres))
                  };

                  console.log('PRE existingPreInstallationLoad', existingPreInstallationLoad);

                  var directDeposit = {
                    nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
                    phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
                  };

                  console.log('directDeposit', directDeposit);

                  self.calculateLivestockExclusion.results.totalPreInstallationLoad = {
                    directDeposit: directDeposit,
                    efficieny: loaddata.efficieny,
                    uplandLanduse: uplandPreInstallationLoad,
                    existingLanduse: existingPreInstallationLoad,
                    nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen + directDeposit.nitrogen,
                    phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus + directDeposit.phosphorus,
                    sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
                  };

                });
              });

            };

            self.calculateLivestockExclusion.GetPlannedLoad = function(period) {

              var existingLanduseType, bmpEfficiency, animal, auDaysYr;

              angular.forEach(self.readings.features, function(reading, $index) {
                if (reading.properties.measurement_period === period) {
                  existingLanduseType = reading.properties.existing_riparian_landuse;
                  bmpEfficiency = (reading.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency;
                  animal = reading.properties.animal_type;
                  auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
                }
              });

              self.calculateLivestockExclusion.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
                self.calculateLivestockExclusion.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

                  Efficiency.query({
                    q: {
                      filters: [
                        {
                          name: 'cbwm_lu',
                          op: 'eq',
                          val: existingLanduseType
                        },
                        {
                          name: 'hydrogeomorphic_region',
                          op: 'eq',
                          val: self.site.properties.segment.properties.hgmr_name
                        },
                        {
                          name: 'best_management_practice_short_name',
                          op: 'eq',
                          val: (existingLanduseType === 'pas' || existingLanduseType === 'npa') ? 'ForestBuffersTrp': 'ForestBuffers'
                        }
                      ]
                    }
                  }).$promise.then(function(efficiencyResponse) {
                    // var efficiency = self.practice_efficiency = efficiencyResponse.response.features[0];

                    //
                    // EXISTING CONDITION — LOAD VALUES
                    //
                    var uplandPlannedInstallationLoad = {
                      sediment: (self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.sediment/100)*bmpEfficiency.s_efficiency,
                      nitrogen: self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.nitrogen/100*bmpEfficiency.n_efficiency,
                      phosphorus: self.calculateLivestockExclusion.results.totalPreInstallationLoad.uplandLanduse.phosphorus/100*bmpEfficiency.p_efficiency
                    };

                    console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

                    var existingPlannedInstallationLoad = {
                      sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                      nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                      phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
                    };

                    console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

                    var directDeposit = {
                      nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
                      phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
                    };

                    //
                    // PLANNED CONDITIONS — LANDUSE VALUES
                    //
                    var totals = {
                      efficiency: {
                        new: newLoaddata,
                        existing: existingLoaddata
                      },
                      directDeposit: directDeposit,
                      nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen + directDeposit.nitrogen,
                      phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus + directDeposit.phosphorus,
                      sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
                    };

                    self.calculateLivestockExclusion.results.totalPlannedLoad = totals;

                  });
                });
              });

            };


            self.calculateLivestockExclusion.quantityReductionInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total) {
                console.log('something to show');
                if (format === '%') {
                  percentage = (installed_total/planned_total);
                  console.log('percentage', (percentage*100));
                  return (percentage*100);
                } else {
                  console.log('installed_total', installed_total);
                  return installed_total;
                }
              }

              return 0;

            };

            //
            // The purpose of this function is to return a percentage of the total installed versus the amount
            // that was originally planned on being installed:
            //
            // (Installation+Installation+Installation) / Planned = % of Planned
            //
            //
            // @param (string) field
            //    The `field` parameter should be the field that you would like to get the percentage for
            //
            self.calculateLivestockExclusion.GetPercentageOfInstalled = function(field, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(self.readings.features, function(reading, $index) {

                if (reading.properties.measurement_period === 'Planning') {
                  planned_total += reading.properties[field];
                } else if (reading.properties.measurement_period === 'Installation') {
                  installed_total += reading.properties[field];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total >= 1) {
                if (format === 'percentage') {
                  percentage = (installed_total/planned_total);
                  return (percentage*100);
                } else {
                  return installed_total;
                }
              }

              return null;
            };

            self.calculateLivestockExclusion.GetSingleInstalledLoad = function(value) {

              console.log('value', value)

              /********************************************************************/
              // Setup
              /********************************************************************/

              //
              // Before we allow any of the following calculations to happen we
              // need to ensure that our basic load data has been loaded
              //
              if (!self.calculateLivestockExclusion.results.totalPlannedLoad) {
                return {
                  nitrogen: null,
                  phosphorus: null,
                  sediment: null
                };
              }

              //
              // Setup variables we will need to complete the calculation
              //
              //
              var bufferArea = (value.properties.length_of_fencing * value.properties.average_buffer_width)/43560,
                  bmpEfficiency = (value.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency,
                  newLanduseLoadData = self.calculateLivestockExclusion.results.totalPlannedLoad.efficiency.new.efficieny,
                  existingLoaddata = self.calculateLivestockExclusion.results.totalPlannedLoad.efficiency.existing.efficieny,
                  uplandLoaddata = self.calculateLivestockExclusion.results.totalPreInstallationLoad.efficieny,
                  rotationalGrazingArea = (value.properties.length_of_fencing*200/43560),
                  animal = AnimalType[value.properties.animal_type],
                  auDaysYr,
                  planningValue;

              //
              // Get Animal Unit Days/Year from Planning data
              //
              angular.forEach(self.readings.features, function(reading) {
                if (reading.properties.measurement_period === 'Planning') {
                  planningValue = reading.properties;
                  auDaysYr = (self.calculateLivestockExclusion.averageDaysPerYearInStream(reading.properties)*self.calculateLivestockExclusion.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
                }
              });

              /********************************************************************/
              // Part 1: Pre-Project Loads based on "Installed" buffer size
              /********************************************************************/

              var preUplandPreInstallationLoad = {
                sediment: (bufferArea * 2 * (uplandLoaddata.eos_tss/uplandLoaddata.eos_acres)/2000) + rotationalGrazingArea * ((uplandLoaddata.eos_tss/uplandLoaddata.eos_acres)/2000) * (self.practice_efficiency.s_efficiency),
                nitrogen: ((bufferArea * 4 * (uplandLoaddata.eos_totn/uplandLoaddata.eos_acres))) + rotationalGrazingArea*(uplandLoaddata.eos_totn/uplandLoaddata.eos_acres)*(self.practice_efficiency.n_efficiency),
                phosphorus: ((bufferArea * 2 * (uplandLoaddata.eos_totp/uplandLoaddata.eos_acres))) + rotationalGrazingArea*((uplandLoaddata.eos_totp/uplandLoaddata.eos_acres))*(self.practice_efficiency.p_efficiency)
              };

              var preExistingPreInstallationLoad = {
                sediment: ((bufferArea*(existingLoaddata.eos_tss/existingLoaddata.eos_acres))/2000),
                nitrogen: (bufferArea*(existingLoaddata.eos_totn/existingLoaddata.eos_acres)),
                phosphorus: (bufferArea*(existingLoaddata.eos_totp/existingLoaddata.eos_acres))
              };

              var preDirectDeposit = {
                nitrogen: (auDaysYr*animal.manure)*animal.total_nitrogen,
                phosphorus: (auDaysYr*animal.manure)*animal.total_phosphorus,
              };

               var preInstallationeBMPLoadTotals = {
                   nitrogen: preUplandPreInstallationLoad.nitrogen + preExistingPreInstallationLoad.nitrogen + preDirectDeposit.nitrogen,
                   phosphorus: preUplandPreInstallationLoad.phosphorus + preExistingPreInstallationLoad.phosphorus + preDirectDeposit.phosphorus,
                   sediment: preUplandPreInstallationLoad.sediment + preExistingPreInstallationLoad.sediment
               };

               console.log('preInstallationeBMPLoadTotals', preInstallationeBMPLoadTotals);

               /********************************************************************/
               // Part 2: Loads based on "Installed" buffer size
               /********************************************************************/
               var uplandPlannedInstallationLoad = {
                 sediment: preUplandPreInstallationLoad.sediment/100*bmpEfficiency.s_efficiency,
                 nitrogen: preUplandPreInstallationLoad.nitrogen/100*bmpEfficiency.n_efficiency,
                 phosphorus: preUplandPreInstallationLoad.phosphorus/100*bmpEfficiency.p_efficiency
               };

               console.log('postInstallationeBMPLoadTotals uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

               var existingPlannedInstallationLoad = {
                 sediment: ((bufferArea*((existingLoaddata.eos_tss/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_tss/newLanduseLoadData.eos_acres)))/2000),
                 nitrogen: (bufferArea*((existingLoaddata.eos_totn/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totn/newLanduseLoadData.eos_acres))),
                 phosphorus: (bufferArea*((existingLoaddata.eos_totp/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totp/newLanduseLoadData.eos_acres)))
               };

               console.log('postInstallationeBMPLoadTotals existingPlannedInstallationLoad', existingPlannedInstallationLoad);

               var directDeposit = {
                 nitrogen: preDirectDeposit.nitrogen*value.length_of_fencing/planningValue.length_of_fencing,
                 phosphorus: preDirectDeposit.phosphorus*value.length_of_fencing/planningValue.length_of_fencing,
               };

               console.log('postInstallationeBMPLoadTotals directDeposit', directDeposit);

              if (uplandPlannedInstallationLoad && existingPlannedInstallationLoad && directDeposit) {
                return {
                  nitrogen: uplandPlannedInstallationLoad.nitrogen + existingPlannedInstallationLoad.nitrogen + directDeposit.nitrogen,
                  phosphorus: uplandPlannedInstallationLoad.phosphorus + existingPlannedInstallationLoad.phosphorus + directDeposit.phosphorus,
                  sediment: uplandPlannedInstallationLoad.sediment + existingPlannedInstallationLoad.sediment
                };
              } else {
                return {
                  nitrogen: null,
                  phosphorus: null,
                  sediment: null
                };
              }
            };

            self.calculateLivestockExclusion.GetTreeDensity = function(trees, length, width) {
              return (trees/(length*width/43560));
            };

            self.calculateLivestockExclusion.GetPercentage = function(part, total) {
              return ((part/total)*100);
            };

            self.calculateLivestockExclusion.GetConversion = function(part, total) {
              return (part/total);
            };

            self.calculateLivestockExclusion.GetConversionWithArea = function(length, width, total) {
              return ((length*width)/total);
            };

            self.calculateLivestockExclusion.GetRestorationTotal = function(unit, area) {

              var total_area = 0;

              angular.forEach(self.readings.features, function(reading) {
                if (reading.properties.measurement_period === 'Installation') {
                  if (area) {
                    total_area += (reading.properties.length_of_fencing*reading.properties.average_buffer_width);
                  } else {
                    total_area += reading.properties.length_of_fencing;
                  }
                }
              });

              console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


              return (total_area/unit);
            };

            self.calculateLivestockExclusion.GetRestorationPercentage = function(unit, area) {

              var planned_area = 0,
                  total_area = self.calculateLivestockExclusion.GetRestorationTotal(unit, area);

              angular.forEach(self.readings.features, function(reading) {
                if (reading.properties.measurement_period === 'Planning') {
                  if (area) {
                    planned_area = (reading.properties.length_of_fencing*reading.properties.average_buffer_width);
                  } else {
                    planned_area = reading.properties.length_of_fencing;
                  }
                }
              });

              planned_area = (planned_area/unit);

              return ((total_area/planned_area)*100);
            };


            self.calculateLivestockExclusion.quantityBufferInstalled = function(values, element, format) {

              var planned_total = 0,
                  installed_total = 0,
                  percentage = 0;

              // Get readings organized by their Type
              angular.forEach(values, function(reading, $index) {
                if (reading.measurement_period === 'Planning') {
                  planned_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                } else if (reading.measurement_period === 'Installation') {
                  installed_total += self.calculateLivestockExclusion.GetSingleInstalledLoad(reading)[element];
                }

              });

              // Divide the Installed Total by the Planned Total to get a percentage of installed
              if (planned_total) {
                console.log('something to show');
                if (format === '%') {
                  percentage = (installed_total/planned_total);
                  console.log('percentage', (percentage*100));
                  return (percentage*100);
                } else {
                  console.log('installed_total', installed_total);
                  return installed_total;
                }
              }

              return 0;

            };

            self.calculateLivestockExclusion.results = {
              totalPreInstallationLoad: self.calculateLivestockExclusion.GetPreInstallationLoad(),
              totalPlannedLoad: self.calculateLivestockExclusion.GetPlannedLoad('Planning')
            };
          }, function(errorResponse) {

          });
      }, function(errorResponse) {
        //
      });

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

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeLivestockExclusion({
          'measurement_period': measurementPeriod,
          'report_date': new Date(),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('LivestockExclusionFormController', function (Account, animals, landuse, $location, practice, PracticeLivestockExclusion, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.landuse = landuse;
    self.animals = animals;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner', {
        templateUrl: '/modules/components/practices/modules/urban-homeowner/views/report--view.html',
        controller: 'UrbanHomeownerReportController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          readings: function(Practice, $route) {
            return Practice.urbanHomeowner({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/urban-homeowner/views/form--view.html',
        controller: 'UrbanHomeownerFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeUrbanHomeowner, $route) {
            return PracticeUrbanHomeowner.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  }]);

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name CalculateUrbanHomeowner
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateUrbanHomeowner', function() {
      return {
        gallonsReducedPerYear: function(value) {

          var rainGarden = (value.rain_garden_area/0.12)*0.623,
              rainBarrel = value.rain_barrel_drainage_area*0.156,
              permeablePavement = value.permeable_pavement_area*0.312,
              downspoutDisconnection = value.downspout_disconnection_drainage_area*0.312;

          return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection);
        },
        preInstallationNitrogenLoad: function(value, loaddata) {

          var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area)*loaddata.impervious.tn_ual,
              pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100))*loaddata.pervious.tn_ual;

          return (impervious+pervious)/43560;
        },
        preInstallationPhosphorusLoad: function(value, loaddata) {
          var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area),
              pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100));

          return ((impervious)*loaddata.impervious.tp_ual + (pervious)*loaddata.pervious.tp_ual)/43560;
        },
        plannedNitrogenLoadReduction: function(value, loaddata) {
          var rainGarden = (value.rain_garden_area/0.12)*8.710,
              rainBarrel = value.rain_barrel_drainage_area*4.360,
              permeablePavement = value.permeable_pavement_area*6.970,
              downspoutDisconnection = value.downspout_disconnection_drainage_area*6.970,
              unmPledgeArea = value.urban_nutrient_management_pledge_area*0.653,
              unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*2.180,
              conservationLandscaping = value.conservation_landscaping*3.830,
              treePlanting = value.tree_planting*0.610,
              imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tn_ual-loaddata.pervious.tn_ual);

          return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+treePlanting+imperviousCoverRemoval)/43560;
        },
        plannedPhosphorusLoadReduction: function(value, loaddata) {
          var rainGarden = (value.rain_garden_area/0.12)*1.220,
              rainBarrel = value.rain_barrel_drainage_area*0.520,
              permeablePavement = value.permeable_pavement_area*0.870,
              downspoutDisconnection = value.downspout_disconnection_drainage_area*0.870,
              unmPledgeArea = value.urban_nutrient_management_pledge_area*0.013,
              unmHighRisk = value.urban_nutrient_management_plan_area_hi_risk*0.044,
              conservationLandscaping = value.conservation_landscaping*0.170,
              imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tp_ual-loaddata.pervious.tp_ual);

          return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+imperviousCoverRemoval)/43560;
        },
        installedPhosphorusLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedPhosphorusLoadReduction(value.properties, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedPhosphorusLoadReduction(value.properties, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        installedNitrogenLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedNitrogenLoadReduction(value.properties, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedNitrogenLoadReduction(value.properties, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        reductionPracticesInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.gallonsReducedPerYear(value.properties);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.gallonsReducedPerYear(value.properties);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        treesPlanted: function(values, field, format) {

          var installed_trees = 0,
              planned_trees = 0;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned_trees += value.properties[field];
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed_trees += value.properties[field];
            }
          });

          return (format === '%') ? ((installed_trees/planned_trees)*100) : installed_trees;
        },
        acresProtected: function(value) {

          var practiceArea = (value.rain_garden_area/0.12) + value.rain_barrel_drainage_area + value.permeable_pavement_area + value.downspout_disconnection_drainage_area + value.urban_nutrient_management_pledge_area + value.urban_nutrient_management_plan_area_hi_risk + value.conservation_landscaping + value.impervious_cover_removal_area,
              treePlantingArea = value.tree_planting*100;

          return (practiceArea+treePlantingArea)/43560;
        },
        acresInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.acresProtected(value.properties);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.acresProtected(value.properties);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        quantityInstalled: function(values, field, format) {

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {

            if (reading.properties.measurement_period === 'Planning') {
              planned_total += reading.properties[field];
            } else if (reading.properties.measurement_period === 'Installation') {
              installed_total += reading.properties[field];
            }

          });

          // Divide the Installed Total by the Planned Total to get a percentage of installed
          if (planned_total >= 1) {
            if (format === '%') {
              percentage = (installed_total/planned_total);
              return (percentage*100);
            } else {
              return installed_total;
            }
          }

          return 0;
        },
        quantityCustomInstalled: function(values, field, format) {

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {

            if (reading.properties.measurement_period === 'Planning') {
              planned_total += reading.properties[field]/0.12;
            } else if (reading.properties.measurement_period === 'Installation') {
              installed_total += reading.properties[field]/0.12;
            }

          });

          // Divide the Installed Total by the Planned Total to get a percentage of installed
          if (planned_total >= 1) {
            if (format === '%') {
              percentage = (installed_total/planned_total);
              return (percentage*100);
            } else {
              return installed_total;
            }
          }

          return 0;
        }
      };
    });

}());

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:UrbanHomeownerReportController
 * @description
 * # UrbanHomeownerReportController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('UrbanHomeownerReportController', function (Account, Calculate, CalculateUrbanHomeowner, $location, moment, practice, PracticeUrbanHomeowner, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };
    self.calculate = Calculate;
    self.calculateUrbanHomeowner = CalculateUrbanHomeowner;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              console.log('saveToPdf')
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        //
        // After we have returned the Site.$promise we can look up our Site
        // specific load data
        //
        if (self.site.properties.state) {
          UALStateLoad.query({
            q: {
              filters: [
                {
                  name: 'state',
                  op: 'eq',
                  val: self.site.properties.state
                }
              ]
            }
          }, function(successResponse) {

            self.loaddata = {};

            angular.forEach(successResponse.features, function(feature, $index) {
              self.loaddata[feature.properties.developed_type] = {
                tn_ual: feature.properties.tn_ual,
                tp_ual: feature.properties.tp_ual,
                tss_ual: feature.properties.tss_ual
              };
            });

          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        } else {
          console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        }

      }, function(errorResponse) {
        //
      });

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

    readings.$promise.then(function(successResponse) {

      self.readings = successResponse;

      self.total = {
        planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
        installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
        monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
      };

    }, function(errorResponse) {

    });

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeUrbanHomeowner({
          'measurement_period': measurementPeriod,
          'report_date': moment().format('YYYY-MM-DD'),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:UrbanHomeownerFormController
 * @description
 * # UrbanHomeownerFormController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('UrbanHomeownerFormController', function (Account, $location, moment, practice, PracticeUrbanHomeowner, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

'use strict';

/**
 * @ngdoc overview
 * @name FieldDoc
 * @description
 * # FieldDoc
 *
 * Main module of the application.
 */
angular.module('FieldDoc')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bioretention', {
        templateUrl: '/modules/components/practices/modules/bioretention/views/report--view.html',
        controller: 'BioretentionReportController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          readings: function(Practice, $route) {
            return Practice.bioretention({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bioretention/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/bioretention/views/form--view.html',
        controller: 'BioretentionFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeBioretention, $route) {
            return PracticeBioretention.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  }]);

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateBioretention
   * @description
   * Service in the FieldDoc.
   */
  angular.module('FieldDoc')
    .service('CalculateBioretention', function() {
      return {
        adjustorCurveNitrogen: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value),
              first = 0.0308*Math.pow(depthTreated, 5),
              second = 0.2562*Math.pow(depthTreated, 4),
              third = 0.8634*Math.pow(depthTreated, 3),
              fourth = 1.5285*Math.pow(depthTreated, 2),
              fifth = 1.501*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.013);

              console.log('runoffVolumeCaptured', runoffVolumeCaptured);

          return (format === '%') ? reduction*100 : reduction;
        },
        adjustorCurvePhosphorus: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value), // we need to make sure that this number is 0 before actually doing the rest of the calculation
              first = 0.0304*Math.pow(depthTreated, 5),
              second = 0.2619*Math.pow(depthTreated, 4),
              third = 0.9161*Math.pow(depthTreated, 3),
              fourth = 1.6837*Math.pow(depthTreated, 2),
              fifth = 1.7072*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.0091);

          return (format === '%') ? reduction*100 : reduction;
        },
        adjustorCurveSediment: function(value, format) {

          var self = this,
              depthTreated = value.properties.installation_rainfall_depth_treated, // Make sure we change this in the database
              runoffVolumeCaptured = self.runoffVolumeCaptured(value), // we need to make sure that this number is 0 before actually doing the rest of the calculation
              first = 0.0326*Math.pow(depthTreated, 5),
              second = 0.2806*Math.pow(depthTreated, 4),
              third = 0.9816*Math.pow(depthTreated, 3),
              fourth = 1.8039*Math.pow(depthTreated, 2),
              fifth = 1.8292*depthTreated,
              reduction = (first-second+third-fourth+fifth-0.0098);

          return (format === '%') ? reduction*100 : reduction;
        },
        rainfallDepthTreated: function(value) {
          return (value.properties.installation_rainfall_depth_treated/(value.properties.installation_bioretention_impervious_area/43560))*12;
        },
        gallonsReducedPerYear: function(value) {
          var runoffVolumeCaptured = this.runoffVolumeCaptured(value);

          return (runoffVolumeCaptured*325851.4);
        },
        preInstallationNitrogenLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tn_ual))/43560;
        },
        preInstallationPhosphorusLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tp_ual))/43560;
        },
        preInstallationSedimentLoad: function(value, loaddata) {
          return ((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tss_ual))/43560;
        },
        plannedNitrogenLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tn_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tn_ual))*this.adjustorCurveNitrogen(value))/43560;
        },
        plannedPhosphorusLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tp_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tp_ual))*this.adjustorCurvePhosphorus(value))/43560;
        },
        plannedSedimentLoadReduction: function(value, loaddata) {
          return (((value.properties.installation_bioretention_impervious_area*loaddata.impervious.tss_ual) + ((value.properties.installation_bioretention_total_drainage_area-value.properties.installation_bioretention_impervious_area)*loaddata.pervious.tss_ual))*this.adjustorCurveSediment(value))/43560;
        },
        installedPhosphorusLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedPhosphorusLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedPhosphorusLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        installedNitrogenLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedNitrogenLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedNitrogenLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        installedSedimentLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedSedimentLoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedSedimentLoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        reductionPracticesInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.gallonsReducedPerYear(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.gallonsReducedPerYear(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        acresProtected: function(value) {
          return (value.properties.installation_bioretention_total_drainage_area/43560);
        },
        acresInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.acresProtected(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.acresProtected(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        quantityInstalled: function(values, field, format) {

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {

            if (reading.properties.measurement_period === 'Planning') {
              planned_total += reading.properties[field];
            } else if (reading.properties.measurement_period === 'Installation') {
              installed_total += reading.properties[field];
            }

          });

          // Divide the Installed Total by the Planned Total to get a percentage of installed
          if (planned_total >= 1) {
            if (format === '%') {
              percentage = (installed_total/planned_total);
              return (percentage*100);
            } else {
              return installed_total;
            }
          }

          return 0;
        },
        runoffVolumeCaptured: function(value) {
          return (value.properties.installation_rainfall_depth_treated*value.properties.installation_bioretention_impervious_area)/(12*43560);
        }
      };
    });

}());

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:BioretentionReportController
 * @description
 * # BioretentionReportController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('BioretentionReportController', function (Account, Calculate, CalculateBioretention, $location, moment, practice, PracticeBioretention, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.calculate = Calculate;
    self.calculateBioretention = CalculateBioretention;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        //
        // After we have returned the Site.$promise we can look up our Site
        // specific load data
        //
        if (self.site.properties.state) {
          UALStateLoad.query({
            q: {
              filters: [
                {
                  name: 'state',
                  op: 'eq',
                  val: self.site.properties.state
                }
              ]
            }
          }, function(successResponse) {

            self.loaddata = {};

            angular.forEach(successResponse.features, function(feature, $index) {
              self.loaddata[feature.properties.developed_type] = {
                tn_ual: feature.properties.tn_ual,
                tp_ual: feature.properties.tp_ual,
                tss_ual: feature.properties.tss_ual
              };
            });

          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        } else {
          console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        }

      }, function(errorResponse) {
        //
      });

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

    readings.$promise.then(function(successResponse) {

      self.readings = successResponse;

      self.total = {
        planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
        installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
        monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
      };

    }, function(errorResponse) {

    });

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeBioretention({
          'measurement_period': measurementPeriod,
          'report_date': moment().format('YYYY-MM-DD'),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:BioretentionFormController
 * @description
 * # BioretentionFormController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('BioretentionFormController', function (Account, $location, moment, practice, PracticeBioretention, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat', {
          templateUrl: '/modules/components/practices/modules/instream-habitat/views/report--view.html',
          controller: 'InstreamHabitatReportController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            readings: function(Practice, $route) {
              return Practice.instreamHabitat({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/instream-habitat/views/form--view.html',
          controller: 'InstreamHabitatFormController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            report: function(PracticeInstreamHabitat, $route) {
              return PracticeInstreamHabitat.get({
                id: $route.current.params.reportId
              });
            }
          }
        });

    });


}());

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .service('CalculateInstreamHabitat', function() {
    return {
      quantityInstalled: function(values, field, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.measurement_period === 'Planning') {
            planned_total += reading[field];
          } else if (reading.measurement_period === 'Installation') {
            installed_total += reading[field];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      }
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('InstreamHabitatReportController', function (Account, Calculate, CalculateInstreamHabitat, $location, practice, PracticeInstreamHabitat, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.calculate = Calculate;
    self.calculateInstreamHabitat = CalculateInstreamHabitat;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        //
        // After we have returned the Site.$promise we can look up our Site
        // specific load data
        //
        // if (self.site.properties.state) {
        //   UALStateLoad.query({
        //     q: {
        //       filters: [
        //         {
        //           name: 'state',
        //           op: 'eq',
        //           val: self.site.properties.state
        //         }
        //       ]
        //     }
        //   }, function(successResponse) {
        //
        //     self.loaddata = {};
        //
        //     angular.forEach(successResponse.features, function(feature, $index) {
        //       self.loaddata[feature.properties.developed_type] = {
        //         tn_ual: feature.properties.tn_ual,
        //         tp_ual: feature.properties.tp_ual,
        //         tss_ual: feature.properties.tss_ual
        //       };
        //     });
        //
        //   }, function(errorResponse) {
        //     console.log('errorResponse', errorResponse);
        //   });
        // } else {
        //   console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        // }

      }, function(errorResponse) {
        //
      });

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

    readings.$promise.then(function(successResponse) {

      self.readings = successResponse;

      self.total = {
        planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
        installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
        monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
      };

    }, function(errorResponse) {

    });

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeInstreamHabitat({
          'measurement_period': measurementPeriod,
          'report_date': new Date(),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };
  });

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('InstreamHabitatFormController', function (Account, $location, practice, PracticeInstreamHabitat, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.options = {
      structureTypes: [
        'Drop Structure',
        'Vanes',
        'Porous Weirs',
        'Roughened Channels/Constructed Riffles',
        'Boulder Placement',
        'Rootwad Revetment'
      ],
      habitatAssessmentTypes: [
        'Rapid Bioassessment Protocol II',
        'SaveOurStreams',
        'Maryland Biological Stream Survey',
        'Unified Stream Assessment'
      ]
    };

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

'use strict';

/**
 * @ngdoc overview
 * @name
 * @description
 */
angular.module('FieldDoc')
  .config(function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bank-stabilization', {
        templateUrl: '/modules/components/practices/modules/bank-stabilization/views/report--view.html',
        controller: 'BankStabilizationReportController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          readings: function(Practice, $route) {
            return Practice.bankStabilization({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bank-stabilization/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/bank-stabilization/views/form--view.html',
        controller: 'BankStabilizationFormController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          site: function(Site, $route) {
            return Site.get({
              id: $route.current.params.siteId
            });
          },
          practice: function(Practice, $route) {
            return Practice.get({
              id: $route.current.params.practiceId
            });
          },
          report: function(PracticeBankStabilization, $route) {
            return PracticeBankStabilization.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  });

'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .service('CalculateBankStabilization', function() {
    return {
      preInstallationSedimentLoad: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = value.properties.installation_lateral_erosion_rate,
            soilDensity = value.properties.installation_soil_bulk_density,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return (loadTotal)/2000;
      },
      plannedSedimentLoadReduction: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = (parseFloat(value.properties.installation_lateral_erosion_rate)-0.02),
            soilDensity = value.properties.installation_soil_bulk_density,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return (loadTotal)/2000;
      },
      installedSedimentLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.plannedSedimentLoadReduction(reading);
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.plannedSedimentLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      preInstallationNitrogenLoad: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = value.properties.installation_lateral_erosion_rate,
            soilDensity = value.properties.installation_soil_bulk_density,
            soilNDensity = value.properties.installation_soil_n_content,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilNDensity;
      },
      plannedNitrogenLoadReduction: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = (value.properties.installation_lateral_erosion_rate-0.02),
            soilDensity = value.properties.installation_soil_bulk_density,
            soilNDensity = value.properties.installation_soil_n_content,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilNDensity;
      },
      installedNitrogenLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.plannedNitrogenLoadReduction(reading);
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.plannedNitrogenLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      preInstallationPhosphorusLoad: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = value.properties.installation_lateral_erosion_rate,
            soilDensity = value.properties.installation_soil_bulk_density,
            soilPDensity = value.properties.installation_soil_p_content,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilPDensity;
      },
      plannedPhosphorusLoadReduction: function(value) {

        var baseLength = value.properties.installation_length_of_streambank,
            ler = (value.properties.installation_lateral_erosion_rate-0.02),
            soilDensity = value.properties.installation_soil_bulk_density,
            soilPDensity = value.properties.installation_soil_p_content,
            squareRoot = Math.sqrt((value.properties.installation_eroding_bank_height*value.properties.installation_eroding_bank_height)+(value.properties.installation_eroding_bank_horizontal_width*value.properties.installation_eroding_bank_horizontal_width)),
            loadTotal = baseLength*squareRoot*ler*soilDensity;

        return ((loadTotal)/2000)*soilPDensity;
      },
      installedPhosphorusLoadReduction: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.plannedPhosphorusLoadReduction(reading);
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.plannedPhosphorusLoadReduction(reading);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      milesStreambankRestored: function(value) {
        return (value.properties.installation_length_of_streambank/5280);
      },
      milesStreambankInstalledFromPlan: function(values, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += (reading.properties.installation_length_of_streambank/5280);
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += (reading.properties.installation_length_of_streambank/5280);
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          percentage = (installed_total/planned_total);
          return (percentage*100);
        } else {
          return installed_total;
        }

        return 0;
      },
      quantityInstalled: function(values, field, format) {

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            planned_total += reading.properties[field];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += reading.properties[field];
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total >= 1) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      }
    };
  });

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('BankStabilizationReportController', function (Account, Calculate, CalculateBankStabilization, $location, moment, practice, PracticeBankStabilization, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.calculate = Calculate;
    self.calculateBankStabilization = CalculateBankStabilization;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        //
        // After we have returned the Site.$promise we can look up our Site
        // specific load data
        //
        if (self.site.properties.state) {
          UALStateLoad.query({
            q: {
              filters: [
                {
                  name: 'state',
                  op: 'eq',
                  val: self.site.properties.state
                }
              ]
            }
          }, function(successResponse) {

            self.loaddata = {};

            angular.forEach(successResponse.features, function(feature, $index) {
              self.loaddata[feature.properties.developed_type] = {
                tn_ual: feature.properties.tn_ual,
                tp_ual: feature.properties.tp_ual,
                tss_ual: feature.properties.tss_ual
              };
            });

          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        } else {
          console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        }

      }, function(errorResponse) {
        //
      });

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

    readings.$promise.then(function(successResponse) {

      self.readings = successResponse;

      self.total = {
        planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
        installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
        monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
      };

    }, function(errorResponse) {

    });

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeBankStabilization({
          'measurement_period': measurementPeriod,
          'report_date': moment().format('YYYY-MM-DD'),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:BankStabilizationFormController
 * @description
 * # BankStabilizationFormController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('BankStabilizationFormController', function (Account, $location, moment, practice, PracticeBankStabilization, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider, commonscloud) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration', {
          templateUrl: '/modules/components/practices/modules/enhanced-stream-restoration/views/report--view.html',
          controller: 'EnhancedStreamRestorationReportController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            readings: function(Practice, $route) {
              return Practice.enhancedStreamRestoration({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/enhanced-stream-restoration/views/form--view.html',
          controller: 'EnhancedStreamRestorationFormController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            site: function(Site, $route) {
              return Site.get({
                id: $route.current.params.siteId
              });
            },
            practice: function(Practice, $route) {
              return Practice.get({
                id: $route.current.params.practiceId
              });
            },
            report: function(PracticeEnhancedStreamRestoration, $route) {
              return PracticeEnhancedStreamRestoration.get({
                id: $route.current.params.reportId
              });
            }
          }
        });

    });


}());

(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateEnhancedStreamRestoration', function($q) {
      return {
        efficiency: {
          n_eff: 0.2,
          p_eff: 0.3,
          s_eff: 0.2
        },
        bankHeightRatio: function(bankHeight, bankfullHeight) {

          var behi = 0;

          if (bankHeight) {
            behi = (bankHeight/bankfullHeight);
          }

          return behi;

        },
        fractionRunoffTreatedByFloodplain: function(fractionInChannel, fractionRunoffTreated) {

          var fraction = 0;

          //
          // =(POWER(D73,2)+0.3*D73-0.98)*POWER(D74,2)+(-2.35*D73+2)*D74
          //
          if (fractionInChannel && fractionRunoffTreated) {
            fraction = (Math.pow(fractionInChannel, 2)+0.3*fractionInChannel-0.98)*Math.pow(fractionRunoffTreated,2)+(-2.35*fractionInChannel+2)*fractionRunoffTreated;
          }

          return fraction;

        },
        plannedNitrogenProtocol2LoadReduction: function(value, loaddata) {

          var self = this,
              bulkDensity = 125,
              nitrogen = 0,
              leftBehi = self.bankHeightRatio(value.properties.project_left_bank_height, value.properties.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.properties.project_right_bank_height, value.properties.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.properties.length_of_left_bank_with_improved_connectivity*(value.properties.stream_width_at_mean_base_flow/2+5);
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.properties.length_of_right_bank_with_improved_connectivity*(value.properties.stream_width_at_mean_base_flow/2+5);
          }

          //
          // =((IF(E64<1.1,E56*(E55/2+5),0)+IF(E65<1.1,E59*(E55/2+5),0))*5*$D63/2000)*0.000195*365
          //
          nitrogen = ((leftBank+rightBank)*5*bulkDensity/2000)*0.000195*365;

          return nitrogen;

        },
        installedNitrogenProtocol2LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedNitrogenProtocol2LoadReduction(value, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedNitrogenProtocol2LoadReduction(value, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        plannedNitrogenProtocol3LoadReduction: function(readings, loaddata) {

          var self = this,
              nitrogen = 0,
              preProjectData = null,
              planningData = null;

          //
          // Before we move on we need to make sure we have the appropriate
          // pre-project data which impacts the rest of the calculation
          //
          angular.forEach(readings, function(value, $index) {
            if (value && value.properties && value.properties.measurement_period === 'Pre-Project') {
              preProjectData = value.properties;
            }
            else if (value && value.properties && value.properties.measurement_period === 'Planning') {
              planningData = value.properties;
            }
          });

          //
          // =IF(E75>0,(E75-D75)*$B$43*(E71*$B$46+E72*$B$47),"")
          //
          if (preProjectData && planningData) {
            var plannedRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(planningData.rainfall_depth_where_connection_occurs, planningData.floodplain_connection_volume)),
                preprojectRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(preProjectData.rainfall_depth_where_connection_occurs, preProjectData.floodplain_connection_volume));

            nitrogen = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.n_eff*(planningData.watershed_impervious_area*parseFloat(loaddata.impervious.tn_ual)+planningData.watershed_pervious_area*parseFloat(loaddata.pervious.tn_ual));
          }

          return nitrogen;

        },
        installedNitrogenProtocol3LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedNitrogenProtocol3LoadReduction(values, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedNitrogenProtocol3LoadReduction(values, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        plannedPhosphorusProtocol3LoadReduction: function(readings, loaddata) {

          var self = this,
              phosphorus = 0,
              preProjectData = null,
              planningData = null;

          //
          // Before we move on we need to make sure we have the appropriate
          // pre-project data which impacts the rest of the calculation
          //
          angular.forEach(readings, function(value, $index) {
            if (value && value.properties && value.properties.measurement_period === 'Pre-Project') {
              preProjectData = value.properties;
            }
            else if (value && value.properties && value.properties.measurement_period === 'Planning') {
              planningData = value.properties;
            }
          });

          //
          // =IF(E75>0,(E75-D75)*$B$43*(E71*$B$46+E72*$B$47),"")
          //
          if (preProjectData && planningData) {
            var plannedRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(planningData.rainfall_depth_where_connection_occurs, planningData.floodplain_connection_volume)),
                preprojectRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(preProjectData.rainfall_depth_where_connection_occurs, preProjectData.floodplain_connection_volume));

            phosphorus = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.p_eff*(planningData.watershed_impervious_area*parseFloat(loaddata.impervious.tp_ual)+planningData.watershed_pervious_area*parseFloat(loaddata.pervious.tp_ual));
          }

          return phosphorus;

        },
        installedPhosphorusProtocol3LoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedPhosphorusProtocol3LoadReduction(values, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedPhosphorusProtocol3LoadReduction(values, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        plannedSedimentLoadReduction: function(readings, loaddata) {

          var self = this,
              sediment = 0,
              preProjectData = null,
              planningData = null;

          //
          // Before we move on we need to make sure we have the appropriate
          // pre-project data which impacts the rest of the calculation
          //
          angular.forEach(readings, function(value, $index) {
            if (value && value.properties && value.properties.measurement_period === 'Pre-Project') {
              preProjectData = value.properties;
            }
            else if (value && value.properties && value.properties.measurement_period === 'Planning') {
              planningData = value.properties;
            }
          });

          //
          // (E75-D75)*$D$43*(E71*$D$46+E72*$D$47)/2000
          //
          if (preProjectData && planningData) {
            var plannedRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(planningData.rainfall_depth_where_connection_occurs, planningData.floodplain_connection_volume)),
                preprojectRunoffFraction = parseFloat(self.fractionRunoffTreatedByFloodplain(preProjectData.rainfall_depth_where_connection_occurs, preProjectData.floodplain_connection_volume));

            sediment = (plannedRunoffFraction-preprojectRunoffFraction)*self.efficiency.s_eff*(planningData.watershed_impervious_area*parseFloat(loaddata.impervious.tss_ual)+planningData.watershed_pervious_area*parseFloat(loaddata.pervious.tss_ual))/2000;
          }

          return sediment;

        },
        installedSedimentLoadReduction: function(values, loaddata, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.plannedSedimentLoadReduction(values, loaddata);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.plannedSedimentLoadReduction(values, loaddata);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        milesOfStreambankRestored: function(value) {

          var self = this,
              miles = 0,
              leftBehi = self.bankHeightRatio(value.properties.project_left_bank_height, value.properties.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.properties.project_right_bank_height, value.properties.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.properties.length_of_left_bank_with_improved_connectivity;
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.properties.length_of_right_bank_with_improved_connectivity;
          }

          //
          // =(IF(E64<1.1,E56,0)+IF(E65<1.1,E59,0)+E68)/5280
          //
          miles = ((leftBank+rightBank+value.properties.stream_length_reconnected_at_floodplain)/5280);

          return miles;

        },
        milesOfStreambankRestoredInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.milesOfStreambankRestored(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.milesOfStreambankRestored(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        acresTreated: function(value) {

          var self = this,
              acres = 0,
              leftBehi = self.bankHeightRatio(value.properties.project_left_bank_height, value.properties.left_bank_bankfull_height),
              rightBehi = self.bankHeightRatio(value.properties.project_right_bank_height, value.properties.right_bank_bankfull_height),
              leftBank = 0,
              rightBank = 0;

          //
          // Left Bank Modifier
          //
          if (leftBehi < 1.1) {
            leftBank = value.properties.length_of_left_bank_with_improved_connectivity;
          }

          //
          // Right Bank Modifier
          //
          if (rightBehi < 1.1) {
            rightBank = value.properties.length_of_right_bank_with_improved_connectivity;
          }

          //
          // =(
          //   IF(E64<1.1,E56*(E55/2+5),0)
          //  +IF(E65<1.1,E59*(E55/2+5),0)
          // )/43560
          //
          acres = (((leftBank*(value.properties.stream_width_at_mean_base_flow/2+5))+(rightBank*(value.properties.stream_width_at_mean_base_flow/2+5))+value.properties.stream_length_reconnected_at_floodplain)/43560);

          return acres;

        },
        acresTreatedInstalled: function(values, format) {

          var installed = 0,
              planned = 0,
              self = this;

          angular.forEach(values, function(value, $index) {
            if (value.properties.measurement_period === 'Planning') {
              planned += self.acresTreated(value);
            }
            else if (value.properties.measurement_period === 'Installation') {
              installed += self.acresTreated(value);
            }
          });

          var percentage_installed = installed/planned;

          return (format === '%') ? (percentage_installed*100) : installed;
        },
        quantityInstalled: function(values, field, format) {

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {
            if (reading.properties.measurement_period === 'Planning') {
              planned_total += reading.properties[field];
            } else if (reading.properties.measurement_period === 'Installation') {
              installed_total += reading.properties[field];
            }

          });

          // Divide the Installed Total by the Planned Total to get a percentage of installed
          if (planned_total) {
            if (format === '%') {
              percentage = (installed_total/planned_total);
              return (percentage*100);
            } else {
              return installed_total;
            }
          }

          return 0;
        }
      };
    });

}());

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('EnhancedStreamRestorationReportController', function (Account, Calculate, CalculateEnhancedStreamRestoration, $location, practice, PracticeEnhancedStreamRestoration, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    self.calculate = Calculate;
    self.calculateEnhancedStreamRestoration = CalculateEnhancedStreamRestoration;

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        $rootScope.page.title = self.practice.properties.practice_type;
        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              type: 'active'
            }
        ];

        $rootScope.page.actions = [
          {
            type: 'button-link',
            action: function() {
              $window.print();
            },
            hideIcon: true,
            text: 'Print'
          },
          {
            type: 'button-link',
            action: function() {
              $scope.$emit('saveToPdf');
            },
            hideIcon: true,
            text: 'Save as PDF'
          },
          {
            type: 'button-link new',
            action: function() {
              self.addReading();
            },
            text: 'Add Measurement Data'
          }
        ];

        //
        // After we have returned the Site.$promise we can look up our Site
        // specific load data
        //
        if (self.site.properties.state) {
          UALStateLoad.query({
            q: {
              filters: [
                {
                  name: 'state',
                  op: 'eq',
                  val: self.site.properties.state
                }
              ]
            }
          }, function(successResponse) {

            self.loaddata = {};

            angular.forEach(successResponse.features, function(feature, $index) {
              self.loaddata[feature.properties.developed_type] = {
                tn_ual: feature.properties.tn_ual,
                tp_ual: feature.properties.tp_ual,
                tss_ual: feature.properties.tss_ual
              };
            });

          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        } else {
          console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        }

      }, function(errorResponse) {
        //
      });

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

    readings.$promise.then(function(successResponse) {

      self.readings = successResponse;

      self.total = {
        preproject: self.calculate.getTotalReadingsByCategory('Pre-Project', self.readings.features),
        planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
        installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
        monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
      };

    }, function(errorResponse) {

    });

    self.addReading = function(measurementPeriod) {

      var newReading = new PracticeEnhancedStreamRestoration({
          'measurement_period': measurementPeriod,
          'report_date': new Date(),
          'practice_id': practiceId,
          'account_id': self.site.properties.project.properties.account_id
        });

      newReading.$save().then(function(successResponse) {
          $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });
    };

  });

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:EnhancedStreamRestorationFormController
 * @description
 * # EnhancedStreamRestorationFormController
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('EnhancedStreamRestorationFormController', function (Account, $location, practice, PracticeEnhancedStreamRestoration, report, $rootScope, $route, site, $scope, user, Utility) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId,
        practiceId = $route.current.params.practiceId;

    $rootScope.page = {};

    self.practiceType = null;
    self.project = {
      'id': projectId
    };

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

      self.practiceType = Utility.machineName(self.practice.properties.practice_type);

      //
      //
      //
      self.template = {
        path: '/modules/components/practices/modules/' + self.practiceType + '/views/report--view.html'
      };

      //
      //
      //
      site.$promise.then(function(successResponse) {
        self.site = successResponse;

        //
        // Assign project to a scoped variable
        //
        report.$promise.then(function(successResponse) {
          self.report = successResponse;

          $rootScope.page.title = self.practice.properties.practice_type;
          $rootScope.page.links = [
              {
                  text: 'Projects',
                  url: '/projects'
              },
              {
                  text: self.site.properties.project.properties.name,
                  url: '/projects/' + projectId
              },
              {
                text: self.site.properties.name,
                url: '/projects/' + projectId + '/sites/' + siteId
              },
              {
                text: self.practice.properties.practice_type,
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + self.practice.id,
              },
              {
                text: 'Edit',
                url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + self.report.id + '/edit',
                type: 'active'
              }
          ];
        }, function(errorResponse) {
          console.error('ERROR: ', errorResponse);
        });

      }, function(errorResponse) {
        //
      });

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
                  can_edit: Account.canEdit(self.site.properties.project)
              };
          });
      }
    });

    self.saveReport = function() {
      self.report.$update().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.deleteReport = function() {
      self.report.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

  });

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.CommonsCloud
 * @description
 * # Site
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .constant('commonscloud', {
    baseurl: 'https://api.commonscloud.org/v2/',
    collections: {
      project: {
        templateId: 121,
        storage: 'type_061edec30db54fa0b96703b40af8d8ca'
      },
      site: {
        templateId: 122,
        storage: 'type_646f23aa91a64f7c89a008322f4f1093'
      },
      practice: {
        templateId: 123,
        storage: 'type_77f5c44516674e8da2532939619759dd'
      },
      land_river_segment: {
        templateId: 272,
        storage: 'type_f9d8609090494dac811e6a58eb8ef4be'
      },
      loaddata: {
        templateId: 282,
        storage: 'type_3fbea3190b634d0c9021d8e67df84187'
      },
      stateloaddata: {
        templateId: 379,
        storage: 'type_053d71f4258746ceb0bef2d914c97876'
      }
    }
  });

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.GeometryService
 * @description
 *   
 */
angular.module('FieldDoc')
  .service('commonsGeometry', ['$http', 'commonscloud', 'leafletData', function Navigation($http, commonscloud, leafletData) {
    return {
      drawGeoJSON: function(geojson, featureGroup) {

        var self = this;

        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          // $scope.geojsonToLayer(geojson, featureGroup);
          self.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);
        });
      },
      /**
       * Convert a valid GeoJSON object to a valid Leaflet/Mapbox layer so that
       * it can be displayed on a Leaflet Map
       *
       * @param (object) geojsonObject
       *    A valid GeoJson object
       *
       *    @see http://geojson.org/geojson-spec.html#geojson-objects
       *
       * @param (object) targetLayer
       *    A valid Leaflet LayerGroup or FeatureGroup
       *
       *    @see http://leafletjs.com/reference.html#layergroup
       *    @see http://leafletjs.com/reference.html#featuregroup
       *
       * @param (object) layerStyle
       *
       * @param (boolean) appendToLayer
       *    If set to `true` the object will be appended to the Group and keep
       *    all the other objects that alread exist within the provided Group,
       *    defaults to clearning all content from provided Group
       *
       * @return (implicit)
       *    Adds the requested GeoJSON to the provided layer
       *
       * @required This function requires that Leaflet be loaded into this
       *           application and depends on the AngularLeafletDirective
       *
       */
      geojsonToLayer: function(geojsonObject, targetLayer, layerStyle, appendToLayer) {

        //
        // Should this GeoJSON object be appended to all existing Features or
        // should it replace all other objects?
        //
        // Defaults to clearing the layer and adding only the new geojsonObject
        // defined in the function arguments
        //
        if (!appendToLayer) {
          targetLayer.clearLayers();
        }

        //
        // Determine if the user has defined styles to be applied to this layer
        // if not, then use our default polygon outline
        //
        layerStyle = (layerStyle) ? layerStyle: {
          stroke: true,
          fill: false,
          weight: 3,
          opacity: 1,
          color: 'rgb(255,255,255)',
          lineCap: 'square'
        };

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojsonObject, {
          style: layerStyle
        }).eachLayer(function(newLayer) {
          newLayer.addTo(targetLayer);
        });

      },
      /**
       * Retrieve a list of possible matching geometries based on user defined
       * geometry passed from application
       *
       * @param (array) requestedLocation
       *    A simple object containing a longitude and latitude.
       *
       *    @see http://leafletjs.com/reference.html#latlng-l.latlng
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       */
      intersects: function(requestedLocation, collection) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedLocation) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var ccGeometryAPI = commonscloud.baseurl.concat(collection, '/', 'intersects', '.geojson');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(ccGeometryAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'geometry': requestedLocation.lng + ' ' + requestedLocation.lat
          }
        })
          .success(function(featureCollection) {
            return featureCollection;
          })
          .error(function(data) {
            console.error('CommonsCloud Geospatial API could not return any results based on your input', data, requestedLocation);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('FieldDoc')
  .service('Map', ['mapbox', function (mapbox) {

    var self = this;

    var Map = {
      defaults: {
        scrollWheelZoom: false,
        maxZoom: 19
      },
      layers: {
        baselayers: {
          basemap: {
            name: 'Satellite Imagery',
            url: 'https://{s}.tiles.mapbox.com/v3/' + mapbox.map_id + '/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
            }
          }
        }
      },
      center: {
        lng: -76.534, 
        lat: 39.134,
        zoom: 11
      },
      styles: {
        icon: {
          parcel: {
            iconUrl: '/images/pin-l+cc0000.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: '/images/pin-l+cc0000@2x.png?access_token=' + mapbox.access_token,
            iconSize: [35, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        },
        polygon: {
          parcel: {
            stroke: true,
            fill: false,
            weight: 3,
            opacity: 1,
            color: 'rgb(255,255,255)',
            lineCap: 'square'
          },
          canopy: {
            stroke: false,
            fill: true,
            weight: 3,
            opacity: 1,
            color: 'rgb(0,204,34)',
            lineCap: 'square',
            fillOpacity: 0.6
          },
          impervious: {
            stroke: false,
            fill: true,
            weight: 3,
            opacity: 1,
            color: 'rgb(204,0,0)',
            lineCap: 'square',
            fillOpacity: 0.6
          }
        }
      },
      geojson: {}
    };
    
    return Map;
  }]);
'use strict';

/**
 * @ngdoc overview
 * @name WaterReporter
 * @description
 *     The WaterReporter Website and associated User/Manager Site
 * Main module of the application.
 */
angular
  .module('Mapbox', [
    'leaflet-directive'
  ]);

'use strict';

/*jshint camelcase: false */

/**
 * @ngdoc directive
 * @name managerApp.directive:mapboxGeocoder
 * @description
 *   The Mapbox Geocoder directive enables developers to quickly add inline
 *   geocoding capabilities to any HTML <input> or <textarea>
 */
angular.module('Mapbox')
  .directive('mapboxGeocoder', ['$compile', '$http', '$templateCache', '$timeout', 'mapbox', 'geocoding', 'TemplateLoader', function ($compile, $http, $templateCache, $timeout, mapbox, geocoding, TemplateLoader) {

    return {
        restrict: 'A',
        scope: {
          mapboxGeocoderDirection: '=?',
          mapboxGeocoderQuery: '=',
          mapboxGeocoderResponse: '=',
          mapboxGeocoderResults: '=?',
          mapboxGeocoderAppend: '=?'
        },
        link: function(scope, element, attrs) {

          //
          // Setup up our timeout and the Template we will use for display the
          // results from the Mapbox Geocoding API back to the user making the
          // Request
          //
          var timeout;

          //
          // Take the template that we loaded into $templateCache and pull
          // out the HTML that we need to create our drop down menu that
          // holds our Mapbox Geocoding API results
          //
          TemplateLoader.get('/modules/shared/mapbox/geocoderResults--view.html')
            .success(function(templateResult) {
              element.after($compile(templateResult)(scope));
            });

          //
          // This tells us if we are using the Forward, Reverse, or Batch
          // Geocoder provided by the Mapbox Geocoding API
          //
          scope.mapboxGeocoderDirection = (scope.mapboxGeocoderDirection) ? scope.mapboxGeocoderDirection: 'forward';

          //
          // Keep an eye on the Query model so that when it's updated we can
          // execute a the Reuqest agains the Mapbox Geocoding API
          //
          scope.$watch('mapboxGeocoderQuery', function(query) {

            var query_ = (scope.mapboxGeocoderAppend) ? query + ' ' + scope.mapboxGeocoderAppend : query;

            //
            // If the user types, make sure we cancel and restart the timeout
            //
            $timeout.cancel(timeout);

            //
            // If the user stops typing for 500 ms then we need to go ahead and
            // execute the query against the Mapbox Geocoding API
            //
            timeout = $timeout(function () {

              //
              // The Mapbox Geocoding Service in our application provides us
              // with a deferred promise with our Mapbox Geocoding API request
              // so that we can handle the results of that request however we
              // need to.
              //
              if (query && !scope.mapboxGeocoderResponse) {
                var results = geocoding[scope.mapboxGeocoderDirection](query_).success(function(results) {
                  scope.mapboxGeocoderResults = results;
                });
              }

            }, 500);

          });

          //
          // Geocoded Address Selection
          //
          scope.address = {
            select: function(selectedValue) {

              //
              // Assign the selected value to back to our scope. The developer
              // should be able to use the results however they like. For
              // instance they may need to use the `Response` from this request
              // to perform a query against another database for geolookup or
              // save this value to the database.
              //
              scope.mapboxGeocoderQuery = selectedValue.place_name;
              scope.mapboxGeocoderResponse = selectedValue;

              //
              // Once we're finished we need to make sure we empty the result
              // list. An empty result list will be hidden.
              //
              scope.mapboxGeocoderResults = null;
            }
          };

        }
    };
  }]);

'use strict';

/**
 * @ngdoc service
 *
 * @name cleanWaterCommunitiesApp.Geocode
 *
 * @description
 *   The Geocode Service provides access to the Mapbox Geocoding API
 *
 * @see https://www.mapbox.com/developers/api/geocoding/
 */
angular.module('Mapbox')
  .service('geocoding', ['$http', 'mapbox', function Navigation($http, mapbox) {
    return {

      /**
       * Retrieve a list of possible geocoded address from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (string) requestedLocation
       *    A simple string containing the information you wish to check
       *    against the Mapbox Geocoding API
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      forward: function(requestedLocation) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedLocation) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var mapboxGeocodingAPI = mapbox.geocodingUrl.concat(requestedLocation, '.json');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(mapboxGeocodingAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'access_token': mapbox.access_token
          }
        })
          .success(function(featureCollection) {
            return featureCollection;
          })
          .error(function(data) {
            console.error('Mapbox Geocoding API could not return any results based on your input', data);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },

      /**
       * Retrieve a list of possible addresses from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (array) requestedCoordinates
       *    A two value array containing the longitude and latitude respectively
       *
       *    Example:
       *    [
       *       '<LONGITUDE>',
       *       '<LATITUDE>',
       *    ]
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      reverse: function(requestedCoordinates) {

        //
        // Check to make sure that the string is not empty prior to submitting
        // it to the Mapbox Geocoding API
        //
        if (!requestedCoordinates) {
          return;
        }

        //
        // Created a valid Mapbox Geocoding API compatible URL
        //
        var mapboxGeocodingAPI = mapbox.geocodingUrl.concat(requestedCoordinates[0], ',', requestedCoordinates[1], '.json');

        //
        // Send a GET request to the Mapbox Geocoding API containing valid user
        // input
        //
        var promise = $http.get(mapboxGeocodingAPI, {
          params: {
            'callback': 'JSON_CALLBACK',
            'access_token': mapbox.access_token
          }
        })
          .success(function(featureCollection) {
            //
            // Return the valid GeoJSON FeatureCollection sent by Mapbox to
            // the module requesting the data with this Service
            //
            return featureCollection;
          })
          .error(function(data) {
            console.error('Mapbox Geocoding API could not return any results based on your input', data);
          });

        //
        // Always return Requests in angular.services as a `promise`
        //
        return promise;
      },

      /**
       * Retrieve a list of possible geocoded address from the Mapbox Geocoding
       * API, based on user input.
       *
       * @param (array) requestedQueries
       *    An array of up to 50 queries to perform. Each individual query
       *    should be a simple string containing the information you wish to
       *    check against the Mapbox Geocoding API
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       * @see https://www.mapbox.com/developers/api/geocoding/
       *
       */
      batch: function(requestedQueries) {
        console.log('Mapbox Geocoding Batch Geocoding not implemented, see https://www.mapbox.com/developers/api/geocoding/ for more information.');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.GeometryService
 * @description
 *
 */
angular.module('Mapbox')
  .service('mapboxGeometry', ['$http', 'leafletData', function Navigation($http, leafletData) {

    var L = L;

    return {
      drawGeoJSON: function(geojson, featureGroup, layerStyle, appendToLayer) {

        var self = this;

        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          // $scope.geojsonToLayer(geojson, featureGroup);
          self.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);
        });
      },
      /**
       * Convert a valid GeoJSON object to a valid Leaflet/Mapbox layer so that
       * it can be displayed on a Leaflet Map
       *
       * @param (object) geojsonObject
       *    A valid GeoJson object
       *
       *    @see http://geojson.org/geojson-spec.html#geojson-objects
       *
       * @param (object) targetLayer
       *    A valid Leaflet LayerGroup or FeatureGroup
       *
       *    @see http://leafletjs.com/reference.html#layergroup
       *    @see http://leafletjs.com/reference.html#featuregroup
       *
       * @param (object) layerStyle
       *
       * @param (boolean) appendToLayer
       *    If set to `true` the object will be appended to the Group and keep
       *    all the other objects that alread exist within the provided Group,
       *    defaults to clearning all content from provided Group
       *
       * @return (implicit)
       *    Adds the requested GeoJSON to the provided layer
       *
       * @required This function requires that Leaflet be loaded into this
       *           application and depends on the AngularLeafletDirective
       *
       */
      geojsonToLayer: function(geojsonObject, targetLayer, layerStyle, appendToLayer) {

        //
        // Should this GeoJSON object be appended to all existing Features or
        // should it replace all other objects?
        //
        // Defaults to clearing the layer and adding only the new geojsonObject
        // defined in the function arguments
        //
        if (!appendToLayer) {
          targetLayer.clearLayers();
        }

        //
        // Determine if the user has defined styles to be applied to this layer
        // if not, then use our default polygon outline
        //
        layerStyle = (layerStyle) ? layerStyle: {
          stroke: true,
          fill: false,
          weight: 3,
          opacity: 1,
          color: 'rgb(255,255,255)',
          lineCap: 'square'
        };

        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        L.geoJson(geojsonObject, {
          style: layerStyle
        }).eachLayer(function(newLayer) {
          newLayer.addTo(targetLayer);
          newLayer.bindPopup('<strong>' + newLayer.feature.properties.owner.properties.first_name + '</strong> reported on ' + newLayer.feature.properties.report_date + '<br /><small><a href="/reports/' + newLayer.feature.id + '">View Report</a></small>');
        });

      },
      /**
       * Retrieve a list of possible matching geometries based on user defined
       * geometry passed from application
       *
       * @param (array) requestedLocation
       *    A simple object containing a longitude and latitude.
       *
       *    @see http://leafletjs.com/reference.html#latlng-l.latlng
       *
       * @return (object) featureCollection
       *    A valid GeoJSON Feature Collection containing a list of matched
       *    addresses and their associated geographic information
       *
       */
      intersects: function(requestedLocation, collection) {

        // //
        // // Check to make sure that the string is not empty prior to submitting
        // // it to the Mapbox Geocoding API
        // //
        // if (!requestedLocation) {
        //   return;
        // }

        // //
        // // Created a valid Mapbox Geocoding API compatible URL
        // //
        // var ccGeometryAPI = commonscloud.baseurl.concat(collection, '/', 'intersects', '.geojson');

        // //
        // // Send a GET request to the Mapbox Geocoding API containing valid user
        // // input
        // //
        // var promise = $http.get(ccGeometryAPI, {
        //   params: {
        //     'callback': 'JSON_CALLBACK',
        //     'geometry': requestedLocation.lng + ' ' + requestedLocation.lat
        //   }
        // })
        //   .success(function(featureCollection) {
        //     return featureCollection;
        //   })
        //   .error(function(data) {
        //     console.error('CommonsCloud Geospatial API could not return any results based on your input', data, requestedLocation);
        //   });

        // //
        // // Always return Requests in angular.services as a `promise`
        // //
        // return promise;
      },
    };
  }]);

'use strict';

/**
 * @ngdoc service
 * @name managerApp.directive:Map
 * @description
 *   Assist Directives in loading templates
 */
angular.module('Mapbox')
  .service('Map', function (mapbox) {

    var Map = {
      defaults: {
        scrollWheelZoom: false,
        maxZoom: 19
      },
      layers: {
        baselayers: {
          basemap: {
            name: 'Streets',
            url: 'https://{s}.tiles.mapbox.com/v3/{mapid}/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              mapid: 'developedsimple.mf7anga9'
            }
          },
          satellite: {
            name: 'Satellite',
            url: 'https://{s}.tiles.mapbox.com/v3/{mapid}/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              mapid: 'developedsimple.mn44k8he'
            }
          }
        }
      },
      center: {
        lng: -77.534,
        lat: 40.834,
        zoom: 7
      },
      markers: {
           projectLoaction: {
             lng: -77.534,
             lat: 40.834,
             message: 'Drag me to your project location',
             focus: true,
             draggable: true
           }
       },
      styles: {
        icon: {
          parcel: {
            iconUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: 'https://api.tiles.mapbox.com/v4/marker/pin-l-cc0000@2x.png?access_token=' + mapbox.access_token,
            iconSize: [35, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        },
        polygon: {
          parcel: {
            stroke: true,
            fill: false,
            weight: 3,
            opacity: 1,
            color: 'rgb(255,255,255)',
            lineCap: 'square'
          },
          canopy: {
            stroke: false,
            fill: true,
            weight: 3,
            opacity: 1,
            color: 'rgb(0,204,34)',
            lineCap: 'square',
            fillOpacity: 0.6
          },
          impervious: {
            stroke: false,
            fill: true,
            weight: 3,
            opacity: 1,
            color: 'rgb(204,0,0)',
            lineCap: 'square',
            fillOpacity: 0.6
          }
        }
      },
      geojson: {}
    };

    return Map;
  });

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('Mapbox')
  .constant('mapbox', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoiZGV2ZWxvcGVkc2ltcGxlIiwiYSI6IlZGVXhnM3MifQ.Q4wmA49ggy9i1rLr8-Mc-w',
    map_id: 'developedsimple.k105bd34',
    terrain: 'developedsimple.k1054a50',
    street: 'developedsimple.k1057ndn'
  });

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.state
 * @description
 * # state
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('Mapbox')
  .constant('states', {
    list: [
      {
        abbr: 'AK',
        name: 'Alaska'
      },
      {
        abbr: 'AL',
        name: 'Alabama'
      },
      {
        abbr: 'AR',
        name: 'Arkansas'
      },
      {
        abbr: 'AZ',
        name: 'Arizona'
      },
      {
        abbr: 'CA',
        name: 'California'
      },
      {
        abbr: 'CO',
        name: 'Colorado'
      },
      {
        abbr: 'CT',
        name: 'Connecticut'
      },
      {
        abbr: 'DE',
        name: 'Delaware'
      },
      {
        abbr: 'DC',
        name: 'District of Columbia'
      },
      {
        abbr: 'FL',
        name: 'Florida'
      },
      {
        abbr: 'GA',
        name: 'Georgia'
      },
      {
        abbr: 'HI',
        name: 'Hawaii'
      },
      {
        abbr: 'IA',
        name: 'Iowa'
      },
      {
        abbr: 'ID',
        name: 'Idaho'
      },
      {
        abbr: 'IL',
        name: 'Illinois'
      },
      {
        abbr: 'IN',
        name: 'Indiana'
      },
      {
        abbr: 'KS',
        name: 'Kansas'
      },
      {
        abbr: 'KY',
        name: 'Kentucky'
      },
      {
        abbr: 'LA',
        name: 'Louisiana'
      },
      {
        abbr: 'MA',
        name: 'Massachusetts'
      },
      {
        abbr: 'MD',
        name: 'Maryland'
      },
      {
        abbr: 'ME',
        name: 'Maine'
      },
      {
        abbr: 'MI',
        name: 'Michigan'
      },
      {
        abbr: 'MN',
        name: 'Minnesota'
      },
      {
        abbr: 'MS',
        name: 'Mississippi'
      },
      {
        abbr: 'MO',
        name: 'Missouri'
      },
      {
        abbr: 'MT',
        name: 'Montana'
      },
      {
        abbr: 'NC',
        name: 'North Carolina'
      },
      {
        abbr: 'ND',
        name: 'North Dakota'
      },
      {
        abbr: 'NE',
        name: 'Nebraska'
      },
      {
        abbr: 'NH',
        name: 'New Hampshire'
      },
      {
        abbr: 'NJ',
        name: 'New Jersey'
      },
      {
        abbr: 'NM',
        name: 'New Mexico'
      },
      {
        abbr: 'NV',
        name: 'Nevada'
      },
      {
        abbr: 'NY',
        name: 'New York'
      },
      {
        abbr: 'OH',
        name: 'Ohio'
      },
      {
        abbr: 'OK',
        name: 'Oklahoma'
      },
      {
        abbr: 'OR',
        name: 'Oregon'
      },
      {
        abbr: 'PA',
        name: 'Pennsylvania'
      },
      {
        abbr: 'RI',
        name: 'Rhode Island'
      },
      {
        abbr: 'SC',
        name: 'South Carolina'
      },
      {
        abbr: 'SD',
        name: 'South Dakota'
      },
      {
        abbr: 'TN',
        name: 'Tennessee'
      },
      {
        abbr: 'TX',
        name: 'Texas'
      },
      {
        abbr: 'UT',
        name: 'Utah'
      },
      {
        abbr: 'VA',
        name: 'Virginia'
      },
      {
        abbr: 'VT',
        name: 'Vermont'
      },
      {
        abbr: 'WA',
        name: 'Washington'
      },
      {
        abbr: 'WI',
        name: 'Wisconsin'
      },
      {
        abbr: 'WV',
        name: 'West Virginia'
      },
      {
        abbr: 'WY',
        name: 'Wyoming'
      }
    ]
  });

'use strict';

angular.module('Mapbox')
  .service('TemplateLoader', function ($compile, $http, $templateCache) {
    return {
      get: function(templateUrl) {

        var promise = $http.get(templateUrl, {
            cache: $templateCache
          }).success(function(html) {
            return html;
          });

        return promise;
      }
    };
  });

'use strict';

/**
 * @ngdoc overview
 * @name WaterReporter
 * @description
 *     The WaterReporter Website and associated User/Manager Site
 * Main module of the application.
 */
angular
  .module('collaborator', []);

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('collaborator')
    .service('Collaborators', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/user'), {
        id: '@id'
      }, {
        query: {
          method: 'GET',
          isArray: false
        },
        invite: {
          method: 'POST',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/collaborator/invite')
        }
      });
    });

}());

(function() {

  'use strict';

  /*jshint camelcase: false */

  /**
   * @ngdoc directive
   * @name managerApp.directive:collaboratorInvite
   * @description
   *   The Mapbox Geocoder directive enables developers to quickly add inline
   *   geocoding capabilities to any HTML <input> or <textarea>
   */
  angular.module('collaborator')
    .directive('collaboratorInvite', function (Collaborators, $compile, $http, $templateCache, $timeout, TemplateLoader) {

      return {
          restrict: 'A',
          scope: {
            collaboratorInviteQuery: '=',
            collaboratorInviteResponse: '=',
            collaboratorInviteResults: '=?'
          },
          link: function(scope, element, attrs) {

            console.log('collaboratorInvite Directive Loaded Successfully');

            //
            // Setup up our timeout and the Template we will use for display the
            // results from the Mapbox Geocoding API back to the user making the
            // Request
            //
            var timeout;

            //
            // Take the template that we loaded into $templateCache and pull
            // out the HTML that we need to create our drop down menu that
            // holds our Mapbox Geocoding API results
            //
            TemplateLoader.get('/modules/shared/collaborator/collaboratorInviteResults--view.html')
              .success(function(templateResult) {
                element.after($compile(templateResult)(scope));
              });

            //
            // Keep an eye on the Query model so that when it's updated we can
            // execute a the Reuqest agains the Mapbox Geocoding API
            //
            scope.$watch('collaboratorInviteQuery', function(query) {

              //
              // If the user types, make sure we cancel and restart the timeout
              //
              $timeout.cancel(timeout);

              //
              // If the user stops typing for 500 ms then we need to go ahead and
              // execute the query against the Mapbox Geocoding API
              //
              timeout = $timeout(function () {

                //
                // The Mapbox Geocoding Service in our application provides us
                // with a deferred promise with our Mapbox Geocoding API request
                // so that we can handle the results of that request however we
                // need to.
                //
                if (query && !scope.collaboratorInviteResponse) {
                  var results = Collaborators.query({
                    q: {
                      filters: [
                        {
                          name: 'email',
                          op: 'ilike',
                          val: '%' + query + '%'
                        }
                      ]
                    }
                  }).$promise.then(function(successResponse) {
                    console.log('successResponse', successResponse);
                    scope.collaboratorInviteResults = successResponse;
                  }, function(errorResponse) {
                    console.error('errorResponse', errorResponse);
                  });
                }

              }, 500);

            });

            //
            // Geocoded Address Selection
            //
            scope.option = {
              select: function(selectedValue, newUser) {

                //
                // Assign the selected value to back to our scope. The developer
                // should be able to use the results however they like. For
                // instance they may need to use the `Response` from this request
                // to perform a query against another database for geolookup or
                // save this value to the database.
                //
                if (newUser) {
                  selectedValue = {
                    properties: {
                      email: selectedValue
                    }
                  }
                }

                scope.collaboratorInviteQuery = selectedValue;
                scope.collaboratorInviteResponse = selectedValue;

                //
                // Once we're finished we need to make sure we empty the result
                // list. An empty result list will be hidden.
                //
                scope.collaboratorInviteResults = null;
              }
            };

          }
      };
    });

}());

(function () {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Notifications', function Notifications($rootScope, $timeout) {

      $rootScope.notifications = {
        objects: [],
        success: function(alertTitle, alertMessage) { // kwargs in this context should be an
          $rootScope.notifications.objects.push({
            type: 'success',
            title: (alertTitle) ? alertTitle : 'Great!',
            message: (alertMessage) ? alertMessage : 'Your report was saved.'
          });
        },
        info: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'info',
            title: (alertTitle) ? alertTitle : 'FYI',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        warning: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'warning',
            title: (alertTitle) ? alertTitle : 'Warning!',
            message: (alertMessage) ? alertMessage : ''
          });
        },
        error: function(alertTitle, alertMessage) {
          $rootScope.notifications.objects.push({
            type: 'error',
            title: (alertTitle) ? alertTitle : 'Uh-oh!',
            message: (alertMessage) ? alertMessage : 'We couldnt save your changes.'
          });
        },
        // dismiss: function($index) {
        //   $timeout(function() {
        //     $rootScope.notifications.objects.splice($index, 1);
        //   }, 5000);
        // },
        dismissAll: function() {
          $rootScope.notifications.objects = [];
        }
      };

    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name WaterReporter.report.controller:SingleReportController
   * @description
   *     Display a single report based on the current `id` provided in the URL
   * Controller of the waterReporterApp
   */
  angular.module('FieldDoc')
    .directive('fileUpload', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);

                var modelSetter = model.assign;

                element.bind('change', function() {
                    scope.$apply(function() {
                        modelSetter(scope, element[0].files);
                    });
                });
            }
        };
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
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
                if (member.id === userId) {
                    return_ = true;
                }
            });

            return return_;
      };

      Account.canEdit = function(resource) {
        if (Account.userObject && !Account.userObject.id) {
            return false;
        }

        if (Account.hasRole('admin')) {
            return true;
        } else if (Account.hasRole('manager') && Account.inGroup(resource.properties.account_id, Account.userObject.properties.account)) {
            return true;
        } else if (Account.hasRole('grantee') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
            return true;
        }

        return false;
      };

      return Account;
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('AnimalManure', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/animal-manure/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
      .service('Efficiency', function (environment, Preprocessors, $resource) {
        return $resource(environment.apiUrl.concat('/v1/data/efficiency/:id'), {
          'id': '@id'
        }, {
          'query': {
            'isArray': false
          },
          'update': {
            'method': 'PATCH',
            transformRequest: function(data) {
              var feature = Preprocessors.geojson(data);
              return angular.toJson(feature);
            }
          }
        });
      });

  }());

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('File', function (environment, Preprocessors, $resource) {

         return $resource(environment.apiUrl.concat('/v1/media/file/:id'), {
           id: '@id'
         }, {
           query: {
             isArray: false
           },
           upload: {
             method: 'POST',
             transformRequest: angular.identity,
             headers: {
               'Content-Type': undefined
             }
           },
           update: {
             method: 'PATCH',
             transformRequest: function(data) {
               var feature = Preprocessors.geojson(data);
               return angular.toJson(feature);
             }
           }
         });

       });

}());

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('Image', function (environment, Preprocessors, $resource) {

         return $resource(environment.apiUrl.concat('/v1/media/image/:id'), {
           id: '@id'
         }, {
           query: {
             isArray: false
           },
           upload: {
             method: 'POST',
             transformRequest: angular.identity,
             headers: {
               'Content-Type': undefined
             }
           },
           update: {
             method: 'PATCH',
             transformRequest: function(data) {
               var feature = Preprocessors.geojson(data);
               return angular.toJson(feature);
             }
           },
           delete: {
             method: 'DELETE',
             url: environment.apiUrl.concat('/v1/data/image/:id')
           }
         });

       });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Landuse', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/landuse/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name Media Service
     * @description Enable consistent, system-wide handling of images
     */
    angular.module('FieldDoc')
        .service('Media', function(Image, $q) {
            return {
                images: new Array(), // empty image array for handling files
                preupload: function(filesList, fieldName) {
                    /**Process all media prior to uploading to server.

                    Create a usable array of deferred requests that will allow
                    us to keep tabs on uploads, so that we know when all
                    uploads have completed with an HTTP Response.

                    @param (array) filesList
                        A list of files to process

                    @return (array) savedQueries
                        A list of deferred upload requests
                    */

                    var self = this,
                        savedQueries = [],
                        field = (fieldName) ? fieldName : 'image';

                    angular.forEach(filesList, function(_file) {
                        savedQueries.push(self.upload(_file, field));
                    });

                    return savedQueries;
                },
                upload: function(file, field) {
                    /**Upload a single file to the server.

                    Create a single deferred request that enables us to keep
                    better track of all of the things that are happening so
                    that we are defining in what order things happen.

                    @param (file) file
                        A qualified Javascript `File` object

                    @return (object) defer.promise
                        A promise
                    */

                    var defer = $q.defer(),
                        fileData = new FormData();

                    fileData.append(field, file);

                    var request = Image.upload({}, fileData, function() {
                        defer.resolve(request);
                    });

                    return defer.promise;
                },
                remove: function(fileIndex) {
                    this.images.splice(fileIndex, 1);
                }
            };
        });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('LoadData', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/load-data/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          'method': 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Practice', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/practice/:id'), {
        'id': '@id'
      }, {
        'query': {
          'isArray': false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        },
        'bankStabilization': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bank_stabilization'),
          'isArray': false
        },
        'bioretention': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_bioretention'),
          'isArray': false
        },
        'enhancedStreamRestoration': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_enhanced_stream_restoration'),
          'isArray': false
        },
        'forestBuffer': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_forest_buffer'),
          'isArray': false
        },
        'grassBuffer': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_grass_buffer'),
          'isArray': false
        },
        'instreamHabitat': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_instream_habitat'),
          'isArray': false
        },
        'livestockExclusion': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_livestock_exclusion'),
          'isArray': false
        },
        'urbanHomeowner': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_urban_homeowner'),
          'isArray': false
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeUrbanHomeowner', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-urban-homeowner/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeBioretention', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-bioretention/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeBankStabilization', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-bank-stabilization/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeEnhancedStreamRestoration', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-enhanced-stream-restoration/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeForestBuffer', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-forest-buffer/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeGrassBuffer', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-grass-buffer/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeInstreamHabitat', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-instream-habitat/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeLivestockExclusion', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-livestock-exclusion/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('PracticeWetlandsNonTidal', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-wetlands-nontidal/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Project', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/project/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        },
        sites: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/project/:id/sites')
        },
        members: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/project/:id/members')
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Security', function(environment, ipCookie, $http, $resource) {

      var Security = $resource(environment.apiUrl.concat('/v1/auth/account/login'), {}, {
        save: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/remote'),
          params: {
            response_type: 'token',
            client_id: environment.clientId,
            redirect_uri: environment.siteUrl.concat('/authorize'),
            scope: 'user',
            state: 'json'
          }
        },
        register: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/account/register')
        },
        reset: {
          method: 'POST',
          url: environment.apiUrl.concat('/v1/auth/password/reset')
        }
      });

      Security.has_token = function() {
        return (ipCookie('FIELDSTACKIO_SESSION')) ? true: false;
      };

      return Security;
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Site', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/site/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        },
        practices: {
          method: 'GET',
          isArray: false,
          url: environment.apiUrl.concat('/v1/data/site/:id/practices')
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Segment', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/segment/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        }
      });
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('UALStateLoad', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/urban-ual-state/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        }
      });
    });

}());

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.template
 * @description
 * # template
 * Provider in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('Utility', function () {

    return {
      machineName: function(name) {
        if (name) {
          var removeDashes = name.replace(/-/g, ''),
              removeSpaces = removeDashes.replace(/ /g, '-'),
              convertLowerCase = removeSpaces.toLowerCase();

          return convertLowerCase;
        }

        return null;
      }
    };

  });

(function () {

    'use strict';

    /**
     * @ngdoc function
     * @name
     * @description
     */
     angular.module('FieldDoc')
       .service('Preprocessors', function ($resource) {

         return {
           geojson: function(raw) {

             var self = this;

             if (raw && raw.id && !raw.properties) {
               return {
                 id: parseInt(raw.id)
               };
             }
             else if (raw && !raw.id && !raw.properties) {
               return;
             }

             var feature = {};

             //
             // Process all of the object, array, string, numeric, and boolean
             // fields; Adding them to the main feature object;
             //
             angular.forEach(raw.properties, function(attribute, index) {

               var value = null;

               if (angular.isArray(attribute)) {
                 var newArray = [];

                 angular.forEach(attribute, function (childObject) {
                   newArray.push(self.geojson(childObject));
                 });

                 value = newArray;
               }
               else if (angular.isObject(attribute)) {
                 value = self.geojson(attribute);
               }
               else {
                 value = attribute;
               }
               feature[index] = value;
             });

             //
             // If a `geometry` attribute is present add it to the main feature
             // object;
             //
             if (raw.geometry) {
               feature.geometry = raw.geometry;
             }

             return feature;
           }
         };

       });

}());

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('User', function (environment, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/user/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        update: {
          method: 'PATCH'
        },
        me: {
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/user/me')
        }
      });
    });

}());

(function() {

  'use strict';

  angular.module('FieldDoc')
    .directive('relationship', function (environment, $http, $timeout) {
      return {
        scope: {
          table: '=',
          field: '=',
          display: '=',
          model: '=',
          multiple: '=',
          placeholder: '='
        },
        templateUrl: '/modules/shared/directives/relationship/relationship.html',
        restrict: 'E',
        link: function (scope, el, attrs) {

          var container = el.children()[0],
              input = angular.element(container.children[0]),
              dropdown = angular.element(container.children[1]),
              timeout;

          scope.relationship_focus = false;

          var getFilteredResults = function(table){
            var url = environment.apiUrl.concat('/v1/data/', table);

            $http({
              method: 'GET',
              url: url,
              params: {
                'q': {
                  'filters':
                  [
                    {
                      'name': scope.field,
                      'op': 'ilike',
                      'val': scope.searchText + '%'
                    }
                  ]
                },
                'results_per_page': 25
              }
            }).success(function(data){

              var features = data.features;

              scope.features = [];

              //
              // Process features prior to display
              //
              angular.forEach(features, function(feature, $index) {

                var result = [];

                angular.forEach(scope.display, function(field) {
                  result.push(feature.properties[field]);
                });

                scope.features.push({
                  'id': feature.id,
                  'feature': feature,
                  'text': result.join(', ')
                });
              });

            });
          };

          var set = function(arr) {
            return arr.reduce(function (a, val) {
              if (a.indexOf(val) === -1) {
                  a.push(val);
              }
              return a;
            }, []);
          };

          //search with timeout to prevent it from firing on every keystroke
          scope.search = function(){
            $timeout.cancel(timeout);

            timeout = $timeout(function () {
              getFilteredResults(scope.table);
            }, 200);
          };

          scope.addFeatureToRelationships = function(feature){

            if (angular.isArray(scope.model)) {
              scope.model.push(feature);
              scope.model = set(scope.model);
            } else {
              scope.model = feature;
            }


            // Clear out input field
            scope.searchText = '';
            scope.features = [];
          };

          scope.removeFeatureFromRelationships = function(index) {
            scope.model.splice(index, 1);
          };

          scope.resetField = function() {
            scope.searchText = '';
            scope.features = [];
            scope.relationship_focus = false;
            console.log('Field reset');
          };

        }
      };
  });

}());

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.toAcres
 * @description
 * # toAcres
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .filter('toAcres', [function(){

    /**
     * Convert the given whole number (assuming square feet) to acres
     *
     * @param (number) squareFeet
     *    The number of square feet you wish to convert to acres
     *
     * @return (number) acres
     *    The conversion result in acres
     *
     * @see https://www.google.com/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=acres%20to%20square%20feet
     */
    return function(squareFeet) {
      var acres = (squareFeet/43560);
      return acres;
    };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .filter('toArray', function(){

    //
    // This function transforms a dictionary or object into an array
    // so that we can use Filters, OrderBy, and other repeater functionality
    // with structured objects.
    //
    return  function(object) {
      
      var result = [];

      angular.forEach(object, function(value) {
        result.push(value);
      });
      
      return result;
    };

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .filter('isArray', function() {
      return function (input) {
        return (angular.isArray(input)) ? true : false;
      };
    });

}());

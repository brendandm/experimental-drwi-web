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
    'MapboxGL',
    'MapboxGLGeocoding',
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

.constant('environment', {name:'staging',apiUrl:'http://stg.api.fielddoc.org',siteUrl:'http://stg.fielddoc.org',clientId:'lynCelX7eoAV1i7pcltLRcNXHvUDOML405kXYeJ1'})

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
                $scope.$on('saveToPdf', function(event, mass) {

                  if (!element[0]) {
                    return;
                  }
                  var pdf = new jsPDF('p', 'pt', 'letter');

                  //
                  // Make sure we modify the scale of the images.
                  //
                  pdf.internal.scaleFactor = 2.25;

                  pdf.addHTML(element[0], 0, 0, {
                    pagesplit: true
                  }, function() {
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
       .controller('SecurityRegisterController', function (Account, $location, Notifications, Security, ipCookie, $rootScope, $timeout, User) {

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
               data: {
                 email: null,
                 first_name: null,
                 last_name: null,
                 organizations: [],
                 password: null
               },
               organizations: function() {
                 var _organizations = [];

                 angular.forEach(self.register.data.organizations, function(_organization, _index) {
                   if (_organization.id) {
                     _organizations.push({
                       "id": _organization.id
                     })
                   }
                   else {
                     _organizations.push({
                       "name": _organization.properties.name
                     })
                   }
                 });

                 return _organizations;
               },
               visible: false,
               login: function(userId) {

                 var credentials = new Security({
                   email: self.register.data.email,
                   password: self.register.data.password,
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
                           first_name: self.register.data.first_name,
                           last_name: self.register.data.last_name,
                           organizations: self.register.organizations()
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
                 if (!self.register.data.email) {
                   $rootScope.notifications.warning('Email', 'field is required');

                   self.register.processing = false;

                   $timeout(function() {
                     $rootScope.notifications.objects = [];
                   }, 3500);

                   return;
                 }
                 else if (!self.register.data.password) {
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
                   email: self.register.data.email,
                   password: self.register.data.password
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

            console.log('SecurityInterceptor::Request', config || $q.when(config));

            return config || $q.when(config);
          },
          response: function(response) {
            $log.info('AuthorizationInterceptor::Response', response || $q.when(response));
            return response || $q.when(response);
          },
          responseError: function (response) {
            $log.info('AuthorizationInterceptor::ResponseError', response || $q.when(response));

            if (response.config.url.indexOf('data/user') > -1 || response.status === 403) {
              $location.path('/user/logout');
            }

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
        reloadOnSearch: false,
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
          },
          'years': function(Filters) {
            return Filters.projectsByYear();
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: '/modules/components/projects/views/projectsSummary--view.html',
        controller: 'ProjectSummaryCtrl',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(Project, $route) {
            return Project.summary({
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
  .controller('ProjectsCtrl', function (Account, $location, $log, Project, projects, $rootScope, $scope, Site, user, years) {

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
        // {
        //   type: 'button-link',
        //   action: function() {
        //     self.createPlan();
        //   },
        //   text: 'Create Pre-Project Plan'
        // },
        {
          type: 'button-link new',
          action: function() {
            self.createProject();
          },
          text: 'Create project'
        }
      ]
    };

    self.filters = {
        "active": {
            "workflow_state": null,
            "year": {
                "year": null
            },
            "sstring": null
        },
        "values": {
          "workflow_states": [
            'Draft',
            'Submitted',
            'Funded',
            'Completed'
          ],
          "years": years
        }
    };


    //
    // Project functionality
    //
    self.projects = projects;

    self.search = {
      query: '',
      execute: function(page) {

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

        if (self.filters.active.workflow_state !== null) {
          console.log('add workflow state filter')

          q.filters.push({
            "name": "workflow_state",
            "op": "like",
            "val": self.filters.active.workflow_state
          });
        }

        if (self.filters.active.year && self.filters.active.year.year) {
            q.filters.push({
              "name": "created_on",
              "op": "gte",
              "val": self.filters.active.year.year + "-01-01"
            });
            q.filters.push({
              "name": "created_on",
              "op": "lte",
              "val": self.filters.active.year.year + "-12-31"
            })
        }

        Project.query({
            "q": q,
            "page": (page ? page : 1)
          }).$promise.then(function(successResponse) {
            console.log("successResponse", successResponse);
            self.projects = successResponse;
          }, function(errorResponse) {
            console.log("errorResponse", errorResponse);
          });

      },
      paginate: function(pageNumber) {

        //
        // Get all of our existing URL Parameters so that we can
        // modify them to meet our goals
        //
        self.search.execute(pageNumber);
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
    else {
        $location.path('/user/logout');
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
  .controller('ProjectSummaryCtrl', function (Account, Notifications, $rootScope, Project, $route, $scope, $location, mapbox, summary, Site, user, $window) {

    var self = this;

    $rootScope.page = {};

    self.mapbox = mapbox;

    self.status = {
      "loading": true
    }

    //
    // Assign project to a scoped variable
    //
    summary.$promise.then(function(successResponse) {

        self.data = successResponse;
        self.project = successResponse.project;

        self.sites = successResponse.sites;

        self.practices = successResponse.practices;

        //
        // Add rollups to the page scope
        //
        self.rollups = successResponse.rollups;

        self.status.loading = false;

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
                    can_edit: Account.canEdit(self.project),
                    is_manager: (Account.hasRole('manager') || Account.inGroup(self.project.properties.account_id, Account.userObject.properties.account)),
                    is_admin: Account.hasRole('admin')
                };
            });
        }

    });

    self.submitProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Submitted"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.fundProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Funded"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.completeProject = function() {

      if (!self.project.properties.account_id) {
        $rootScope.notifications.warning("In order to submit your project, it must be associated with a Funder. Please edit your project and try again.")
        return;
      }

      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Completed"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

    self.rollbackProjectSubmission = function() {
      var _project = new Project({
        "id": self.project.id,
        "properties": {
          "workflow_state": "Draft"
        }
      })

      _project.$update(function(successResponse) {
          self.project = successResponse
        }, function(errorResponse) {

        });
    }

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
          self.createSite();
        },
        text: 'Create site'
      }
    ];

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
                    can_edit: Account.canEdit(project),
                    can_delete: Account.canDelete(project)
                };
            });
        }

    }, function(errorResponse) {
        $log.error('Unable to load request project');
    });

    self.saveProject = function() {

      self.project.properties.workflow_state = "Draft";

      // We are simply removing this from the request because we should not
      // be saving updates to the Projects Sites at this point, just the Project
      delete self.project.properties.sites;

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
              return Account.getUser();
            }
          }
        });

    });

}());

'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
  .controller('AccountEditViewController', function (Account, $location, $log, Notifications, $rootScope, $route, user, User) {

    var self = this;


    //
    // Assign project to a scoped variable
    //
    //
    // Verify Account information for proper UI element display
    //
    if (Account.userObject && user) {
        user.$promise.then(function(userResponse) {
            $rootScope.user = Account.userObject = self.user = userResponse;

            self.permissions = {
                isLoggedIn: Account.hasToken(),
                role: $rootScope.user.properties.roles[0].properties.name,
                account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
            };

            //
            // Setup page meta data
            //
            $rootScope.page = {
                "title": "Edit Account Information « FieldDoc",
                "links": [
                    {
                        "text": "Account",
                        "url": "/"
                    },
                    {
                        "text": "Edit",
                        "url": "/account/" + $rootScope.user.id + "/edit"
                    }
                ]
            };


        });


    }
    else {
        //
        // If there is not Account.userObject and no user object, then the
        // user is not properly authenticated and we should send them, at
        // minimum, back to the projects page, and have them attempt to
        // come back to this page again.
        //
        self.actions.exit();
    }



    //
    //
    //
    self.status = {
        "saving": false
    };

    self.actions = {
        organizations: function() {
          var _organizations = [];

          angular.forEach(self.user.properties.organizations, function(_organization, _index) {
            if (_organization.id) {
              _organizations.push({
                "id": _organization.id
              })
            }
            else {
              _organizations.push({
                "name": _organization.properties.name
              })
            }
          });

          return _organizations;
        },
        save: function() {

            self.status.saving = true;

            var _organizations = self.actions.organizations()

            var _user = new User({
                "id": self.user.id,
                "first_name": self.user.properties.first_name,
                "last_name": self.user.properties.last_name,
                "organizations": _organizations
            });

            _user.$update(function(successResponse) {

                self.status.saving = false;

                $rootScope.notifications.success("Great!", "Your account changes were saved");

                $location.path('/account/');

            }, function(errorResponse) {
                self.status.saving = false;
            });
        },
        exit: function() {
            $location.path('/projects');
        }
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
      .when('/projects/:projectId/sites', {
        redirectTo: '/projects/:projectId'
      })
      .when('/projects/:projectId/sites/:siteId', {
        templateUrl: '/modules/components/sites/views/sites--summary.html',
        controller: 'SiteSummaryCtrl',
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
          summary: function(Site, $route) {
            return Site.summary({
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

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:SiteSummaryCtrl
   * @description
   */
  angular.module('FieldDoc')
    .controller('SiteSummaryCtrl', function (Account, $location, mapbox, Practice, project, $rootScope, $route, summary, user) {

      var self = this;

      $rootScope.page = {};

      self.mapbox = mapbox;

      self.status = {
        "loading": true
      }

      summary.$promise.then(function(successResponse) {

        self.data = successResponse;

        self.site = successResponse.site;
        self.practices = successResponse.practices;

        //
        // Add rollups to the page scope
        //
        self.rollups = successResponse.rollups;

        //
        // Set the default tab to "All"
        //
        self.rollups.active = "all";

        self.status.loading = false;

        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {
            user.$promise.then(function(userResponse) {
                $rootScope.user = Account.userObject = userResponse;

                self.project = project;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0].properties.name,
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: Account.canEdit(self.project)
                };

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
          type: 'button-link',
          action: function() {
            $location.path('/projects/' + $route.current.params.projectId + '/sites/' + $route.current.params.siteId + '/edit');
          },
          text: 'Edit Site'
        },
        {
          type: 'button-link new',
          action: function() {
            self.createPractice();
          },
          text: 'Create practice'
        }
      ];


    });

})();

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
        } else if (!self.site.properties.county && !self.site.properties.state) {
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
        },
        getPlanningData: function(readings) {

          var planningData = {};

          angular.forEach(readings, function(reading) {
            if (reading.properties.measurement_period === 'Planning') {
              planningData = reading;
            }
          });

          return planningData;
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
  .controller('PracticeEditController', function (Account, Image, leafletData, $location, $log, Map, mapbox, Media, Practice, practice, $q, $rootScope, $route, $scope, site, user) {

    var self = this,
        projectId = $route.current.params.projectId,
        siteId = $route.current.params.siteId;

    self.files = Media;
    self.files.images = [];

    self.map = Map;
    //
    // We use this function for handle any type of geographic change, whether
    // through the map or through the fields
    //
    self.processPin = function(coordinates, zoom) {

      if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
        return;
      }

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
      self.practice.geometry = {
        type: 'GeometryCollection',
        geometries: []
      };
      self.practice.geometry.geometries.push({
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


    self.removeImage = function(image) {

      if (self.practice.properties.images.length !== 0) {
        var _image_index = self.practice.properties.images.indexOf(image);
        self.practice.properties.images.splice(_image_index, 1);
      }

      return;
    }

    $rootScope.page = {};

    practice.$promise.then(function(successResponse) {

      self.practice = successResponse;

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
          lat: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[1] : 38.362,
          lng: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[0] : -81.119,
          zoom: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? 16 : 6
        },
        markers: {
          LandRiverSegment: {
            lat: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[1] : 38.362,
            lng: (self.practice.geometry !== null && self.practice.geometry !== undefined) ? self.practice.geometry.geometries[0].coordinates[0] : -81.119,
            focus: false,
            draggable: true
          }
        }
      };

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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/agriculture-generic', {
        templateUrl: '/modules/components/practices/modules/agriculture-generic/views/summary--view.html',
        controller: 'AgricultureGenericSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeAgricultureGeneric, $route) {
            return PracticeAgricultureGeneric.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/agriculture-generic/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/agriculture-generic/views/form--view.html',
        controller: 'AgricultureGenericFormController',
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
          report: function(PracticeAgricultureGeneric, $route) {
            return PracticeAgricultureGeneric.get({
              id: $route.current.params.reportId
            });
          },
          landuse: function(Landuse) {
            return Landuse.query({
              results_per_page: 50
            });
          },
          efficiency_agriculture_generic: function(EfficiencyAgricultureGeneric) {
            return EfficiencyAgricultureGeneric.query({
              results_per_page: 150
            });
          }
        }
      });

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('AgricultureGenericFormController', function (Account, efficiency_agriculture_generic, landuse, $location, practice, PracticeAgricultureGeneric, report, $rootScope, $route, site, $scope, user, Utility) {

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

      self.efficiency_agriculture_generic = efficiency_agriculture_generic;

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
          return new Date(b[0], b[1]-1, b[2]);
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

            $rootScope.page.title = "Other Agricultural Practices";
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
                  text: "Other Agricultural Practices",
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
    .controller('AgricultureGenericSummaryController', function (Account, $location, $log, PracticeAgricultureGeneric, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.data = successResponse;
        self.summary = successResponse;

        $rootScope.page.title = "Other Agricultural Practices";

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: "Other Agricultural Practices",
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

          if (measurementPeriod === "Planning") {
            var newReading = new PracticeAgricultureGeneric({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {
            var newReading = new PracticeAgricultureGeneric({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id,
                'generic_agriculture_efficiency_id': self.summary.practice.properties.defaults.properties.generic_agriculture_efficiency_id,
                'model_type': self.summary.practice.properties.defaults.properties.model_type,
                'existing_riparian_landuse': self.summary.practice.properties.defaults.properties.existing_riparian_landuse,
                'custom_model_name': self.summary.practice.properties.defaults.properties.custom_model_name,
                'custom_model_source': self.summary.practice.properties.defaults.properties.custom_model_source,
                'custom_model_nitrogen': self.summary.practice.properties.defaults.properties.custom_model_nitrogen,
                'custom_model_phosphorus': self.summary.practice.properties.defaults.properties.custom_model_phosphorus,
                'custom_model_sediment': self.summary.practice.properties.defaults.properties.custom_model_sediment
              });

          }

          newReading.$save().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('ERROR: ', errorResponse);
            });
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
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer', {
        templateUrl: '/modules/components/practices/modules/forest-buffer/views/summary--view.html',
        controller: 'ForestBufferSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeForestBuffer, $route) {
            return PracticeForestBuffer.summary({
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
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('ForestBufferFormController', function (Account, landuse, $location, Notifications, practice, PracticeForestBuffer, report, $rootScope, $route, site, $scope, $timeout, user, Utility) {

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
      self.report = null;

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
          return new Date(b[0], b[1]-1, b[2]);
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
          if (response) {
              var _new = response.month + ' ' + response.date + ' ' + response.year,
              _date = new Date(_new);
              self.date.day = self.days[_date.getDay()];
          }
      }, true);

      $scope.$watch(angular.bind(this, function() {
          return this.report;
      }), function () {
        self.calculateBufferComposition();
      }, true);

      self.saveReport = function() {

        //
        // Before saving the report, we need warn the user if they haven't
        // entered any landuse information
        //
        if (!self.report.properties.type_of_buffer_project || !self.report.properties.existing_riparian_landuse || !self.report.properties.upland_landuse) {
          $rootScope.notifications.error('Missing Landuse Data', 'We cannot calculate your nutrient load or reductions because you didn\'t select an existing or upland landuse');

          $timeout(function() {
            $rootScope.notifications.objects = [];
          }, 7500);
        }

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

      //
      // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
      //
      self.calculateBufferComposition = function() {

        if (!self.report) {
          return false;
        }

        var running_total = self.report.properties.buffer_composition_woody + self.report.properties.buffer_composition_shrub + self.report.properties.buffer_composition_bare + self.report.properties.buffer_composition_grass;

        var remainder = 100-running_total;

        if (remainder >= 0) {
          self.report.properties.buffer_composition_other = remainder;
        } else {
          self.report.properties.buffer_composition_other = 0;
        }

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
    .controller('ForestBufferSummaryController', function (Account, $location, $log, PracticeForestBuffer, $q, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeForestBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
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
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer', {
        templateUrl: '/modules/components/practices/modules/grass-buffer/views/summary--view.html',
        controller: 'GrassBufferSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeGrassBuffer, $route) {
            return PracticeGrassBuffer.summary({
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
          return new Date(b[0], b[1]-1, b[2]);
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
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('GrassBufferSummaryController', function (Account, $location, $log, PracticeGrassBuffer, $q, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeGrassBuffer({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
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
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion', {
          templateUrl: '/modules/components/practices/modules/livestock-exclusion/views/summary--view.html',
          controller: 'LivestockExclusionSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeLivestockExclusion, $route) {
              return PracticeLivestockExclusion.summary({
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

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('LivestockExclusionSummaryController', function (Account, $location, PracticeLivestockExclusion, $q, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeLivestockExclusion({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner', {
        templateUrl: '/modules/components/practices/modules/urban-homeowner/views/summary--view.html',
        controller: 'UrbanHomeownerSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeUrbanHomeowner, $route) {
            return PracticeUrbanHomeowner.summary({
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

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('UrbanHomeownerSummaryController', function (Account, $location, $log, PracticeUrbanHomeowner, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeUrbanHomeowner({
            'measurement_period': measurementPeriod,
            'report_date': moment().format('YYYY-MM-DD'),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bioretention', {
        templateUrl: '/modules/components/practices/modules/bioretention/views/summary--view.html',
        controller: 'BioretentionSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeBioretention, $route) {
            return PracticeBioretention.summary({
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
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('BioretentionSummaryController', function (Account, $location, $log, PracticeBioretention, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;

      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeBioretention({
            'measurement_period': measurementPeriod,
            'report_date': moment().format('YYYY-MM-DD'),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
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
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat', {
          templateUrl: '/modules/components/practices/modules/instream-habitat/views/summary--view.html',
          controller: 'InstreamHabitatSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeInstreamHabitat, $route) {
              return PracticeInstreamHabitat.summary({
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
        'Mudsills',
        'Deflectors',
        'Porous Weirs',
        'Other',
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

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('InstreamHabitatSummaryController', function (Account, $location, PracticeInstreamHabitat, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeInstreamHabitat({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };
    });

}());

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
        templateUrl: '/modules/components/practices/modules/bank-stabilization/views/summary--view.html',
        controller: 'BankStabilizationSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeBankStabilization, $route) {
            return PracticeBankStabilization.summary({
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
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('BankStabilizationSummaryController', function (Account, $location, $log, PracticeBankStabilization, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeBankStabilization({
            'measurement_period': measurementPeriod,
            'report_date': moment().format('YYYY-MM-DD'),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
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
   * @ngdoc overview
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider, commonscloud) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration', {
          templateUrl: '/modules/components/practices/modules/enhanced-stream-restoration/views/summary--view.html',
          controller: 'EnhancedStreamRestorationSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeEnhancedStreamRestoration, $route) {
              return PracticeEnhancedStreamRestoration.summary({
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
                  account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
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

      var _tmp = new PracticeEnhancedStreamRestoration({
        id: self.report.id
      });
      _tmp.$delete().then(function(successResponse) {
        $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType);
      }, function(errorResponse) {
        console.error('ERROR: ', errorResponse);
      });
    };

    self.change = {
      "updateTotal": function() {

        var total_ = 0;

        total_ += self.report.properties.override_linear_feet_in_coastal_plain;
        total_ += self.report.properties.override_linear_feet_in_noncoastal_plain;

        self.report.properties.override_linear_feet_in_total = total_;
      }
    }

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('EnhancedStreamRestorationSummaryController', function (Account, $location, Practice, PracticeEnhancedStreamRestoration, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

          if (measurementPeriod === "Pre-Project") {
            var newReading = new PracticeEnhancedStreamRestoration({
                'measurement_period': measurementPeriod,
                'report_date': moment().format('YYYY-MM-DD'),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {
            var newReading = new PracticeEnhancedStreamRestoration({
                'measurement_period': measurementPeriod,
                'report_date': moment().format('YYYY-MM-DD'),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id,
                'has_majority_design_completion': self.summary.practice.properties.defaults.properties.has_majority_design_completion,
                'override_linear_feet_in_coastal_plain': self.summary.practice.properties.defaults.properties.override_linear_feet_in_coastal_plain,
                'override_linear_feet_in_noncoastal_plain': self.summary.practice.properties.defaults.properties.override_linear_feet_in_noncoastal_plain,
                'override_linear_feet_in_total': self.summary.practice.properties.defaults.properties.override_linear_feet_in_total
              });
          }

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
      };

      self.createBankStabilizationPractice = function() {
          self.practice = new Practice({
              'practice_type': 'Bank Stabilization',
              'site_id': self.summary.site.id,
              'account_id': self.summary.site.properties.project.properties.account_id
          });

          self.practice.$save(function(successResponse) {
              $location.path('/projects/' + self.summary.site.properties.project.id + '/sites/' + self.summary.site.id + '/practices/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('Unable to create your site, please try again later');
            });
      };


    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name FieldDoc
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/nontidal-wetlands', {
          templateUrl: '/modules/components/practices/modules/nontidal-wetlands/views/summary--view.html',
          controller: 'WetlandsNonTidalSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeWetlandsNonTidal, $route) {
              return PracticeWetlandsNonTidal.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/nontidal-wetlands/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/nontidal-wetlands/views/form--view.html',
          controller: 'WetlandsNonTidalFormController',
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
            report: function(PracticeWetlandsNonTidal, $route) {
              return PracticeWetlandsNonTidal.get({
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

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:WetlandsNonTidalFormController
   * @description
   */
  angular.module('FieldDoc')
    .controller('WetlandsNonTidalFormController', function (Account, Efficiency, landuse, LoadData, $location, Notifications, practice, PracticeWetlandsNonTidal, report, $rootScope, $route, site, $scope, $timeout, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      landuse.$promise.then(function(successResponse) {
        self.landuse = successResponse;

        self.getLanduseById = function(landuseId) {

          var _landuse = {};

          angular.forEach(self.landuse.features, function(thisLanduse) {
            if (thisLanduse.id === landuseId) {
              _landuse = thisLanduse;
            }
          });

          return _landuse;
        };
      });

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
          return new Date(b[0], b[1]-1, b[2]);
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

          self.segment = self.site.properties.segment.properties.hgmr_code;

          //
          // Assign project to a scoped variable
          //
          report.$promise.then(function(successResponse) {
            self.report = successResponse;

            if (self.report.properties.report_date) {
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

      /**
       * Get Load Data for specified landuse and assign it to the appropriate
       * report fields
       *
       * @param landuse (object) A fully qualitified Landuse object
       * @param objectField (string)
       * @param idField (string)
       */
      self.getLoadData = function(report, landuseField, idField) {

        console.log('report', report);

        var landuse = self.getLanduseById(report.properties[landuseField]);

        LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: self.segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                }
              ]
            }
          }, function(successResponse) {
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
          });
      };

      self.getEfficiencyData = function(report, landuseIdField, landuseField, idField) {

        var landuse = self.getLanduseById(report.properties[landuseIdField]);

        console.log('report', report);

        Efficiency.query({
            q: {
              filters: [
                {
                  name: 'type',
                  op: 'eq',
                  val: 'Efficiency'
                },
                {
                  name: 'best_management_practice_short_name',
                  op: 'eq',
                  val: (landuse.properties.landuse_type === 'urban') ? 'WetPondWetland': 'WetlandRestore'
                },
                {
                  name: 'cbwm_lu',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                },
                {
                  name: 'hydrogeomorphic_region',
                  op: 'eq',
                  val: self.site.properties.segment.properties.hgmr_name
                }
              ]
            }
          }, function(successResponse) {
            console.log('Efficiency::successResponse', successResponse);
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
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
    .controller('WetlandsNonTidalSummaryController', function (Account, $location, $log, PracticeWetlandsNonTidal, $q, $rootScope, $route, $scope, summary, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeWetlandsNonTidal({
            'measurement_period': measurementPeriod,
            'report_date': new Date(),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
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
   * @ngdoc overview
   * @name FieldDoc
   * @description
   */
  angular.module('FieldDoc')
    .config(function($routeProvider) {

      $routeProvider
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/shoreline-management', {
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/summary--view.html',
          controller: 'ShorelineManagementSummaryController',
          controllerAs: 'page',
          resolve: {
            user: function(Account) {
              if (Account.userObject && !Account.userObject.id) {
                  return Account.getUser();
              }
              return Account.userObject;
            },
            summary: function(PracticeShorelineManagement, $route) {
              return PracticeShorelineManagement.summary({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/shoreline-management/:reportId/edit', {
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/form--view.html',
          controller: 'ShorelineManagementFormController',
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
            report: function(PracticeShorelineManagement, $route) {
              return PracticeShorelineManagement.get({
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

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:WetlandsNonTidalFormController
   * @description
   */
  angular.module('FieldDoc')
    .controller('ShorelineManagementFormController', function (Account, Efficiency, landuse, LoadData, $location, Notifications, practice, report, $rootScope, $route, site, $scope, $timeout, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

      landuse.$promise.then(function(successResponse) {
        self.landuse = successResponse;

        self.getLanduseById = function(landuseId) {

          var _landuse = {};

          angular.forEach(self.landuse.features, function(thisLanduse) {
            if (thisLanduse.id === landuseId) {
              _landuse = thisLanduse;
            }
          });

          return _landuse;
        };
      });

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
          return new Date(b[0], b[1]-1, b[2]);
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

          self.segment = self.site.properties.segment.properties.hgmr_code;

          //
          // Assign project to a scoped variable
          //
          report.$promise.then(function(successResponse) {
            self.report = successResponse;

            if (self.report.properties.report_date) {
                self.today = parseISOLike(self.report.properties.report_date);
            }

            //
            // Set Default BIR Value
            //
            if (self.report && !self.report.properties.installation_bank_instability_reduction_factor) {
              self.report.properties.installation_bank_instability_reduction_factor = 1.0;
            }

            if (self.report && !self.report.properties.protocol_2_tn_reduction_rate) {
              self.report.properties.protocol_2_tn_reduction_rate = 85.0;
            }

            if (self.report && !self.report.properties.protocol_3_tp_reduction_rate) {
              self.report.properties.protocol_3_tp_reduction_rate = 5.29;
            }

            if (self.report && !self.report.properties.protocol_3_tss_reduction_rate) {
              self.report.properties.protocol_3_tss_reduction_rate = 3.9795;
            }

            if (self.report && !self.report.properties.protocol_4_tn_reduction_rate) {
              self.report.properties.protocol_4_tn_reduction_rate = 6.83;
            }

            if (self.report && !self.report.properties.protocol_4_tp_reduction_rate) {
              self.report.properties.protocol_4_tp_reduction_rate = 0.3;
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

      /**
       * Get Load Data for specified landuse and assign it to the appropriate
       * report fields
       *
       * @param landuse (object) A fully qualitified Landuse object
       * @param objectField (string)
       * @param idField (string)
       */
      self.getLoadData = function(report, landuseField, idField) {

        console.log('report', report);

        var landuse = self.getLanduseById(report.properties[landuseField]);

        LoadData.query({
            q: {
              filters: [
                {
                  name: 'land_river_segment',
                  op: 'eq',
                  val: self.segment
                },
                {
                  name: 'landuse',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                }
              ]
            }
          }, function(successResponse) {
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
          });
      };

      self.getEfficiencyData = function(report, landuseIdField, landuseField, idField) {

        var landuse = self.getLanduseById(report.properties[landuseIdField]);

        console.log('report', report);

        Efficiency.query({
            q: {
              filters: [
                {
                  name: 'type',
                  op: 'eq',
                  val: 'Efficiency'
                },
                {
                  name: 'best_management_practice_short_name',
                  op: 'eq',
                  val: (landuse.properties.landuse_type === 'urban') ? 'WetPondWetland': 'WetlandRestore'
                },
                {
                  name: 'cbwm_lu',
                  op: 'eq',
                  val: landuse.properties.landuse_code
                },
                {
                  name: 'hydrogeomorphic_region',
                  op: 'eq',
                  val: self.site.properties.segment.properties.hgmr_name
                }
              ]
            }
          }, function(successResponse) {
            console.log('Efficiency::successResponse', successResponse);
            if (successResponse.features.length) {
              self.report.properties[idField] = successResponse.features[0].id;
            } else {
              $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');

              $timeout(function() {
                $rootScope.notifications.objects = [];
              }, 3500);
            }
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
    .controller('ShorelineManagementSummaryController', function (Account, $location, $log, PracticeShorelineManagement, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeShorelineManagement({
            'measurement_period': measurementPeriod,
            'report_date': moment().format('YYYY-MM-DD'),
            'practice_id': practiceId,
            'account_id': self.summary.site.properties.project.properties.account_id
          });

        newReading.$save().then(function(successResponse) {
            $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('ERROR: ', errorResponse);
          });
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
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/stormwater', {
        templateUrl: '/modules/components/practices/modules/stormwater/views/summary--view.html',
        controller: 'StormwaterSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeStormwater, $route) {
            return PracticeStormwater.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/stormwater/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/stormwater/views/form--view.html',
        controller: 'StormwaterFormController',
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
          report: function(PracticeStormwater, $route) {
            return PracticeStormwater.get({
              id: $route.current.params.reportId
            });
          }
        }
      });

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('StormwaterFormController', function (Account, $location, practice, PracticeStormwater, report, $rootScope, $route, site, $scope, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
      };

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

      self.stormwater_practices = {
        'Runoff Reduction': [
          'All ESD practices in MD 2007',
          'Bioretention or Rain Garden (Standard or Enhanced)',
          'Dry Channel Regenerative Stormwater Conveyance (aka Step Pool Storm Conveyance)',
          'Dry Swale',
          'Expanded Tree Pits',
          'Grass Channels (w/ Soil Amendments, aka Bioswale, Vegetated Swale)',
          'Green Roof (aka Vegetated Roof)',
          'Green Streets',
          'Infiltration (aka Infiltration Basin, Infiltration Bed, Infiltration Trench, Dry Well/Seepage Pit, Landscape Infiltration)',
          'Landscape Restoration/Reforestation',
          'Non-Structural BMPs, PA 2006 BMP Manual, Chapter 5',
          'Permeable Pavement (aka Porous Pavement)',
          'Rainwater Harvesting (aka Capture and Re-use)',
          'Riparian Buffer Restoration',
          'Rooftop Disconnection (aka Simple Disconnection to Amended Soils, to a Conservation Area, to a Pervious Area, Non-Rooftop Disconnection)',
          'Sheetflow to Filter/Open Space* (aka Sheetflow to Conservation Area, Vegetated Filter Strip)'
        ],
        'Stormwater Treatment': [
          'Constructed Wetlands',
          'Filtering Practices (aka Constructed Filters, Sand Filters, Stormwater Filtering Systems)',
          'Proprietary Practices (aka Manufactured BMPs)',
          'Wet Ponds (aka Retention Basin)',
          'Wet Swale'
        ]
      };

      self.stormwater_project_types = [
        'New Development',
        'Re-development'
      ];

      self.stormwater_site_classifications = [
        'Runoff Reduction',
        'Stormwater Treatment'
      ];

      function parseISOLike(s) {
          var b = s.split(/\D/);
          return new Date(b[0], b[1]-1, b[2]);
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

            $rootScope.page.title = "Stormwater Management";
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
                  text: "Stormwater Management",
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
    .controller('StormwaterSummaryController', function (Account, $location, $log, PracticeStormwater, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.summary = successResponse;

        $rootScope.page.title = self.summary.practice.properties.practice_type;

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: self.summary.practice.properties.practice_type,
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

          if (measurementPeriod === "Planning") {
            var newReading = new PracticeStormwater({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id,
              });
          }
          else {
            var newReading = new PracticeStormwater({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id,
                'practice_1_name': self.summary.practice.properties.defaults.properties.practice_1_name,
                'practice_2_name': self.summary.practice.properties.defaults.properties.practice_2_name,
                'practice_3_name': self.summary.practice.properties.defaults.properties.practice_3_name,
                'practice_4_name': self.summary.practice.properties.defaults.properties.practice_4_name,
                'project_type': self.summary.practice.properties.defaults.properties.project_type,
                'site_reduction_classification': self.summary.practice.properties.defaults.properties.site_reduction_classification
              });

          }

          newReading.$save().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('ERROR: ', errorResponse);
            });
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
  .config(function($routeProvider) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/custom', {
        templateUrl: '/modules/components/practices/modules/custom/views/summary--view.html',
        controller: 'CustomSummaryController',
        controllerAs: 'page',
        resolve: {
          user: function(Account) {
            if (Account.userObject && !Account.userObject.id) {
                return Account.getUser();
            }
            return Account.userObject;
          },
          summary: function(PracticeCustom, $route) {
            return PracticeCustom.summary({
              id: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/custom/:reportId/edit', {
        templateUrl: '/modules/components/practices/modules/custom/views/form--view.html',
        controller: 'CustomFormController',
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
          report: function(PracticeCustom, $route) {
            return PracticeCustom.get({
              id: $route.current.params.reportId
            });
          },
          practice_types: function(PracticeType, $route) {
            return PracticeType.query();
          },
          metric_types: function(MetricType, $route) {
            return MetricType.query();
          },
          unit_types: function(UnitType, $route) {
            return UnitType.query({
              results_per_page: 500
            });
          }

        }
      });

  });

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .controller('CustomFormController', function (Account, leafletData, $location, Map, mapbox, metric_types, practice, PracticeCustom, practice_types, report, $rootScope, $route, site, $scope, unit_types, user, Utility) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};


      //
      // Setup Map Requirements
      //
      self.map = {};
      self.mapActiveGeocoder = null;

      self.showData = true;

      self.practiceType = null;
      self.practiceTypes = practice_types;

      self.unitTypes = unit_types;

      self.metricType = null;
      self.metricTypes = metric_types;

      self.project = {
        'id': projectId
      };

      self.custom_practice_type = [];

      self.custom_metric_type = [];

      self.actions = {
        addNewPracticeType: function(existingReading) {

          angular.forEach(self.report.properties.readings, function(reading, index) {
            if (existingReading.id === reading.id) {
              self.report.properties.readings[index].properties.practice_type = {
                "properties": {
                  "name": "",
                  "group": "Other",
                  "source": "Add by user_id " + $rootScope.user.id
                }
              }
            }
          })

          // Mark the field as visible.
          self.custom_practice_type[existingReading.id] = true;
        },
        cancelAddNewPracticeType: function(reading_) {
          self.custom_practice_type[reading_.id] = false;
        },
        addNewMetricType: function(existingMetric) {

          angular.forEach(self.report.properties.metrics, function(metric, index) {
            if (existingMetric.id === metric.id) {
              self.report.properties.metrics[index].properties.metric_type = {
                "properties": {
                  "name": "",
                  "group": "Other",
                  "source": "Add by user_id " + $rootScope.user.id
                }
              }
            }
          })

          // Mark the field as visible.
          self.custom_metric_type[existingMetric.id] = true;
        },
        cancelAddNewMetricType: function(metric_) {
          self.custom_metric_type[metric_.id] = false;
        },
        addNewMonitoringType: function(existingMonitoring) {

          angular.forEach(self.report.properties.monitoring, function(monitoring, index) {
            if (existingMonitoring.id === monitoring.id) {
              self.report.properties.metrics[index].properties.metric_type = {
                "properties": {
                  "name": "",
                  "group": "Other",
                  "source": "Add by user_id " + $rootScope.user.id
                }
              }
            }
          })

          // Mark the field as visible.
          self.custom_monitoring_type[existingMonitoring.id] = true;
        },
        cancelAddNewMonitoringType: function(monitoring_) {
          self.custom_monitoring_type[metric_.id] = false;
        }
      }


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
          return new Date(b[0], b[1]-1, b[2]);
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
                self.today = parseISOLike(self.report.properties.report_date);
            }

            //
            // Preprocess the individual Practice Readings before display
            //
            if (self.report.properties.readings.length) {

              angular.forEach(self.report.properties.readings, function(reading_, index_) {
                self.map[reading_.id] = angular.copy(Map);
                self.map[reading_.id] = self.buildSingleMap(reading_);
              });

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

            $rootScope.page.title = "Custom Practices";
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
                  text: "Custom Practice",
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
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null
                };
            });
        }
      });

      $scope.$watch(angular.bind(this, function() {
          return this.date;
      }), function (response) {
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

      self.addReading = function(reading_) {
        var reading = {
          "geometry": null,
          "properties": {
            "bmp_custom_id": self.report.id,
            "practice_type_id": null,
            "practice_extent": 0,
            "practice_unit_id": null,
            "practice_description": "",
            "practice_nutrient_reductions": {
              "properties": {
                "nitrogen": 0,
                "phosphorus": 0,
                "sediment": 0,
                "protocol": ""
              }
            }
          }
        };

        self.report.properties.readings.push(reading);

        self.report.properties.report_date = self.date.month + ' ' + self.date.date + ' ' + self.date.year;

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
        });

      }

      self.addMetric = function() {
        var metric = {
          "geometry": null,
          "properties": {
            "metric_type_id": null,
            "metric_value": 0,
            "metric_unit_id": null,
            "metric_description": ""
          }
        };

        self.report.properties.metrics.push(metric);

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
        });

      }

      self.addMonitoring = function() {
        var monitoring = {
          "geometry": null,
          "properties": {
            "monitoring_type_id": null,
            "monitoring_value": 0,
            "was_verified": false,
            "monitoring_description": ""
          }
        };

        self.report.properties.monitoring.push(monitoring);

        self.report.$update().then(function(successResponse) {
          console.log('New reading created successfully');

          self.report = successResponse;

          if (self.report.properties.report_date) {
              self.today = parseISOLike(self.report.properties.report_date);
          }

          //
          // Preprocess the individual Practice Readings before display
          //
          if (self.report.properties.readings.length) {

            angular.forEach(self.report.properties.readings, function(reading_, index_) {
              self.map[reading_.id] = angular.copy(Map);
              self.map[reading_.id] = self.buildSingleMap(reading_);
            });

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

        }, function(errorResponse) {
          console.log('New reading created successfully');
        });

      }

      self.deleteSubPractice = function(reading_id) {

        var readings_ = []

        angular.forEach(self.report.properties.readings, function(reading_, index_) {
          if (reading_id !== reading_.id) {
            readings_.push(reading_);
          }
        })

        self.report.properties.readings = readings_;
      };


      //
      // MAPS
      //

      //
      // We use this function for handle any type of geographic change, whether
      // through the map or through the fields
      //
      self.processPin = function(coordinates, zoom, map_) {

        if (coordinates.lat === null || coordinates.lat === undefined || coordinates.lng === null || coordinates.lng === undefined) {
          return;
        }

        //
        // Move the map pin/marker and recenter the map on the new location
        //
        map_.markers = {
          projectLocation: {
            lng: coordinates.lng,
            lat: coordinates.lat,
            focus: false,
            draggable: true
          }
        };

        //
        // Update the visible pin on the map
        //
        map_.center = {
          lat: coordinates.lat,
          lng: coordinates.lng,
          zoom: (zoom < 10) ? 10 : zoom
        };
      };

      self.activateGeocoderForReading = function(reading_id) {

        //
        // RESET ALL GEOCODERS TO HIDDEN AND EMPTY
        //
        angular.forEach(self.map, function(map_, index) {

          var is_matching = reading_id === parseInt(index);
          console.log('is_matching', is_matching);
          if (is_matching) {
            self.map[reading_id].showGeocoder = true;
          }
          else {
            self.map[index].showGeocoder = false;
            self.map[index].geocode = {};
          }
        });

        console.log('self.map', self.map)

        return;
      };


      self.buildSingleMap = function(reading_) {

        return {
          showGeocoder: null,
          geocode : {},
          defaults: {
            scrollWheelZoom: false,
            zoomControl: true,
            maxZoom: 19
          },
          layers: {
            baselayers: {
              basemap: {
                name: 'Satellite Imagery',
                url: 'https://{s}.tiles.mapbox.com/v3/rdawes1.0dg4d3gd/{z}/{x}/{y}.png',
                type: 'xyz',
                layerOptions: {
                  attribution: '<a href="https://www.mapbox.com/about/maps/" target="_blank">&copy; Mapbox &copy; OpenStreetMap</a>'
                }
              }
            }
          },
          center: {
            lat: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[1] : 38.362,
            lng: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[0] : -81.119,
            zoom: (reading_.geometry !== null && reading_.geometry !== undefined) ? 16 : 6
          },
          markers: {
            projectLocation: {
              lat: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[1] : 38.362,
              lng: (reading_.geometry !== null && reading_.geometry !== undefined) ? reading_.geometry.geometries[0].coordinates[0] : -81.119,
              focus: false,
              draggable: true
            }
          }
        }
      }



        //
        // IF NUTRIENTS UPDATE FOR ANY PRACTICE, UPDATE THE NUTRIENT ROLLUP
        // AT THE TOP OF THE PAGE.
        //
        $scope.$watch(angular.bind(this, function() {
          return this.report;
        }), function (response) {
          if (response) {
            console.log('Custom Practice: Nutrients updated in sub-practice.');

            var totals = {
              "nitrogen": 0,
              "phosphorus": 0,
              "sediment": 0
            }

            if (self.report && self.report.properties) {
              angular.forEach(self.report.properties.readings, function(reading_, index_) {

                var nutrients_ = reading_.properties.practice_nutrient_reductions;

                if (nutrients_ && nutrients_.properties) {
                  totals.nitrogen += nutrients_.properties.nitrogen;
                  totals.phosphorus += nutrients_.properties.phosphorus;
                  totals.sediment += nutrients_.properties.sediment;
                }

                return;

              });

              self.report.properties.custom_model_nitrogen_total = totals.nitrogen;
              self.report.properties.custom_model_phosphorus_total = totals.phosphorus;
              self.report.properties.custom_model_sediment_total = totals.sediment;

              return;
            }

          }
        }, true);

      //
      // IF NUTRIENTS UPDATE FOR ANY PRACTICE, UPDATE THE NUTRIENT ROLLUP
      // AT THE TOP OF THE PAGE.
      //
      $scope.$watch(angular.bind(this, function() {
        return this.map;
      }), function (response) {
        if (response) {
          console.log('Custom Practice: Map updated.');

          if (self.report && self.report.properties) {
            angular.forEach(self.report.properties.readings, function(reading_, index_) {

              var coordinates = response[reading_.id].markers.projectLocation;

              self.processPin({
                lat: coordinates.lat,
                lng: coordinates.lng
              }, 16, response[reading_.id]);

              // reading_.geometry = {
              //   type: 'GeometryCollection',
              //   geometries: []
              // };
              //
              // reading_.geometry.geometries.push({
              //   type: 'Point',
              //   coordinates: [
              //     coordinates.lng,
              //     coordinates.lat
              //   ]
              // });

            });

            angular.forEach(response, function(response_, index) {
              console.log('response_', index, response_);

              //
              // Only execute the following block of code if the user has geocoded an
              // address. This block of code expects this to be a single feature from a
              // Carmen GeoJSON object.
              //
              // @see https://github.com/mapbox/carmen/blob/master/carmen-geojson.md
              //
              if (response_ && response_.geocode && response_.geocode.response) {

                var r_ = response_.geocode.response;

                self.processPin({
                  lat: r_.geometry.coordinates[1],
                  lng: r_.geometry.coordinates[0]
                }, 16, self.map[index]);

                self.map[index].geocode = {
                  query: null,
                  response: null
                };
              }
            });

          }
        }
      }, true);


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
    .controller('CustomSummaryController', function (Account, $location, $log, PracticeCustom, $rootScope, $route, $scope, summary, Utility, user, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId;

      $rootScope.page = {};

      self.practiceType = null;

      self.showData = false;

      self.project = {
        'id': projectId
      };

      self.status = {
        loading: true
      };

      summary.$promise.then(function(successResponse) {

        self.data = successResponse;
        self.summary = successResponse;

        $rootScope.page.title = "Custom Practice";

        self.practiceType = Utility.machineName(self.summary.practice.properties.practice_type);

        $rootScope.page.links = [
            {
                text: 'Projects',
                url: '/projects'
            },
            {
                text: self.summary.site.properties.project.properties.name,
                url: '/projects/' + projectId
            },
            {
              text: self.summary.site.properties.name,
              url: '/projects/' + projectId + '/sites/' + siteId
            },
            {
              text: "Custom Practice",
              url: '/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId,
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

        self.status.loading = false;
      }, function() {});

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

      self.addReading = function(measurementPeriod) {

          if (measurementPeriod === "Planning") {
            var newReading = new PracticeCustom({
                'measurement_period': measurementPeriod,
                'report_date': new Date(),
                'practice_id': practiceId,
                'account_id': self.summary.site.properties.project.properties.account_id
              });
          }
          else {

            var defaults = angular.copy(self.summary.practice.properties.defaults.properties),
                readings = [];

            angular.forEach(defaults.readings, function(reading, index) {
              delete reading.properties.id;

              var r_ = reading.properties;

              //
              // TODO Need to make sure that we are copying nutrients
              // and not linking them ...
              //
              // TODO Need to copy over geometry
              //

              // r_['geometry'] = reading.geometry;
              readings.push(r_);
            });

            delete defaults.id;
            delete defaults.account;
            delete defaults.practice;

            delete defaults.metrics;
            delete defaults.monitoring;
            delete defaults.created_by;
            delete defaults.last_modified_by;

            defaults.measurement_period = "Installation";
            defaults.readings = readings;

            var newReading = new PracticeCustom(defaults);
          }

          newReading.$save().then(function(successResponse) {
              $location.path('/projects/' + projectId + '/sites/' + siteId + '/practices/' + practiceId + '/' + self.practiceType + '/' + successResponse.id + '/edit');
            }, function(errorResponse) {
              console.error('ERROR: ', errorResponse);
            });
        };

    });

}());

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
              mapid: mapbox.street
            }
          },
          satellite: {
            name: 'Satellite',
            url: 'https://{s}.tiles.mapbox.com/v3/{mapid}/{z}/{x}/{y}.png',
            type: 'xyz',
            layerOptions: {
              mapid: mapbox.map_id
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
         projectLocation: {
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
    access_token: 'pk.eyJ1IjoicmRhd2VzMSIsImEiOiJjaXBneGlqNG8wMHR5dWduajloZXhyZnZ5In0.mPworUdqIVGkNWGnFRGz9A',
    map_id: 'rdawes1.0dg4d3gd',
    terrain: '',
    street: 'mapbox.mapbox-streets-v7'
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

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL
   * @description
   */
  angular.module('MapboxGL', []);

})();

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.Site
 * @description
 * # Site
 * Service in the cleanWaterCommunitiesApp.
 */
angular.module('MapboxGL')
  .constant('MapboxGLSettings', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoiZGV2ZWxvcGVkc2ltcGxlIiwiYSI6IjQ2YTM3YTdhNGU2NzYyMDc2ZjIzNDM4Yjg2MDc1MzRmIn0.bT4dOk8ewUnhJ3pyyOcWTg',
    // style: 'mapbox://styles/mapbox/dark-v9?optimize=true'
    style: 'mapbox://styles/mapbox/mapbox.mapbox-streets-v7'
  });

(function() {

  "use strict";

  /**
   * @ngdoc directive
   * @name managerApp.directive:mapboxGeocoder
   * @description
   *   The Mapbox GL directive enables developers to quickly add Mapbox GL
   *   maps to an angular project.
   *
   *   Example:
   *   <mapboxgl id="map" class="mapboxgl-map"
   *                          options="page.map.options" model="page.map.data">
   *   </mapboxgl>
   */
  angular.module('MapboxGL')
    .directive('mapboxgl', function ($log, $rootScope) {

      return {
          scope: {
            options: '='
          },
          restrict: 'E',
          link: function(scope, element, attrs) {

            /**
             * Give feedback that the MapboxGL Directive has loaded
             */
            $log.log('Loaded MapboxGL::viableMapboxglDirective')

            /**
             * Instantiate a new MapboxGL Map object
             */
            var map = new mapboxgl.Map(scope.options);

            /**
             * Assign MapboxGL Map object to `scope.model` when map has
             * finished loading.
             */
            map.on('load', function () {

              $rootScope.$broadcast('mapboxgl.loaded', {
                map: map
              });

            });

          }
      };
    });

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding', []);

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding')
    .service('MapboxGLGeocodingService', function($http, MapboxGLSettings) {

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
          var mapboxGeocodingAPI = MapboxGLSettings.geocodingUrl.concat(requestedLocation, '.json');

          //
          // Send a GET request to the Mapbox Geocoding API containing valid user
          // input
          //
          var promise = $http.get(mapboxGeocodingAPI, {
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': MapboxGLSettings.access_token
            }
          })
            .then(function(featureCollection) {
              return featureCollection;
            },function(data) {
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
          var mapboxGeocodingAPI = MapboxGLSettings.geocodingUrl.concat(requestedCoordinates[0], ',', requestedCoordinates[1], '.json');

          //
          // Send a GET request to the Mapbox Geocoding API containing valid user
          // input
          //
          var promise = $http.get(mapboxGeocodingAPI, {
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': MapboxGLSettings.access_token
            }
          })
            .then(function(featureCollection) {
              //
              // Return the valid GeoJSON FeatureCollection sent by Mapbox to
              // the module requesting the data with this Service
              //
              return featureCollection;
            },function(data) {
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
          console.warning('Mapbox Geocoding Batch Geocoding not implemented, see https://www.mapbox.com/developers/api/geocoding/ for more information.');
        }
      };

    });

})();

(function() {

  'use strict';

  /**
   * @ngdoc overview
   * @name MapboxGL Geocoding Implementation
   * @description Allow for the
   */
  angular.module('MapboxGLGeocoding')
    .directive('mapboxGeocoder', function($compile, $http, $log, $templateCache, $timeout, MapboxGLGeocodingService) {

      return {
          scope: {
            model: '=',
            mapboxGeocoderDirection: '=?',
            mapboxGeocoderQuery: '=',
            mapboxGeocoderResponse: '=',
            mapboxGeocoderResults: '=?',
            mapboxGeocoderAppend: '=?',
            tabindexnumber: '=',
            placeholder: '=',
          },
          templateUrl: '/modules/shared/mapboxgl-geocoding/mapboxglGeocodingResults--view.html',
          restrict: 'E',
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
            // $http.get('/scripts/shared/mapbox/geocoderResults--view.html', {
            //     cache: $templateCache
            //   }).then(function(templateResult) {
            //     // console.log('element', element);
            //     // console.log('templateResult', templateResult);
            //     element.next().after($compile(templateResult)(scope))
            //     //element.after($compile(templateResult)(scope));
            //   });

            //
            // This tells us if we are using the Forward, Reverse, or Batch
            // Geocoder provided by the Mapbox Geocoding API
            //
            scope.mapboxGeocoderDirection = (scope.mapboxGeocoderDirection) ? scope.mapboxGeocoderDirection: 'forward';

            //
            // Keep an eye on the Query model so that when it's updated we can
            // execute a the Reuqest agains the Mapbox Geocoding API
            //
            scope.$watch('geocode_query', function(query) {

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
                if (query) {
                  var results = MapboxGLGeocodingService[scope.mapboxGeocoderDirection](query_).then(function(results) {
                    scope.results = results;
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
                scope.model = selectedValue;

                //
                // Once we're finished we need to make sure we empty the result
                // list. An empty result list will be hidden.
                //
                scope.geocode_query = null;
                scope.results = null;

              }
            };

          }
      };

    });

})();

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
        } else if (Account.hasRole('manager') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(resource.properties.account_id, Account.userObject.properties.account) || Account.inGroup(Account.userObject.id, resource.properties.members))) {
            return true;
        } else if (Account.hasRole('grantee') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
            return true;
        }

        return false;
      };

      Account.canDelete = function(resource) {
        if (Account.userObject && !Account.userObject.id) {
            return false;
        }

        if (Account.hasRole('admin')) {
            return true;
        } else if (Account.hasRole('manager') && (Account.userObject.id === resource.properties.creator_id || Account.inGroup(Account.userObject.id, resource.properties.members))) {
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

(function() {

    'use strict';

    /**
     * @ngdoc service
     * @name
     * @description
     */
    angular.module('FieldDoc')
      .service('EfficiencyAgricultureGeneric', function (environment, Preprocessors, $resource) {
        return $resource(environment.apiUrl.concat('/v1/data/efficiency-agriculture-generic/:id'), {
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
       .service('Filters', function (environment, Preprocessors, $resource) {
         return $resource(environment.apiUrl.concat('/v1/data/filters'), {
           id: '@id'
         }, {
           projectsByYear: {
             isArray: false,
             url: environment.apiUrl.concat('/v1/data/filters/projects-by-year')
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
           'delete': {
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
    .service('MetricType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/metric-type/:id'), {
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
        'custom': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_custom'),
          'isArray': false
        },
        'agricultureGeneric': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_agriculture_generic'),
          'isArray': false
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
        },
        'shorelineManagement': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_shoreline_management'),
          'isArray': false
        },
        'stormwater': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_stormwater'),
          'isArray': false
        },
        'wetlandsNontidal': {
          'method': 'GET',
          'url': environment.apiUrl.concat('/v1/data/practice/:id/readings_wetlands_nontidal'),
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
    .service('PracticeCustom', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-custom/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/custom/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data),
                json_ = angular.toJson(feature);
            return json_;
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
    .service('PracticeAgricultureGeneric', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-agriculture-generic/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/agriculture-generic/:id')
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
    .service('PracticeUrbanHomeowner', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-urban-homeowner/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/urban-homeowner/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/bioretention/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/bank-stabilization/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/enhanced-stream-restoration/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/forest-buffer/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/grass-buffer/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/instream-habitat/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/livestock-exclusion/:id')
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
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/wetlands-nontidal/:id')
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
    .service('PracticeShorelineManagement', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-shoreline-management/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/shoreline-management/:id')
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
    .service('PracticeStormwater', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-stormwater/:id'), {
        'id': '@id'
      }, {
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/stormwater/:id')
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
    .service('PracticeType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/practice-type/:id'), {
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
    .service('Project', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/project/:id'), {
        id: '@id'
      }, {
        query: {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/project/:id')
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
        'query': {
          isArray: false
        },
        'summary': {
          isArray: false,
          method: 'GET',
          url: environment.apiUrl.concat('/v1/data/summary/site/:id')
        },
        'update': {
          method: 'PATCH',
          transformRequest: function(data) {
            var feature = Preprocessors.geojson(data);
            return angular.toJson(feature);
          }
        },
        'practices': {
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

(function() {

  'use strict';

  /**
   * @ngdoc service
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('UnitType', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/unit-type/:id'), {
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
      },
      camelName: function(name) {
        if (name) {
          return name.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
          }).replace(/\s+/g, '');
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

(function() {

  'use strict';

  angular.module('FieldDoc')
    .directive('organization', function (environment, $http, $timeout) {
      return {
        scope: {
          table: '=',
          field: '=',
          display: '=',
          model: '=',
          tabindexnumber: '=',
          placeholder: '=',
          addNew: '='
        },
        templateUrl: '/modules/shared/directives/organization/organization.html',
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

          scope.addNewFeature = function() {
            var _newFeature = {
              properties: {
                name: scope.searchText
              }
            };

            if (angular.isArray(scope.model)) {
              scope.model.push(_newFeature);
              scope.model = set(scope.model);
            } else {
              scope.model = _newFeature;
            }

            // Clear out input field
            scope.searchText = '';
            scope.features = [];
          }

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

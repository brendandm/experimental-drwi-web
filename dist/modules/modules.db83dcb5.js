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
  .controller('ProjectViewCtrl', function (Account, Calculate, CalculateAgricultureGeneric, CalculateBankStabilization, CalculateBioretention, CalculateEnhancedStreamRestoration, CalculateForestBuffer, CalculateGrassBuffer, CalculateInstreamHabitat, CalculateLivestockExclusion, CalculateShorelineManagement, CalculateStormwater, CalculateWetlandsNonTidal, CalculateUrbanHomeowner, LoadData, Notifications, $rootScope, Project, $route, $scope, $location, mapbox, project, Site, $timeout, UALStateLoad, user, $window) {

    var self = this;

    $rootScope.page = {};

    self.data = {};

    self.rollups = {
      nitrogen: {
      	installed: 0,
      	total: 0
      },
      phosphorus: {
      	installed: 0,
      	total: 0
      },
      sediment: {
      	installed: 0,
      	total: 0
      },
      metrics: {
        'metric_1': {
          label: 'Gallons/Year of Stormwater Detained or Infiltrated',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_2': {
          label: 'Acres Protected by BMP to Reduce Stormwater Runoff',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_3': {
          label: 'Number of Trees Planted',
          installed: 0,
          total: 0,
          units: 'trees'
        },
        'metric_4': {
          label: 'Square Feet of Impervious Surface Removed',
          installed: 0,
          total: 0,
          units: 'sq ft'
        },
        'metric_5': {
          label: 'Miles of Streambank Restored',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_6': {
          label: 'Acres of Hyporheic Area Treated',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_7': {
          label: 'Acres of Floodplain Reconnected',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_8': {
          label: 'Acres of Riparian Restoration',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_9': {
          label: 'Miles of Riparian Restoration',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_10': {
          label: 'Acres Protected Under Long-term Easment',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_11': {
          label: 'Habitat Restoration Target Species 1',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_12': {
          label: 'Habitat Restoration Target Species 2',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_13': {
          label: 'Acres of Habitat Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_14': {
          label: 'Acres of Wetlands Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_15': {
          label: 'Miles of Living Shoreline Restored',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_16': {
          label: 'Miles of Stream Opened',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_17': {
          label: 'Acres of Oyster Habitat Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_18': {
          label: 'Fish Passage Improvements: # of Passage Barriers Rectified',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_19': {
          label: 'Fish Passage Improvements: # of Fish Crossing Barriers',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_20': {
          label: 'Eastern Brook Trout: # of Reintroduced Subwatersheds',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_21': {
          label: 'Eastern Brook Trout: # of Habitat Units Improved',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_22': {
          label: 'Miles of Fencing Installed',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_23': {
          label: 'Acres of Practice Installed',
          installed: 0,
          total: 0,
          chart: 0,
          units: 'acres'
        },
        'metric_24': {
          label: 'Acres protected by BMPs to reduce stormwater runoff	',
          installed: 0,
          total: 0,
          chart: 0,
          units: 'acres'
        },
        'metric_25': {
          label: 'Acres of stormwater BMPs installed',
          installed: 0,
          total: 0,
          chart: 0,
          units: 'acres'
        }
      }
    };


    //
    //
    //
    self.calculate = Calculate;

    //
    //
    //
    self.mapbox = mapbox;

    //
    // Assign project to a scoped variable
    //
    project.$promise.then(function(projectResponse) {
        self.project = projectResponse;
        self.sites = self.project.properties.sites;

        self.data = projectResponse;

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
        //
        //
        self.statistics.sites(projectResponse);

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


    var _timer;

    //
    // Process rollup statistics for the entire `project`.
    //
    self.statistics = {
        sites: function(_thisProject) {

          var _self = this;

          var counter = 0,
              _sitesLists = _thisProject.properties.sites;

          _timer = setInterval(function() {

            console.log('counter', counter, '_sitesLists.length', _sitesLists.length);
            if (counter < _sitesLists.length) {
              _self.practices(_sitesLists[counter], _sitesLists[counter].properties.practices);
              counter++;
            }
            else {
              clearInterval(_timer);
            }
          }, 5000);

          // angular.forEach(_thisProject.properties.sites, function(_site, _siteIndex) {
          //
          //   _self.practices(copy.site, copy.practices);
          //
          // });
        },
        calculations: function(_thisSite, _thesePractices, _loadData) {

          var _self = this,
              _site = angular.copy(_thisSite);

          // console.log('Processing Calculations for Site', _site.id);
          // debugger;

          angular.forEach(_thesePractices, function(_practice, _practiceIndex){

            console.log('_practice.properties.practice_type', _practice.properties.practice_type)

            switch(_practice.properties.practice_type) {
              case "Agriculture Generic":
                var _calculate = angular.copy(CalculateAgricultureGeneric);
                var _readings = _practice.properties.readings_agriculture_generic;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                var existingLanduseType = "",
                    landRiverSegmentCode = _thisSite.properties.segment.properties.hgmr_code,
                    planningData = null;

                angular.forEach(_readings, function(reading, $index) {
                  if (reading.properties.measurement_period === 'Planning') {
                    planningData = reading;
                    existingLanduseType = (reading.properties.existing_riparian_landuse) ?  reading.properties.existing_riparian_landuse : "";
                  }
                });

                // Existing Landuse and Land River Segment Code MUST BE TRUTHY
                if (existingLanduseType && landRiverSegmentCode && planningData) {

                  _calculate.GetLoadVariables(landRiverSegmentCode, existingLanduseType, function(successResponse) {

                    if (successResponse.features.length === 0) {
                      console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", _thisSite.properties.segment.properties.hgmr_code)
                      $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                    }
                    else {
                      //
                      // Begin calculating nutrient reductions
                      //
                      self.calculateAgricultureGeneric = CalculateAgricultureGeneric;

                      self.calculateAgricultureGeneric.loadData = successResponse.features[0];
                      self.calculateAgricultureGeneric.readings = _readings;

                      self.calculateAgricultureGeneric.getUAL(planningData);

                      // Agriculture Generic: CHESAPEAKE BAY METRICS
                      //
                      // 1. Miles of Streambank Restored
                      //
                      angular.forEach(_readings, function(_reading, _readingIndex){
                          if (_reading.properties.measurement_period === 'Planning' && _calculate.ual && _calculate.ual.nitrogen) {
                              self.rollups.metrics.metric_23.total += _reading.properties.custom_practice_extent_acres

                              // Agriculture Generic: LOAD REDUCTIONS
                              //
                              var _tempReadings_nitrogen_total = (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                              var _tempReadings_phosphorus_total = (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                              var _tempReadings_sediment_total = (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)

                              _tempReadings.nitrogen.total += (_tempReadings_nitrogen_total) ? _tempReadings_nitrogen_total : 0;
                              _tempReadings.phosphorus.total += (_tempReadings_phosphorus_total) ? _tempReadings_phosphorus_total : 0;
                              _tempReadings.sediment.total += (_tempReadings_sediment_total) ? _tempReadings_sediment_total : 0;

                          } else if (_reading.properties.measurement_period === 'Installation' && _calculate.ual && _calculate.ual.nitrogen) {
                              self.rollups.metrics.metric_23.installed += _reading.properties.custom_practice_extent_acres

                              // Agriculture Generic: LOAD REDUCTIONS
                              //
                              var _tempReadings_nitrogen_installed = (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                              var _tempReadings_phosphorus_installed = (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                              var _tempReadings_sediment_installed = (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)

                              _tempReadings.nitrogen.installed += (_tempReadings_nitrogen_installed) ? _tempReadings_nitrogen_installed : 0;
                              _tempReadings.phosphorus.installed += (_tempReadings_phosphorus_installed) ? _tempReadings_phosphorus_installed : 0;
                              _tempReadings.sediment.installed += (_tempReadings_sediment_installed) ? _tempReadings_sediment_installed : 0;
                          }
                      });

                      self.rollups.metrics.metric_23.chart += (self.rollups.metrics.metric_23.installed/self.rollups.metrics.metric_23.total)*100;

                      // ADD TO PRACTICE LIST
                      //
                      self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                      self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                      self.rollups.sediment.total += _tempReadings.sediment.total

                      self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                      self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                      self.rollups.sediment.installed += _tempReadings.sediment.installed

                    }

                  });
                }
                break;

              case "Bank Stabilization":
                var _calculate = angular.copy(CalculateBankStabilization);
                var _readings = _practice.properties.readings_bank_stabilization;

                // BANK STABILIZATION: CHESAPEAKE BAY METRICS
                //
                // 1. Miles of Streambank Restored
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_5.total += _calculate.milesStreambankRestored(_reading);

                        // BANK STABILIZATION: LOAD REDUCTIONS
                        //
                        self.rollups.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading)
                        self.rollups.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading)
                        self.rollups.sediment.total += _calculate.plannedSedimentLoadReduction(_reading)
                    } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_5.installed += _calculate.milesStreambankRestored(_reading);

                        // BANK STABILIZATION: LOAD REDUCTIONS
                        //
                        self.rollups.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading)
                        self.rollups.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading)
                        self.rollups.sediment.installed += _calculate.plannedSedimentLoadReduction(_reading)
                    }
                });

                self.rollups.metrics.metric_5.chart += (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;

                break;
              case "Bioretention":
                var _calculate = angular.copy(CalculateBioretention);
                var _readings = _practice.properties.readings_bioretention;

                // BIORETENTION: CHESAPEAKE BAY METRICS
                //
                // 1. Gallons/Year of Stormwater Detained or Infiltrated
                // 2. Acres of Protected by BMP's to Reduce Stormwater Runoff
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_1.total += _calculate.gallonsReducedPerYear(_reading);
                        self.rollups.metrics.metric_2.total += _calculate.acresProtected(_reading);

                        // BIORETENTION: LOAD REDUCTIONS
                        //
                        self.rollups.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading, _loadData);
                        self.rollups.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading, _loadData);
                        self.rollups.sediment.total += _calculate.plannedSedimentLoadReduction(_reading, _loadData);
                    } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading);
                        self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading);

                        // BIORETENTION: LOAD REDUCTIONS
                        //
                        self.rollups.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading, _loadData)
                        self.rollups.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading, _loadData)
                        self.rollups.sediment.installed += _calculate.plannedSedimentLoadReduction(_reading, _loadData)
                    }
                });

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;


                break;
              case "Enhanced Stream Restoration":
                var _calculate = angular.copy(CalculateEnhancedStreamRestoration);
                var _readings = _practice.properties.readings_enhanced_stream_restoration;

                // ENHANCED STREAM RESTORATION: CHESAPEAKE BAY METRICS
                //
                // 1. Miles of Streambank Restored
                // 2. Acres of Hyporheic Area Treated
                // 3. Acres of Floodplain Reconnected
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_5.total += _calculate.milesOfStreambankRestored(_reading);
                      self.rollups.metrics.metric_6.total += _calculate.acresTreated(_reading);
                      self.rollups.metrics.metric_7.total += _reading.properties.connected_floodplain_surface_area;

                      // BIORETENTION: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.total += _calculate.plannedNitrogenProtocol2LoadReduction(_reading, _loadData);
                      self.rollups.nitrogen.total += _calculate.plannedNitrogenProtocol3LoadReduction(_readings, _loadData);
                      self.rollups.phosphorus.total += _calculate.plannedPhosphorusProtocol3LoadReduction(_readings, _loadData);
                      self.rollups.sediment.total += _calculate.plannedSedimentLoadReduction(_readings, _loadData);
                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_5.installed += _calculate.milesOfStreambankRestored(_reading);
                      self.rollups.metrics.metric_6.installed += _calculate.acresTreated(_reading);
                      self.rollups.metrics.metric_7.installed += _reading.properties.connected_floodplain_surface_area;

                      // BIORETENTION: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.installed += _calculate.plannedNitrogenProtocol2LoadReduction(_reading, _loadData);
                      self.rollups.nitrogen.installed += _calculate.plannedNitrogenProtocol3LoadReduction(_readings, _loadData);
                      self.rollups.phosphorus.installed += _calculate.plannedPhosphorusProtocol3LoadReduction(_readings, _loadData);
                      self.rollups.sediment.installed += _calculate.plannedSedimentLoadReduction(_readings, _loadData);
                    }
                });

                self.rollups.metrics.metric_5.chart = (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;
                self.rollups.metrics.metric_6.chart = (self.rollups.metrics.metric_6.installed/self.rollups.metrics.metric_6.total)*100;
                self.rollups.metrics.metric_7.chart = (self.rollups.metrics.metric_7.installed/self.rollups.metrics.metric_7.total)*100;

                // ENHANCED STREAM RESTORATION: LOAD REDUCTIONS
                //

                break;
              case "Forest Buffer":
                var _calculate = angular.copy(CalculateForestBuffer);
                var _readings = _practice.properties.readings_forest_buffer;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                _calculate.site = _site;

                _calculate.readings = {
                  features: _readings
                };

                _calculate.metrics();

                _calculate.GetPreInstallationLoad('Planning', function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // FOREST BUFFER: CHESAPEAKE BAY METRICS
                    //
                    // 1. Acres of Riparian Restoration
                    // 2. Miles of Riparian Restoration
                    // 3. Number of Trees Planted
                    //
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        if (_reading.properties.measurement_period === 'Planning') {
                          self.rollups.metrics.metric_8.total += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.total += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);
                          self.rollups.metrics.metric_3.total += _reading.properties.number_of_trees_planted;

                          _tempReadings.nitrogen.total += (totalPlannedLoad.nitrogen) ? totalPlannedLoad.nitrogen : 0;
                          _tempReadings.phosphorus.total += (totalPlannedLoad.phosphorus) ? totalPlannedLoad.phosphorus : 0;
                          _tempReadings.sediment.total += (totalPlannedLoad.sediment) ? totalPlannedLoad.sediment : 0;

                        } else if (_reading.properties.measurement_period === 'Installation') {

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.installed += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.installed += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);
                          self.rollups.metrics.metric_3.installed +=  _reading.properties.number_of_trees_planted;

                          _tempReadings.nitrogen.installed += (_installed.nitrogen) ? _installed.nitrogen : 0;
                          _tempReadings.phosphorus.installed += (_installed.phosphorus) ? _installed.phosphorus : 0;
                          _tempReadings.sediment.installed += (_installed.sediment) ? _installed.sediment : 0;
                        }
                    });

                    self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                    self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;
                    self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;

                    // ADD TO PRACTICE LIST
                    //
                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                  });

                });
                break;
              case "Grass Buffer":
                var _calculate = angular.copy(CalculateGrassBuffer);
                var _readings = _practice.properties.readings_grass_buffer;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                _calculate.site = _site;

                _calculate.readings = {
                  features: _readings
                };

                _calculate.metrics();

                _calculate.GetPreInstallationLoad('Planning', function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  // if (_site.id === 719) {
                  //   console.log('preUplandPreInstallationLoad', preUplandPreInstallationLoad)
                  //   debugger;
                  // }

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // if (_site.id === 719) {
                    //   console.log('totalPlannedLoad', totalPlannedLoad)
                    //   debugger;
                    // }

                    // FOREST BUFFER: CHESAPEAKE BAY METRICS
                    //
                    // 1. Acres of Riparian Restoration
                    // 2. Miles of Riparian Restoration
                    // 3. Number of Trees Planted
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        if (_reading.properties.measurement_period === 'Planning') {
                          self.rollups.metrics.metric_8.total += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.total += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);

                          _tempReadings.nitrogen.total += (totalPlannedLoad.nitrogen) ? totalPlannedLoad.nitrogen : 0;
                          _tempReadings.phosphorus.total += (totalPlannedLoad.phosphorus) ? totalPlannedLoad.phosphorus : 0;
                          _tempReadings.sediment.total += (totalPlannedLoad.sediment) ? totalPlannedLoad.sediment : 0;

                        } else if (_reading.properties.measurement_period === 'Installation') {

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.installed += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.installed += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);

                          _tempReadings.nitrogen.installed += (_installed.nitrogen) ? _installed.nitrogen : 0;
                          _tempReadings.phosphorus.installed += (_installed.phosphorus) ? _installed.phosphorus : 0;
                          _tempReadings.sediment.installed += (_installed.sediment) ? _installed.sediment : 0;
                        }
                    });

                    self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                    self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;

                    // ADD TO PRACTICE LIST
                    //
                    // self.rollups.nitrogen.total.push({"site_id": _site.id, "name": "Grass Buffer", "value": _tempReadings.nitrogen.total});
                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total;
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total;
                    self.rollups.sediment.total += _tempReadings.sediment.total;

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed;
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed;
                    self.rollups.sediment.installed += _tempReadings.sediment.installed;

                  });

                });

                break;
              case "In-stream Habitat":
                var _calculate = angular.copy(CalculateInstreamHabitat);
                var _readings = _practice.properties.readings_instream_habitat;

                // IN-STREAM HABITAT: CHESAPEAKE BAY METRICS
                //
                // 1. Acres Protected Under Long-term Easment (permanent or >=30 years)
                // 2. Habitat Restoration Target Species 1
                // 3. Habitat Restoration Target Species 2
                // 4. Acres of Habitat Restored
                // 5. Acres of Wetlands Restored
                // 6. Miles of Living Shoreline Restored
                // 7. Miles of Stream Opened
                // 8. Acres of Oyster Habitat Restored
                // 9. Fish Passage Improvements: # of Passage Barriers Rectified
                // 10. Fish Passage Improvements: # of Fish Crossing Barriers
                // 11. Eastern Brook Trout: # of Reintroduced Subwatersheds
                // 12. Eastern Brook Trout: # of Habitat Units Improved
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_10.total += _reading.properties.metrics_areas_protected;
                      self.rollups.metrics.metric_11.total += 0;
                      self.rollups.metrics.metric_12.total += 0;
                      self.rollups.metrics.metric_13.total += _reading.properties.metrics_areas_of_habitat_restored;
                      self.rollups.metrics.metric_14.total += _reading.properties.metrics_acres_of_wetlands_restored;
                      self.rollups.metrics.metric_15.total += _reading.properties.metrics_miles_of_living_shoreline_restored;
                      self.rollups.metrics.metric_16.total += _reading.properties.metrics_miles_of_stream_opened;
                      self.rollups.metrics.metric_17.total += _reading.properties.metrics_acres_of_oyster_habitat_restored;
                      self.rollups.metrics.metric_18.total += _reading.properties.metrics_fish_passage_improvements_number_of_passage_barriers_re;
                      self.rollups.metrics.metric_19.total += _reading.properties.metrics_fish_passage_improvements_number_of_fish_crossing_barri;
                      self.rollups.metrics.metric_20.total += _reading.properties.metrics_number_of_reintroduced_subwatersheds_eastern_brook_trou;
                      self.rollups.metrics.metric_21.total += _reading.properties.metrics_number_of_habitat_units_improved_eastern_brook_trout;

                      // IN-STREAM HABITAT: LOAD REDUCTIONS FOR PLANNED/TOTAL
                      //
                      // !!!! NO NITROGEN, PHOSPHORUS, OR SEDIMENT REDUCTIONS

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_10.installed += _reading.properties.metrics_areas_protected;
                      self.rollups.metrics.metric_11.installed += 0;
                      self.rollups.metrics.metric_12.installed += 0;
                      self.rollups.metrics.metric_13.installed += _reading.properties.metrics_areas_of_habitat_restored;
                      self.rollups.metrics.metric_14.installed += _reading.properties.metrics_acres_of_wetlands_restored;
                      self.rollups.metrics.metric_15.installed += _reading.properties.metrics_miles_of_living_shoreline_restored;
                      self.rollups.metrics.metric_16.installed += _reading.properties.metrics_miles_of_stream_opened;
                      self.rollups.metrics.metric_17.installed += _reading.properties.metrics_acres_of_oyster_habitat_restored;
                      self.rollups.metrics.metric_18.installed += _reading.properties.metrics_fish_passage_improvements_number_of_passage_barriers_re;
                      self.rollups.metrics.metric_19.installed += _reading.properties.metrics_fish_passage_improvements_number_of_fish_crossing_barri;
                      self.rollups.metrics.metric_20.installed += _reading.properties.metrics_number_of_reintroduced_subwatersheds_eastern_brook_trou;
                      self.rollups.metrics.metric_21.installed += _reading.properties.metrics_number_of_habitat_units_improved_eastern_brook_trout;

                      // IN-STREAM HABITAT: LOAD REDUCTIONS FOR INSTALLATION
                      //
                      // !!!! NO NITROGEN, PHOSPHORUS, OR SEDIMENT REDUCTIONS

                    }
                });

                self.rollups.metrics.metric_10.chart = (self.rollups.metrics.metric_10.installed/self.rollups.metrics.metric_10.total)*100;
                self.rollups.metrics.metric_11.chart = (self.rollups.metrics.metric_11.installed/self.rollups.metrics.metric_11.total)*100;
                self.rollups.metrics.metric_12.chart = (self.rollups.metrics.metric_12.installed/self.rollups.metrics.metric_12.total)*100;
                self.rollups.metrics.metric_13.chart = (self.rollups.metrics.metric_13.installed/self.rollups.metrics.metric_13.total)*100;
                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;
                self.rollups.metrics.metric_15.chart = (self.rollups.metrics.metric_15.installed/self.rollups.metrics.metric_15.total)*100;
                self.rollups.metrics.metric_16.chart = (self.rollups.metrics.metric_16.installed/self.rollups.metrics.metric_16.total)*100;
                self.rollups.metrics.metric_17.chart = (self.rollups.metrics.metric_17.installed/self.rollups.metrics.metric_17.total)*100;
                self.rollups.metrics.metric_18.chart = (self.rollups.metrics.metric_18.installed/self.rollups.metrics.metric_18.total)*100;
                self.rollups.metrics.metric_19.chart = (self.rollups.metrics.metric_19.installed/self.rollups.metrics.metric_19.total)*100;
                self.rollups.metrics.metric_20.chart = (self.rollups.metrics.metric_20.installed/self.rollups.metrics.metric_20.total)*100;
                self.rollups.metrics.metric_21.chart = (self.rollups.metrics.metric_21.installed/self.rollups.metrics.metric_21.total)*100;

                break;
              case "Livestock Exclusion":

                var _readings = _practice.properties.readings_livestock_exclusion;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                var _calculate = angular.copy(CalculateLivestockExclusion);

                _calculate.readings = {
                  features: _readings
                };

                _calculate.site = _site;

                _calculate.practice_efficiency = {
                  s_efficiency: 30/100,
                  n_efficiency: 9/100,
                  p_efficiency: 24/100
                };

                _calculate.grass_efficiency = {
                  s_efficiency: 60/100,
                  n_efficiency: 21/100,
                  p_efficiency: 45/100
                };

                _calculate.forest_efficiency = {
                  s_efficiency: 60/100,
                  n_efficiency: 21/100,
                  p_efficiency: 45/100
                };

                _calculate.GetPreInstallationLoad(function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // LIVESTOCK EXCLUSION: CHESAPEAKE BAY METRICS
                    //
                    // 1. Miles of Fencing Installed
                    //
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        if (_reading.properties.measurement_period === 'Planning') {
                          self.rollups.metrics.metric_22.total += _calculate.toMiles(_reading.properties.length_of_fencing);

                          _tempReadings.nitrogen.total += totalPlannedLoad.nitrogen;
                          _tempReadings.phosphorus.total += totalPlannedLoad.phosphorus;
                          _tempReadings.sediment.total += totalPlannedLoad.sediment;

                        } else if (_reading.properties.measurement_period === 'Installation') {
                          self.rollups.metrics.metric_22.installed += _calculate.toMiles(_reading.properties.length_of_fencing);

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          _tempReadings.nitrogen.installed += _installed.nitrogen;
                          _tempReadings.phosphorus.installed += _installed.phosphorus;
                          _tempReadings.sediment.installed += _installed.sediment;
                        }
                    });

                    self.rollups.metrics.metric_22.chart = (self.rollups.metrics.metric_22.installed/self.rollups.metrics.metric_22.total)*100;

                    // ADD TO PRACTICE LIST
                    //
                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                  })
                })

                break;
              case "Non-Tidal Wetlands":
                var _calculate = angular.copy(CalculateWetlandsNonTidal);
                var _readings = _practice.properties.readings_wetlands_nontidal;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // NON-TIDAL WETLANDS: CHESAPEAKE BAY METRICS
                //
                // 1. Acres of Wetland Restored
                //
                // TODO: It appears that this may not be working right for metric_14
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_14.total += _calculate.milesRestored(_readings, 'Planning');

                      var _results = _calculate.loads(_readings, _thisSite.properties.segment.properties.hgmr_code)

                      // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.total += _results.planned.nitrogen
                      _tempReadings.phosphorus.total += _results.planned.phosphorus
                      _tempReadings.sediment.total += _results.planned.sediment
                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_14.installed += _calculate.milesRestored(_readings, 'Installation');

                      // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.installed += _calculate.plannedLoad(_reading, 'nitrogen')
                      _tempReadings.phosphorus.installed += _calculate.plannedLoad(_reading, 'phosphorus')
                      _tempReadings.sediment.installed += _calculate.plannedLoad(_reading, 'sediment')
                    }
                });

                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;

                console.log('Site', _site.id, '_tempReadings', _tempReadings.nitrogen.total)
                console.log('Site', _site.id, '_tempReadings', _tempReadings.phosphorus.total)

                // self.rollups.nitrogen.total.push({"site_id": _site.id, "name": "Non-Tidal Wetlands", "value": _tempReadings.nitrogen.total});
                self.rollups.nitrogen.total += _tempReadings.nitrogen.total;
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                break;
              case "Shoreline Management":
                var _calculate = angular.copy(CalculateShorelineManagement);
                var _readings = _practice.properties.readings_shoreline_management;

                // SHORELINE MANAGEMENT: CHESAPEAKE BAY METRICS
                //
                // 1. Acres of Wetland Restored
                // 2. Miles of Living Shoreline Restored
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_14.total += _reading.properties.installation_area_of_planted_or_replanted_tidal_wetlands;
                      self.rollups.metrics.metric_15.total += _reading.properties.installation_length_of_living_shoreline_restored;

                      var _results = _calculate.loads(_readings)

                      // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.total += _results.planned.protocol_2_tn
                      self.rollups.nitrogen.total += _results.planned.protocol_4_tn

                      self.rollups.phosphorus.total += _results.planned.protocol_3_tp
                      self.rollups.phosphorus.total += _results.planned.protocol_4_tp

                      self.rollups.sediment.total += _results.planned.protocol_1_tss
                      self.rollups.sediment.total += _results.planned.protocol_3_tss

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_14.installed += _reading.properties.installation_area_of_planted_or_replanted_tidal_wetlands;
                      self.rollups.metrics.metric_15.installed += _reading.properties.installation_length_of_living_shoreline_restored;

                      // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.installed += _calculate.loadProtocol2TN(_reading)
                      self.rollups.nitrogen.installed += _calculate.loadProtocol4TN(_reading)

                      self.rollups.phosphorus.installed += _calculate.loadProtocol3TP(_reading)
                      self.rollups.phosphorus.installed += _calculate.loadProtocol4TP(_reading)

                      self.rollups.sediment.installed += _calculate.loadProtocol1TSS(_reading)
                      self.rollups.sediment.installed += _calculate.loadProtocol3TSS(_reading)
                    }
                });

                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;
                self.rollups.metrics.metric_15.chart = (self.rollups.metrics.metric_15.installed/self.rollups.metrics.metric_15.total)*100;

                break;
              case "Stormwater":
                var _calculate = angular.copy(CalculateStormwater);
                var _readings = _practice.properties.readings_stormwater;

                // URBAN HOMEOWNER: CHESAPEAKE BAY METRICS
                //
                // 1. Number of Trees Planted
                // 2. Square Feet of Impervious Surface Removed
                // 3. Gallons/Year of Stormwater Detained or Infiltrated
                // 4. Areas of Protected by BMP's to Reduce Stormwater Runoff
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_1.total += _calculate.gallonsPerYearStormwaterDetainedFiltrationInstalled(_readings)
                      self.rollups.metrics.metric_23.total += _calculate.metricTotalAcresProtected(_reading)
                      self.rollups.metrics.metric_24.total += _calculate.metricTotalPracticeArea(_reading)

                      // Stormwater Management: LOAD REDUCTIONS
                      //
                      if (_reading.properties.site_reduction_classification === 'Runoff Reduction') {
                        self.rollups.nitrogen.total += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveNitrogen')
                        self.rollups.phosphorus.total += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus')
                        self.rollups.sediment.total += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment')
                      }
                      else {
                        self.rollups.nitrogen.total += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedStormwaterTreatmentAdjustorCurveNitrogen')
                        self.rollups.phosphorus.total += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus')
                        self.rollups.sediment.total += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment')
                      }

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_1.installed += _calculate.gallonsPerYearStormwaterDetainedFiltrationInstalled(_readings)
                      self.rollups.metrics.metric_23.installed += _calculate.metricInstalledAcresProtected(_readings);
                      self.rollups.metrics.metric_24.installed += _calculate.metricInstalledPracticeArea(_readings);

                      // Stormwater Management: LOAD REDUCTIONS
                      //
                      if (_reading.properties.site_reduction_classification === 'Runoff Reduction') {
                        self.rollups.nitrogen.installed += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveNitrogen', _reading)
                        self.rollups.phosphorus.installed += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus', _reading)
                        self.rollups.sediment.installed += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment', _reading)
                      }
                      else {
                        self.rollups.nitrogen.installed += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedStormwaterTreatmentAdjustorCurveNitrogen', _reading)
                        self.rollups.phosphorus.installed += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus', _reading)
                        self.rollups.sediment.installed += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment', _reading)
                      }

                    }
                });

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_23.chart = (self.rollups.metrics.metric_23.installed/self.rollups.metrics.metric_23.total)*100;
                self.rollups.metrics.metric_24.chart = (self.rollups.metrics.metric_24.installed/self.rollups.metrics.metric_24.total)*100;

                break;
              case "Urban Homeowner":
                var _calculate = angular.copy(CalculateUrbanHomeowner);
                var _readings = _practice.properties.readings_urban_homeowner;

                // URBAN HOMEOWNER: CHESAPEAKE BAY METRICS
                //
                // 1. Number of Trees Planted
                // 2. Square Feet of Impervious Surface Removed
                // 3. Gallons/Year of Stormwater Detained or Infiltrated
                // 4. Areas of Protected by BMP's to Reduce Stormwater Runoff
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_1.total += _calculate.gallonsReducedPerYear(_reading.properties);
                      self.rollups.metrics.metric_2.total += _calculate.acresProtected(_reading.properties);
                      self.rollups.metrics.metric_3.total += _calculate.quantityInstalled(_readings, 'tree_planting');
                      self.rollups.metrics.metric_4.total += _calculate.quantityInstalled(_readings, 'impervious_cover_removal_area');

                      // URBAN HOMEOWNER: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading.properties, _loadData)
                      self.rollups.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading.properties, _loadData)

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading.properties);
                      self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading.properties);
                      self.rollups.metrics.metric_3.installed += _calculate.quantityInstalled(_readings, 'tree_planting');
                      self.rollups.metrics.metric_4.installed += _calculate.quantityInstalled(_readings, 'impervious_cover_removal_area');

                      // URBAN HOMEOWNER: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading.properties, _loadData)
                      self.rollups.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading.properties, _loadData)

                    }
                });

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;
                self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;
                self.rollups.metrics.metric_4.chart = (self.rollups.metrics.metric_4.installed/self.rollups.metrics.metric_4.total)*100;

                break;
            }

          });

        },
        practices: function(_thisSite, _thesePractices) {

            if (!_thisSite.properties.state) {
              console.warn('No state was selected for this Site. No Load Reductions can be estimated with out state efficiency data.');
              return;
            }

            var _self = this,
                _params = {
                  "q": {
                    "filters": [
                      {
                        "name": "state",
                        "op": "eq",
                        "val": _thisSite.properties.state
                      }
                    ]
                  }
                };

            UALStateLoad.query(_params, function(successResponse){

              var _loadData = {};

              angular.forEach(successResponse.features, function(feature, $index) {
                _loadData[feature.properties.developed_type] = {
                  tn_ual: feature.properties.tn_ual,
                  tp_ual: feature.properties.tp_ual,
                  tss_ual: feature.properties.tss_ual
                };
              });

              // console.log("UALStateLoad::Response for site_id", _thisSite, "with _loadData", _loadData);
              // debugger;

              self.statistics.calculations(_thisSite, _thesePractices, _loadData);
            }, function(errorResponse) {
              console.log('ERROR LOADING LOAD DATA', errorResponse)
            });

            return;
        },
        readings: function(_these) {}
    };

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
  .controller('SiteViewCtrl', function (Account, Calculate, CalculateAgricultureGeneric, CalculateBankStabilization, CalculateBioretention, CalculateEnhancedStreamRestoration, CalculateForestBuffer, CalculateGrassBuffer, CalculateInstreamHabitat, CalculateLivestockExclusion, CalculateShorelineManagement, CalculateStormwater, CalculateWetlandsNonTidal, CalculateUrbanHomeowner, leafletData, LoadData, $location, mapbox, site, Practice, practices, project, $rootScope, $route, $scope, $timeout, UALStateLoad, user) {

    var self = this;

    $rootScope.page = {};

    self.mapbox = mapbox;

    self.practices = practices;

    self.rollups = {
      active: "all",
      all: {
        practices: {
          agriculture_generic: {
            name: "Other Agricultural Practices",
            installed: 0,
            total: 0
          },
          bank_stabilization: {
            name: "Bank Stabilization",
            installed: 0,
            total: 0
          },
          bioretention: {
            name: "Bioretention",
            installed: 0,
            total: 0
          },
          enhanced_stream_restoration: {
            name: "Enhanced Stream Restoration",
            installed: 0,
            total: 0
          },
          forest_buffer: {
            name: "Forest Buffer",
            installed: 0,
            total: 0
          },
          grass_buffer: {
            name: "Grass Buffer",
            installed: 0,
            total: 0
          },
          instream_habitat: {
            name: "In-stream Habitat",
            installed: 0,
            total: 0
          },
          livestock_exclusion: {
            name: "Livestock Exclusion",
            installed: 0,
            total: 0
          },
          nontidal_wetlands: {
            name: "Non-tidal Wetlands",
            installed: 0,
            total: 0
          },
          shoreline_management: {
            name: "Shoreline Management",
            installed: 0,
            total: 0
          },
          stormwater: {
            name: "Stormwater",
            installed: 0,
            total: 0
          },
          urban_homeowner: {
            name: "Urban Homeowner",
            installed: 0,
            total: 0
          }

        }
      },
      nitrogen: {
      	installed: 0,
      	total: 0,
        practices: []
      },
      phosphorus: {
      	installed: 0,
      	total: 0,
        practices: []
      },
      sediment: {
      	installed: 0,
      	total: 0,
        practices: []
      },
      metrics: {
        'metric_1': {
          label: 'Gallons/Year of Stormwater Detained or Infiltrated',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_2': {
          label: 'Acres Protected by BMP to Reduce Stormwater Runoff',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_3': {
          label: 'Number of Trees Planted',
          installed: 0,
          total: 0,
          units: 'trees'
        },
        'metric_4': {
          label: 'Square Feet of Impervious Surface Removed',
          installed: 0,
          total: 0,
          units: 'sq ft'
        },
        'metric_5': {
          label: 'Miles of Streambank Restored',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_6': {
          label: 'Acres of Hyporheic Area Treated',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_7': {
          label: 'Acres of Floodplain Reconnected',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_8': {
          label: 'Acres of Riparian Restoration',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_9': {
          label: 'Miles of Riparian Restoration',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_10': {
          label: 'Acres Protected Under Long-term Easment',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_11': {
          label: 'Habitat Restoration Target Species 1',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_12': {
          label: 'Habitat Restoration Target Species 2',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_13': {
          label: 'Acres of Habitat Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_14': {
          label: 'Acres of Wetlands Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_15': {
          label: 'Miles of Living Shoreline Restored',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_16': {
          label: 'Miles of Stream Opened',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_17': {
          label: 'Acres of Oyster Habitat Restored',
          installed: 0,
          total: 0,
          units: 'acres'
        },
        'metric_18': {
          label: 'Fish Passage Improvements: # of Passage Barriers Rectified',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_19': {
          label: 'Fish Passage Improvements: # of Fish Crossing Barriers',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_20': {
          label: 'Eastern Brook Trout: # of Reintroduced Subwatersheds',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_21': {
          label: 'Eastern Brook Trout: # of Habitat Units Improved',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_22': {
          label: 'Miles of Fencing Installed',
          installed: 0,
          total: 0,
          units: 'miles'
        },
        'metric_23': {
          label: 'Acres of Practice Installed',
          installed: 0,
          total: 0,
          units: 'acres',
          chart: 0
        },
        'metric_24': {
          label: 'Acres protected by BMPs to reduce stormwater runoff	',
          installed: 0,
          total: 0,
          chart: 0,
          units: 'acres'
        },
        'metric_25': {
          label: 'Acres of stormwater BMPs installed',
          installed: 0,
          total: 0,
          chart: 0,
          units: 'acres'
        }
      }
    };

    self.calculate = Calculate;


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
      //
      //
      self.statistics.site(successResponse);


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

                self.project = projectResponse;
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
    // Process rollup statistics for the entire `project`.
    //
    self.statistics = {
        site: function(_thisSite) {

          var _self = this,
              _thesePractices = _self.practices(_thisSite, _thisSite.properties.practices);

        },
        calculations: function(_thisSite, _thesePractices, _loadData) {

          var _self = this;

          angular.forEach(_thesePractices, function(_practice, _practiceIndex){
            switch(_practice.properties.practice_type) {
              case "Agriculture Generic":
                var _calculate = CalculateAgricultureGeneric;
                var _readings = _practice.properties.readings_agriculture_generic;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                var existingLanduseType = "",
                    landRiverSegmentCode = self.site.properties.segment.properties.hgmr_code,
                    planningData = null;

                angular.forEach(_readings, function(reading, $index) {
                  if (reading.properties.measurement_period === 'Planning') {
                    planningData = reading;
                    existingLanduseType = (reading.properties.existing_riparian_landuse) ?  reading.properties.existing_riparian_landuse : "";
                  }
                });

                // Existing Landuse and Land River Segment Code MUST BE TRUTHY
                if (existingLanduseType && landRiverSegmentCode && planningData) {

                  LoadData.query({
                      q: {
                        filters: [
                          {
                            name: 'land_river_segment',
                            op: 'eq',
                            val: landRiverSegmentCode
                          },
                          {
                            name: 'landuse',
                            op: 'eq',
                            val: existingLanduseType
                          }
                        ]
                      }
                    }).$promise.then(function(successResponse) {
                      if (successResponse.features.length === 0) {
                        console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                        $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                      }
                      else {
                        //
                        // Begin calculating nutrient reductions
                        //
                        self.calculateAgricultureGeneric = CalculateAgricultureGeneric;

                        self.calculateAgricultureGeneric.loadData = successResponse.features[0];
                        self.calculateAgricultureGeneric.readings = _readings;

                        self.calculateAgricultureGeneric.getUAL(planningData);

                        // Agriculture Generic: CHESAPEAKE BAY METRICS
                        //
                        // 1. Miles of Streambank Restored
                        //
                        angular.forEach(_readings, function(_reading, _readingIndex){
                            if (_reading.properties.measurement_period === 'Planning' && _calculate.ual && _calculate.ual.nitrogen) {
                                self.rollups.metrics.metric_23.total += _reading.properties.custom_practice_extent_acres

                                // Agriculture Generic: LOAD REDUCTIONS
                                //
                                var _tempReadings_nitrogen_total = (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                                var _tempReadings_phosphorus_total = (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                                var _tempReadings_sediment_total = (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)

                                _tempReadings.nitrogen.total += (_tempReadings_nitrogen_total) ? _tempReadings_nitrogen_total : 0;
                                _tempReadings.phosphorus.total += (_tempReadings_phosphorus_total) ? _tempReadings_phosphorus_total : 0;
                                _tempReadings.sediment.total += (_tempReadings_sediment_total) ? _tempReadings_sediment_total : 0;

                            } else if (_reading.properties.measurement_period === 'Installation' && _calculate.ual && _calculate.ual.nitrogen) {
                                self.rollups.metrics.metric_23.installed += _reading.properties.custom_practice_extent_acres

                                // Agriculture Generic: LOAD REDUCTIONS
                                //
                                var _tempReadings_nitrogen_installed = (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                                var _tempReadings_phosphorus_installed = (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                                var _tempReadings_sediment_installed = (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)

                                _tempReadings.nitrogen.installed += (_tempReadings_nitrogen_installed) ? _tempReadings_nitrogen_installed : 0;
                                _tempReadings.phosphorus.installed += (_tempReadings_phosphorus_installed) ? _tempReadings_phosphorus_installed : 0;
                                _tempReadings.sediment.installed += (_tempReadings_sediment_installed) ? _tempReadings_sediment_installed : 0;
                            }
                        });


                        self.rollups.metrics.metric_23.chart += (self.rollups.metrics.metric_23.installed/self.rollups.metrics.metric_23.total)*100;

                        // ADD TO PRACTICE LIST
                        //
                        self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                        self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                        self.rollups.sediment.total += _tempReadings.sediment.total

                        self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                        self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                        self.rollups.sediment.installed += _tempReadings.sediment.installed

                        self.rollups.all.practices.agriculture_generic.installed += _tempReadings.nitrogen.installed;
                        self.rollups.all.practices.agriculture_generic.total += _tempReadings.nitrogen.total;

                        self.rollups.nitrogen.practices.push({
                          name: 'Other Agricultural Practices',
                          url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/agriculture-generic",
                          installed: _tempReadings.nitrogen.installed,
                          total: _tempReadings.nitrogen.total
                        })
                        self.rollups.phosphorus.practices.push({
                          name: 'Other Agricultural Practices',
                          url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/agriculture-generic",
                          installed: _tempReadings.phosphorus.installed,
                          total: _tempReadings.phosphorus.total
                        })
                        self.rollups.sediment.practices.push({
                          name: 'Other Agricultural Practices',
                          url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/agriculture-generic",
                          installed: _tempReadings.sediment.installed,
                          total: _tempReadings.sediment.total
                        })


                        console.log('self.calculateAgricultureGeneric.ual', self.calculateAgricultureGeneric.ual);
                      }

                    },
                    function(errorResponse) {
                      console.debug('LoadData::errorResponse', errorResponse)
                      console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                    });
                }
                break;
              case "Bank Stabilization":
                var _calculate = CalculateBankStabilization;
                var _readings = _practice.properties.readings_bank_stabilization;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // BANK STABILIZATION: CHESAPEAKE BAY METRICS
                //
                // 1. Miles of Streambank Restored
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_5.total += _calculate.milesStreambankRestored(_reading);

                        // BANK STABILIZATION: LOAD REDUCTIONS
                        //
                        _tempReadings.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading)
                        _tempReadings.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading)
                        _tempReadings.sediment.total += _calculate.plannedSedimentLoadReduction(_reading)
                    } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_5.installed += _calculate.milesStreambankRestored(_reading);

                        // BANK STABILIZATION: LOAD REDUCTIONS
                        //
                        _tempReadings.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading)
                        _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading)
                        _tempReadings.sediment.installed += _calculate.plannedSedimentLoadReduction(_reading)
                    }
                });

                self.rollups.metrics.metric_5.chart += (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;

                // ADD TO PRACTICE LIST
                //
                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.all.practices.bank_stabilization.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.bank_stabilization.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.practices.push({
                  name: 'Bank Stabilization',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bank-stabilization",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Bank Stabilization',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bank-stabilization",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Bank Stabilization',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bank-stabilization",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Bioretention":
                var _calculate = CalculateBioretention;
                var _readings = _practice.properties.readings_bioretention;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // BIORETENTION: CHESAPEAKE BAY METRICS
                //
                // 1. Gallons/Year of Stormwater Detained or Infiltrated
                // 2. Acres of Protected by BMP's to Reduce Stormwater Runoff
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_1.total += _calculate.gallonsReducedPerYear(_reading);
                        self.rollups.metrics.metric_2.total += _calculate.acresProtected(_reading);

                        // BIORETENTION: LOAD REDUCTIONS
                        //
                        _tempReadings.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading, _loadData);
                        _tempReadings.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading, _loadData);
                        _tempReadings.sediment.total += _calculate.plannedSedimentLoadReduction(_reading, _loadData);
                    } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading);
                        self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading);

                        // BIORETENTION: LOAD REDUCTIONS
                        //
                        _tempReadings.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading, _loadData)
                        _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading, _loadData)
                        _tempReadings.sediment.installed += _calculate.plannedSedimentLoadReduction(_reading, _loadData)
                    }
                });

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;

                // ADD TO PRACTICE LIST
                //
                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.all.practices.bioretention.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.bioretention.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.practices.push({
                  name: 'Bioretention',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bioretention",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Bioretention',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bioretention",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Bioretention',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/bioretention",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Enhanced Stream Restoration":
                var _calculate = CalculateEnhancedStreamRestoration;
                var _readings = _practice.properties.readings_enhanced_stream_restoration;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // ENHANCED STREAM RESTORATION: CHESAPEAKE BAY METRICS
                //
                // 1. Miles of Streambank Restored
                // 2. Acres of Hyporheic Area Treated
                // 3. Acres of Floodplain Reconnected
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_5.total += _calculate.milesOfStreambankRestored(_reading);
                      self.rollups.metrics.metric_6.total += _calculate.acresTreated(_reading);
                      self.rollups.metrics.metric_7.total += _reading.properties.connected_floodplain_surface_area;

                      // ENHANCED STREAM RESTORATION: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.total += _calculate.plannedNitrogenProtocol2LoadReduction(_reading, _loadData);
                      _tempReadings.nitrogen.total += _calculate.plannedNitrogenProtocol3LoadReduction(_readings, _loadData);
                      _tempReadings.phosphorus.total += _calculate.plannedPhosphorusProtocol3LoadReduction(_readings, _loadData);
                      _tempReadings.sediment.total += _calculate.plannedSedimentLoadReduction(_readings, _loadData);

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_5.installed += _calculate.milesOfStreambankRestored(_reading);
                      self.rollups.metrics.metric_6.installed += _calculate.acresTreated(_reading);
                      self.rollups.metrics.metric_7.installed += _reading.properties.connected_floodplain_surface_area;

                      // ENHANCED STREAM RESTORATION: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.installed += _calculate.plannedNitrogenProtocol2LoadReduction(_reading, _loadData);
                      _tempReadings.nitrogen.installed += _calculate.plannedNitrogenProtocol3LoadReduction(_readings, _loadData);
                      _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusProtocol3LoadReduction(_readings, _loadData);
                      _tempReadings.sediment.installed += _calculate.plannedSedimentLoadReduction(_readings, _loadData);
                    }
                });

                self.rollups.metrics.metric_5.chart = (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;
                self.rollups.metrics.metric_6.chart = (self.rollups.metrics.metric_6.installed/self.rollups.metrics.metric_6.total)*100;
                self.rollups.metrics.metric_7.chart = (self.rollups.metrics.metric_7.installed/self.rollups.metrics.metric_7.total)*100;

                // ENHANCED STREAM RESTORATION: ADD TO PRACTICE LIST
                //
                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.nitrogen.practices.push({
                  name: 'Enhanced Stream Restoration',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/enhanced-stream-restoration",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Enhanced Stream Restoration',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/enhanced-stream-restoration",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Enhanced Stream Restoration',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/enhanced-stream-restoration",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Forest Buffer":
                var _calculate = CalculateForestBuffer;
                var _readings = _practice.properties.readings_forest_buffer;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                _calculate.site = self.site;

                _calculate.readings = {
                  features: _readings
                };

                _calculate.metrics();

                _calculate.GetPreInstallationLoad('Planning', function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // FOREST BUFFER: CHESAPEAKE BAY METRICS
                    //
                    // 1. Acres of Riparian Restoration
                    // 2. Miles of Riparian Restoration
                    // 3. Number of Trees Planted
                    //
                    // TODO: This is not finished ... Forest buffers has no calculation functions
                    //
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){

                        if (_reading.properties.measurement_period === 'Planning') {

                          var _planned = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.total += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.total += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);
                          self.rollups.metrics.metric_3.total += _reading.properties.number_of_trees_planted;

                          _tempReadings.nitrogen.total += (totalPlannedLoad.nitrogen) ? totalPlannedLoad.nitrogen : 0;
                          _tempReadings.phosphorus.total += (totalPlannedLoad.phosphorus) ? totalPlannedLoad.phosphorus : 0;
                          _tempReadings.sediment.total += (totalPlannedLoad.sediment) ? totalPlannedLoad.sediment : 0;

                        } else if (_reading.properties.measurement_period === 'Installation') {

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.installed += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.installed += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);
                          self.rollups.metrics.metric_3.installed +=  _reading.properties.number_of_trees_planted;

                          _tempReadings.nitrogen.installed += (_installed.nitrogen) ? _installed.nitrogen : 0;
                          _tempReadings.phosphorus.installed += (_installed.phosphorus) ? _installed.phosphorus : 0;
                          _tempReadings.sediment.installed += (_installed.sediment) ? _installed.sediment : 0;
                        }
                    });

                    self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                    self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;
                    self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;

                    // ADD TO PRACTICE LIST
                    //

                    self.rollups.all.practices.forest_buffer.installed += _tempReadings.nitrogen.installed;
                    self.rollups.all.practices.forest_buffer.total += _tempReadings.nitrogen.total;

                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                    self.rollups.nitrogen.practices.push({
                      name: 'Forest Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/forest-buffer",
                      installed: _tempReadings.nitrogen.installed,
                      total: _tempReadings.nitrogen.total,
                      chart: (_tempReadings.nitrogen.installed/_tempReadings.nitrogen.total)*100
                    })
                    self.rollups.phosphorus.practices.push({
                      name: 'Forest Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/forest-buffer",
                      installed: _tempReadings.phosphorus.installed,
                      total: _tempReadings.phosphorus.total,
                      chart: (_tempReadings.phosphorus.installed/_tempReadings.phosphorus.total)*100
                    })
                    self.rollups.sediment.practices.push({
                      name: 'Forest Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/forest-buffer",
                      installed: _tempReadings.sediment.installed,
                      total: _tempReadings.sediment.total,
                      chart: (_tempReadings.sediment.installed/_tempReadings.sediment.total)*100
                    })

                  });

                });

                break;
              case "Grass Buffer":
                var _calculate = CalculateGrassBuffer;
                var _readings = _practice.properties.readings_grass_buffer;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                _calculate.site = self.site;

                _calculate.readings = {
                  features: _readings
                };

                _calculate.metrics();

                _calculate.GetPreInstallationLoad('Planning', function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // FOREST BUFFER: CHESAPEAKE BAY METRICS
                    //
                    // 1. Acres of Riparian Restoration
                    // 2. Miles of Riparian Restoration
                    // 3. Number of Trees Planted
                    //
                    // TODO: This is not finished ... Forest buffers has no calculation functions
                    //
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        if (_reading.properties.measurement_period === 'Planning') {

                          var _planned = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.total += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.total += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);

                          _tempReadings.nitrogen.total += _planned.nitrogen;
                          _tempReadings.phosphorus.total += _planned.phosphorus;
                          _tempReadings.sediment.total += _planned.sediment;

                        } else if (_reading.properties.measurement_period === 'Installation') {

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.installed += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.installed += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);

                          _tempReadings.nitrogen.installed += _installed.nitrogen;
                          _tempReadings.phosphorus.installed += _installed.phosphorus;
                          _tempReadings.sediment.installed += _installed.sediment;
                        }
                    });

                    self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                    self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;

                    // ADD TO PRACTICE LIST
                    //

                    self.rollups.all.practices.grass_buffer.installed += _tempReadings.nitrogen.installed;
                    self.rollups.all.practices.grass_buffer.total += _tempReadings.nitrogen.total;

                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                    self.rollups.nitrogen.practices.push({
                      name: 'Grass Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/grass-buffer",
                      installed: _tempReadings.nitrogen.installed,
                      total: _tempReadings.nitrogen.total,
                      chart: (_tempReadings.nitrogen.installed/_tempReadings.nitrogen.total)*100
                    })
                    self.rollups.phosphorus.practices.push({
                      name: 'Grass Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/grass-buffer",
                      installed: _tempReadings.phosphorus.installed,
                      total: _tempReadings.phosphorus.total,
                      chart: (_tempReadings.phosphorus.installed/_tempReadings.phosphorus.total)*100
                    })
                    self.rollups.sediment.practices.push({
                      name: 'Grass Buffer',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/grass-buffer",
                      installed: _tempReadings.sediment.installed,
                      total: _tempReadings.sediment.total,
                      chart: (_tempReadings.sediment.installed/_tempReadings.sediment.total)*100
                    })

                  });

                });


                break;
              case "In-stream Habitat":
                var _calculate = CalculateInstreamHabitat;
                var _readings = _practice.properties.readings_instream_habitat;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // IN-STREAM HABITAT: CHESAPEAKE BAY METRICS
                //
                // 1. Acres Protected Under Long-term Easment (permanent or >=30 years)
                // 2. Habitat Restoration Target Species 1
                // 3. Habitat Restoration Target Species 2
                // 4. Acres of Habitat Restored
                // 5. Acres of Wetlands Restored
                // 6. Miles of Living Shoreline Restored
                // 7. Miles of Stream Opened
                // 8. Acres of Oyster Habitat Restored
                // 9. Fish Passage Improvements: # of Passage Barriers Rectified
                // 10. Fish Passage Improvements: # of Fish Crossing Barriers
                // 11. Eastern Brook Trout: # of Reintroduced Subwatersheds
                // 12. Eastern Brook Trout: # of Habitat Units Improved
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_10.total += _reading.properties.metrics_areas_protected;
                      self.rollups.metrics.metric_11.total += 0;
                      self.rollups.metrics.metric_12.total += 0;
                      self.rollups.metrics.metric_13.total += _reading.properties.metrics_areas_of_habitat_restored;
                      self.rollups.metrics.metric_14.total += _reading.properties.metrics_acres_of_wetlands_restored;
                      self.rollups.metrics.metric_15.total += _reading.properties.metrics_miles_of_living_shoreline_restored;
                      self.rollups.metrics.metric_16.total += _reading.properties.metrics_miles_of_stream_opened;
                      self.rollups.metrics.metric_17.total += _reading.properties.metrics_acres_of_oyster_habitat_restored;
                      self.rollups.metrics.metric_18.total += _reading.properties.metrics_fish_passage_improvements_number_of_passage_barriers_re;
                      self.rollups.metrics.metric_19.total += _reading.properties.metrics_fish_passage_improvements_number_of_fish_crossing_barri;
                      self.rollups.metrics.metric_20.total += _reading.properties.metrics_number_of_reintroduced_subwatersheds_eastern_brook_trou;
                      self.rollups.metrics.metric_21.total += _reading.properties.metrics_number_of_habitat_units_improved_eastern_brook_trout;

                      // IN-STREAM HABITAT: LOAD REDUCTIONS FOR PLANNED/TOTAL
                      //
                      // !!!! NO NITROGEN, PHOSPHORUS, OR SEDIMENT REDUCTIONS

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_10.installed += _reading.properties.metrics_areas_protected;
                      self.rollups.metrics.metric_11.installed += 0;
                      self.rollups.metrics.metric_12.installed += 0;
                      self.rollups.metrics.metric_13.installed += _reading.properties.metrics_areas_of_habitat_restored;
                      self.rollups.metrics.metric_14.installed += _reading.properties.metrics_acres_of_wetlands_restored;
                      self.rollups.metrics.metric_15.installed += _reading.properties.metrics_miles_of_living_shoreline_restored;
                      self.rollups.metrics.metric_16.installed += _reading.properties.metrics_miles_of_stream_opened;
                      self.rollups.metrics.metric_17.installed += _reading.properties.metrics_acres_of_oyster_habitat_restored;
                      self.rollups.metrics.metric_18.installed += _reading.properties.metrics_fish_passage_improvements_number_of_passage_barriers_re;
                      self.rollups.metrics.metric_19.installed += _reading.properties.metrics_fish_passage_improvements_number_of_fish_crossing_barri;
                      self.rollups.metrics.metric_20.installed += _reading.properties.metrics_number_of_reintroduced_subwatersheds_eastern_brook_trou;
                      self.rollups.metrics.metric_21.installed += _reading.properties.metrics_number_of_habitat_units_improved_eastern_brook_trout;

                      // IN-STREAM HABITAT: LOAD REDUCTIONS FOR INSTALLATION
                      //
                      // !!!! NO NITROGEN, PHOSPHORUS, OR SEDIMENT REDUCTIONS

                    }
                });

                self.rollups.metrics.metric_10.chart = (self.rollups.metrics.metric_10.installed/self.rollups.metrics.metric_10.total)*100;
                self.rollups.metrics.metric_11.chart = (self.rollups.metrics.metric_11.installed/self.rollups.metrics.metric_11.total)*100;
                self.rollups.metrics.metric_12.chart = (self.rollups.metrics.metric_12.installed/self.rollups.metrics.metric_12.total)*100;
                self.rollups.metrics.metric_13.chart = (self.rollups.metrics.metric_13.installed/self.rollups.metrics.metric_13.total)*100;
                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;
                self.rollups.metrics.metric_15.chart = (self.rollups.metrics.metric_15.installed/self.rollups.metrics.metric_15.total)*100;
                self.rollups.metrics.metric_16.chart = (self.rollups.metrics.metric_16.installed/self.rollups.metrics.metric_16.total)*100;
                self.rollups.metrics.metric_17.chart = (self.rollups.metrics.metric_17.installed/self.rollups.metrics.metric_17.total)*100;
                self.rollups.metrics.metric_18.chart = (self.rollups.metrics.metric_18.installed/self.rollups.metrics.metric_18.total)*100;
                self.rollups.metrics.metric_19.chart = (self.rollups.metrics.metric_19.installed/self.rollups.metrics.metric_19.total)*100;
                self.rollups.metrics.metric_20.chart = (self.rollups.metrics.metric_20.installed/self.rollups.metrics.metric_20.total)*100;
                self.rollups.metrics.metric_21.chart = (self.rollups.metrics.metric_21.installed/self.rollups.metrics.metric_21.total)*100;

                self.rollups.all.practices.instream_habitat.inactive = true;

                self.rollups.nitrogen.practices.push({
                  name: 'In-stream Habitat',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/instream-habitat",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total,
                  chart: (_tempReadings.nitrogen.installed/_tempReadings.nitrogen.total)*100,
                  inactive: true
                })
                self.rollups.phosphorus.practices.push({
                  name: 'In-stream Habitat',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/instream-habitat",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total,
                  chart: (_tempReadings.phosphorus.installed/_tempReadings.phosphorus.total)*100,
                  inactive: true
                })
                self.rollups.sediment.practices.push({
                  name: 'In-stream Habitat',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/instream-habitat",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total,
                  chart: (_tempReadings.sediment.installed/_tempReadings.sediment.total)*100,
                  inactive: true
                })

                break;
              case "Livestock Exclusion":
                var _readings = _practice.properties.readings_livestock_exclusion;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                var _calculate = CalculateLivestockExclusion;

                _calculate.readings = {
                  features: _readings
                };

                _calculate.site = _thisSite;

                _calculate.practice_efficiency = {
                  s_efficiency: 30/100,
                  n_efficiency: 9/100,
                  p_efficiency: 24/100
                };

                _calculate.grass_efficiency = {
                  s_efficiency: 60/100,
                  n_efficiency: 21/100,
                  p_efficiency: 45/100
                };

                _calculate.forest_efficiency = {
                  s_efficiency: 60/100,
                  n_efficiency: 21/100,
                  p_efficiency: 45/100
                };

                _calculate.GetPreInstallationLoad(function(preUplandPreInstallationLoadReturn) {

                  var preUplandPreInstallationLoad = preUplandPreInstallationLoadReturn;

                  _calculate.GetPlannedLoad('Planning', function(totalPlannedLoadReturn) {

                    var totalPlannedLoad = totalPlannedLoadReturn;

                    // LIVESTOCK EXCLUSION: CHESAPEAKE BAY METRICS
                    //
                    // 1. Miles of Fencing Installed
                    //
                    //
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        if (_reading.properties.measurement_period === 'Planning') {
                          var _planned = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_22.total += _calculate.toMiles(_reading.properties.length_of_fencing);

                          _tempReadings.nitrogen.total += _planned.nitrogen;
                          _tempReadings.phosphorus.total += _planned.phosphorus;
                          _tempReadings.sediment.total += _planned.sediment;

                        } else if (_reading.properties.measurement_period === 'Installation') {
                          self.rollups.metrics.metric_22.installed += _calculate.toMiles(_reading.properties.length_of_fencing);

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          _tempReadings.nitrogen.installed += _installed.nitrogen;
                          _tempReadings.phosphorus.installed += _installed.phosphorus;
                          _tempReadings.sediment.installed += _installed.sediment;
                        }
                    });

                    self.rollups.metrics.metric_22.chart = (self.rollups.metrics.metric_22.installed/self.rollups.metrics.metric_22.total)*100;

                    // ADD TO PRACTICE LIST
                    //
                    self.rollups.all.practices.livestock_exclusion.installed += _tempReadings.nitrogen.installed;
                    self.rollups.all.practices.livestock_exclusion.total += _tempReadings.nitrogen.total;

                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                    self.rollups.nitrogen.practices.push({
                      name: 'Livestock Exclusion',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/livestock-exclusion",
                      installed: _tempReadings.nitrogen.installed,
                      total: _tempReadings.nitrogen.total
                    })
                    self.rollups.phosphorus.practices.push({
                      name: 'Livestock Exclusion',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/livestock-exclusion",
                      installed: _tempReadings.phosphorus.installed,
                      total: _tempReadings.phosphorus.total
                    })
                    self.rollups.sediment.practices.push({
                      name: 'Livestock Exclusion',
                      url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/livestock-exclusion",
                      installed: _tempReadings.sediment.installed,
                      total: _tempReadings.sediment.total
                    })

                  })
                })


                break;
              case "Non-Tidal Wetlands":
                var _calculate = CalculateWetlandsNonTidal;
                var _readings = _practice.properties.readings_wetlands_nontidal;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // NON-TIDAL WETLANDS: CHESAPEAKE BAY METRICS
                //
                // 1. Acres of Wetland Restored
                //
                // TODO: It appears that this may not be working right for metric_14
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_14.total += _calculate.milesRestored(_readings, 'Planning');

                      var _results = _calculate.loads(_readings, _thisSite.properties.segment.properties.hgmr_code)

                      // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.total += _results.planned.nitrogen
                      _tempReadings.phosphorus.total += _results.planned.phosphorus
                      _tempReadings.sediment.total += _results.planned.sediment
                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_14.installed += _calculate.milesRestored(_readings, 'Installation');

                      // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.installed += _calculate.plannedLoad(_reading, 'nitrogen')
                      _tempReadings.phosphorus.installed += _calculate.plannedLoad(_reading, 'phosphorus')
                      _tempReadings.sediment.installed += _calculate.plannedLoad(_reading, 'sediment')
                    }
                });

                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;

                // ADD TO PRACTICE LIST
                //
                self.rollups.all.practices.nontidal_wetlands.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.nontidal_wetlands.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.nitrogen.practices.push({
                  name: 'Non-Tidal Wetlands',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/nontidal-wetlands",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Non-Tidal Wetlands',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/nontidal-wetlands",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Non-Tidal Wetlands',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/nontidal-wetlands",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Shoreline Management":
                var _calculate = CalculateShorelineManagement;
                var _readings = _practice.properties.readings_shoreline_management;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // SHORELINE MANAGEMENT: CHESAPEAKE BAY METRICS
                //
                // 1. Acres of Wetland Restored
                // 2. Miles of Living Shoreline Restored
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_14.total += _reading.properties.installation_area_of_planted_or_replanted_tidal_wetlands;
                      self.rollups.metrics.metric_15.total += _reading.properties.installation_length_of_living_shoreline_restored;

                      var _results = _calculate.loads(_readings)

                      // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.total += _results.planned.protocol_2_tn
                      _tempReadings.nitrogen.total += _results.planned.protocol_4_tn

                      _tempReadings.phosphorus.total += _results.planned.protocol_3_tp
                      _tempReadings.phosphorus.total += _results.planned.protocol_4_tp

                      _tempReadings.sediment.total += _results.planned.protocol_1_tss
                      _tempReadings.sediment.total += _results.planned.protocol_3_tss

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_14.installed += _reading.properties.installation_area_of_planted_or_replanted_tidal_wetlands;
                      self.rollups.metrics.metric_15.installed += _reading.properties.installation_length_of_living_shoreline_restored;

                      // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.installed += _calculate.loadProtocol2TN(_reading)
                      _tempReadings.nitrogen.installed += _calculate.loadProtocol4TN(_reading)

                      _tempReadings.phosphorus.installed += _calculate.loadProtocol3TP(_reading)
                      _tempReadings.phosphorus.installed += _calculate.loadProtocol4TP(_reading)

                      _tempReadings.sediment.installed += _calculate.loadProtocol1TSS(_reading)
                      _tempReadings.sediment.installed += _calculate.loadProtocol3TSS(_reading)
                    }
                });

                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;
                self.rollups.metrics.metric_15.chart = (self.rollups.metrics.metric_15.installed/self.rollups.metrics.metric_15.total)*100;

                // ADD TO PRACTICE LIST
                //
                self.rollups.all.practices.shoreline_management.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.shoreline_management.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.nitrogen.practices.push({
                  name: 'Shoreline Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/shoreline-management",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Shoreline Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/shoreline-management",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Shoreline Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/shoreline-management",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Stormwater":
                var _calculate = CalculateStormwater;
                var _readings = _practice.properties.readings_stormwater;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_1.total += _calculate.gallonsPerYearStormwaterDetainedFiltrationInstalled(_readings)
                      self.rollups.metrics.metric_23.total += _calculate.metricTotalAcresProtected(_reading)
                      self.rollups.metrics.metric_24.total += _calculate.metricTotalPracticeArea(_reading)

                      // Stormwater Management: LOAD REDUCTIONS
                      //
                      if (_reading.properties.site_reduction_classification === 'Runoff Reduction') {
                        // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                        //
                        _tempReadings.nitrogen.total += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveNitrogen')
                        _tempReadings.phosphorus.total += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus')
                        _tempReadings.sediment.total += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment')
                      }
                      else {
                        _tempReadings.nitrogen.total += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedStormwaterTreatmentAdjustorCurveNitrogen')
                        _tempReadings.phosphorus.total += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus')
                        _tempReadings.sediment.total += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment')
                      }

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_1.installed += _calculate.gallonsPerYearStormwaterDetainedFiltrationInstalled(_readings)
                      self.rollups.metrics.metric_23.installed += _calculate.metricInstalledAcresProtected(_readings);
                      self.rollups.metrics.metric_24.installed += _calculate.metricInstalledPracticeArea(_readings);

                      // Stormwater Management: LOAD REDUCTIONS
                      //
                      if (_reading.properties.site_reduction_classification === 'Runoff Reduction') {
                        _tempReadings.nitrogen.installed += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveNitrogen', _reading)
                        _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus', _reading)
                        _tempReadings.sediment.installed += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment', _reading)
                      }
                      else {
                        _tempReadings.nitrogen.installed += _calculate.plannedNitrogenReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedStormwaterTreatmentAdjustorCurveNitrogen', _reading)
                        _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurvePhosphorus', _reading)
                        _tempReadings.sediment.installed += _calculate.plannedSedimentReduction(_reading.properties.impervious_area, _reading.properties.total_drainage_area, _loadData, 'plannedRunoffReductionAdjustorCurveSediment', _reading)
                      }

                    }
                });

                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_23.chart = (self.rollups.metrics.metric_23.installed/self.rollups.metrics.metric_23.total)*100;
                self.rollups.metrics.metric_24.chart = (self.rollups.metrics.metric_24.installed/self.rollups.metrics.metric_24.total)*100;

                self.rollups.all.practices.stormwater.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.stormwater.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.practices.push({
                  name: 'Stormwater Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/stormwater",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Stormwater Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/stormwater",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Stormwater Management',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/stormwater",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total
                })

                break;
              case "Urban Homeowner":
                var _calculate = CalculateUrbanHomeowner;
                var _readings = _practice.properties.readings_urban_homeowner;
                var _tempReadings = {
                  nitrogen: {
                    installed: 0,
                    total: 0
                  },
                  phosphorus: {
                    installed: 0,
                    total: 0
                  },
                  sediment: {
                    installed: 0,
                    total: 0
                  }
                };

                // URBAN HOMEOWNER: CHESAPEAKE BAY METRICS
                //
                // 1. Number of Trees Planted
                // 2. Square Feet of Impervious Surface Removed
                // 3. Gallons/Year of Stormwater Detained or Infiltrated
                // 4. Areas of Protected by BMP's to Reduce Stormwater Runoff
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_1.total += _calculate.gallonsReducedPerYear(_reading.properties);
                      self.rollups.metrics.metric_2.total += _calculate.acresProtected(_reading.properties);
                      self.rollups.metrics.metric_3.total += _calculate.quantityInstalled(_readings, 'tree_planting');
                      self.rollups.metrics.metric_4.total += _calculate.quantityInstalled(_readings, 'impervious_cover_removal_area');

                      // URBAN HOMEOWNER: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.total += _calculate.plannedNitrogenLoadReduction(_reading.properties, _loadData)
                      _tempReadings.phosphorus.total += _calculate.plannedPhosphorusLoadReduction(_reading.properties, _loadData)

                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading.properties);
                      self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading.properties);
                      self.rollups.metrics.metric_3.installed += _calculate.quantityInstalled(_readings, 'tree_planting');
                      self.rollups.metrics.metric_4.installed += _calculate.quantityInstalled(_readings, 'impervious_cover_removal_area');

                      // URBAN HOMEOWNER: LOAD REDUCTIONS
                      //
                      _tempReadings.nitrogen.installed += _calculate.plannedNitrogenLoadReduction(_reading.properties, _loadData)
                      _tempReadings.phosphorus.installed += _calculate.plannedPhosphorusLoadReduction(_reading.properties, _loadData)

                    }
                });

                self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;
                self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;
                self.rollups.metrics.metric_4.chart = (self.rollups.metrics.metric_4.installed/self.rollups.metrics.metric_4.total)*100;

                // ADD TO PRACTICE LIST
                //
                self.rollups.all.practices.urban_homeowner.installed += _tempReadings.nitrogen.installed;
                self.rollups.all.practices.urban_homeowner.total += _tempReadings.nitrogen.total;

                self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                self.rollups.sediment.total += _tempReadings.sediment.total

                self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                self.rollups.sediment.installed += _tempReadings.sediment.installed

                self.rollups.nitrogen.practices.push({
                  name: 'Urban Homeowner',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/urban-homeowner",
                  installed: _tempReadings.nitrogen.installed,
                  total: _tempReadings.nitrogen.total
                })
                self.rollups.phosphorus.practices.push({
                  name: 'Urban Homeowner',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/urban-homeowner",
                  installed: _tempReadings.phosphorus.installed,
                  total: _tempReadings.phosphorus.total
                })
                self.rollups.sediment.practices.push({
                  name: 'Urban Homeowner',
                  url: "/projects/" + self.site.properties.project_id + "/sites/" + self.site.id + "/practices/" + _practice.id + "/urban-homeowner",
                  installed: _tempReadings.sediment.installed,
                  total: _tempReadings.sediment.total,
                  inactive: true
                })

                break;
            }

          });

        },
        practices: function(_thisSite, _thesePractices) {

            if (!_thisSite.properties.state) {
              console.warn('No state was selected for this Site. No Load Reductions can be estimated with out state efficiency data.');
              return;
            }

            var _self = this,
                _params = {
                  "q": {
                    "filters": [
                      {
                        "name": "state",
                        "op": "eq",
                        "val": _thisSite.properties.state
                      }
                    ]
                  }
                };

            UALStateLoad.query(_params, function(successResponse){

              var _loadData = {};

              angular.forEach(successResponse.features, function(feature, $index) {
                _loadData[feature.properties.developed_type] = {
                  tn_ual: feature.properties.tn_ual,
                  tp_ual: feature.properties.tp_ual,
                  tss_ual: feature.properties.tss_ual
                };
              });

              self.statistics.calculations(_thisSite, _thesePractices, _loadData);
            }, function(errorResponse) {
              console.log('ERROR LOADING LOAD DATA', errorResponse)
            });

            return;
        },
        readings: function(_these) {}
    };


    //
    //
    //
    // $scope.$watch(angular.bind(this, function () {
    //   return this.rollups;
    // }), function (newVal) {
    //
    //   //
    //   // Everytime the `self.rollups` variable is updated with more best
    //   // management practices, we need to rerun this loop to ensure proper
    //   // rollup to a practice type.
    //   //
    //   console.log('self.statistics.all()', newVal);
    //   debugger;
    // }, true);


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
    },
    'agriculture-generic': {
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
        templateUrl: '/modules/components/practices/modules/agriculture-generic/views/report--view.html',
        controller: 'AgricultureGenericReportController',
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
            return Practice.agricultureGeneric({
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

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateAgricultureGeneric', function(Calculate, EfficiencyAgricultureGeneric, LoadData, $q) {

    return {
      readings: null,
      loadData: null,
      ual: null,
      GetLoadVariables: function(landRiverSegmentCode, existingLanduseType, callback) {

        var self = this;

        var deferred = $q.defer();

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

            if (callback) {
              callback(successResponse)
            }

            deferred.resolve(planned);
          }, function(errorResponse) {

          });

        return deferred.promise;
      },
      getUAL: function(_planning_data) {
        /**
         * Calculate nitrogen, phosphorus, and sediment UALs.
         *
         * @param (object) _planning_data
         *    Planning data reading containing best management practice extent
         *
         * @return (object) _ual
         *    Object containing nitrogen, phosphorus, and sediment UAL values
         */

        var self = this;

        /**
         * Ensure that our LoadData has been returned and assigned to this
         * Agriculture Generic Calculator.
         */
        if (!self.loadData) {
          console.warn("CalculateAgricultureGeneric: Load data not found for practice");
          return;
        }

        /**
         * Load Data is present, we may proceed with calculating the reductions
         */
        var _extent = _planning_data.properties.custom_practice_extent_acres;

        /**
         * UAL's are derived data in the user interface, you get them
         * for each nutrient as follows:
         *
         * Abbreviations:
         *     PA = Practice Area in Acres
         *
         * - Nitrogen = (EOS_TTON/EOS_ACRES)
         * - Phosphorus = (EOS_TTOP/EOS_ACRES)
         * - Sediment = ((EOS_TSS/EOS_ACRES)/2000)
         */
        var _ual = {
          nitrogen: (self.loadData.properties.eos_totn/self.loadData.properties.eos_acres),
          phosphorus: (self.loadData.properties.eos_totp/self.loadData.properties.eos_acres),
          sediment: ((self.loadData.properties.eos_tss/self.loadData.properties.eos_acres)/2000)
        };

        self.ual = _ual;
      },
      getReductionValue: function(_extent, _efficiency, _nutrient) {
        /**
         * Calculate a single nutrient reduction.
         *
         * @param (number) _extent
         *    Extent of the BMP in Acres
         * @param (number) _efficiency
         *    Single nutrient efficiency number from
         *    efficiency_agriculture_generic table
         * @param (object) _nutrient
         *    Nutrient UAL calculated based on current land_river_segment HGMR
         *    code and existing land use type
         *
         * @return (number) _reductionValue
         *    The reduction value for the specified nutrient
         */

         var _ual = self.ual,
             _ualValue = _ual[_nutrient],
             _efficiencyPercentage = (_efficiency/100),
             _reductionValue = _extent*_ualValue*_efficiencyPercentage;

        return _reductionValue
      },
      totalAcresInstalled: function() {

        var self = this,
            total_area = 0;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Installation') {
            total_area += reading.properties.custom_practice_extent_acres;
          }
        });

        return total_area;
      },
      percentageAcresInstalled: function() {

        var self = this,
            total_area = 0,
            planned_area = 0;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            planned_area = reading.properties.custom_practice_extent_acres;
          }
          else if (reading.properties.measurement_period === 'Installation') {
            total_area += reading.properties.custom_practice_extent_acres;
          }
        });

        return ((total_area/planned_area)*100);
      },
      quantityInstalled: function(_ual, _efficiency, format) {

        var installed = 0,
            planned = 0,
            self = this,
            _efficiencyValue = null;

        angular.forEach(self.readings.features, function(value, $index) {

          // Figure out which efficieny to use
          //
          switch (_efficiency) {
            case 'n_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_nitrogen;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
            case 'p_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_phosphorus;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
            case 's_efficiency':
              var _default = value.properties.generic_agriculture_efficiency.properties[_efficiency],
                  _custom = value.properties.custom_model_sediment;

              _efficiencyValue = (_custom === null) ? _default : _custom ;
              break;
          }

          if (value.properties.measurement_period === 'Planning') {
            planned += value.properties.custom_practice_extent_acres*_ual*(_efficiencyValue/100)
          }
          else if (value.properties.measurement_period === 'Installation') {
            installed += value.properties.custom_practice_extent_acres*_ual*(_efficiencyValue/100)
          }
        });

        var percentage_installed = installed/planned;

        return (format === '%') ? (percentage_installed*100) : installed;

      }
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
    .controller('AgricultureGenericReportController', function (Account, Calculate, CalculateAgricultureGeneric, Efficiency, LoadData, $location, $log, Notifications, practice, PracticeAgricultureGeneric, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId,
          practicePlanningData = null;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
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

            //
            // Setup and Find Existing Landuse and BMP Short Name Data
            //
            var existingLanduseType = "",
                landRiverSegmentCode = self.site.properties.segment.properties.hgmr_code,
                planningData = null;

            angular.forEach(self.readings.features, function(reading, $index) {
              if (reading.properties.measurement_period === 'Planning') {
                planningData = practicePlanningData = reading;
                existingLanduseType = (reading.properties.existing_riparian_landuse) ?  reading.properties.existing_riparian_landuse : "";
              }
            });

            // Existing Landuse and Land River Segment Code MUST BE TRUTHY
            if (existingLanduseType && landRiverSegmentCode && planningData) {

              LoadData.query({
                  q: {
                    filters: [
                      {
                        name: 'land_river_segment',
                        op: 'eq',
                        val: landRiverSegmentCode
                      },
                      {
                        name: 'landuse',
                        op: 'eq',
                        val: existingLanduseType
                      }
                    ]
                  }
                }).$promise.then(function(successResponse) {
                  if (successResponse.features.length === 0) {
                    console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                    $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                  }
                  else {
                    //
                    // Begin calculating nutrient reductions
                    //
                    self.calculateAgricultureGeneric = CalculateAgricultureGeneric;

                    self.calculateAgricultureGeneric.loadData = successResponse.features[0];
                    self.calculateAgricultureGeneric.readings = self.readings;

                    self.calculateAgricultureGeneric.getUAL(planningData);

                    console.log('self.calculateAgricultureGeneric.ual', self.calculateAgricultureGeneric.ual);
                  }

                },
                function(errorResponse) {
                  console.debug('LoadData::errorResponse', errorResponse)
                  console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
                  $rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
                });
            }
            else {
              console.warn("LoadData requirements not met by grantee input. Please add a valid Landuse Type and Land River Segment. Input landuse:", existingLanduseType, "land_river_segment", self.site.properties.segment.properties.hgmr_code)
              //$rootScope.notifications.error('Missing Load Data', 'Load Data is unavailable for this within this Land River Segment');
            }

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

        if (measurementPeriod === "Planning") {
          var newReading = new PracticeAgricultureGeneric({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id
            });
        }
        else {
          var newReading = new PracticeAgricultureGeneric({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id,
              'generic_agriculture_efficiency_id': practicePlanningData.properties.generic_agriculture_efficiency_id,
              'model_type': practicePlanningData.properties.model_type,
              'existing_riparian_landuse': practicePlanningData.properties.existing_riparian_landuse,
              'custom_model_name': practicePlanningData.properties.custom_model_name,
              'custom_model_source': practicePlanningData.properties.custom_model_source,
              'custom_model_nitrogen': practicePlanningData.properties.custom_model_nitrogen,
              'custom_model_phosphorus': practicePlanningData.properties.custom_model_phosphorus,
              'custom_model_sediment': practicePlanningData.properties.custom_model_sediment
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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer/summary', {
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
   * @ngdoc service
   * @name FieldDoc.Storage
   * @description
   *    Provides site/application specific variables to the entire application
   * Service in the FieldDoc.
   */
  angular.module('FieldDoc')
    .service('CalculateForestBuffer', function(Calculate, Efficiency, LoadData, $q) {
      return {
        newLanduse: 'for',
        readings: {},
        site: {},
        GetLoadVariables: function(period, landuse) {

          var self = this;
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
                }, function(errorResponse) {
                  deferred.resolve({
                    area: null,
                    efficieny: {
                      eos_totn: null,
                      eos_tss: null,
                      eos_totp: null,
                      eos_acres: null
                    }
                  });
                });
            }
          });

          return deferred.promise;
        },
        GetPreInstallationLoad: function(period, callback) {

          var self = this;

          //
          // Existing Landuse
          //
          self.GetLoadVariables(period).then(function(loaddata) {

            if (!loaddata.area) {
              self.results.totalPreInstallationLoad = null;
              return;
            }

            var uplandPreInstallationLoad = {
              nitrogen: ((loaddata.area*4)*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
              phosphorus: ((loaddata.area*2)*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
              sediment: (((loaddata.area*2)*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
            };

            var existingPreInstallationLoad = {
              nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
              phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
              sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
            };

            self.results.totalPreInstallationLoad = {
              efficieny: loaddata.efficieny,
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };

            if (callback) {
              callback(self.results.totalPreInstallationLoad)
            }

          });


        },
        GetPlannedLoad: function(period, callback) {

          var self = this;

          var existingLanduseType, bufferProjectType;

          angular.forEach(self.readings.features, function(reading, $index) {
            if (reading.properties.measurement_period === 'Planning') {
              existingLanduseType = reading.properties.existing_riparian_landuse;
              bufferProjectType = reading.properties.type_of_buffer_project;
            }
          });

          if (!period && !existingLanduseType) {
            return;
          }

          self.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
            self.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

              var best_management_practice_short_name = 'ForestBuffersTrp';

              if (bufferProjectType === 'agriculture' && (existingLanduseType === 'pas' || existingLanduseType === 'npa')) {
                best_management_practice_short_name = 'ForestBuffersTrp';
              } else if (bufferProjectType === 'agriculture' && (existingLanduseType !== 'pas' || existingLanduseType === 'npa')) {
                best_management_practice_short_name = 'ForestBuffers';
              } else if (bufferProjectType === 'urban') {
                best_management_practice_short_name = 'ForestBufUrban';
              }

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
                      val: best_management_practice_short_name
                    }
                  ]
                }
              }).$promise.then(function(efficiencyResponse) {

                if (efficiencyResponse.features.length !== 0) {
                    self.practice_efficiency = efficiencyResponse.features[0].properties;
                }


               if (typeof self.practice_efficiency !== "undefined") {


                    //
                    // EXISTING CONDITION — LOAD VALUES
                    //
                    // console.log('uplandPlannedInstallationLoad', self.results.totalPreInstallationLoad.uplandLanduse.nitrogen, self.practice_efficiency.n_efficiency)
                    var uplandPlannedInstallationLoad = {
                        sediment: self.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                        nitrogen: self.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                        phosphorus: self.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
                    };

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

                    self.results.totalPlannedLoad = totals;
                }
                else {

                    self.results.totalPlannedLoad = {
                        efficiency: {
                            new: null,
                            existing: null
                        },
                        nitrogen: 0,
                        phophorus: 0,
                        sediment: 0
                    }
                }

                if (callback) {
                    callback(self.results.totalPlannedLoad)
                }

              });
            });
          });

        },
        quantityInstalled: function(values, element, format) {

          var self = this;

          var planned_total = 0,
              installed_total = 0,
              percentage = 0;

          // Get readings organized by their Type
          angular.forEach(values, function(reading, $index) {
            if (reading.properties.measurement_period === 'Planning') {
              planned_total += self.GetSingleInstalledLoad(reading)[element];
            } else if (reading.properties.measurement_period === 'Installation') {
              installed_total += self.GetSingleInstalledLoad(reading)[element];
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

        },
        GetPercentageOfInstalled: function(field, format) {
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

          var self = this;

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
        },
        GetSingleInstalledLoad: function(value) {

          var self = this;

          var reduction = 0,
              bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
              landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
              preExistingEfficieny = self.results.totalPreInstallationLoad.efficieny,
              landuseEfficiency = (self.results.totalPlannedLoad && self.results.totalPlannedLoad.efficiency) ? self.results.totalPlannedLoad.efficiency : null,
              uplandPreInstallationLoad = null,
              existingPreInstallationLoad = null;

          if (self.practice_efficiency) {
            uplandPreInstallationLoad = {
              sediment: (((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_tss/landuseEfficiency.existing.efficieny.eos_acres))/2000)*self.practice_efficiency.s_efficiency),
              nitrogen: ((bufferArea*4*(landuseEfficiency.existing.efficieny.eos_totn/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.n_efficiency),
              phosphorus: ((bufferArea*2*(landuseEfficiency.existing.efficieny.eos_totp/landuseEfficiency.existing.efficieny.eos_acres))*self.practice_efficiency.p_efficiency)
            };
          }

          if (landuseEfficiency && landuseEfficiency.existing !== null && landuseEfficiency.new !== null) {
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
        },
        GetTreeDensity: function(trees, length, width) {
          return (trees/(length*width/43560));
        },
        GetPercentage: function(part, total) {
          return ((part/total)*100);
        },
        GetConversion: function(part, total) {
          return (part/total);
        },
        GetConversionWithArea: function(length, width, total) {
          return ((length*width)/total);
        },
        GetRestorationTotal: function(unit, area) {

          var self = this;

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
        },GetRestorationPercentage: function(unit, area) {

          var self = this;

          var planned_area = 0,
              total_area = self.GetRestorationTotal(unit, area);

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
        },
        results: function() {

          var self = this;

          return {
            percentageLengthOfBuffer: {
              percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
              total: self.GetPercentageOfInstalled('length_of_buffer')
            },
            percentageTreesPlanted: {

              percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
              total: self.GetPercentageOfInstalled('number_of_trees_planted')
            },
            totalPreInstallationLoad: self.GetPreInstallationLoad('Planning'),
            totalPlannedLoad: self.GetPlannedLoad('Planning'),
            totalMilesRestored: self.GetRestorationTotal(5280),
            percentageMilesRestored: self.GetRestorationPercentage(5280, false),
            totalAcresRestored: self.GetRestorationTotal(43560, true),
            percentageAcresRestored: self.GetRestorationPercentage(43560, true)
          }
        },
        metrics: function() {

          var self = this;

          return {
            percentageLengthOfBuffer: {
              percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
              total: self.GetPercentageOfInstalled('length_of_buffer')
            },
            percentageTreesPlanted: {

              percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
              total: self.GetPercentageOfInstalled('number_of_trees_planted')
            },
            totalMilesRestored: self.GetRestorationTotal(5280),
            percentageMilesRestored: self.GetRestorationPercentage(5280, false),
            totalAcresRestored: self.GetRestorationTotal(43560, true),
            percentageAcresRestored: self.GetRestorationPercentage(43560, true)
          }
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

            //
            //
            //
            self.calculateForestBuffer = CalculateForestBuffer;

            self.calculateForestBuffer.site = self.site;
            self.calculateForestBuffer.readings = self.readings;

            self.calculateForestBuffer.return = self.calculateForestBuffer.results();

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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer/summary', {
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

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateGrassBuffer', function(Calculate, Efficiency, LoadData, $q) {
    return {
      newLanduse: 'hyo',
      readings: {},
      site: {},
      GetLoadVariables: function(period, landuse) {

        var self = this;
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
      },
      GetPreInstallationLoad: function(period, callback) {

        var self = this;

        //
        // Existing Landuse
        //
        self.GetLoadVariables(period).then(function(loaddata) {

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

          self.results.totalPreInstallationLoad = {
            efficieny: loaddata.efficieny,
            uplandLanduse: uplandPreInstallationLoad,
            existingLanduse: existingPreInstallationLoad,
            nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen,
            phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus,
            sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
          };

          if (callback) {
            callback(self.results.totalPreInstallationLoad)
          }

        });


      },
      GetPlannedLoad: function(period, callback) {

        var existingLanduseType;
        var self = this;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            existingLanduseType = reading.properties.existing_riparian_landuse;
          }
        });

        if (!period && !existingLanduseType) {
          return;
        }

        self.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {

          self.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

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
                  sediment: self.results.totalPreInstallationLoad.uplandLanduse.sediment*(self.practice_efficiency.s_efficiency),
                  nitrogen: self.results.totalPreInstallationLoad.uplandLanduse.nitrogen*(self.practice_efficiency.n_efficiency),
                  phosphorus: self.results.totalPreInstallationLoad.uplandLanduse.phosphorus*(self.practice_efficiency.p_efficiency)
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

                self.results.totalPlannedLoad = totals;

                if (callback) {
                  callback(self.results.totalPlannedLoad)
                }
              }

            });
          });
        });

      },
      quantityInstalled: function(values, element, format) {

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.GetSingleInstalledLoad(reading)[element];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.GetSingleInstalledLoad(reading)[element];
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

      },
      GetPercentageOfInstalled: function(field, format) {
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

        var self = this;

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
      },
      GetSingleInstalledLoad: function(value) {

        var self = this;

        var reduction = 0,
            bufferArea = ((value.properties.length_of_buffer * value.properties.average_width_of_buffer)/43560),
            landuse = (value.properties.existing_riparian_landuse) ? value.properties.existing_riparian_landuse : null,
            preExistingEfficieny = self.results.totalPreInstallationLoad.efficieny,
            landuseEfficiency = (self.results.totalPlannedLoad && self.results.totalPlannedLoad.efficiency) ? self.results.totalPlannedLoad.efficiency : null,
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
      },
      GetTreeDensity: function(trees, length, width) {
        return (trees/(length*width/43560));
      },
      GetPercentage: function(part, total) {
        return ((part/total)*100);
      },
      GetConversion: function(part, total) {
        return (part/total);
      },
      GetConversionWithArea: function(length, width, total) {
        return ((length*width)/total);
      },
      GetRestorationTotal: function(unit, area) {

        var self = this;
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
      },
      GetRestorationPercentage: function(unit, area) {

        var self = this;
        var planned_area = 0,
            total_area = self.GetRestorationTotal(unit, area);

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
      },
      results: function() {

        var self = this;

        return {
            percentageLengthOfBuffer: {
            percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
            total: self.GetPercentageOfInstalled('length_of_buffer')
          },
          percentageTreesPlanted: {

            percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
            total: self.GetPercentageOfInstalled('number_of_trees_planted')
          },
          totalPreInstallationLoad: self.GetPreInstallationLoad('Planning'),
          totalPlannedLoad: self.GetPlannedLoad('Planning'),
          totalMilesRestored: self.GetRestorationTotal(5280),
          percentageMilesRestored: self.GetRestorationPercentage(5280, false),
          totalAcresRestored: self.GetRestorationTotal(43560, true),
          percentageAcresRestored: self.GetRestorationPercentage(43560, true)
        }
      },
      metrics: function() {

        var self = this;

        return {
            percentageLengthOfBuffer: {
            percentage: self.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
            total: self.GetPercentageOfInstalled('length_of_buffer')
          },
          percentageTreesPlanted: {

            percentage: self.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
            total: self.GetPercentageOfInstalled('number_of_trees_planted')
          },
          totalMilesRestored: self.GetRestorationTotal(5280),
          percentageMilesRestored: self.GetRestorationPercentage(5280, false),
          totalAcresRestored: self.GetRestorationTotal(43560, true),
          percentageAcresRestored: self.GetRestorationPercentage(43560, true)
        }
      }
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

            //
            //
            //
            self.calculateGrassBuffer = CalculateGrassBuffer;

            self.calculateGrassBuffer.site = self.site;
            self.calculateGrassBuffer.readings = self.readings;

            self.calculateGrassBuffer.return = self.calculateGrassBuffer.results();

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
            animals: function(AnimalManure) {
              return AnimalManure.query();
            },
            readings: function(Practice, $route) {
              return Practice.livestockExclusion({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion/summary', {
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
 * @name FieldDoc.LivestockExclusionCalculate
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateLivestockExclusion', function(Calculate, Landuse, Efficiency, LoadData, $q) {
    return {
      newLanduse: 'hyo',
      readings: {},
      site: {},
      practice_efficiency: {},
      grass_efficiency: {},
      forest_efficiency: {},
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
          // console.log('Efficienies selected', area, efficiency);
          return Calculate.getLoadTotals(area, efficiency.features[0].properties);
        });

        return promise;
      },
      GetLoadVariables: function(period, landuse) {

        var self = this;

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
      },
      GetPreInstallationLoad: function(callback) {

        var self = this;

        var rotationalGrazingArea, existingLanduseType, uplandLanduseType, animal, auDaysYr;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
             rotationalGrazingArea = (reading.properties.length_of_fencing*200/43560);
             existingLanduseType = reading.properties.existing_riparian_landuse;
             uplandLanduseType = reading.properties.upland_landuse;
             animal = reading.properties.animal_type;
             auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
          }
        });

        self.GetLoadVariables('Planning', existingLanduseType).then(function(existingLoaddata) {
          self.GetLoadVariables('Planning', uplandLanduseType).then(function(loaddata) {

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

            self.results.totalPreInstallationLoad = {
              directDeposit: directDeposit,
              efficieny: loaddata.efficieny,
              uplandLanduse: uplandPreInstallationLoad,
              existingLanduse: existingPreInstallationLoad,
              nitrogen: uplandPreInstallationLoad.nitrogen + existingPreInstallationLoad.nitrogen + directDeposit.nitrogen,
              phosphorus: uplandPreInstallationLoad.phosphorus + existingPreInstallationLoad.phosphorus + directDeposit.phosphorus,
              sediment: uplandPreInstallationLoad.sediment + existingPreInstallationLoad.sediment
            };

            console.log('self.results.totalPreInstallationLoad', self.results.totalPreInstallationLoad)

            if (callback) {
              callback(self.results.totalPreInstallationLoad);
            }

          });
        });

      },
      GetPlannedLoad: function(period, callback) {

        var self = this;

        var existingLanduseType, bmpEfficiency, animal, auDaysYr;

        angular.forEach(self.readings.features, function(reading, $index) {
          if (reading.properties.measurement_period === period) {
            existingLanduseType = reading.properties.existing_riparian_landuse;
            bmpEfficiency = (reading.properties.buffer_type) ? self.grass_efficiency : self.forest_efficiency;
            animal = reading.properties.animal_type;
            auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
          }
        });

        self.GetLoadVariables(period, existingLanduseType).then(function(existingLoaddata) {
          self.GetLoadVariables(period, self.newLanduse).then(function(newLoaddata) {

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
                sediment: (self.results.totalPreInstallationLoad.uplandLanduse.sediment/100)*bmpEfficiency.s_efficiency,
                nitrogen: self.results.totalPreInstallationLoad.uplandLanduse.nitrogen/100*bmpEfficiency.n_efficiency,
                phosphorus: self.results.totalPreInstallationLoad.uplandLanduse.phosphorus/100*bmpEfficiency.p_efficiency
              };

              // console.log('PLANNED uplandPlannedInstallationLoad', uplandPlannedInstallationLoad);

              var existingPlannedInstallationLoad = {
                sediment: ((existingLoaddata.area*((existingLoaddata.efficieny.eos_tss/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_tss/newLoaddata.efficieny.eos_acres)))/2000),
                nitrogen: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totn/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totn/newLoaddata.efficieny.eos_acres))),
                phosphorus: (existingLoaddata.area*((existingLoaddata.efficieny.eos_totp/existingLoaddata.efficieny.eos_acres)-(newLoaddata.efficieny.eos_totp/newLoaddata.efficieny.eos_acres)))
              };

              // console.log('PLANNED existingPlannedInstallationLoad', existingPlannedInstallationLoad);

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

              self.results.totalPlannedLoad = totals;

              if (callback) {
                callback(self.results.totalPlannedLoad);
              }
            });
          });
        });
      },
      quantityReductionInstalled: function(values, element, format) {

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {
          if (reading.properties.measurement_period === 'Planning') {
            planned_total += self.GetSingleInstalledLoad(reading)[element];
          } else if (reading.properties.measurement_period === 'Installation') {
            installed_total += self.GetSingleInstalledLoad(reading)[element];
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

      },
      GetPercentageOfInstalled: function(field, format) {
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

        var self = this;

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
      },
      GetSingleInstalledLoad: function(value) {

        /********************************************************************/
        // Setup
        /********************************************************************/

        var self = this;

        //
        // Before we allow any of the following calculations to happen we
        // need to ensure that our basic load data has been loaded
        //
        if (!self.results.totalPlannedLoad) {
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
            newLanduseLoadData = self.results.totalPlannedLoad.efficiency.new.efficieny,
            existingLoaddata = self.results.totalPlannedLoad.efficiency.existing.efficieny,
            uplandLoaddata = self.results.totalPreInstallationLoad.efficieny,
            rotationalGrazingArea = (value.properties.length_of_fencing*200/43560),
            animal = value.properties.animal_type,
            auDaysYr,
            planningValue;

        //
        // Get Animal Unit Days/Year from Planning data
        //
        angular.forEach(self.readings.features, function(reading) {
          if (reading.properties.measurement_period === 'Planning') {
            planningValue = reading.properties;
            auDaysYr = (self.averageDaysPerYearInStream(reading.properties)*self.animalUnits(reading.properties.number_of_livestock, reading.properties.average_weight));
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
          nitrogen: (auDaysYr*animal.properties.manure)*animal.properties.total_nitrogen,
          phosphorus: (auDaysYr*animal.properties.manure)*animal.properties.total_phosphorus,
        };

         var preInstallationeBMPLoadTotals = {
             nitrogen: preUplandPreInstallationLoad.nitrogen + preExistingPreInstallationLoad.nitrogen + preDirectDeposit.nitrogen,
             phosphorus: preUplandPreInstallationLoad.phosphorus + preExistingPreInstallationLoad.phosphorus + preDirectDeposit.phosphorus,
             sediment: preUplandPreInstallationLoad.sediment + preExistingPreInstallationLoad.sediment
         };

        //  console.log('preInstallationeBMPLoadTotals', preInstallationeBMPLoadTotals);

         /********************************************************************/
         // Part 2: Loads based on "Installed" buffer size
         /********************************************************************/
         var uplandPlannedInstallationLoad = {
           sediment: preUplandPreInstallationLoad.sediment/100*bmpEfficiency.s_efficiency,
           nitrogen: preUplandPreInstallationLoad.nitrogen/100*bmpEfficiency.n_efficiency,
           phosphorus: preUplandPreInstallationLoad.phosphorus/100*bmpEfficiency.p_efficiency
         };

         var existingPlannedInstallationLoad = {
           sediment: ((bufferArea*((existingLoaddata.eos_tss/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_tss/newLanduseLoadData.eos_acres)))/2000),
           nitrogen: (bufferArea*((existingLoaddata.eos_totn/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totn/newLanduseLoadData.eos_acres))),
           phosphorus: (bufferArea*((existingLoaddata.eos_totp/existingLoaddata.eos_acres)-(newLanduseLoadData.eos_totp/newLanduseLoadData.eos_acres)))
         };

         var directDeposit = {
           nitrogen: preDirectDeposit.nitrogen*value.properties.length_of_fencing/planningValue.length_of_fencing,
           phosphorus: preDirectDeposit.phosphorus*value.properties.length_of_fencing/planningValue.length_of_fencing,
         };

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
      },
      GetTreeDensity: function(trees, length, width) {
        return (trees/(length*width/43560));
      },
      GetPercentage: function(part, total) {
        return ((part/total)*100);
      },
      GetConversion: function(part, total) {
        return (part/total);
      },
      GetConversionWithArea: function(length, width, total) {
        return ((length*width)/total);
      },
      GetRestorationTotal: function(unit, area) {

        var self = this;

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

        // console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


        return (total_area/unit);
      },
      GetRestorationPercentage: function(unit, area) {

        var self = this;

        var planned_area = 0,
            total_area = self.GetRestorationTotal(unit, area);

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
      },
      quantityBufferInstalled: function(values, element, format) {

        var self = this;

        var planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {
          if (reading.measurement_period === 'Planning') {
            planned_total += self.GetSingleInstalledLoad(reading)[element];
          } else if (reading.measurement_period === 'Installation') {
            installed_total += self.GetSingleInstalledLoad(reading)[element];
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

      },
      results: function() {

        var self = this;

        return {
          totalPreInstallationLoad: self.GetPreInstallationLoad(),
          totalPlannedLoad: self.GetPlannedLoad('Planning')
        }
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
  .controller('LivestockExclusionReportController', function (Account, animals, Calculate, CalculateLivestockExclusion, Efficiency, LoadData, $location, practice, PracticeLivestockExclusion, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

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

            //
            //
            //
            //
            self.calculateLivestockExclusion = CalculateLivestockExclusion;

            self.calculateLivestockExclusion.readings = self.readings;
            self.calculateLivestockExclusion.site = self.site;

            self.calculateLivestockExclusion.practice_efficiency = {
              s_efficiency: 30/100,
              n_efficiency: 9/100,
              p_efficiency: 24/100
            };

            self.calculateLivestockExclusion.grass_efficiency = {
              s_efficiency: 60/100,
              n_efficiency: 21/100,
              p_efficiency: 45/100
            };

            self.calculateLivestockExclusion.forest_efficiency = {
              s_efficiency: 60/100,
              n_efficiency: 21/100,
              p_efficiency: 45/100
            };

            self.calculateLivestockExclusion.results();

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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bioretention/summary', {
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
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/instream-habitat/summary', {
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
  .service('CalculateInstreamHabitat', function() {
    return {
      quantityInstalled: function(values, field, format) {

          console.log('values', values, 'field', field, 'format', format);

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
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/bank-stabilization/summary', {
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
            ler = (parseFloat(value.properties.installation_lateral_erosion_rate)*0.5),
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
            ler = (value.properties.installation_lateral_erosion_rate*0.5),
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
            ler = (value.properties.installation_lateral_erosion_rate*0.5),
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
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/enhanced-stream-restoration/summary', {
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
  .controller('EnhancedStreamRestorationReportController', function (Account, Calculate, CalculateEnhancedStreamRestoration, $location, practice, Practice, PracticeEnhancedStreamRestoration, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

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

    self.createBankStabilizationPractice = function() {
        self.practice = new Practice({
            'practice_type': 'Bank Stabilization',
            'site_id': self.site.id,
            'account_id': self.site.properties.project.properties.account_id
        });

        self.practice.$save(function(successResponse) {
            $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
          }, function(errorResponse) {
            console.error('Unable to create your site, please try again later');
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

        var newReading = new PracticeEnhancedStreamRestoration({
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

      self.createBankStabilizationPractice = function() {
          self.practice = new Practice({
              'practice_type': 'Bank Stabilization',
              'site_id': self.site.id,
              'account_id': self.summary.site.properties.project.properties.account_id
          });

          self.practice.$save(function(successResponse) {
              $location.path('/projects/' + self.site.properties.project.id + '/sites/' + self.site.id + '/practices/' + successResponse.id + '/edit');
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
          templateUrl: '/modules/components/practices/modules/nontidal-wetlands/views/report--view.html',
          controller: 'WetlandsNonTidalReportController',
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
              return Practice.wetlandsNontidal({
                id: $route.current.params.practiceId
              });
            }
          }
        })
        .when('/projects/:projectId/sites/:siteId/practices/:practiceId/nontidal-wetlands/summary', {
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

(function(){

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateWetlandsNonTidal
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateWetlandsNonTidal', function(Calculate, LoadData, $q) {
      return {
        efficiency: {
          urban: {
            nitrogen: 0.20,
            phosphorus: 0.45,
            sediment: 0.60
          }
        },
        reduceLoadValues: function(previousValue, currentValue) {
          return previousValue + currentValue;
        },
        preInstallationLoad: function(data, parameter) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          var landuses = 4,
              calculatedLoads = [];

          for (var i = 0; i <= landuses; i++) {

            var landuse = 'installation_upland_landuse_'+(i+1),
                acresTreated = 'installation_landuse_acreage_'+(i+1),
                loads = 'installation_loaddata_'+(i+1);

            if (data.properties[loads] && data.properties[loads].hasOwnProperty('properties')) {
              var loadData = {
                    nitrogen: (data.properties[loads].properties.eos_totn/data.properties[loads].properties.eos_acres),
                    phosphorus: (data.properties[loads].properties.eos_totp/data.properties[loads].properties.eos_acres),
                    sediment: (data.properties[loads].properties.eos_tss/data.properties[loads].properties.eos_acres)/2000
                  };

              calculatedLoads.push(data.properties[acresTreated]*loadData[parameter]);
            }
          };

          return (calculatedLoads.length) ? calculatedLoads.reduce(this.reduceLoadValues) : 0;
        },
        plannedLoad: function(data, parameter) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          var self = this,
              landuses = 4,
              calculatedLoads = [],
              efficiency_parameter,
              reductionValue = 0;

          switch (parameter) {
            case 'nitrogen':
              efficiency_parameter = 'n_efficiency';
              break;
            case 'phosphorus':
              efficiency_parameter = 'p_efficiency';
              break;
            case 'sediment':
              efficiency_parameter = 's_efficiency';
              break;
          }

          for (var i = 0; i < landuses; i++) {
            var landuse = 'installation_upland_landuse_'+(i+1),
                acresTreated = 'installation_landuse_acreage_'+(i+1),
                efficiency = 'installation_efficiency_'+(i+1),
                loads = 'installation_loaddata_'+(i+1);

            if (data.properties[loads] && data.properties[loads].hasOwnProperty('properties')) {
              var loadData = {
                nitrogen: (data.properties[loads].properties.eos_totn/data.properties[loads].properties.eos_acres),
                phosphorus: (data.properties[loads].properties.eos_totp/data.properties[loads].properties.eos_acres),
                sediment: (data.properties[loads].properties.eos_tss/data.properties[loads].properties.eos_acres)/2000
              };

              var parameterReduction = data.properties[acresTreated]*loadData[parameter]*data.properties[efficiency].properties[efficiency_parameter];

              // console.log(parameter, efficiency_parameter, data.properties[acresTreated], '*', loadData[parameter], '*', data.properties[efficiency].properties[efficiency_parameter], '=', parameterReduction);

              calculatedLoads.push(parameterReduction);
            }

          };

          // *data.properties[efficiency].properties[efficiency_parameter]

          if (calculatedLoads.length) {
            reductionValue = calculatedLoads.reduce(this.reduceLoadValues);
          }

          return reductionValue;
        },
        loads: function(reports, segment) {

          var self = this,
              planningData = Calculate.getPlanningData(reports);

          return {
            preinstallation: {
              nitrogen: self.preInstallationLoad(planningData, 'nitrogen'),
              phosphorus: self.preInstallationLoad(planningData, 'phosphorus'),
              sediment: self.preInstallationLoad(planningData, 'sediment')
            },
            planned: {
              nitrogen: self.plannedLoad(planningData, 'nitrogen'),
              phosphorus: self.plannedLoad(planningData, 'phosphorus'),
              sediment: self.plannedLoad(planningData, 'sediment')
            }
          };

        },
        installed: function(values, parameter, format) {

          var self = this,
              plannedTotal = 0,
              installedTotal = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === 'Installation') {
              installedTotal += self.plannedLoad(values[i], parameter);
            }
            else if (values[i].properties.measurement_period === 'Planning') {
              plannedTotal += self.plannedLoad(values[i], parameter);
            }
          }

          if (plannedTotal >= 1) {
            if (format === '%') {
              return ((installedTotal/plannedTotal)*100);
            } else {
              return installedTotal;
            }
          }

          return 0;
        },
        milesRestored: function(values, period, format) {

          var self = this,
              milesRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {

              var acreage = [
                values[i].properties.installation_landuse_acreage_1,
                values[i].properties.installation_landuse_acreage_2,
                values[i].properties.installation_landuse_acreage_3,
                values[i].properties.installation_landuse_acreage_4,
                values[i].properties.installation_landuse_acreage_5,
                values[i].properties.installation_landuse_acreage_6
              ]

              milesRestored += acreage.reduce(this.reduceLoadValues);
            }
          }

          if (format === '%') {
            var plannedMilesRestored = self.milesRestored(values, 'Planning');
            milesRestored = (milesRestored/plannedMilesRestored)*100;
          }

          return milesRestored;
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
      }
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:WetlandsNonTidalReportController
   * @description
   */
  angular.module('FieldDoc')
    .controller('WetlandsNonTidalReportController', function (Account, Calculate, CalculateWetlandsNonTidal, Efficiency, LoadData, $location, $log, practice, PracticeWetlandsNonTidal, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

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
      self.calculateWetlandsNonTidal = CalculateWetlandsNonTidal;

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

        self.results = self.calculateWetlandsNonTidal.loads(self.readings.features, self.segment)

      }, function(errorResponse) {

      });

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeWetlandsNonTidal({
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
          templateUrl: '/modules/components/practices/modules/shoreline-management/views/report--view.html',
          controller: 'ShorelineManagementReportController',
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
              return Practice.shorelineManagement({
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

(function(){

  'use strict';

  /**
   * @ngdoc service
   * @name FieldDoc.CalculateShorelineManagement
   * @description
   */
  angular.module('FieldDoc')
    .service('CalculateShorelineManagement', function(Calculate, LoadData, $q) {
      return {
        efficiency: {
          protocol_2_tn_reduction_rate: 0,
          protocol_3_tp_reduction_rate: 0,
          protocol_3_tss_reduction_rate: 0,
          protocol_4_tn_reduction_rate: 0,
          protocol_4_tp_reduction_rate: 0,
        },
        reduceLoadValues: function(previousValue, currentValue) {
          return previousValue + currentValue;
        },
        loadProtocol1TSS: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          var multipler_1 = data.properties.installation_length_of_living_shoreline_restored,
              multipler_2 = data.properties.installation_existing_average_bank_height,
              multipler_3 = data.properties.installation_existing_shoreline_recession_rate,
              multipler_4 = data.properties.installation_soil_bulk_density,
              multipler_5 = data.properties.installation_sand_reduction_factor,
              multipler_6 = data.properties.installation_bank_instability_reduction_factor,
              divider = 2000,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2*multipler_3*multipler_4*multipler_5*multipler_6)/2000;

          return returnValue
        },
        loadProtocol2TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }
          
          if (data.properties.protocol_2_tn_reduction_rate) {
            this.efficiency.protocol_2_tn_reduction_rate = data.properties.protocol_2_tn_reduction_rate;
          }

          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_2_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol3TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_3_tp_reduction_rate) {
            this.efficiency.protocol_3_tp_reduction_rate = data.properties.protocol_3_tp_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_3_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol3TSS: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_3_tss_reduction_rate) {
            this.efficiency.protocol_3_tss_reduction_rate = data.properties.protocol_3_tss_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_3_tss_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol4TN: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_4_tn_reduction_rate) {
            this.efficiency.protocol_4_tn_reduction_rate = data.properties.protocol_4_tn_reduction_rate;
          }

          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_4_tn_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loadProtocol4TP: function(data) {

          if (!data.hasOwnProperty('properties')) {
            return [];
          }

          if (data.properties.protocol_4_tp_reduction_rate) {
            this.efficiency.protocol_4_tp_reduction_rate = data.properties.protocol_4_tp_reduction_rate;
          }
          
          var multipler_1 = data.properties.installation_area_of_planted_or_replanted_tidal_wetlands,
              multipler_2 = this.efficiency.protocol_4_tp_reduction_rate,
              returnValue = 0;

          returnValue = (multipler_1*multipler_2);

          return returnValue
        },
        loads: function(reports) {

          var self = this,
              planningData = Calculate.getPlanningData(reports);

          return {
            planned: {
              protocol_1_tss: self.loadProtocol1TSS(planningData),
              protocol_2_tn: self.loadProtocol2TN(planningData),
              protocol_3_tp: self.loadProtocol3TP(planningData),
              protocol_3_tss: self.loadProtocol3TSS(planningData),
              protocol_4_tn: self.loadProtocol4TN(planningData),
              protocol_4_tp: self.loadProtocol4TP(planningData)
            }
          };

        },
        installed: function(values, parameter, format) {

          var self = this,
              planned_protocol_1_tss_total = 0,
              planned_protocol_2_tn_total = 0,
              planned_protocol_3_tp_total = 0,
              planned_protocol_3_tss_total = 0,
              planned_protocol_4_tn_total = 0,
              planned_protocol_4_tp_total = 0,

              installed_protocol_1_tss_total = 0,
              installed_protocol_2_tn_total = 0,
              installed_protocol_3_tp_total = 0,
              installed_protocol_3_tss_total = 0,
              installed_protocol_4_tn_total = 0,
              installed_protocol_4_tp_total = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === 'Installation') {
              installed_protocol_1_tss_total += self.loadProtocol1TSS(values[i]);
              installed_protocol_2_tn_total += self.loadProtocol2TN(values[i]);
              installed_protocol_3_tp_total += self.loadProtocol3TP(values[i]);
              installed_protocol_3_tss_total += self.loadProtocol3TSS(values[i]);
              installed_protocol_4_tn_total += self.loadProtocol4TN(values[i]);
              installed_protocol_4_tp_total += self.loadProtocol4TP(values[i]);
            }
            else if (values[i].properties.measurement_period === 'Planning') {
              planned_protocol_1_tss_total += self.loadProtocol1TSS(values[i]);
              planned_protocol_2_tn_total += self.loadProtocol2TN(values[i]);
              planned_protocol_3_tp_total += self.loadProtocol3TP(values[i]);
              planned_protocol_3_tss_total += self.loadProtocol3TSS(values[i]);
              planned_protocol_4_tn_total += self.loadProtocol4TN(values[i]);
              planned_protocol_4_tp_total += self.loadProtocol4TP(values[i]);
            }
          }

          if (planned_protocol_1_tss_total >= 1) {
            if (format === '%') {
              return ((installed_protocol_1_tss_total/planned_protocol_1_tss_total)*100);
            } else {
              return installed_protocol_1_tss_total;
            }
          }

          return 0;
        },
        milesRestored: function(values, period, format) {

          var self = this,
              milesRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {
              milesRestored += values[i].properties.installation_length_of_living_shoreline_restored;
            }
          }

          if (format === '%') {
            var plannedMilesRestored = self.milesRestored(values, 'Planning');
            milesRestored = (milesRestored/plannedMilesRestored)*100;
          }

          return (milesRestored/5280);
        },
        acresRestored: function(values, period, format) {

          var self = this,
              acresRestored = 0;

          for (var i = 0; i < values.length; i++) {
            if (values[i].properties.measurement_period === period) {
              acresRestored += values[i].properties.installation_area_of_planted_or_replanted_tidal_wetlands;
            }
          }

          if (format === '%') {
            var plannedAcresRestored = self.acresRestored(values, 'Planning');
            acresRestored = (acresRestored/plannedAcresRestored)*100;
          }

          return acresRestored;
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
      }
    });

}());

(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name FieldDoc.controller:ShorelineManagementReportController
   * @description
   */
  angular.module('FieldDoc')
    .controller('ShorelineManagementReportController', function (Account, Calculate, CalculateShorelineManagement, Efficiency, LoadData, $location, $log, practice, PracticeShorelineManagement, $q, readings, $rootScope, $route, site, $scope, user, Utility, $window) {

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
      self.calculateShorelineManagement = CalculateShorelineManagement;

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

        console.log('self.total', self.total)

        self.results = self.calculateShorelineManagement.loads(self.readings.features)

        console.log('self.results', self.results)

      }, function(errorResponse) {

      });

      self.addReading = function(measurementPeriod) {

        var newReading = new PracticeShorelineManagement({
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
        templateUrl: '/modules/components/practices/modules/stormwater/views/report--view.html',
        controller: 'StormwaterReportController',
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
            return Practice.stormwater({
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

'use strict';

/**
 * @ngdoc service
 * @name FieldDoc.Storage
 * @description
 * Service in the FieldDoc.
 */
angular.module('FieldDoc')
  .service('CalculateStormwater', function(Calculate, $q) {

    return {
      readings: null,
      loadData: null,
      plannedRunoffReductionAdjustorCurveNitrogen: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0308*Math.pow(depthTreated, 5),
            second = 0.2562*Math.pow(depthTreated, 4),
            third = 0.8634*Math.pow(depthTreated, 3),
            fourth = 1.5285*Math.pow(depthTreated, 2),
            fifth = 1.501*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.013);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurvePhosphorus: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0304*Math.pow(depthTreated, 5),
            second = 0.2619*Math.pow(depthTreated, 4),
            third = 0.9161*Math.pow(depthTreated, 3),
            fourth = 1.6837*Math.pow(depthTreated, 2),
            fifth = 1.7072*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedRunoffReductionAdjustorCurveSediment: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0326*Math.pow(depthTreated, 5),
            second = 0.2806*Math.pow(depthTreated, 4),
            third = 0.9816*Math.pow(depthTreated, 3),
            fourth = 1.8039*Math.pow(depthTreated, 2),
            fifth = 1.8292*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0098);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveNitrogen: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0152*Math.pow(depthTreated, 5),
            second = 0.131*Math.pow(depthTreated, 4),
            third = 0.4581*Math.pow(depthTreated, 3),
            fourth = 0.8418*Math.pow(depthTreated, 2),
            fifth = 0.8536*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0046);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurvePhosphorus: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0239*Math.pow(depthTreated, 5),
            second = 0.2058*Math.pow(depthTreated, 4),
            third = 0.7198*Math.pow(depthTreated, 3),
            fourth = 1.3229*Math.pow(depthTreated, 2),
            fifth = 1.3414*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0072);

        return (format === '%') ? reduction*100 : reduction;
      },
      plannedStormwaterTreatmentAdjustorCurveSediment: function(_report, format) {

        var self = this,
            depthTreated = 1.0;

        if (_report) {
          depthTreated = self.runoffDepthTreated(_report)
        }

        var first = 0.0304*Math.pow(depthTreated, 5),
            second = 0.2619*Math.pow(depthTreated, 4),
            third = 0.9161*Math.pow(depthTreated, 3),
            fourth = 1.6837*Math.pow(depthTreated, 2),
            fifth = 1.7072*depthTreated,
            reduction = (first-second+third-fourth+fifth-0.0091);

        return (format === '%') ? reduction*100 : reduction;
      },
      prePlannedNitrogenLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tn_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tn_ual))/43560;
      },
      prePlannedPhosphorusLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tp_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tp_ual))/43560;
      },
      prePlannedSedimentLoad: function(imperviousArea, drainageArea, loadData) {
        return ((imperviousArea*loadData.impervious.tss_ual) + (drainageArea-imperviousArea) * (loadData.pervious.tss_ual))/43560;
      },
      plannedNitrogenReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //
        // TO DO this WE PASS THE APPROPRIATE `func` either a `RunoffReduction`
        // or `StormwaterTreatment`
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedNitrogenLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      plannedPhosphorusReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedPhosphorusLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      plannedSedimentReduction: function(imperviousArea, drainageArea, loadData, func, _report) {

        //
        // NEED TO KNOW IF THE PROJECT IS `RUNOFF REDUCTION` or `STROMWATER
        // TREATMENT` SO THAT WE CAN SELECT THE RIGHT ADJUSTOR CURVE %
        //

        var self = this,
            _thisReport = (_report) ? _report : null,
            prePlannedReduction = self.prePlannedSedimentLoad(imperviousArea, drainageArea, loadData),
            plannedAdjustorCurve = self[func](_thisReport);

        return (prePlannedReduction*plannedAdjustorCurve);
      },
      metricTotalPracticeArea: function(_report) {
        return _report.properties.practice_1_extent+_report.properties.practice_2_extent+_report.properties.practice_3_extent+_report.properties.practice_4_extent;
      },
      metricTotalAcresProtected: function(_report) {
        return (_report.properties.total_drainage_area/43560)
      },
      gallonsPerYearStormwaterDetainedFiltration: function(_report) {
        return (_report.properties.runoff_volume_captured*325851.4)
      },
      runoffDepthTreated: function(_report) {

        var depthTreated = 1.0;

        if (_report.properties.runoff_volume_captured && _report.properties.impervious_area) {
          depthTreated = (_report.properties.runoff_volume_captured*12)/(_report.properties.impervious_area/43560);
        }

        return depthTreated;
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
      quantityNitrogenReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurveNitrogen';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurveNitrogen';
          }

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_nitrogen_planned = self.plannedNitrogenReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_nitrogen_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_nitrogen_installed = self.plannedNitrogenReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_nitrogen_installed;
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
      quantityPhosphorusReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurvePhosphorus';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurvePhosphorus';
          }
          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned   = self.plannedPhosphorusReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.plannedPhosphorusReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total !== 0) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      quantitySedimentReducedToDate: function(values, loaddata, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          var _adjustor;

          if (reading.properties.site_reduction_classification === 'Runoff Reduction') {
            _adjustor = 'plannedRunoffReductionAdjustorCurveSediment';
          }
          else {
            _adjustor = 'plannedStormwaterTreatmentAdjustorCurveSediment';
          }

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.plannedSedimentReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor);
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.plannedSedimentReduction(reading.properties.impervious_area, reading.properties.total_drainage_area, loaddata, _adjustor, reading);
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (planned_total !== 0) {
          if (format === '%') {
            percentage = (installed_total/planned_total);
            return (percentage*100);
          } else {
            return installed_total;
          }
        }

        return 0;
      },
      gallonsPerYearStormwaterDetainedFiltrationInstalled: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.gallonsPerYearStormwaterDetainedFiltration(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.gallonsPerYearStormwaterDetainedFiltration(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          } else if (planned_total < installed_total) {
            return 100;
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;
      },
      metricInstalledAcresProtected: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.metricTotalAcresProtected(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.metricTotalAcresProtected(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;
      },
      metricInstalledPracticeArea: function(values, format) {

        var self = this,
            planned_total = 0,
            installed_total = 0,
            percentage = 0;

        // Get readings organized by their Type
        angular.forEach(values, function(reading, $index) {

          if (reading.properties.measurement_period === 'Planning') {
            var _reduced_planned = self.metricTotalPracticeArea(reading)
            planned_total += _reduced_planned;
          } else if (reading.properties.measurement_period === 'Installation') {
            var _reduced_installed = self.metricTotalPracticeArea(reading)
            installed_total += _reduced_installed;
          }

        });

        // Divide the Installed Total by the Planned Total to get a percentage of installed
        if (format === '%') {
          if (planned_total) {
            percentage = (installed_total/planned_total);
            return (percentage*100) > 100 ? 100 : (percentage*100);
          }
          return 0;
        } else {
          return installed_total;
        }

        return 0;

      }
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
    .controller('StormwaterReportController', function (Account, Calculate, CalculateStormwater, Efficiency, LoadData, $location, $log, Notifications, practice, PracticeStormwater, $q, readings, $rootScope, $route, site, $scope, UALStateLoad, user, Utility, $window) {

      var self = this,
          projectId = $route.current.params.projectId,
          siteId = $route.current.params.siteId,
          practiceId = $route.current.params.practiceId,
          practicePlanningData = null;

      $rootScope.page = {};

      self.practiceType = null;
      self.project = {
        'id': projectId
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


          readings.$promise.then(function(successResponse) {

            self.readings = successResponse;

            self.total = {
              planning: self.calculate.getTotalReadingsByCategory('Planning', self.readings.features),
              installation: self.calculate.getTotalReadingsByCategory('Installation', self.readings.features),
              monitoring: self.calculate.getTotalReadingsByCategory('Monitoring', self.readings.features)
            };

            angular.forEach(self.readings.features, function(reading, $index) {
              if (reading.properties.measurement_period === 'Planning') {
                 practicePlanningData = reading;
              }
            });

            self.calculateStormwater = CalculateStormwater

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

        if (measurementPeriod === "Planning") {
          var newReading = new PracticeStormwater({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id
            });
        }
        else {
          var newReading = new PracticeStormwater({
              'measurement_period': measurementPeriod,
              'report_date': new Date(),
              'practice_id': practiceId,
              'account_id': self.site.properties.project.properties.account_id,
              'practice_1_name': practicePlanningData.properties.practice_1_name,
              'practice_2_name': practicePlanningData.properties.practice_2_name,
              'practice_3_name': practicePlanningData.properties.practice_3_name,
              'practice_4_name': practicePlanningData.properties.practice_4_name,
              'project_type': practicePlanningData.properties.project_type,
              'site_reduction_classification': practicePlanningData.properties.site_reduction_classification
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
    .service('PracticeAgricultureGeneric', function (environment, Preprocessors, $resource) {
      return $resource(environment.apiUrl.concat('/v1/data/bmp-agriculture-generic/:id'), {
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

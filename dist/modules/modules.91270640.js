'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular
  .module('practiceMonitoringAssessmentApp', [
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ipCookie',
    'ui.gravatar',
    'leaflet-directive',
    'angularFileUpload',
    'geolocation',
    'angular-loading-bar',
    'monospaced.elastic',
    'angular-medium-editor',
    'angularMoment'
  ]);
'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider
      .otherwise({
        templateUrl: '/modules/shared/errors/error404--view.html'
      });

    $locationProvider.html5Mode(true);

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', function($routeProvider) {

    $routeProvider
      .when('/', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SecurityLogin',
        resolve: {
          user: function(User) {
            return User.getUser();
          }
        }
      })
      .when('/authorize', {
        template: '',
        controller: 'SecurityAuthorize'
      })
      .when('/logout', {
        template: '',
        controller: 'SecurityLogout'
      });

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SecurityController
 * @description
 * # SecurityController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SecurityAuthorize', ['$location', 'token', function($location, token) {

    //
    // If we have an Access Token, forward the user to the Projects page
    //
    if (token.get()) {
      $location.path('/projects');
    } else {      
      token.save();
    }

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SecurityLogin
 * @description
 * # SecurityLogin
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SecurityLogin', ['$scope', 'ipCookie', '$location', function($scope, ipCookie, $location) {

    var session_cookie = ipCookie('COMMONS_SESSION');

    //
    // Setup basic page variables
    //
    $scope.page = {
      template: '/modules/shared/security/views/securityLogin--view.html',
      title: 'NFWF Grant Monitoring and Assessment',
      header: {
        hidden: true
      }
    };

    $scope.setupLoginPage = function() {
      var host = $location.host();

      //
      // Redirect based on current enviornment
      //
      if (host === 'localhost' || host === '127.0.0.1') {
        $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=qXadujeb96VrZogGGd6zE6wTtzziBZJnxPfM8ZPu&redirect_uri=http%3A%2F%2F127.0.0.1%3A9000%2Fauthorize&scope=user applications';
      // } else if (host === 'stg.commonscloud.org') {
      //   $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=MbanCzYpm0fUW8md1cdSJjUoYI78zTbak2XhZ2hf&redirect_uri=http%3A%2F%2Fstg.commonscloud.org%2Fauthorize&scope=user applications';
      } else {
        $scope.login_url = '//api.commonscloud.org/oauth/authorize?response_type=token&client_id=MbanCzYpm0fUW8md1cdSJjUoYI78zTbak2XhZ2hQ&redirect_uri=http%3A%2F%2Fnfwf.viableindustries.com%2Fauthorize&scope=user applications';
      }

    };

    if (session_cookie && session_cookie !== undefined && session_cookie !== 'undefined') {
      $location.path('/projects');
    } else {
      ipCookie.remove('COMMONS_SESSION');
      ipCookie.remove('COMMONS_SESSION', { path: '/' });
      $scope.setupLoginPage();
    }

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SecurityLogout
 * @description
 * # SecurityLogout
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SecurityLogout', ['$location', 'token', function($location, token) {

    console.log('SecurityLogout');
    
    //
    // Remove the access token from our session cookie
    //
    token.remove();

    //
    // Redirect the user to the home page
    //
    $location.path('/');
    
  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.authorizationInterceptor
 * @description
 * # authorizationInterceptor
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .factory('AuthorizationInterceptor', ['$location', '$q', 'ipCookie', function($location, $q, ipCookie) {

    return {
      request: function(config) {

        var session = ipCookie('COMMONS_SESSION');

        //
        // Before we make any modifications to the config/header of the request
        // check to see if our authorization page is being requested and if the
        // session cookie is defined
        //
        if (!session) {
          $location.path('/');
          return config || $q.when(config);
        }

        //
        // We have a session cookie if we've gotten this far. That means we
        // need to make some header changes so that all of our requests are
        // properly authenticated.
        //
        config.headers = config.headers || {};

        if (config.headers['Authorization'] === 'external') {
          delete config.headers['Authorization-Bypass'];
          delete config.headers.Authorization;
          return config || $q.when(config);
        }

        //
        // Add the Authorization header with our Access Token
        //
        if (session) {
          config.headers.Authorization = 'Bearer ' + session;
        }

        console.debug('AuthorizationInterceptor::Request', config || $q.when(config));
        return config || $q.when(config);
      },
      response: function(response) {
        console.debug('AuthorizationInterceptor::Response', response || $q.when(response));
        return response || $q.when(response);
      },
      responseError: function (response) {
        console.debug('AuthorizationInterceptor::ResponseError', response || $q.when(response));
        return $q.reject(response);
      }
    };
  }]).config(function ($httpProvider) {
    $httpProvider.interceptors.push('AuthorizationInterceptor');
  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Navigation
 * @description
 * # Navigation
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
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

        $location.path('/projects');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectsCtrl',
        reloadOnSearch: false,
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId);
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectViewCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          site: function() {
            return commonscloud.collections.site;
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          sites: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.project.storage,
              relationship: commonscloud.collections.site.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectEditCtrl',
        resolve: {
          user: function(User) {
            return User.getUser();
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      })
      .when('/projects/:projectId/users', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ProjectUsersCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.project.templateId
            });
          },
          users: function(User) {
            return User.GetUsers();
          },
          projectUsers: function(Feature, $route) {
            return Feature.GetFeatureUsers({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.project.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.project.templateId, 'object');
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          }
        }
      });

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectsCtrl
 * @description
 * # ProjectsCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectsCtrl', ['$rootScope', '$scope', '$route', '$routeParams', '$location', '$timeout', 'Feature', 'template', 'fields', 'storage', 'user', function ($rootScope, $scope, $route, $routeParams, $location, $timeout, Feature, template, fields, storage, user) {

    var timeout;

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--list.html',
      title: 'Projects',
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.project.create();
          },
          text: 'Create project'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.user = user;


    //
    // We need the Template and it's associated Field list so that we can automatically populate
    // the Filter options for the user and display the Fields/Options specific to this Template,
    // in the case of this specific application and route we are only dealing with a single Template
    // for the Projects Feature Collection
    //
    $scope.template = template;
    $scope.defaults = $location.search();


    //
    // When the page initially loads, we should check to see if existing filters are present in the
    // browser's address bar. We should pass those filters along to the Feature Search. The Projects
    // that populate the list shown to the user, we update this later on based upon filters that the
    // user applies
    //
    Feature.GetFeatures({
      storage: storage,
      page: $route.current.params.page,
      q: $route.current.params.q,
      location: $scope.defaults,
      fields: fields
    }).then(function(response) {
      $scope.projects = response;
    });

    //
    // Setup project filter functionality
    //
    var filters_ = Feature.buildFilters(fields, $scope.defaults);

    $scope.filters = {
      page: ($scope.defaults.page) ? $scope.defaults.page : null,
      results_per_page: ($scope.defaults.results_per_page) ? $scope.defaults.results_per_page : null,
      callback: ($scope.defaults.callback) ? $scope.defaults.callback : null,
      selected: filters_,
      available: filters_
    };

    $scope.filters.select = function ($index) {
      $scope.filters.available[$index].active = true;
    };

    $scope.filters.remove = function ($index) {
      $scope.filters.available[$index].active = false;

      //
      // Each Filter can have multiple criteria such as single ilike, or
      // a combination of gte and lte. We need to null the values of all 
      // filters in order for the URL to change appropriately
      //
      angular.forEach($scope.filters.available[$index].filter, function(criteria, $_index) {
        $scope.filters.available[$index].filter[$_index].value = null;
      }); 

      $scope.search.execute();
    };


    //
    // Filter existing Projects to a specified list based on the user's input
    //
    $scope.search = {};

    $scope.search.projects = function() {

      $timeout.cancel(timeout);

      timeout = $timeout(function () {
        $scope.search.execute();
      }, 1000);
      
    };

    $scope.search.execute = function(page_number) {

      var Q = Feature.getFilters($scope.filters);

      console.log('Q', Q);

      $scope.filters.page = page_number;

      Feature.query({
        storage: $scope.template.storage,
        q: {
          filters: Q,
          order_by: [
            {
              field: 'created',
              direction: 'desc'
            }
          ]
        },
        page: ($scope.filters.page) ? $scope.filters.page: null,
        results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
        callback: ($scope.filters.callback) ? $scope.filters.callback: null,
        updated: new Date().getTime()
      }).$promise.then(function(response) {

        //
        // Check to see if there are Filters remaining and if not, we should just remove the Q
        //
        var Q_ = null;

        if (Q.length) {
          Q_ = angular.toJson({
            filters: Q
          });
        }

        $location.search({
          q: Q_,
          page: ($scope.filters.page) ? $scope.filters.page: null,
          results_per_page: ($scope.filters.results_per_page) ? $scope.filters.results_per_page: null,
          callback: ($scope.filters.callback) ? $scope.filters.callback: null 
        });

		$scope.projects = response;
      });
    };

    $scope.search.paginate = function(page_number) {

      //
      // First, we need to make sure we preserve any filters that the user has defined
      //
      $scope.search.execute(page_number);

      //
      // Next we go to the selected page `page_number`
      //

      console.log('Go to page', page_number);
    };


    //
    // Project functionality
    //
    $scope.project = {};
    
    $scope.project.create = function() {
      
      Feature.CreateFeature({
        storage: storage,
        data: {
          project_title: 'Untitled Project',
          owner: $scope.user.id,
          status: 'private'
        }
      }).then(function(project) {

        console.log('New Project', project);

        //
        // Forward the user along to the new project
        //
        $location.path('/projects/' + project + '/edit');
      });
    };

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$anchorScroll', 'mapbox', 'Template', 'Feature', 'project', 'storage', 'user', 'template', 'site', 'sites', function ($rootScope, $scope, $route, $location, $anchorScroll, mapbox, Template, Feature, project, storage, user, template, site, sites) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.project.sites = {
      list: sites,
      create: function() {
        //
        // Creating a site is a two step process.
        //
        //  1. Create the new site record, including the owner and a new UserFeatures entry
        //     for the Site table
        //  2. Update the Project to create a relationship with the Site created in step 1 
        //
        Feature.CreateFeature({
          storage: site.storage,
          data: {
            site_number: '0000',
            site_description: 'Untitled Site',
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(siteId) {

          console.log('New Site', siteId);

          //
          // Create the relationship with the parent, Project, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: storage,
            featureId: $route.current.params.projectId,
            data: {
              type_646f23aa91a64f7c89a008322f4f1093: $scope.GetAllChildren(siteId),
            }
          }).then(function() {
            //
            // Forward the user along to the new site now that it has been associated with the Project
            //
            $location.path('/projects/' + $route.current.params.projectId + '/sites/' + siteId + '/edit');
          });
        });
      }
    };

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--view.html',
      title: $scope.project.project_title,
      display_title: false,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $route.current.params.projectId,
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.project.sites.create();
          },
          text: 'Create site'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllChildren = function(siteId) {

      var existingSites = $scope.project.sites.list,
          updatedSites = [{
            id: siteId // Start by adding the newest relationships, then we'll add the existing sites
          }];

      angular.forEach(existingSites, function(site, $index) {
        updatedSites.push({
          id: site.id
        });
      });

      return updatedSites;
    };


    $scope.$watch('project.sites.list', function(processedSites, existingSites) {
      // console.log('$scope.project.sites.list,', $scope.project.sites.list)
      angular.forEach(processedSites, function(feature, $index) {
        var coords = [0,0];
        
        if (feature.geometry !== null) {
          console.log('feature.geometry', feature.geometry);
          if (feature.geometry.geometries[0].type === 'Point') {
            coords = feature.geometry.geometries[0].coordinates;
          }
        }
        
        $scope.project.sites.list[$index].site_thumbnail = 'https://api.tiles.mapbox.com/v4/' + mapbox.satellite + '/pin-s+b1c11d(' + coords[0] + ',' + coords[1] + ',17)/' + coords[0] + ',' + coords[1] + ',17/80x80@2x.png?access_token=' + mapbox.access_token;
      });      
    });


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }
    
  }]);




'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjecteditCtrl
 * @description
 * # ProjecteditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectEditCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--edit.html',
      title: $scope.project.project_title,
      display_title: false,
      editable: true,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id
        },
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/edit',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.project.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Project'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.project.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    $scope.project.save = function() {
      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {
        //
        // Refresh the page so that those things update appropriately.
        //
        $rootScope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };


    $scope.project.delete = function() {
      Feature.DeleteFeature({
        storage: storage,
        featureId: $scope.project.id
      }).then(function(response) {
        $location.path('/projects');
      });
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $scope.project.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $scope.project.id);
            }
          });
        }

      });
    }
    
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ProjectUsersCtrl
 * @description
 * # ProjectUsersCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ProjectUsersCtrl', ['$rootScope', '$scope', '$route', '$location', 'project', 'Template', 'Feature', 'Field', 'template', 'fields', 'storage', 'user', 'users', 'projectUsers', function ($rootScope, $scope, $route, $location, project, Template, Feature, Field, template, fields, storage, user, users, projectUsers) {

    //
    // Setup necessary Template and Field lists
    //
    $scope.template = template;
    $scope.fields = fields;


    //
    // Setup the Project
    //
    $scope.project = project;
    $scope.project.users = projectUsers;
    $scope.project.users_edit = false;


    //
    // Modal Windows
    //
    $scope.modals = {
      open: function($index) {
        $scope.modals.windows[$index].visible = true;
      },
      close: function($index) {
        $scope.modals.windows[$index].visible = false;
      },
      windows: {
        inviteUser: {
          title: 'Add a collaborator',
          body: '',
          visible: false
        }
      }
    };


    //
    // Setup User information
    //
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.users = {
      list: users,
      search: null,
      invite: function(user) {
        $scope.invite.push(user); // Add selected User object to invitation list
        this.search = null; // Clear search text
      },
      add: function() {
        angular.forEach($scope.invite, function(user_, $index) {
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
            // Once the users have been added to the project, close the modal
            // and refresh the page
            //
            $scope.modals.close('inviteUser');
            $scope.page.refresh();
          });
        });
      },
      remove: function(user) {
        var index = $scope.project.users.indexOf(user);
        
        Feature.RemoveUser({
            storage: storage,
            featureId: $scope.project.id,
            userId: user.id
          }).then(function(response) {
            //
            // Once the users have been added to the project, close the modal
            // and refresh the page
            //
            $scope.project.users.splice(index, 1);
          });
      },
      remove_confirm: false
    };


    $scope.invite = [];


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/projects/views/projects--users.html',
      title: $scope.project.project_title + ' Users',
      display_title: false,
      editable: true,
      back: '/',
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id
        },
        {
          text: 'Collaborators',
          url: '/projects/' + $scope.project.id + '/users',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          // url: '/projects/' + $scope.project.id + '/users/invite',
          action: function($index) {
            $scope.project.users_edit = ! $scope.project.users_edit;
            $scope.page.actions[$index].visible = ! $scope.page.actions[$index].visible;
          },
          visible: false,
          text: 'Edit collaborators',
          alt: 'Done Editing'
        },
        {
          type: 'button-link new',
          // url: '/projects/' + $scope.project.id + '/users/invite',
          action: function() {
            console.log('modal');
            $scope.modals.open('inviteUser');
          },
          text: 'Add a collaborator'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $scope.project.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $scope.project.id);
            }
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites', {
        redirectTo: '/projects/:projectId'
      })
      .when('/projects/:projectId/sites/:siteId', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SiteViewCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practices: function(Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.site.storage,
              relationship: commonscloud.collections.practice.storage,
              featureId: $route.current.params.siteId
            });
          },
          variables: function() {
            return {
              project: commonscloud.collections.project,
              site: commonscloud.collections.site,
              practice: commonscloud.collections.practice,
              land_river_segment: commonscloud.collections.land_river_segment
            };
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'SiteEditCtrl',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          storage: function() {
            return commonscloud.collections.project.storage;
          },
          variables: function() {
            return commonscloud.collections.site;
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteViewCtrl', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'mapbox', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practices', 'variables', 'leafletData', function ($rootScope, $scope, $route, $location, $timeout, moment, user, mapbox, Template, Feature, template, fields, project, site, practices, variables, leafletData) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = {};
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.site = site;
    $scope.site.practices = {
      list: practices,
      process: function() {
        //
        // Get a clean practice type for all practices
        //
        angular.forEach($scope.site.practices.list, function(practice, $index) {
          Feature.GetFeature({
            storage: variables.practice.storage,
            featureId: practice.id           
          }).then(function(response) {
            $scope.site.practices.list[$index] = response;
            $scope.site.practices.list[$index].clean_practice_type = Feature.MachineReadable(practice.practice_type);
          });
        });
      },
      create: function() {
        //
        // Creating a practice is a two step process.
        //
        //  1. Create the new Practice record, including the owner and a new UserFeatures entry
        //     for the Practice table
        //  2. Update the Site to create a relationship with the Practice created in step 1 
        //
        Feature.CreateFeature({
          storage: variables.practice.storage,
          data: {
            practice_type: 'Forest Buffer',
            description: '',
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(practiceId) {
          //
          // Create the relationship with the parent, Project, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: variables.site.storage,
            featureId: $route.current.params.siteId,
            data: {
              type_77f5c44516674e8da2532939619759dd: $scope.GetAllChildren(practiceId),
            }
          }).then(function(response) {
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + practiceId + '/edit');
          });
        });
      }
    };

    $rootScope.page = {
      template: '/modules/components/sites/views/sites--view.html',
      title: $scope.site.site_number,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            // $scope.modals.open('createPractice');
            $scope.site.practices.create();
          },
          text: 'Add a practice'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };
    
    $scope.map = {
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
      center: {},
      markers: {
        LandRiverSegment: {
          lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
          lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        }
      },
      geojsonToLayer: function (geojson, layer, options) {
        
        //
        // Make sure the GeoJSON object is added to the layer with appropriate styles
        //
        layer.clearLayers();

        if (options === undefined || options === null) {
          options = {
            stroke: true,
            fill: false,
            weight: 1,
            opacity: 1,
            color: 'rgb(255,255,255)',
            lineCap: 'square'
          };
        }

        L.geoJson(geojson, {
          style: options
        }).eachLayer(function(l) {
          l.addTo(layer);
        });

      },
      drawPolygon: function(geojson, fitBounds, options) {
          
        leafletData.getMap().then(function(map) {
          var featureGroup = new L.FeatureGroup();


          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          $scope.map.geojsonToLayer(geojson, featureGroup, options);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);

          //
          // If we can getBounds then we can zoom to a specific level, we need to check to see
          // if the FeatureGroup has any bounds first though, otherwise we'll get an error.
          //
          if (fitBounds === true) {
            var bounds = featureGroup.getBounds();

            if (bounds.hasOwnProperty('_northEast')) {
              map.fitBounds(featureGroup.getBounds());
            }
          }
        });

      },
      setupMap: function() {
        //
        // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
        // selected their property, so we just need to display it on the map for them again.
        //
        if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {

          //
          // Draw the Land River Segment
          //
          $scope.map.drawPolygon({
            type: 'Feature',
            geometry: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].geometry
          }, false, {
            stroke: false,
            fill: true,
            fillOpacity: 0.65,
            color: 'rgb(25,166,215)'
          });

          //
          // Load Land river segment details
          //
          Feature.GetFeature({
            storage: variables.land_river_segment.storage,
            featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
          }).then(function(response) {
            $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
          });

          //
          // Draw the county
          //          
          if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8.length) {
            $scope.map.drawPolygon({
              type: 'Feature',
              geometry: $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].geometry
            }, true);
          }

        }
      }
    };

    $scope.GetAllChildren = function(practiceId) {

      var existingSites = $scope.site.practices.list,
          updatedSites = [{
            id: practiceId // Start by adding the newest relationships, then we'll add the existing sites
          }];

      angular.forEach(existingSites, function(site, $index) {
        updatedSites.push({
          id: site.id
        });
      });

      return updatedSites;
    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: variables.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: variables.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }

    //
    // Once the page has loaded we need to load in all Reading Features that are associated with
    // the Practices related to the Site being viewed
    //
    $scope.site.practices.process();
    $scope.map.setupMap();

  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:SiteEditCtrl
 * @description
 * # SiteEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('SiteEditCtrl', ['$rootScope', '$scope', '$route', '$timeout', '$http', '$location', 'Template', 'Feature', 'mapbox', 'user', 'template', 'fields', 'project', 'site', 'storage', 'variables', 'leafletData', function ($rootScope, $scope, $route, $timeout, $http, $location, Template, Feature, mapbox, user, template, fields, project, site, storage, variables, leafletData) {

    var timeout;

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.project = project;
    $scope.site = site;
    $scope.site.geolocation = null;
    $scope.site.save = function() {

      //
      // Make sure we've assigned a state to the state field based on user selections in the
      // site county field.
      //
      if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8.length) {
        if ($scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].state_name) {
          $scope.site.site_state = $scope.site.type_b1baa10ba3ce493d90581a864ec95dc8[0].state_name;
        }
      }

      


      Feature.UpdateFeature({
        storage: variables.storage,
        featureId: $scope.site.id,
        data: $scope.site
      }).then(function(response) {
        //
        // Refresh the page so that those things update appropriately.
        //
        $rootScope.page.refresh();

      }).then(function(error) {
        // Do something with the error
      });
    };
    $scope.site.delete = function() {

      //
      // Before we can remove the Site we need to remove the relationship it has with the Project
      //
      //
      // Drop the siteId from the list of 
      //
      angular.forEach($scope.project.type_646f23aa91a64f7c89a008322f4f1093, function(feature, $index) {
        if (feature.id === $scope.site.id) {
          $scope.project.type_646f23aa91a64f7c89a008322f4f1093.splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: storage,
        featureId: $scope.project.id,
        data: $scope.project
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: variables.storage,
          featureId: $scope.site.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id);
        });

      });

    };


    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/sites/views/sites--edit.html',
      title: $scope.site.site_number,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id,
        },
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/edit',
          type: 'active'
        }
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.site.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Site'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.site.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    //
    // Define a layer to add geometries to later
    //
    var featureGroup = new L.FeatureGroup();

    $scope.map = {
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
        lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
        lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
        zoom: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? 16 : 6
      },
      markers: {
        LandRiverSegment: {
          lat: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[1] : 38.362,
          lng: ($scope.site.geometry !== null && $scope.site.geometry !== undefined) ? $scope.site.geometry.geometries[0].coordinates[0] : -81.119, 
          focus: false,
          draggable: true,
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        }
      }
    };


    //
    // Convert a GeoJSON Feature Collection to a valid Leaflet Layer
    //
    $scope.geojsonToLayer = function (geojson, layer) {
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

    $scope.geolocation = {
      drawSegment: function(geojson) {
          
        leafletData.getMap().then(function(map) {
          //
          // Reset the FeatureGroup because we don't want multiple parcels drawn on the map
          //
          map.removeLayer(featureGroup);

          //
          // Convert the GeoJSON to a layer and add it to our FeatureGroup
          //
          $scope.geojsonToLayer(geojson, featureGroup);

          //
          // Add the FeatureGroup to the map
          //
          map.addLayer(featureGroup);
        });

      },
      getSegment: function(coordinates) {

        $http({
          method: 'GET', 
          url: '//api.commonscloud.org/v2/type_f9d8609090494dac811e6a58eb8ef4be/intersects.geojson',
          params: {
            geometry: coordinates.lng + ' ' + coordinates.lat
          }
        }).
          success(function(data, status, headers, config) {
            // console.log('LandRiverSegment Request', data);
            $scope.geolocation.drawSegment(data);
            if (data.features.length > 0) {
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be = [];
              $scope.site.type_f9d8609090494dac811e6a58eb8ef4be.push(data.features[0].properties);
            }
          }).
          error(function(data, status, headers, config) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            console.log('error', data);

            return data;
          });
      },
      search: function() {
        $timeout.cancel(timeout);

        timeout = $timeout(function () {
          $scope.geolocation.initGeocoder();
        }, 800);
      },
      initGeocoder: function() {
        var requested_location = $scope.site.geolocation;

        if (requested_location.length >= 3) {
          var geocode_service_url = '//api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/' + requested_location + '.json';
          $http({
            method: 'get',
            url: geocode_service_url,
            params: {
              'callback': 'JSON_CALLBACK',
              'access_token': mapbox.access_token
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data) {
            $scope.geocode_features = data.features;
          }).error(function(data, status, headers, config) {
            console.log('ERROR: ', data);
          });
        }
      },
      select: function(geocode) {

        //
        // Move the draggable marker to the newly selected address
        //
        $scope.map.markers.LandRiverSegment = {
          lat: geocode.center[1],
          lng: geocode.center[0], 
          focus: false,
          draggable: true,
          icon: {
            iconUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d.png?access_token=' + mapbox.access_token,
            iconRetinaUrl: '//api.tiles.mapbox.com/v4/marker/pin-l+b1c11d@2x.png?access_token=' + mapbox.access_token,
            iconSize: [38, 90],
            iconAnchor: [18, 44],
            popupAnchor: [0, 0]
          }
        };

        //
        // Center the map view on the newly selected address
        //
        $scope.map.center = {
          lat: geocode.center[1],
          lng: geocode.center[0], 
          zoom: 16
        };

        //
        // Get the parcel for the property if one exists
        //
        $scope.geolocation.getSegment($scope.map.center);

        //
        // Since an address has been select, we should clear the drop down so the user
        // can focus on the map.
        //
        $scope.geocode_features = [];

        //
        // We should also make sure we save this information to the
        // User's Site object, that way if we come back later it is
        // retained within the system
        //
        $scope.site.geometry = {
          type: 'GeometryCollection',
          geometries: []
        };
        $scope.site.geometry.geometries.push(geocode.geometry);


        $timeout(function () {
          leafletData.getMap().then(function(map) {
            map.invalidateSize();
          });
        }, 200);

      }
    };
    


    $scope.site.processPin = function(coordinates, zoom) {

      //
      // Update the LandRiver Segment
      //
      $scope.geolocation.getSegment(coordinates);

      //
      // Update the geometry for this Site
      //
      $scope.site.geometry = {
        type: 'GeometryCollection',
        geometries: []
      };
      $scope.site.geometry.geometries.push({
        type: 'Point',
        coordinates: [
          coordinates.lng,
          coordinates.lat
        ]
      });

      //
      // Update the visible pin on the map
      //
      $scope.map.markers.LandRiverSegment.lat = coordinates.lat;
      $scope.map.markers.LandRiverSegment.lng = coordinates.lng;

      //
      // Update the map center and zoom level
      //
      $scope.map.center = {
        lat: coordinates.lat,
        lng: coordinates.lng, 
        zoom: (zoom < 10) ? 10 : zoom
      };
    };

    //
    // Define our map interactions via the Angular Leaflet Directive
    //
    leafletData.getMap().then(function(map) {

      //
      // Move Zoom Control position to bottom/right
      //
      new L.Control.Zoom({
        position: 'bottomright'
      }).addTo(map);

      //
      // Update the pin and segment information when the user clicks on the map
      // or drags the pin to a new location
      //
      $scope.$on('leafletDirectiveMap.click', function(event, args) {
        $scope.site.processPin(args.leafletEvent.latlng, map._zoom);
      });

      $scope.$on('leafletDirectiveMap.dblclick', function(event, args) {
        $scope.site.processPin(args.leafletEvent.latlng, map._zoom+1);
      });

      $scope.$on('leafletDirectiveMarker.dragend', function(event, args) {
        $scope.site.processPin(args.leafletEvent.target._latlng, map._zoom);
      });

      $scope.$on('leafletDirectiveMarker.dblclick', function(event, args) {
        var zoom = map._zoom+1;
        map.setZoom(zoom);
      });

    });


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }

    //
    // If the page is being loaded, and a parcel exists within the user's plan, that means they've already
    // selected their property, so we just need to display it on the map for them again.
    //
    if ($scope.site.type_f9d8609090494dac811e6a58eb8ef4be.length > 0) {
      var json = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0];
      var geojson = {
        type: 'Feature',
        geometry: json.geometry
      };
      $scope.geolocation.drawSegment(geojson);
    }

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices', {
        redirectTo: '/projects/:projectId/sites/:siteId'
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'PracticeEditController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
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
    }      
  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Calculate', ['Load', function(Load) {
    return {
      getLoadVariables: function(segment, landuse) {
        var promise = Load.query({
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        }, function(response) {
          return response;
        });

        return promise;
      },
      getLoadTotals: function(area, efficiency) {
        return {
          nitrogen: (area*(efficiency.eos_totn/efficiency.eos_acres)),
          phosphorus: (area*(efficiency.eos_totp/efficiency.eos_acres)),
          sediment: ((area*(efficiency.eos_tss/efficiency.eos_acres))/2000)
        };
      }
    };
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:PracticeEditController
 * @description
 * # PracticeEditController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('PracticeEditController', ['$rootScope', '$scope', '$route', '$location', '$timeout', 'moment', 'user', 'Attachment', 'Feature', 'Template', 'template', 'fields', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, $timeout, moment, user, Attachment, Feature, Template, template, fields, project, site, practice, commonscloud
    ) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;
    $scope.fields = fields;
    $scope.project = project;
    $scope.practice = practice;
    console.log('$scope.practice', $scope.practice);
    $scope.files = {};
    $scope.files[$scope.fields.installation_photos.relationship] = $scope.practice[$scope.fields.installation_photos.relationship];
    $scope.files[$scope.fields.mature_photos.relationship] = $scope.practice[$scope.fields.mature_photos.relationship];
    console.log('files', $scope.files);
    $scope.practice_type = Feature.MachineReadable($scope.practice.practice_type);

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};


    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--edit.html',
      title: $scope.site.site_number,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.practice_type,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice_type
        },    
        {
          text: 'Edit',
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/edit',
          type: 'active'
        }   
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.practice.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Practice'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.practice.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.practice.save = function() {
      $scope.practice.name = $scope.practice.practice_type;

      Feature.UpdateFeature({
        storage: commonscloud.collections.practice.storage,
        featureId: $scope.practice.id,
        data: $scope.practice
      }).then(function(response) {

        var fileData = new FormData();

        angular.forEach($scope.files[$scope.fields.installation_photos.relationship], function(file, index) {
          fileData.append(file.field, file.file);
        });

        angular.forEach($scope.files[$scope.fields.mature_photos.relationship], function(file, index) {
          fileData.append(file.field, file.file);
        });

        Feature.postFiles({
          storage: commonscloud.collections.practice.storage,
          featureId: $scope.practice.id
        }, fileData).$promise.then(function(response) {
          $scope.feature = response.response;
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id);
        }, function(error) {
          console.error('$scope.practice.save::postFiles', error);
        });

      }).then(function(error) {
          console.error('$scope.practice.save', error);
      });
    };

    $scope.practice.delete = function() {

      //
      // Before we can remove the Practice we need to remove the relationship it has with the Site
      //
      //
      // Drop the siteId from the list of 
      //
      angular.forEach($scope.site.type_77f5c44516674e8da2532939619759dd, function(feature, $index) {
        if (feature.id === $scope.practice.id) {
          $scope.site.type_77f5c44516674e8da2532939619759dd.splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: commonscloud.collections.site.storage,
        featureId: $scope.site.id,
        data: $scope.site
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: commonscloud.collections.practice.storage,
          featureId: $scope.practice.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id);
        });

      });

    };

    // $scope.onFileRemove = function(file, field_name, index) {
    //   $scope.files[$scope.fields[field_name].relationship].splice(index, 1);
    // };

    $scope.onFileSelect = function(files, field_name) {

      angular.forEach(files, function(file, index) {
        // Check to see if we can load previews
        if (window.FileReader && file.type.indexOf('image') > -1) {

          var fileReader = new FileReader();
          fileReader.readAsDataURL(file);
          fileReader.onload = function (event) {
            file.preview = event.target.result;
            $scope.files[field_name].push({
              'field': field_name,
              'file': file
            });
            $scope.$apply();
          };
        } else {
          $scope.files.push({
            'field': field_name,
            'file': file
          });
          $scope.$apply();
        }
      });

    };

    $scope.DeleteAttachment = function(file, $index, attachment_storage) {

      $scope.practice[attachment_storage].splice($index, 1);

      // console.log($scope.template.storage, $scope.feature.id, attachment_storage, file.id)

      //
      // Send the 'DELETE' method to the API so it's removed from the database
      //
      Attachment.delete({
        storage: commonscloud.collections.practice.storage,
        featureId: $scope.practice.id,
        attachmentStorage: attachment_storage,
        attachmentId: file.id
      }).$promise.then(function(response) {
        console.log('DeleteAttachment', response);
        $route.reload();
      });

    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: commonscloud.collections.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: commonscloud.collections.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
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
      "other cattle": {
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
      "hogs and pigs for breeding": {
        average_weight: 374.53,
        manure: 33.46,
        total_nitrogen: 0.0066,
        total_phosphorus: 0.0021
      },
      "hogs for slaughter": {
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
      "angora goats": {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      "milk goats": {
        average_weight: 65.02,
        manure: 41,
        total_nitrogen: 0.011,
        total_phosphorus: 0.0027
      },
      "sheep and lambs": {
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
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .constant('Landuse', {
    'high-till with manure': 'hwm',
    'high-till with manure nutrient management': 'nhi',
    'high-till without manure': 'hom',
    'high-till without manure nutrient management': 'nho',
    'low-till with manure': 'lwm',
    'low-till with manure nutrient management': 'nlo',
    'hay with nutrients': 'hyw',
    'hay with nutrients nutrient management': 'nhy',
    'alfalfa': 'alf',
    'alfalfa nutrient management': 'nal',
    'hay without nutrients': 'hyo',
    'pasture': 'pas',
    'pasture nutrient management': 'npa',
    'pasture corridor': 'trp',
    'animal feeding operations': 'afo',
    'nursery': 'urs',
    'concentrated animal feeding operations': 'cfo',
    'regulated construction': 'rcn',
    'css construction': 'ccn',
    'regulated extractive': 'rex',
    'css extractive': 'cex',
    'nonregulated extractive': 'nex',
    'forest': 'for',
    'harvested forest': 'hvf',
    'regulated impervious developed': 'rid',
    'nonregulated impervious developed': 'nid',
    'css impervious developed': 'cid',
    'atmospheric deposition to non-tidal water': 'atdep',
    'regulated pervious developed': 'rpd',
    'nonregulated pervious developed': 'npd',
    'css pervious developed': 'cpd',
    'municipal-waste water treatment plants':'wwtp',
    'septic': 'septic',
    'combined sewer overflows': 'cso',
    'industrial-waste water treatment plants': 'indus'
  });

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ForestBufferReportController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          readings: function(Storage, Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.practice.storage,
              relationship: Storage['forest-buffer'].storage,
              featureId: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/forest-buffer/:reportId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'ForestBufferFormController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 *    Provides site/application specific variables to the entire application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('ForestBufferCalculate', [function() {
    return {

    };
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ForestBufferController
 * @description
 * # ForestBufferController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ForestBufferReportController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$http', '$q', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'commonscloud', 'Storage', 'Landuse', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, Template, Feature, template, fields, project, site, practice, readings, commonscloud, Storage, Landuse) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.site = site;

    $scope.template = template;
    $scope.fields = fields;
    
    $scope.practice = practice;
    $scope.practice.practice_type = 'forest-buffer';
    $scope.practice.readings = readings;
    $scope.practice_efficiency = null;

    $scope.storage = Storage[$scope.practice.practice_type];

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.landuse = Landuse;

    $scope.GetTotal = function(period) {

      var total = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          total++;
        }
      }

      return total;
    };

    $scope.total = {
      planning: $scope.GetTotal('Planning'),
      installation: $scope.GetTotal('Installation'),
      monitoring: $scope.GetTotal('Monitoring')
    };

    //
    // Load Land river segment details
    //
    Feature.GetFeature({
      storage: commonscloud.collections.land_river_segment.storage,
      featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    }).then(function(response) {
      $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    });

    $scope.readings = {
      bufferWidth: function() {
        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === 'Planning') {
            return $scope.practice.readings[i].average_width_of_buffer;
          }
        }
      },
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            average_width_of_buffer: $scope.readings.bufferWidth(),
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      },
      addGrassBuffer: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/reports/' + reportId + '/edit');
          });
        });
      }
    };

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--view.html',
      title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
          type: 'active'
        }    
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice);
          },
          text: 'Add Measurement Data'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllReadings = function(existingReadings, readingId) {

      var updatedReadings = [{
        id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      }];

      angular.forEach(existingReadings, function(reading, $index) {
        updatedReadings.push({
          id: reading.id
        });
      });

      return updatedReadings;
    };

    $scope.calculate = {};

    $scope.calculate.GetLoadVariables = function(period, landuse) {

      var planned = {
        width: 0,
        length: 0,
        area: 0,
        landuse: '',
        segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
        efficieny: null
      };

      var deferred = $q.defer();

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          planned.length = $scope.practice.readings[i].length_of_buffer;
          planned.width = $scope.practice.readings[i].average_width_of_buffer;
          planned.area = ((planned.length*planned.width)/43560);
          planned.landuse = (landuse) ? landuse : $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];

          var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
            params: {
              q: {
                filters: [
                  {
                    name: 'landriversegment',
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
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data, status, headers, config) {
            planned.efficieny = data.response.features[0];
            deferred.resolve(planned);
          });
        }
      }

      return deferred.promise;
    };

    $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {

      var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;

      var deferred = $q.defer();

      var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
        params: {
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        },
        headers: {
          'Authorization': 'external'
        }
      }).success(function(data, status, headers, config) {
        
        var efficieny = data.response.features[0],
            total_area = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {

            var that = {
              length: $scope.practice.readings[i].length_of_buffer,
              width: $scope.practice.readings[i].average_width_of_buffer
            };

            total_area += (that.length*that.width);
          }
        }

        deferred.resolve({
          efficieny: efficieny,
          area: (total_area/43560)
        });
      });

      return deferred.promise;
    };

    $scope.calculate.GetPreInstallationLoad = function(period) {

      $scope.calculate.GetLoadVariables(period).then(function(loaddata) {

        console.log('GetPreInstallationLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPreInstallationLoad = results;
      });

    };

    $scope.calculate.GetPlannedLoad = function(period) {

      $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetPlannedLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPlannedLoad = results;
      });

    };


    $scope.calculate.GetInstalledLoad = function(period) {

      $scope.calculate.GetInstalledLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetInstalledLoad', loaddata);

        $scope.practice_efficiency = loaddata.efficieny;

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalInstalledLoad = results;
      });

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
    $scope.calculate.GetPercentageOfInstalled = function(field, format) {

      var planned_total = 0,
          installed_total = 0,
          percentage = 0;

      // Get readings organized by their Type
      angular.forEach($scope.practice.readings, function(reading, $index) {

        if (reading.measurement_period === 'Planning') {
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          installed_total += reading[field];
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

    $scope.calculate.GetSingleInstalledLoad = function(length, width, element) {

        var efficieny = $scope.practice_efficiency,
            area = ((length*width)/43560),
            value = null;

        console.log('efficieny', efficieny);

        if (element === 'nitrogen') {
          value = (area*(efficieny.eos_totn/efficieny.eos_acres));
        } else if (element === 'phosphorus') {
          value = (area*(efficieny.eos_totp/efficieny.eos_acres));
        } else if (element === 'sediment') {
          value = ((area*(efficieny.eos_tss/efficieny.eos_acres))/2000);
        }

        return value;
    };

    $scope.calculate.GetTreeDensity = function(trees, length, width) {
      return (trees/(length*width/43560));
    };

    $scope.calculate.GetPercentage = function(part, total) {
      return ((part/total)*100);
    };

    $scope.calculate.GetConversion = function(part, total) {
      return (part/total);
    };

    $scope.calculate.GetConversionWithArea = function(length, width, total) {
      return ((length*width)/total);
    };

    $scope.calculate.GetRestorationTotal = function(unit, area) {

      var total_area = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Installation') {
          if (area) {
            total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].av);
          } else {
            total_area += $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


      return (total_area/unit);
    };

    $scope.calculate.GetRestorationPercentage = function(unit, area) {

      var planned_area = 0,
          total_area = $scope.calculate.GetRestorationTotal(unit, area);

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Planning') {
          if (area) {
            planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
          } else {
            planned_area = $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      planned_area = (planned_area/unit);

      console.log(total_area, planned_area, (total_area/planned_area));

      return ((total_area/planned_area)*100);
    };

    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    $scope.calculate.results = {
      percentageLengthOfBuffer: {
        percentage: $scope.calculate.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
        total: $scope.calculate.GetPercentageOfInstalled('length_of_buffer')
      },
      percentageTreesPlanted: {
        percentage: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
        total: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted')
      },
      totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
      totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
      totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation'),
      totalMilesRestored: $scope.calculate.GetRestorationTotal(5280),
      percentageMilesRestored: $scope.calculate.GetRestorationPercentage(5280, false),
      totalAcresRestored: $scope.calculate.GetRestorationTotal(43560, true),
      percentageAcresRestored: $scope.calculate.GetRestorationPercentage(43560, true),
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: commonscloud.collections.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: commonscloud.collections.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }


  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:ReportEditCtrl
 * @description
 * # ReportEditCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('ForestBufferFormController', ['$rootScope', '$scope', '$route', '$location', 'moment', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, moment, user, Template, Field, Feature, Storage, template, project, site, practice, commonscloud) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};

    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.practice_type = 'forest-buffer';

    $scope.storage = Storage[$scope.practice.practice_type];

    Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.storage.storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;
      $scope.report.template = $scope.storage.templates.form;

      //
      // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
      //
      $scope.calculateBufferComposition = function() {

        var running_total = $scope.report.buffer_composition_woody + $scope.report.buffer_composition_shrub + $scope.report.buffer_composition_bare + $scope.report.buffer_composition_grass;

        var remainder = 100-running_total;

        $scope.report.buffer_composition_other = remainder;
      };
      $scope.$watch('report.buffer_composition_woody', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_shrub', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_bare', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_grass', function() {
        $scope.calculateBufferComposition();
      });


      $scope.report.save = function() {
        Feature.UpdateFeature({
          storage: $scope.storage.storage,
          featureId: $scope.report.id,
          data: $scope.report
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
        }).then(function(error) {
          // Do something with the error
        });
      };

      $scope.report.delete = function() {

        //
        // Before we can remove the Practice we need to remove the relationship it has with the Site
        //
        //
        angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
          if (feature.id === $scope.report.id) {
            $scope.practice[$scope.storage.storage].splice($index, 1);
          }
        });

        Feature.UpdateFeature({
          storage: commonscloud.collections.practice.storage,
          featureId: $scope.practice.id,
          data: $scope.practice
        }).then(function(response) {
          
          //
          // Now that the Project <> Site relationship has been removed, we can remove the Site
          //
          Feature.DeleteFeature({
            storage: $scope.storage.storage,
            featureId: $scope.report.id
          }).then(function(response) {
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
          });

        });

      };

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report from ' + moment($scope.report.report_date).format('MMM d, YYYY');

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + $scope.report.id + '/edit'
      });

      $rootScope.page.title = page_title;

    });

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--form.html',
      title: null,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.report.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.report.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.in = function(search_value, list) {

      if (!list.length) {
        return true;
      }
        
      var $index;

      for ($index = 0; $index < list.length; $index++) {
        if (list[$index] === search_value) {
          return true;
        }
      }

      return false;
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: $scope.storage.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer', {
        templateUrl: '/modules/shared/default.html',
        controller: 'GrassBufferReportController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          readings: function(Storage, Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.practice.storage,
              relationship: Storage['grass-buffer'].storage,
              featureId: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/grass-buffer/:reportId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'GrassBufferFormController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Storage
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('GrassBufferCalculate', [function() {
    return {

    };
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:GrassBufferReportController
 * @description
 * # GrassBufferReportController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('GrassBufferReportController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$http', '$q', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'commonscloud', 'Storage', 'Landuse', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, Template, Feature, template, fields, project, site, practice, readings, commonscloud, Storage, Landuse) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.site = site;

    $scope.template = template;
    $scope.fields = fields;
    
    $scope.practice = practice;
    $scope.practice.practice_type = 'grass-buffer';
    $scope.practice.readings = readings;
    $scope.practice_efficiency = null;

    $scope.storage = Storage[$scope.practice.practice_type];

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    $scope.landuse = Landuse;

    $scope.GetTotal = function(period) {

      var total = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          total++;
        }
      }

      return total;
    };

    $scope.total = {
      planning: $scope.GetTotal('Planning'),
      installation: $scope.GetTotal('Installation'),
      monitoring: $scope.GetTotal('Monitoring')
    };

    //
    // Load Land river segment details
    //
    Feature.GetFeature({
      storage: commonscloud.collections.land_river_segment.storage,
      featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    }).then(function(response) {
      $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    });

    $scope.readings = {
      bufferWidth: function() {
        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === 'Planning') {
            return $scope.practice.readings[i].average_width_of_buffer;
          }
        }
      },
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            average_width_of_buffer: $scope.readings.bufferWidth(),
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      },
      addReading: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      }
    };

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--view.html',
      title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
          type: 'active'
        }    
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice);
          },
          text: 'Add Measurement Data'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllReadings = function(existingReadings, readingId) {

      var updatedReadings = [{
        id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      }];

      angular.forEach(existingReadings, function(reading, $index) {
        updatedReadings.push({
          id: reading.id
        });
      });

      return updatedReadings;
    };

    $scope.calculate = {};

    $scope.calculate.GetLoadVariables = function(period, landuse) {

      var planned = {
        width: 0,
        length: 0,
        area: 0,
        landuse: '',
        segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
        efficieny: null
      };

      var deferred = $q.defer();

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          planned.length = $scope.practice.readings[i].length_of_buffer;
          planned.width = $scope.practice.readings[i].average_width_of_buffer;
          planned.area = ((planned.length*planned.width)/43560);
          planned.landuse = (landuse) ? landuse : $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];

          var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
            params: {
              q: {
                filters: [
                  {
                    name: 'landriversegment',
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
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data, status, headers, config) {
            planned.efficieny = data.response.features[0];
            deferred.resolve(planned);
          });
        }
      }

      return deferred.promise;
    };

    $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {

      var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;

      var deferred = $q.defer();

      var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
        params: {
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        },
        headers: {
          'Authorization': 'external'
        }
      }).success(function(data, status, headers, config) {
        
        var efficieny = data.response.features[0],
            total_area = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {

            var that = {
              length: $scope.practice.readings[i].length_of_buffer,
              width: $scope.practice.readings[i].average_width_of_buffer
            };

            total_area += (that.length*that.width);
          }
        }

        deferred.resolve({
          efficieny: efficieny,
          area: (total_area/43560)
        });
      });

      return deferred.promise;
    };

    $scope.calculate.GetPreInstallationLoad = function(period) {

      $scope.calculate.GetLoadVariables(period).then(function(loaddata) {

        console.log('GetPreInstallationLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPreInstallationLoad = results;
      });

    };

    $scope.calculate.GetPlannedLoad = function(period) {

      $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetPlannedLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPlannedLoad = results;
      });

    };


    $scope.calculate.GetInstalledLoad = function(period) {

      $scope.calculate.GetInstalledLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetInstalledLoad', loaddata);

        $scope.practice_efficiency = loaddata.efficieny;

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalInstalledLoad = results;
      });

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
    $scope.calculate.GetPercentageOfInstalled = function(field, format) {

      var planned_total = 0,
          installed_total = 0,
          percentage = 0;

      // Get readings organized by their Type
      angular.forEach($scope.practice.readings, function(reading, $index) {

        if (reading.measurement_period === 'Planning') {
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          installed_total += reading[field];
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

    $scope.calculate.GetSingleInstalledLoad = function(length, width, element) {

        var efficieny = $scope.practice_efficiency,
            area = ((length*width)/43560),
            value = null;

        console.log('efficieny', efficieny);

        if (element === 'nitrogen') {
          value = (area*(efficieny.eos_totn/efficieny.eos_acres));
        } else if (element === 'phosphorus') {
          value = (area*(efficieny.eos_totp/efficieny.eos_acres));
        } else if (element === 'sediment') {
          value = ((area*(efficieny.eos_tss/efficieny.eos_acres))/2000);
        }

        return value;
    };

    $scope.calculate.GetTreeDensity = function(trees, length, width) {
      return (trees/(length*width/43560));
    };

    $scope.calculate.GetPercentage = function(part, total) {
      return ((part/total)*100);
    };

    $scope.calculate.GetConversion = function(part, total) {
      return (part/total);
    };

    $scope.calculate.GetConversionWithArea = function(length, width, total) {
      return ((length*width)/total);
    };

    $scope.calculate.GetRestorationTotal = function(unit, area) {

      var total_area = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Installation') {
          if (area) {
            total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].av);
          } else {
            total_area += $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


      return (total_area/unit);
    };

    $scope.calculate.GetRestorationPercentage = function(unit, area) {

      var planned_area = 0,
          total_area = $scope.calculate.GetRestorationTotal(unit, area);

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Planning') {
          if (area) {
            planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
          } else {
            planned_area = $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      planned_area = (planned_area/unit);

      console.log(total_area, planned_area, (total_area/planned_area));

      return ((total_area/planned_area)*100);
    };

    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    $scope.calculate.results = {
      percentageLengthOfBuffer: {
        percentage: $scope.calculate.GetPercentageOfInstalled('length_of_buffer', 'percentage'),
        total: $scope.calculate.GetPercentageOfInstalled('length_of_buffer')
      },
      percentageTreesPlanted: {
        percentage: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted', 'percentage'),
        total: $scope.calculate.GetPercentageOfInstalled('number_of_trees_planted')
      },
      totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
      totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
      totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation'),
      totalMilesRestored: $scope.calculate.GetRestorationTotal(5280),
      percentageMilesRestored: $scope.calculate.GetRestorationPercentage(5280, false),
      totalAcresRestored: $scope.calculate.GetRestorationTotal(43560, true),
      percentageAcresRestored: $scope.calculate.GetRestorationPercentage(43560, true),
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: commonscloud.collections.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: commonscloud.collections.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }


  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:GrassBufferFormController
 * @description
 * # GrassBufferFormController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('GrassBufferFormController', ['$rootScope', '$scope', '$route', '$location', 'moment', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, moment, user, Template, Field, Feature, Storage, template, project, site, practice, commonscloud) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};

    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.practice_type = 'grass-buffer';

    $scope.storage = Storage[$scope.practice.practice_type];

    Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.storage.storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;
      $scope.report.template = $scope.storage.templates.form;

      //
      // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
      //
      $scope.calculateBufferComposition = function() {

        var running_total = $scope.report.buffer_composition_woody + $scope.report.buffer_composition_shrub + $scope.report.buffer_composition_bare + $scope.report.buffer_composition_grass;

        var remainder = 100-running_total;

        $scope.report.buffer_composition_other = remainder;
      };
      $scope.$watch('report.buffer_composition_woody', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_shrub', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_bare', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_grass', function() {
        $scope.calculateBufferComposition();
      });


      $scope.report.save = function() {
        Feature.UpdateFeature({
          storage: $scope.storage.storage,
          featureId: $scope.report.id,
          data: $scope.report
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
        }).then(function(error) {
          // Do something with the error
        });
      };

      $scope.report.delete = function() {

        //
        // Before we can remove the Practice we need to remove the relationship it has with the Site
        //
        //
        angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
          if (feature.id === $scope.report.id) {
            $scope.practice[$scope.storage.storage].splice($index, 1);
          }
        });

        Feature.UpdateFeature({
          storage: commonscloud.collections.practice.storage,
          featureId: $scope.practice.id,
          data: $scope.practice
        }).then(function(response) {
          
          //
          // Now that the Project <> Site relationship has been removed, we can remove the Site
          //
          Feature.DeleteFeature({
            storage: $scope.storage.storage,
            featureId: $scope.report.id
          }).then(function(response) {
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
          });

        });

      };

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report from ' + moment($scope.report.report_date).format('MMM d, YYYY');

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + $scope.report.id + '/edit'
      });

      $rootScope.page.title = page_title;

    });

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--form.html',
      title: null,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.report.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.report.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.in = function(search_value, list) {

      if (!list.length) {
        return true;
      }
        
      var $index;

      for ($index = 0; $index < list.length; $index++) {
        if (list[$index] === search_value) {
          return true;
        }
      }

      return false;
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: $scope.storage.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion', {
        templateUrl: '/modules/shared/default.html',
        controller: 'LivestockExclusionReportController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          readings: function(Storage, Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.practice.storage,
              relationship: Storage['livestock-exclusion'].storage,
              featureId: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/livestock-exclusion/:reportId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'LivestockExclusionFormController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.LivestockExclusionCalculate
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
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
        return (totalHoursPerYearInStream/12);
      },
      averageDaysPerYearInStream: function(values) {
        var dpm = this.totalDaysPerYearInStream(values),
            hpd = this.averageHoursPerYearInStream(values);
        return (dpm*hpd/24);
      },
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
          if (values[$index].measurement_period === 'Planning') {
            planned_length += values[$index][field];
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed_length += values[$index][field];
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
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:LivestockExclusionReportController
 * @description
 * # LivestockExclusionReportController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('LivestockExclusionReportController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$http', '$q', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'commonscloud', 'Storage', 'Landuse', 'CalculateLivestockExclusion', 'Calculate', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, Template, Feature, template, fields, project, site, practice, readings, commonscloud, Storage, Landuse, CalculateLivestockExclusion, Calculate) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.site = site;

    $scope.template = template;
    $scope.fields = fields;
    
    $scope.practice = practice;
    $scope.practice.practice_type = 'livestock-exclusion';
    $scope.practice.readings = readings;

    console.log('readings', readings);

    $scope.practice_efficiency = null;

    $scope.storage = Storage[$scope.practice.practice_type];

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};


    $scope.landuse = Landuse;

    $scope.calculate = CalculateLivestockExclusion;

    // //
    // // Calculate Load Values
    // //
    // $scope.loads = {
    //   preproject: null,
    //   planned: null,
    //   installed: null
    // };

    // $scope.calculate.getPrePlannedLoad($scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name, 'alfalfa nutrient management', (25*29472)).then(function(response) {
    //   $scope.loads = response;
    // });

    $scope.calculate.GetLoadVariables = function(period, landuse) {

      var planned = {
        width: 0,
        length: 0,
        area: 0,
        landuse: '',
        segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
        efficieny: null
      };

      var deferred = $q.defer();

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          planned.length = $scope.practice.readings[i].length_of_fencing;
          planned.width = $scope.practice.readings[i].average_buffer_width;
          planned.area = ((planned.length*planned.width)/43560);
          planned.landuse = (landuse) ? landuse : $scope.landuse[$scope.practice.readings[i].existing_riparian_landuse.toLowerCase()];

          var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
            params: {
              q: {
                filters: [
                  {
                    name: 'landriversegment',
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
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data, status, headers, config) {
            planned.efficieny = data.response.features[0];
            deferred.resolve(planned);
          });
        }
      }

      return deferred.promise;
    };

    $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {

      var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;

      var deferred = $q.defer();

      var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
        params: {
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        },
        headers: {
          'Authorization': 'external'
        }
      }).success(function(data, status, headers, config) {
        
        var efficieny = data.response.features[0],
            total_area = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {

            var that = {
              length: $scope.practice.readings[i].length_of_fencing,
              width: $scope.practice.readings[i].average_buffer_width
            };

            total_area += (that.length*that.width);
          }
        }

        deferred.resolve({
          efficieny: efficieny,
          area: (total_area/43560)
        });
      });

      return deferred.promise;
    };

    $scope.calculate.GetPreInstallationLoad = function(period) {

      $scope.calculate.GetLoadVariables(period).then(function(loaddata) {

        console.log('GetPreInstallationLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPreInstallationLoad = results;
      });

    };

    $scope.calculate.GetPlannedLoad = function(period) {

      $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetPlannedLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPlannedLoad = results;
      });

    };


    $scope.calculate.GetInstalledLoad = function(period) {

      $scope.calculate.GetInstalledLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetInstalledLoad', loaddata);

        $scope.practice_efficiency = loaddata.efficieny;

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalInstalledLoad = results;
      });

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
    $scope.calculate.GetPercentageOfInstalled = function(field, format) {

      var planned_total = 0,
          installed_total = 0,
          percentage = 0;

      // Get readings organized by their Type
      angular.forEach($scope.practice.readings, function(reading, $index) {

        if (reading.measurement_period === 'Planning') {
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          installed_total += reading[field];
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

    $scope.calculate.GetSingleInstalledLoad = function(length, width, element) {

        var efficieny = $scope.practice_efficiency,
            area = ((length*width)/43560),
            value = null;

        console.log('efficieny', efficieny);

        if (element === 'nitrogen') {
          value = (area*(efficieny.eos_totn/efficieny.eos_acres));
        } else if (element === 'phosphorus') {
          value = (area*(efficieny.eos_totp/efficieny.eos_acres));
        } else if (element === 'sediment') {
          value = ((area*(efficieny.eos_tss/efficieny.eos_acres))/2000);
        }

        return value;
    };

    $scope.calculate.GetTreeDensity = function(trees, length, width) {
      return (trees/(length*width/43560));
    };

    $scope.calculate.GetPercentage = function(part, total) {
      return ((part/total)*100);
    };

    $scope.calculate.GetConversion = function(part, total) {
      return (part/total);
    };

    $scope.calculate.GetConversionWithArea = function(length, width, total) {
      return ((length*width)/total);
    };

    $scope.calculate.GetRestorationTotal = function(unit, area) {

      var total_area = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Installation') {
          if (area) {
            total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].av);
          } else {
            total_area += $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


      return (total_area/unit);
    };

    $scope.calculate.GetRestorationPercentage = function(unit, area) {

      var planned_area = 0,
          total_area = $scope.calculate.GetRestorationTotal(unit, area);

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Planning') {
          if (area) {
            planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
          } else {
            planned_area = $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      planned_area = (planned_area/unit);

      console.log(total_area, planned_area, (total_area/planned_area));

      return ((total_area/planned_area)*100);
    };

    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    $scope.calculate.results = {
      totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
      totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
      totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation')
    };


    //
    //
    //
    $scope.GetTotal = function(period) {

      var total = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          total++;
        }
      }

      return total;
    };

    $scope.total = {
      planning: $scope.GetTotal('Planning'),
      installation: $scope.GetTotal('Installation'),
      monitoring: $scope.GetTotal('Monitoring')
    };

    //
    // Load Land river segment details
    //
    Feature.GetFeature({
      storage: commonscloud.collections.land_river_segment.storage,
      featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    }).then(function(response) {
      $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    });

    $scope.readings = {
      bufferWidth: function() {
        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === 'Planning') {
            return $scope.practice.readings[i].average_width_of_buffer;
          }
        }
      },
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            average_width_of_buffer: $scope.readings.bufferWidth(),
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      },
      addReading: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      }
    };

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--view.html',
      title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
          type: 'active'
        }    
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice);
          },
          text: 'Add Measurement Data'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllReadings = function(existingReadings, readingId) {

      var updatedReadings = [{
        id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      }];

      angular.forEach(existingReadings, function(reading, $index) {
        updatedReadings.push({
          id: reading.id
        });
      });

      return updatedReadings;
    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: commonscloud.collections.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: commonscloud.collections.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }
    
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:LivestockExclusionFormController
 * @description
 * # LivestockExclusionFormController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('LivestockExclusionFormController', ['$rootScope', '$scope', '$route', '$location', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, user, Template, Field, Feature, Storage, template, project, site, practice, commonscloud) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};

    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.practice_type = 'livestock-exclusion';

    $scope.storage = Storage[$scope.practice.practice_type];

    Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.storage.storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;

      console.log('Report Data Model', $scope.report);

      $scope.report.template = $scope.storage.templates.form;

      //
      // Watch the Tree Canopy Value, when it changes we need to update the lawn area value
      //
      $scope.calculateBufferComposition = function() {

        var running_total = $scope.report.buffer_composition_woody + $scope.report.buffer_composition_shrub + $scope.report.buffer_composition_bare + $scope.report.buffer_composition_grass;

        var remainder = 100-running_total;

        $scope.report.buffer_composition_other = remainder;
      };
      $scope.$watch('report.buffer_composition_woody', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_shrub', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_bare', function() {
        $scope.calculateBufferComposition();
      });
      $scope.$watch('report.buffer_composition_grass', function() {
        $scope.calculateBufferComposition();
      });


      $scope.report.save = function() {
        Feature.UpdateFeature({
          storage: $scope.storage.storage,
          featureId: $scope.report.id,
          data: $scope.report
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
        }).then(function(error) {
          // Do something with the error
        });
      };

      $scope.report.delete = function() {

        //
        // Before we can remove the Practice we need to remove the relationship it has with the Site
        //
        //
        angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
          if (feature.id === $scope.report.id) {
            $scope.practice[$scope.storage.storage].splice($index, 1);
          }
        });

        Feature.UpdateFeature({
          storage: commonscloud.collections.practice.storage,
          featureId: $scope.practice.id,
          data: $scope.practice
        }).then(function(response) {
          
          //
          // Now that the Project <> Site relationship has been removed, we can remove the Site
          //
          Feature.DeleteFeature({
            storage: $scope.storage.storage,
            featureId: $scope.report.id
          }).then(function(response) {
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
          });

        });

      };

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report';

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + $scope.report.id + '/edit'
      });

      $rootScope.page.title = page_title;

    });

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--form.html',
      title: null,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.report.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.report.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.in = function(search_value, list) {

      if (!list.length) {
        return true;
      }
        
      var $index;

      for ($index = 0; $index < list.length; $index++) {
        if (list[$index] === search_value) {
          return true;
        }
      }

      return false;
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: $scope.storage.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc overview
 * @name practiceMonitoringAssessmentApp
 * @description
 * # practiceMonitoringAssessmentApp
 *
 * Main module of the application.
 */
angular.module('practiceMonitoringAssessmentApp')
  .config(['$routeProvider', 'commonscloud', function($routeProvider, commonscloud) {

    $routeProvider
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner', {
        templateUrl: '/modules/shared/default.html',
        controller: 'UrbanHomeownerReportController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.site.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.site.templateId, 'object');
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          readings: function(Storage, Feature, $route) {
            return Feature.GetRelatedFeatures({
              storage: commonscloud.collections.practice.storage,
              relationship: Storage['urban-homeowner'].storage,
              featureId: $route.current.params.practiceId
            });
          }
        }
      })
      .when('/projects/:projectId/sites/:siteId/practices/:practiceId/urban-homeowner/:reportId/edit', {
        templateUrl: '/modules/shared/default.html',
        controller: 'UrbanHomeownerFormController',
        resolve: {
          user: function(User, $route) {
            return User.getUser({
              featureId: $route.current.params.projectId,
              templateId: commonscloud.collections.site.templateId
            });
          },
          project: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.project.storage,
              featureId: $route.current.params.projectId
            });
          },
          site: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.site.storage,
              featureId: $route.current.params.siteId
            });
          },
          practice: function(Feature, $route) {
            return Feature.GetFeature({
              storage: commonscloud.collections.practice.storage,
              featureId: $route.current.params.practiceId
            });
          },
          template: function(Template, $route) {
            return Template.GetTemplate(commonscloud.collections.practice.templateId);
          },
          fields: function(Field, $route) {
            return Field.GetPreparedFields(commonscloud.collections.practice.templateId, 'object');
          }
        }
      });

  }]);



'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.CalculateUrbanHomeowner
 * @description
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('CalculateUrbanHomeowner', ['Calculate', 'Landuse', 'StateLoad', function(Calculate, Landuse, StateLoad) {
    return {
      gallonsReducedPerYear: function(value) {

        var rainGarden = (value.rain_garden_area/0.12)*0.623,
            rainBarrel = value.rain_barrel_drainage_area*0.156,
            permeablePavement = value.permeable_pavement_area*0.312,
            downspoutDisconnection = value.downspout_disconnection_drainage_area*0.312;

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection);
      },
      preInstallationNitrogenLoad: function(value, loaddata) {
        var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area),
            pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100));

        console.log(impervious, 43560, loaddata.impervious.tn_ual, pervious, 43560, loaddata.pervious.tn_ual, 43560, '=', (((impervious/43560)*loaddata.impervious.tn_ual + (pervious/43560)*loaddata.pervious.tn_ual)/43560));

        return ((impervious/43560)*loaddata.impervious.tn_ual + (pervious/43560)*loaddata.pervious.tn_ual)/43560; // These need to be state specific
      },
      preInstallationPhosphorusLoad: function(value, loaddata) {
        var impervious = ((value.rain_garden_area/0.12)+value.rain_barrel_drainage_area+value.permeable_pavement_area+value.downspout_disconnection_drainage_area+value.impervious_cover_removal_area),
            pervious = (value.urban_nutrient_management_pledge_area+value.urban_nutrient_management_plan_area_hi_risk+value.conservation_landscaping+(value.tree_planting*100));

        console.log(impervious, 43560, loaddata.impervious.tp_ual, pervious, 43560, loaddata.pervious.tp_ual, 43560, '=', ((impervious/43560)*loaddata.impervious.tp_ual + (pervious/43560)*loaddata.pervious.tp_ual)/43560);

        return ((impervious/43560)*loaddata.impervious.tp_ual + (pervious/43560)*loaddata.pervious.tp_ual)/43560; // These need to be state specific
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
            imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tn_ual-loaddata.pervious.tn_ual); // These need to be state specific

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
            imperviousCoverRemoval = value.impervious_cover_removal_area*(loaddata.impervious.tp_ual-loaddata.pervious.tp_ual); // These need to be state specific

        return (rainGarden+rainBarrel+permeablePavement+downspoutDisconnection+unmPledgeArea+unmHighRisk+conservationLandscaping+imperviousCoverRemoval)/43560;
      },
      installedPhosphorusLoadReduction: function(values, loaddata, format) {

        var installed = 0,
            planned = 0,
            self = this;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned += self.plannedPhosphorusLoadReduction(value, loaddata);
          }
          else if (values[$index].measurement_period === 'Installation') {
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.plannedNitrogenLoadReduction(value, loaddata);
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed += self.plannedNitrogenLoadReduction(value, loaddata);
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.gallonsReducedPerYear(value);
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed += self.gallonsReducedPerYear(value);
          }
        });

        var percentage_installed = installed/planned;

        return (format === '%') ? (percentage_installed*100) : installed;
      },
      treesPlanted: function(values, field, format) {

        var installed_trees = 0,
            planned_trees = 0;

        angular.forEach(values, function(value, $index) {
          if (values[$index].measurement_period === 'Planning') {
            planned_trees += values[$index][field];
          }
          else if (values[$index].measurement_period === 'Installation') {
            installed_trees += values[$index][field];
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
          if (values[$index].measurement_period === 'Planning') {
            planned += self.acresProtected(value);
          }
          else if (values[$index].measurement_period === 'Installation') {
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

          if (reading.measurement_period === 'Planning') {
            planned_total += reading[field];
          } else if (reading.measurement_period === 'Installation') {
            installed_total += reading[field];
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

          if (reading.measurement_period === 'Planning') {
            planned_total += reading[field]/0.12;
          } else if (reading.measurement_period === 'Installation') {
            installed_total += reading[field]/0.12;
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
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:UrbanHomeownerReportController
 * @description
 * # UrbanHomeownerReportController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('UrbanHomeownerReportController', ['$rootScope', '$scope', '$route', '$location', '$timeout', '$http', '$q', 'moment', 'user', 'Template', 'Feature', 'template', 'fields', 'project', 'site', 'practice', 'readings', 'commonscloud', 'Storage', 'Landuse', 'CalculateUrbanHomeowner', 'Calculate', 'StateLoad', function ($rootScope, $scope, $route, $location, $timeout, $http, $q, moment, user, Template, Feature, template, fields, project, site, practice, readings, commonscloud, Storage, Landuse, CalculateUrbanHomeowner, Calculate, StateLoad) {

    //
    // Assign project to a scoped variable
    //
    $scope.project = project;
    $scope.site = site;

    $scope.template = template;
    $scope.fields = fields;
    
    $scope.practice = practice;
    $scope.practice.practice_type = 'urban-homeowner';
    $scope.practice.readings = readings;

    $scope.practice_efficiency = null;

    $scope.storage = Storage[$scope.practice.practice_type];

    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Retrieve State-specific Load Data
    //
    StateLoad.query({
      q: {
        filters: [
          {
            name: 'state',
            op: 'eq',
            val: $scope.site.site_state
          }
        ]
      }
    }, function(response) {
      $scope.loaddata = {};

      angular.forEach(response.response.features, function(feature, $index) {
        $scope.loaddata[feature.developed_type] = {
          tn_ual: feature.tn_ual,
          tp_ual: feature.tp_ual,
          tss_ual: feature.tss_ual
        };

        console.log('feature', feature)
      });
    });


    $scope.landuse = Landuse;

    $scope.calculate = CalculateUrbanHomeowner;

    $scope.calculate.GetLoadVariables = function(period, landuse) {

      var planned = {
        width: 0,
        length: 0,
        area: 0,
        landuse: '',
        segment: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name,
        efficieny: null
      };

      var deferred = $q.defer();

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {

          var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
            params: {
              q: {
                filters: [
                  {
                    name: 'landriversegment',
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
            },
            headers: {
              'Authorization': 'external'
            }
          }).success(function(data, status, headers, config) {
            planned.efficieny = data.response.features[0];
            deferred.resolve(planned);
          });
        }
      }

      return deferred.promise;
    };

    $scope.calculate.GetInstalledLoadVariables = function(period, landuse) {

      var segment = $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].name;

      var deferred = $q.defer();

      var promise = $http.get('//api.commonscloud.org/v2/type_3fbea3190b634d0c9021d8e67df84187.json', {
        params: {
          q: {
            filters: [
              {
                name: 'landriversegment',
                op: 'eq',
                val: segment
              },
              {
                name: 'landuse',
                op: 'eq',
                val: landuse
              }
            ]
          }
        },
        headers: {
          'Authorization': 'external'
        }
      }).success(function(data, status, headers, config) {
        
        var efficieny = data.response.features[0],
            total_area = 0;

        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === period) {

            var that = {
              length: $scope.practice.readings[i].length_of_fencing,
              width: $scope.practice.readings[i].average_buffer_width
            };

            total_area += (that.length*that.width);
          }
        }

        deferred.resolve({
          efficieny: efficieny,
          area: (total_area/43560)
        });
      });

      return deferred.promise;
    };

    $scope.calculate.GetPreInstallationLoad = function(period) {

      $scope.calculate.GetLoadVariables(period).then(function(loaddata) {

        console.log('GetPreInstallationLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPreInstallationLoad = results;
      });

    };

    $scope.calculate.GetPlannedLoad = function(period) {

      $scope.calculate.GetLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetPlannedLoad', loaddata);

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalPlannedLoad = results;
      });

    };


    $scope.calculate.GetInstalledLoad = function(period) {

      $scope.calculate.GetInstalledLoadVariables(period, $scope.storage.landuse).then(function(loaddata) {

        console.log('GetInstalledLoad', loaddata);

        $scope.practice_efficiency = loaddata.efficieny;

        var results = {
          nitrogen: (loaddata.area*(loaddata.efficieny.eos_totn/loaddata.efficieny.eos_acres)),
          phosphorus: (loaddata.area*(loaddata.efficieny.eos_totp/loaddata.efficieny.eos_acres)),
          sediment: ((loaddata.area*(loaddata.efficieny.eos_tss/loaddata.efficieny.eos_acres))/2000)
        };

        console.log('results', results);

        $scope.calculate.results.totalInstalledLoad = results;
      });

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
    $scope.calculate.GetPercentageOfInstalled = function(field, format) {

      var planned_total = 0,
          installed_total = 0,
          percentage = 0;

      // Get readings organized by their Type
      angular.forEach($scope.practice.readings, function(reading, $index) {

        if (reading.measurement_period === 'Planning') {
          planned_total += reading[field];
        } else if (reading.measurement_period === 'Installation') {
          installed_total += reading[field];
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

    $scope.calculate.GetSingleInstalledLoad = function(length, width, element) {

        var efficieny = $scope.practice_efficiency,
            area = ((length*width)/43560),
            value = null;

        console.log('efficieny', efficieny);

        if (element === 'nitrogen') {
          value = (area*(efficieny.eos_totn/efficieny.eos_acres));
        } else if (element === 'phosphorus') {
          value = (area*(efficieny.eos_totp/efficieny.eos_acres));
        } else if (element === 'sediment') {
          value = ((area*(efficieny.eos_tss/efficieny.eos_acres))/2000);
        }

        return value;
    };

    $scope.calculate.GetTreeDensity = function(trees, length, width) {
      return (trees/(length*width/43560));
    };

    $scope.calculate.GetPercentage = function(part, total) {
      return ((part/total)*100);
    };

    $scope.calculate.GetConversion = function(part, total) {
      return (part/total);
    };

    $scope.calculate.GetConversionWithArea = function(length, width, total) {
      return ((length*width)/total);
    };

    $scope.calculate.GetRestorationTotal = function(unit, area) {

      var total_area = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Installation') {
          if (area) {
            total_area += ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].av);
          } else {
            total_area += $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      console.log('GetRestorationTotal', total_area, unit, (total_area/unit));


      return (total_area/unit);
    };

    $scope.calculate.GetRestorationPercentage = function(unit, area) {

      var planned_area = 0,
          total_area = $scope.calculate.GetRestorationTotal(unit, area);

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === 'Planning') {
          if (area) {
            planned_area = ($scope.practice.readings[i].length_of_buffer*$scope.practice.readings[i].average_width_of_buffer);
          } else {
            planned_area = $scope.practice.readings[i].length_of_buffer;
          }
        }
      }

      planned_area = (planned_area/unit);

      console.log(total_area, planned_area, (total_area/planned_area));

      return ((total_area/planned_area)*100);
    };

    //
    // Scope elements that run the actual equations and send them back to the user interface for display
    //
    // $scope.calculate.results = {
    //   totalPreInstallationLoad: $scope.calculate.GetPreInstallationLoad('Planning'),
    //   totalPlannedLoad: $scope.calculate.GetPlannedLoad('Planning'),
    //   totalInstalledLoad: $scope.calculate.GetInstalledLoad('Installation')
    // };


    //
    //
    //
    $scope.GetTotal = function(period) {

      var total = 0;

      for (var i = 0; i < $scope.practice.readings.length; i++) {
        if ($scope.practice.readings[i].measurement_period === period) {
          total++;
        }
      }

      return total;
    };

    $scope.total = {
      planning: $scope.GetTotal('Planning'),
      installation: $scope.GetTotal('Installation'),
      monitoring: $scope.GetTotal('Monitoring')
    };

    //
    // Load Land river segment details
    //
    Feature.GetFeature({
      storage: commonscloud.collections.land_river_segment.storage,
      featureId: $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0].id
    }).then(function(response) {
      $scope.site.type_f9d8609090494dac811e6a58eb8ef4be[0] = response;
    });

    $scope.readings = {
      bufferWidth: function() {
        for (var i = 0; i < $scope.practice.readings.length; i++) {
          if ($scope.practice.readings[i].measurement_period === 'Planning') {
            return $scope.practice.readings[i].average_width_of_buffer;
          }
        }
      },
      add: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            average_width_of_buffer: $scope.readings.bufferWidth(),
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      },
      addReading: function(practice, readingType) {
        //
        // Creating a practice reading is a two step process.
        //
        //  1. Create the new Practice Reading feature, including the owner and a new UserFeatures entry
        //     for the Practice Reading table
        //  2. Update the Practice to create a relationship with the Reading created in step 1 
        //
        Feature.CreateFeature({
          storage: $scope.storage.storage,
          data: {
            measurement_period: (readingType) ? readingType : null,
            report_date: moment().format('YYYY-MM-DD'),
            owner: $scope.user.id,
            status: 'private'
          }
        }).then(function(reportId) {

          var data = {};
          data[$scope.storage.storage] = $scope.GetAllReadings(practice.readings, reportId);

          //
          // Create the relationship with the parent, Practice, to ensure we're doing this properly we need
          // to submit all relationships that are created and should remain. If we only submit the new
          // ID the system will kick out the sites that were added previously.
          //
          Feature.UpdateFeature({
            storage: commonscloud.collections.practice.storage,
            featureId: practice.id,
            data: data
          }).then(function() {
            //
            // Once the new Reading has been associated with the existing Practice we need to
            // display the form to the user, allowing them to complete it.
            //
            $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + reportId + '/edit');
          });
        });
      }
    };

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--view.html',
      title: $scope.site.site_number + ' « ' + $scope.project.project_title,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type,
          type: 'active'
        }    
      ],
      actions: [
        {
          type: 'button-link new',
          action: function() {
            $scope.readings.add($scope.practice);
          },
          text: 'Add Measurement Data'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };


    $scope.GetAllReadings = function(existingReadings, readingId) {

      var updatedReadings = [{
        id: readingId // Start by adding the newest relationships, then we'll add the existing sites
      }];

      angular.forEach(existingReadings, function(reading, $index) {
        updatedReadings.push({
          id: reading.id
        });
      });

      return updatedReadings;
    };


    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: commonscloud.collections.project.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: commonscloud.collections.project.storage,
            featureId: $route.current.params.projectId,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
            if ($scope.user.feature.is_admin || $scope.user.feature.write) {
            } else {
              $location.path('/projects/' + $route.current.params.projectId);
            }
          });
        }

      });
    }
    
  }]);

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:UrbanHomeownerFormController
 * @description
 * # UrbanHomeownerFormController
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .controller('UrbanHomeownerFormController', ['$rootScope', '$scope', '$route', '$location', 'user', 'Template', 'Field', 'Feature', 'Storage', 'template', 'project', 'site', 'practice', 'commonscloud', function ($rootScope, $scope, $route, $location, user, Template, Field, Feature, Storage, template, project, site, practice, commonscloud) {

    //
    // Assign project to a scoped variable
    //
    $scope.template = template;

    $scope.report = {};
    
    $scope.save = function() {
      Feature.UpdateFeature({
        storage: $scope.storage.storage,
        featureId: $scope.report.id,
        data: $scope.report
      }).then(function(response) {
        $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
      }).then(function(error) {
        // Do something with the error
      });
    };

    $scope.delete = function() {

      //
      // Before we can remove the Practice we need to remove the relationship it has with the Site
      //
      //
      angular.forEach($scope.practice[$scope.storage.storage], function(feature, $index) {
        if (feature.id === $scope.report.id) {
          $scope.practice[$scope.storage.storage].splice($index, 1);
        }
      });

      Feature.UpdateFeature({
        storage: commonscloud.collections.practice.storage,
        featureId: $scope.practice.id,
        data: $scope.practice
      }).then(function(response) {
        
        //
        // Now that the Project <> Site relationship has been removed, we can remove the Site
        //
        Feature.DeleteFeature({
          storage: $scope.storage.storage,
          featureId: $scope.report.id
        }).then(function(response) {
          $location.path('/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type);
        });

      });

    };

    $scope.project = project;
    $scope.practice = practice;
    $scope.practice.practice_type = 'urban-homeowner';

    $scope.storage = Storage[$scope.practice.practice_type];

    Field.GetPreparedFields($scope.storage.templateId, 'object').then(function(response) {
      $scope.fields = response;
    });

    Feature.GetFeature({
      storage: $scope.storage.storage,
      featureId: $route.current.params.reportId
    }).then(function(report) {

      //
      // Load the reading into the scope
      //
      $scope.report = report;

      $scope.report.template = $scope.storage.templates.form;

      //
      // Add the reading information to the breadcrumbs
      //
      var page_title = 'Editing the ' + $scope.report.measurement_period + ' Report';

      $rootScope.page.links.push({
        text: page_title,
        url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + $scope.practice.practice_type + '/' + $scope.report.id + '/edit'
      });

      $rootScope.page.title = page_title;

    });

    $scope.site = site;
    $scope.user = user;
    $scope.user.owner = false;
    $scope.user.feature = {};
    $scope.user.template = {};

    //
    // Setup basic page variables
    //
    $rootScope.page = {
      template: '/modules/components/practices/views/practices--form.html',
      title: null,
      links: [
        {
          text: 'Projects',
          url: '/projects'
        },
        {
          text: $scope.project.project_title,
          url: '/projects/' + $scope.project.id,
        },
        {
          text: $scope.site.site_number,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id
        },
        {
          text: $scope.practice.name,
          url: '/projects/' + $scope.project.id + '/sites/' + $scope.site.id + '/practices/' + $scope.practice.id + '/' + Feature.MachineReadable($scope.practice.practice_type)
        }    
      ],
      actions: [
        {
          type: 'button-link',
          action: function($index) {
            $scope.delete();
          },
          visible: false,
          loading: false,
          text: 'Delete Report'
        },
        {
          type: 'button-link new',
          action: function($index) {
            $scope.save();
            $scope.page.actions[$index].loading = ! $scope.page.actions[$index].loading;
          },
          visible: false,
          loading: false,
          text: 'Save Changes'
        }
      ],
      refresh: function() {
        $route.reload();
      }
    };

    //
    // Determine whether the Edit button should be shown to the user. Keep in mind, this doesn't effect
    // backend functionality. Even if the user guesses the URL the API will stop them from editing the
    // actual Feature within the system
    //
    if ($scope.user.id === $scope.project.owner) {
      $scope.user.owner = true;
    } else {
      Template.GetTemplateUser({
        storage: $scope.storage.storage,
        templateId: $scope.template.id,
        userId: $scope.user.id
      }).then(function(response) {

        $scope.user.template = response;
        
        //
        // If the user is not a Template Moderator or Admin then we need to do a final check to see
        // if there are permissions on the individual Feature
        //
        if (!$scope.user.template.is_admin || !$scope.user.template.is_moderator) {
          Feature.GetFeatureUser({
            storage: $scope.storage.storage,
            featureId: $scope.report.id,
            userId: $scope.user.id
          }).then(function(response) {
            $scope.user.feature = response;
          });
        }

      });
    }

  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.CommonsCloud
 * @description
 * # Site
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
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
 * @name practiceMonitoringAssessmentApp.GeometryService
 * @description
 *   
 */
angular.module('practiceMonitoringAssessmentApp')
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
angular.module('practiceMonitoringAssessmentApp')
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

/*jshint camelcase: false */

/**
 * @ngdoc directive
 * @name managerApp.directive:mapboxGeocoder
 * @description
 *   The Mapbox Geocoder directive enables developers to quickly add inline
 *   geocoding capabilities to any HTML <input> or <textarea>
 */
angular.module('practiceMonitoringAssessmentApp')
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
 * @name practiceMonitoringAssessmentApp.Geocode
 *
 * @description
 *   The Geocode Service provides access to the Mapbox Geocoding API
 *
 * @see https://www.mapbox.com/developers/api/geocoding/
 */
angular.module('practiceMonitoringAssessmentApp')
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
          },
          headers: {
            'Authorization': 'external'
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
        console.warning('Mapbox Geocoding Batch Geocoding not implemented, see https://www.mapbox.com/developers/api/geocoding/ for more information.');
      }
    };

  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.Site
 * @description
 * # Site
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .constant('mapbox', {
    geocodingUrl: 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places-v1/',
    access_token: 'pk.eyJ1IjoiZGV2ZWxvcGVkc2ltcGxlIiwiYSI6IlZGVXhnM3MifQ.Q4wmA49ggy9i1rLr8-Mc-w',
    satellite: 'developedsimple.k105bd34',
    terrain: 'developedsimple.k1054a50',
    street: 'developedsimple.k1057ndn',
  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.application
 * @description
 * # application
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Application', function application() {
    
    this.$get = ['$resource', '$location', '$rootScope', function($resource, $location, $rootScope) {

      var base_resource_url = '//api.commonscloud.org/v2/applications/:id.json';

      var Application = $resource(base_resource_url, {}, {
        query: {
          method: 'GET',
          isArray: true,
          transformResponse: function(data, headersGetter) {

            var applications = angular.fromJson(data);

            return applications.response.applications;
          }
        },
        collaborators: {
          url: '//api.commonscloud.org/v2/applications/:id/users.json',
          method: 'GET',
          isArray: false
        },
        permission: {
          url: '//api.commonscloud.org/v2/applications/:id/users/:userId.json',
          method: 'GET',
          isArray: false
        },
        permissionUpdate: {
          url: '//api.commonscloud.org/v2/applications/:id/users/:userId.json',
          method: 'PATCH'
        },
        collaborator: {
          url: '//api.commonscloud.org/v2/users/:userId.json',
          method: 'GET',
          isArray: false
        },
        update: {
          method: 'PATCH'
        }
      });

      Application.GetApplication = function(applicationId) {

        //
        // Get the single application that the user wants to view
        //
        var promise = Application.get({
            id: applicationId
          }).$promise.then(function(response) {
            return response.response;
          }, function(error) {
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind reloading the page? It looks like we couldn\'t get that Application for you.'
            });
          });

        return promise;
      };

      Application.GetCollaborators = function(applicationId) {

        //
        // Get the single application that the user wants to view
        //
        var promise = Application.collaborators({
            id: applicationId
          }).$promise.then(function(response) {
            return response.response.users;
          }, function(error) {
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind reloading the page? It looks like we couldn\'t get that Application for you.'
            });
          });

        return promise;
      };

      Application.GetCollaborator = function(applicationId, userId) {

        //
        // Get the single application that the user wants to view
        //
        var promise = Application.collaborator({
            id: applicationId,
            userId: userId
          }).$promise.then(function(response) {
            return response.response;
          }, function(error) {
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind reloading the page? It looks like we couldn\'t get that Application for you.'
            });
          });

        return promise;
      };

      Application.GetCollaboratorPermissions = function(applicationId, userId) {

        //
        // Get the single application that the user wants to view
        //
        var promise = Application.permission({
            id: applicationId,
            userId: userId
          }).$promise.then(function(response) {
            return response;
          }, function(error) {
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind reloading the page? It looks like we couldn\'t get that Application for you.'
            });
          });

        return promise;
      };

      return Application;
    }];
  });

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.ImperviousSurfaceResource
 * @description
 * # ImperviousSurfaceResource
 * Service in the managerApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('Load', ['$resource', 'commonscloud', function ($resource, commonscloud) {
    return $resource(commonscloud.baseurl + commonscloud.collections.loaddata.storage + '/:id.geojson', {
      id: '@id'
    }, {
      query: {
        isArray: false
      },
    });
  }]);

'use strict';

/**
 * @ngdoc service
 * @name cleanWaterCommunitiesApp.ImperviousSurfaceResource
 * @description
 * # ImperviousSurfaceResource
 * Service in the managerApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .service('StateLoad', ['$resource', 'commonscloud', function ($resource, commonscloud) {
    return $resource(commonscloud.baseurl + commonscloud.collections.stateloaddata.storage + '/:id.json', {
      id: '@id'
    }, {
      query: {
        isArray: false
      },
    });
  }]);

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.attachment
 * @description
 * # attachment
 * Service in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Attachment', function attachment() {

    this.$get = ['$resource', function ($resource) {

      var Attachment = $resource('//api.commonscloud.org/v2/:storage/:featureId/:attachmentStorage/:attachmentId.json', {

      }, {
        delete: {
          method: 'DELETE'
        }
      });

      return Attachment;
    }];

  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.feature
 * @description
 * # feature
 * Provider in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Feature', function () {


    this.$get = ['$resource', '$rootScope', 'Template', function ($resource, $rootScope, Template) {

      var Feature = $resource('//api.commonscloud.org/v2/:storage.json', {

      }, {
        query: {
          method: 'GET',
          isArray: false,
          transformResponse: function (data, headersGetter) {
            return angular.fromJson(data);
          }
        },
        relationship: {
          method: 'GET',
          isArray: false,
          url: '//api.commonscloud.org/v2/:storage/:featureId/:relationship.json',
          transformResponse: function (data, headersGetter) {
            return angular.fromJson(data);
          }
        },
        postFiles: {
          method: 'PUT',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json',
          transformRequest: angular.identity,
          headers: {
            'Content-Type': undefined
          }
        },
        user: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        createUser: {
          method: 'POST',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        removeUser: {
          method: 'DELETE',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users/:userId.json'
        },
        users: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId/users.json'
        },
        get: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        },
        update: {
          method: 'PATCH',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        },
        delete: {
          method: 'DELETE',
          url: '//api.commonscloud.org/v2/:storage/:featureId.json'
        }
      });

      Feature.GetPaginatedFeatures = function(templateId, page) {
        
        var promise = Feature.GetTemplate(templateId, page).then(function(options) {
          return Feature.GetFeatures(options);
        });
        
        return promise;     
      };

      Feature.GetSingleFeatures = function(templateId, featureId) {
        
        var promise = Feature.GetTemplateSingleFeature(templateId, featureId).then(function(options) {
          return Feature.GetFeature(options);
        });
        
        return promise;     
      };

      Feature.GetTemplate = function(templateId, page) {
  
        var promise = Template.get({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return {
              storage: response.response.storage,
              page: page
            };
          });

        return promise;
      };

      Feature.GetTemplateSingleFeature = function(templateId, featureId) {
  
        var promise = Template.get({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return {
              storage: response.response.storage,
              featureId: featureId
            };
          });

        return promise;
      };

      Feature.GetFeatures = function(options) {

        var defaults = options.location;
        var getFilters = Feature.buildFilters(options.fields, defaults);

        var filters = {
          page: (defaults.page) ? defaults.page : null,
          results_per_page: (defaults.results_per_page) ? defaults.results_per_page : null,
          callback: (defaults.callback) ? defaults.callback : null,
          selected: getFilters,
          available: getFilters
        };

        var promise = Feature.query({
            storage: options.storage,
            page: (options.page === undefined || options.page === null) ? 1: options.page,
            q: {
              filters: Feature.getFilters(filters),
              order_by: [
                {
                  field: 'created',
                  direction: 'desc'
                }
              ]
            },
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Feature.GetRelatedFeatures = function(options) {



        var promise = Feature.relationship({
            storage: options.storage,
            relationship: options.relationship,
            featureId: options.featureId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response.features;
          });

        return promise;
      };

      Feature.MachineReadable = function(name) {
        name = name.replace(' ', '-');
        return name.toLowerCase();
      };

      Feature.HumanReadable = function(name) {
        return Feature.CapitalizeEachWord(name.replace('-', ' '));
      };

      Feature.CapitalizeEachWord = function(str) {
        return str.replace(/\w\S*/g, function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
      };

      //
      // Search a specified Feature Collection
      //
      //    storage (string) The storage string for the Feature Collection you wish to search
      //    criteria (object) An object of filters, order by, and other statements
      //    page (integer) The page number
      //    
      //
      Feature.SearchFeatures = function(storage, criteria, page) {

        var promise = Feature.query({
            storage: storage,
            page: (page === undefined || page === null) ? 1: page,
            q: criteria,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Feature.GetFeature = function(options) {

        var promise = Feature.get({
            storage: options.storage,
            featureId: options.featureId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };

      Feature.CreateFeature = function(options) {

        console.log(options);

        var promise = Feature.save({
            storage: options.storage
          }, options.data).$promise.then(function(response) {

            var feature_id = response.resource_id;

            //
            // Before we return the values we should also add the owner of the new Feature
            // to the Users list by given them project specific permissions
            //
            Feature.AddUser({
              storage: options.storage,
              featureId: feature_id,
              userId: options.data.owner,
              data: {
                read: true,
                write: true,
                is_admin: true
              }
            });

            return feature_id;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };


      Feature.UpdateFeature = function(options) {

        var promise = Feature.update({
            storage: options.storage,
            featureId: options.featureId
          }, options.data).$promise.then(function(response) {
            return response;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };

      Feature.DeleteFeature = function(options) {

        var promise = Feature.delete({
            storage: options.storage,
            featureId: options.featureId
          }).$promise.then(function(response) {
            return response;
          }, function(error) {
            $rootScope.alerts = [];
            $rootScope.alerts.push({
              'type': 'error',
              'title': 'Uh-oh!',
              'details': 'Mind trying that again? We couldn\'t find the Feature you were looking for.'
            });
          });

        return promise;
      };

      //
      // User Specific Permissions or User Lists for a specific Feature
      //
      Feature.GetFeatureUsers = function(options) {

        var promise = Feature.users({
          storage: options.storage,
          featureId: options.featureId
        }).$promise.then(function(response) {
          return response.response.users;
        });

        return promise;

      };

      Feature.GetFeatureUser = function(options) {

        var promise = Feature.user({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }).$promise.then(function(response) {
          return response.response;
        });

        return promise;

      };

      Feature.AddUser = function(options) {

        var promise = Feature.createUser({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }, options.data).$promise.then(function(response) {
          return response;
        });

        return promise;

      };

      Feature.RemoveUser = function(options) {

        var promise = Feature.removeUser({
          storage: options.storage,
          featureId: options.featureId,
          userId: options.userId
        }).$promise.then(function(response) {
          return response;
        });

        return promise;

      };

      //
      // From an Angular $location.search() object we need to parse it
      // so that we can produce an appropriate URL for our API
      //
      // Our API can accept a limited number of keywords and values this
      // functions is meant to act as a middleman to process it before
      // sending it along to the API. This functionality will grant us the
      // ability to use 'saved searches' and direct URL input from the user
      // and retain appropriate search and pagination functionality
      //
      // Keywords:
      // 
      // results_per_page (integer) The number of results per page you wish to return, not to be used like limit/offset
      // page (integer) The page number of results to return
      // callback (string) Wrap response in a Javascript function with the name of the string
      // q (object) An object containing the following attributes and values
      //   filters (array) An array of filters (i.e., {"name": <fieldname>, "op": <operatorname>, "val": <argument>})
      //   disjunction (boolean) Processed as AND or OR statement, default is False or AND
      //   limit (integer) Number of Features to limit a single call to return
      //   offset (integer) Number of Features to offset the current call
      //   order_by (array) An array of order by clauses (i.e., {"field": <fieldname>, "direction": <directionname>})
      //
      //
      // Feature.getSearchParameters = function(search_parameters) {
      //   console.log('search_parameters', search_parameters);

      //   //
      //   // We need to convert the JSON from a string to a JSON object that our application can use
      //   //
      //   var q_ = angular.fromJson(search_parameters.q);

      //   return {
      //     results_per_page: search_parameters.results_per_page,
      //     page: search_parameters.page,
      //     callback: search_parameters.callback,
      //     q: q_
      //   };
      // };


      //
      // Prepare Filters for submission via an HTTP request
      //
      Feature.getFilters = function(filters) {

        var filters_ = [];

        angular.forEach(filters.available, function(filter, $index) {

          //
          // Each Filter can have multiple criteria such as single ilike, or
          // a combination of gte and lte. We need to create an individual filter
          // for each of the criteria, even if it's for the same field.
          //
          angular.forEach(filter.filter, function(criteria, $index) {
            if (criteria.value !== null) {
              filters_.push({
                name: filter.field,
                op: criteria.op,
                val: (criteria.op === 'ilike') ? '%' + criteria.value + '%' : criteria.value
              });
            }
          });          
        
        });

        return filters_;
      };

      //
      // Build a list of Filters based on a Template Field list passed in through the fields parameter
      //
      // fields (array) An array of fields specific to a template, these need to be in the default
      //                CommonsCloudAPI's Field list format [1]
      //
      // @see [1] https://api.commonscloud.org/v2/templates/:templateId/fields.json for an example
      //
      Feature.buildFilters = function(fields, defaults) {

        //
        // Default, empty Filters list
        //
        var filters = [],
            types = {
              text: ['text', 'textarea', 'list', 'email', 'phone', 'url'],
              number: ['float', 'whole_number'],
              date: ['date', 'time']
            },
            q_ = angular.fromJson(defaults.q);

        angular.forEach(fields, function(field, $index) {
          if (Feature.inList(field.data_type, types.text)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'text',
              active: (Feature.getDefault(field, 'ilike', q_)) ? true: false,
              filter: [
                {
                  op: 'ilike',
                  value: Feature.getDefault(field, 'ilike', q_)
                }
              ]
            });
          }
          else if (Feature.inList(field.data_type, types.number)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'number',
              active: false,
              filter: [
                {
                  op: 'gte',
                  value: Feature.getDefault(field, 'gte', q_)
                },
                {
                  op: 'lte',
                  value: Feature.getDefault(field, 'lte', q_)
                }
              ]
            });
          }
          else if (Feature.inList(field.data_type, types.date)) {
            filters.push({
              label: field.label,
              field: field.name,
              type: 'date',
              active: false,
              filter: [
                {
                  op: 'gte',
                  value: Feature.getDefault(field, 'gte', q_)
                },
                {
                  op: 'lte',
                  value: Feature.getDefault(field, 'lte', q_)
                }
              ]
            });
          }
        });

        return filters;
      };

      //
      // Check if a property is in an object and then select a default value
      //
      Feature.getDefault = function(field, op, defaults) {

        var value = null;

        if (defaults && defaults.filters !== undefined) {
          angular.forEach(defaults.filters, function(default_value, $index) {
            if (field.name === default_value.name && op === default_value.op) {
              if (default_value.op === 'ilike') {
                // Remove the % from the string
                value = default_value.val.replace(/%/g, '');
              } else {
                value = default_value.val;
              }
              // console.log('default found for', default_value.name, default_value.op, default_value.val);
            }
          });
        }

        return value;
      };

      //
      // Check if a value is in a list of values
      //
      Feature.inList = function(search_value, list) {
        
        var $index;

        for ($index = 0; $index < list.length; $index++) {
          if (list[$index] === search_value) {
            return true;
          }
        }

        return false;
      };

      return Feature;
    }];

  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.field
 * @description
 * # field
 * Provider in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Field', function () {

    this.$get = ['$resource', function ($resource) {

      var Field = $resource('//api.commonscloud.org/v2/templates/:templateId/fields/:fieldId.json', {

      }, {
        query: {
          method: 'GET',
          isArray: true,
          url: '//api.commonscloud.org/v2/templates/:templateId/fields.json',
          transformResponse: function (data, headersGetter) {

            var fields = angular.fromJson(data);

            return fields.response.fields;
          }
        },
        save: {
          method: 'POST',
          url: '//api.commonscloud.org/v2/templates/:templateId/fields.json'
        },
        update: {
          method: 'PATCH'
        },
        delete: {
          method: 'DELETE',
          url: '//api.commonscloud.org/v2/templates/:templateId/fields/:fieldId.json'
        }

      });

      Field.PrepareFields = function(fields) {

        var processed_fields = [];

        angular.forEach(fields, function(field, index) {

          if (field.data_type === 'list') {
            field.options = field.options.split(',');
          }

          processed_fields.push(field);
        });

        return processed_fields;
      };

      Field.PrepareFieldsObject = function(fields) {

        var processed_fields = {};

        angular.forEach(fields, function(field, index) {

          if (field.data_type === 'list') {
            field.options = field.options.split(',');
          }

          processed_fields[field.name] = field;
        });

        return processed_fields;
      };

      Field.GetPreparedFields = function(templateId, returnAs) {

        var promise = Field.query({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            if (returnAs && returnAs === 'object') {
              return Field.PrepareFieldsObject(response);
            } else {
              return Field.PrepareFields(response);
            }
          });

        return promise;
      };


      Field.GetFields = function(templateId) {

        var promise = Field.query({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Field.GetField = function(templateId, fieldId) {

        var promise = Field.get({
            templateId: templateId,
            fieldId: fieldId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response;
          });

        return promise;
      };

      return Field;
    }];

  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.template
 * @description
 * # template
 * Provider in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('Template', function () {

    this.$get = ['$resource', function ($resource) {

      var Template = $resource('//api.commonscloud.org/v2/templates/:templateId.json', {

      }, {
        activity: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/templates/:templateId/activity.json'
        },
        user: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/templates/:templateId/users/:userId.json'
        },
        users: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/templates/:templateId/users.json'
        },
        get: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/templates/:templateId.json'
        },
        query: {
          method: 'GET',
          isArray: true,
          url: '//api.commonscloud.org/v2/applications/:applicationId/templates.json',
          transformResponse: function (data, headersGetter) {

            var templates = angular.fromJson(data);

            return templates.response.templates;
          }
        },
        save: {
          method: 'POST',
          url: '//api.commonscloud.org/v2/applications/:applicationId/templates.json'
        },
        update: {
          method: 'PATCH'
        }
      });

      Template.GetTemplate = function(templateId) {
  
        var promise = Template.get({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response;
          });

        return promise;
      };

      Template.GetTemplateList = function(applicationId) {
        
        //
        // Get a list of templates associated with the current application
        //
        var promise = Template.query({
            applicationId: applicationId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response;
          });

        return promise;
      };

      Template.GetActivities = function(templateId) {

        var promise = Template.activity({
            templateId: templateId,
            updated: new Date().getTime()
          }).$promise.then(function(response) {
            return response.response.activities;
          });

        return promise;
      };


      //
      // User Specific Permissions or User Lists for a specific Feature
      //
      //
      // User Specific Permissions or User Lists for a specific Feature
      //
      Template.GetTemplateUsers = function(options) {

        var promise = Template.users({
          storage: options.storage,
          templateId: options.templateId
        }).$promise.then(function(response) {
          return response.response;
        });

        return promise;

      };

      Template.GetTemplateUser = function(options) {

        var promise = Template.user({
          storage: options.storage,
          templateId: options.templateId,
          userId: options.userId
        }).$promise.then(function(response) {
          return response.response;
        });

        return promise;

      };


      return Template;
    }];

  });

'use strict';

/**
 * @ngdoc service
 * @name practiceMonitoringAssessmentApp.user
 * @description
 * # user
 * Provider in the practiceMonitoringAssessmentApp.
 */
angular.module('practiceMonitoringAssessmentApp')
  .provider('User', function () {

    this.$get = ['$resource', '$rootScope', '$location', '$q', 'ipCookie', '$timeout', function($resource, $rootScope, $location, $q, ipCookie, $timeout) {

      var User = $resource('//api.commonscloud.org/v2/user/me.json', {

      }, {
        query: {
          method: 'GET',
          url: '//api.commonscloud.org/v2/users.json',
          isArray: false,
          transformResponse: function (data, headersGetter) {
            return angular.fromJson(data);
          }
        }
      });

      User.GetUsers = function() {

        var promise = User.query().$promise.then(function(response) {
          return response.response.users;
        });

        return promise;

      };

      User.getUser = function (options) {

        var promise = User.get().$promise.then(function(response) {
          $rootScope.user = response.response;

          var user = response.response;

          return user;
        }, function (response) {

          if (response.status === 401 || response.status === 403) {
            console.error('Couldn\'t retrieve user information from server., need to redirect and clear cookies');

            var session_cookie = ipCookie('COMMONS_SESSION');

            if (session_cookie && session_cookie !== undefined && session_cookie !== 'undefined') {
              //
              // Clear out existing COMMONS_SESSION cookies that may be invalid or
              // expired. This may happen when a user closes the window and comes back
              //
              ipCookie.remove('COMMONS_SESSION');
              ipCookie.remove('COMMONS_SESSION', { path: '/' });

              //
              // Start a new Alerts array that is empty, this clears out any previous
              // messages that may have been presented on another page
              //
              $rootScope.alerts = ($rootScope.alerts) ? $rootScope.alerts: [];

              $rootScope.alerts.push({
                'type': 'info',
                'title': 'Please sign in again',
                'details': 'You may only sign in at one location at a time'
              });

              $location.hash('');
              $location.path('/');
            }

          }

        });

        return promise;
      };

      return User;
    }];

  });

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.controller:imageResize
 * @description
 * # imageResize
 * Directive of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
  .directive('imageResize', ['$parse', function($parse) {
      return {
        link: function(scope, elm, attrs) {
          var imagePercent;
          imagePercent = $parse(attrs.imagePercent)(scope);
          return elm.one('load', function() {
            var canvas, ctx, neededHeight, neededWidth;
            neededHeight = elm.height() * imagePercent / 100;
            neededWidth = elm.width() * imagePercent / 100;
            canvas = document.createElement('canvas');
            canvas.width = neededWidth;
            canvas.height = neededHeight;
            ctx = canvas.getContext('2d');
            ctx.drawImage(elm[0], 0, 0, neededWidth, neededHeight);
            return elm.attr('src', canvas.toDataURL('image/jpeg'));
          });
        }
      };
  }]);

'use strict';

angular.module('practiceMonitoringAssessmentApp')
  .directive('relationship', function ($http, $timeout) {
  function link(scope, el, attrs) {
    //create variables for needed DOM elements
    var container = el.children()[0];
    var input = angular.element(container.children[0]);
    var dropdown = angular.element(container.children[1]);
    var timeout;
    scope.relationship_focus = false;

    //$http request to be fired on search
    var getFilteredResults = function(table){
      var url = '//api.commonscloud.org/v2/' + table + '.json';

      $http({
        method: 'GET',
        url: url,
        params: {
          'q': {
            'filters':
            [
              {
                'name': 'name',
                'op': 'ilike',
                'val': scope.searchText + '%'
              }
            ]
          },
          'results_per_page': 6
        }
      }).success(function(data){
        //assign feature objects to scope for use in template
        scope.features = data.response.features;
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
        // scope.human_readable_values.push(feature);
        scope.model.push(feature);
      } else {
        scope.model = [];
        // scope.human_readable_values.push(feature);
        scope.model.push(feature);
      }

      scope.model = set(scope.model);

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

  return {
    scope: {
      table: '=',
      model: '=',
      fields: '=',
      placeholder: '='
    },
    templateUrl: '/modules/shared/directives/relationship/relationship.html',
    restrict: 'E',
    link: link
  };
});

'use strict';

/**
 * @ngdoc function
 * @name practiceMonitoringAssessmentApp.toAcres
 * @description
 * # toAcres
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
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
 * @name practiceMonitoringAssessmentApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the practiceMonitoringAssessmentApp
 */
angular.module('practiceMonitoringAssessmentApp')
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

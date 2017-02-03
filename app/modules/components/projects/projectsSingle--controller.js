'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('ProjectViewCtrl', function (Account, Calculate, CalculateBioretention, CalculateUrbanHomeowner, Notifications, $rootScope, Project, $route, $location, mapbox, project, Site, UALStateLoad, user) {

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
        self.sites = self.project.properties.sites

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
                    can_edit: Account.canEdit(project)
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
        type: 'button-link new',
        action: function() {
          self.createSite();
        },
        text: 'Create site'
      }
    ];



    //
    // Process rollup statistics for the entire `project`.
    //
    self.statistics = {
        sites: function(_thisProject) {

          var _self = this;

          angular.forEach(_thisProject.properties.sites, function(_site, _siteIndex) {
            console.log('Processing Site', _site.id);

            var _thesePractices = _self.practices(_site, _site.properties.practices);

          });
        },
        practices: function(_thisSite, _thesePractices) {

            var _self = this;

            angular.forEach(_thesePractices, function(_practice, _practiceIndex){

                console.log('Processing Practice', _practice);

                switch(_practice.properties.practice_type) {
                  case "In-stream Habitat":
                    var _readings = _practice.properties.readings_instream_habitat
                    var _totals = {
                        "planning": self.calculate.getTotalReadingsByCategory('Planning', _readings),
                        "installation": self.calculate.getTotalReadingsByCategory('Installation', _readings)
                    };
                    break;
                  case "Bioretention":
                    var _calculate = CalculateBioretention;
                    var _readings = _practice.properties.readings_bioretention;
                    var _loadData = {};

                    //
                    //
                    //
        if (_thisSite.properties.state) {
          UALStateLoad.query({
            q: {
              filters: [
                {
                  name: 'state',
                  op: 'eq',
                  val: _thisSite.properties.state
                }
              ]
            }
          }, function(successResponse) {

            angular.forEach(successResponse.features, function(feature, $index) {
              _loadData[feature.properties.developed_type] = {
                tn_ual: feature.properties.tn_ual,
                tp_ual: feature.properties.tp_ual,
                tss_ual: feature.properties.tss_ual
              };
            });

            console.log('loadData', _loadData);

            //
            //
            //i
                    angular.forEach(_readings, function(_reading, _readingIndex){
                        console.log('_reading', _reading.properties);

                        if (_reading.properties.measurement_period === 'Planning') {
                            var _plannedN = _calculate.plannedNitrogenLoadReduction(_reading, _loadData);
                            var _plannedP = _calculate.plannedPhosphorusLoadReduction(_reading, _loadData);
                            var _plannedS = _calculate.plannedSedimentLoadReduction(_reading, _loadData);

                            self.rollups.nitrogen.total += _plannedN;
                            self.rollups.phosphorus.total += _plannedP;
                            self.rollups.sediment.total += _plannedS;
                        } else if (_reading.properties.measurement_period === 'Installation') {
                            var _installedN = _calculate.plannedNitrogenLoadReduction(_reading, _loadData);
                            var _installedP = _calculate.plannedPhosphorusLoadReduction(_reading, _loadData);
                            var _installedS = _calculate.plannedSedimentLoadReduction(_reading, _loadData);

                            self.rollups.nitrogen.installed += _installedN;
                            self.rollups.phosphorus.installed += _installedP;
                            self.rollups.sediment.installed += _installedS;

                            //self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading);
                        }
                    });

                    self.rollups.nitrogen.chart = (self.rollups.nitrogen.installed/self.rollups.nitrogen.total)*100;
                    self.rollups.phosphorus.chart = (self.rollups.phosphorus.installed/self.rollups.phosphorus.total)*100;
                    self.rollups.sediment.chart = (self.rollups.sediment.installed/self.rollups.sediment.total)*100;



          }, function(errorResponse) {
            console.log('errorResponse', errorResponse);
          });
        } else {
          console.log('No State UAL Load Reductions could be loaded because the `Site.state` field is `null`');
        }



                    //
                    // CHESAPEAKE BAY METRICS
                    //

                    angular.forEach(_readings, function(_reading, _readingIndex){
                        console.log('_reading', _reading.properties);

                        if (_reading.properties.measurement_period === 'Planning') {
                            self.rollups.metrics.metric_1.total += _calculate.gallonsReducedPerYear(_reading);
                        } else if (_reading.properties.measurement_period === 'Installation') {
                            self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading);
                        }
                    });

                    self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;

                    break;
                  case "Urban Homeowner":
                    var _calculate = CalculateUrbanHomeowner;

                    var _readings = _practice.properties.readings_urban_homeowner;

                    angular.forEach(_readings, function(_reading, _readingIndex){
                        console.log('_reading', _reading.properties);

                        if (_reading.properties.measurement_period === 'Planning') {
                            self.rollups.metrics.metric_1.total += CalculateUrbanHomeowner.gallonsReducedPerYear(_reading.properties);
                        } else if (_reading.properties.measurement_period === 'Installation') {
                            self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading.properties);
                        }
                    });

                    self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;

                    break;

                }

                //var _theseReadings = _self.readings(_practice);
            });
        },
        readings: function(_these) {}
    };

  });

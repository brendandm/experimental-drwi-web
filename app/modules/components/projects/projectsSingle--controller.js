'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('ProjectViewCtrl', function (Account, Calculate, CalculateBankStabilization, CalculateBioretention, CalculateEnhancedStreamRestoration, CalculateForestBuffer, CalculateGrassBuffer, CalculateInstreamHabitat, CalculateLivestockExclusion, CalculateShorelineManagement, CalculateUrbanHomeowner, Notifications, $rootScope, Project, $route, $location, mapbox, project, Site, UALStateLoad, user) {

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
          units: ''
        },
        'metric_10': {
          label: 'Acres Protected Under Long-term Easment',
          installed: 0,
          total: 0,
          units: ''
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
          units: ''
        },
        'metric_14': {
          label: 'Acres of Wetlands Restored',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_15': {
          label: 'Miles of Living Shoreline Restored',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_16': {
          label: 'Miles of Stream Opened',
          installed: 0,
          total: 0,
          units: ''
        },
        'metric_17': {
          label: 'Acres of Oyster Habitat Restored',
          installed: 0,
          total: 0,
          units: ''
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
          units: ''
        },
        'metric_23': {
          label: 'Acres of Wetland Restored',
          installed: 0,
          total: 0,
          units: ''
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

              switch(_practice.properties.practice_type) {
                case "Bank Stabilization":
                  var _calculate = CalculateBankStabilization;
                  var _readings = _practice.properties.readings_bank_stabilization;

                  // BANK STABILIZATION: CHESAPEAKE BAY METRICS
                  //
                  // 1. Miles of Streambank Restored
                  //
                  angular.forEach(_readings, function(_reading, _readingIndex){
                      if (_reading.properties.measurement_period === 'Planning') {
                          self.rollups.metrics.metric_5.total += _calculate.milesStreambankRestored(_reading);
                      } else if (_reading.properties.measurement_period === 'Installation') {
                          self.rollups.metrics.metric_5.installed += _calculate.milesStreambankRestored(_reading);
                      }
                  });

                  self.rollups.metrics.metric_5.chart = (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;

                  // BANK STABILIZATION: LOAD REDUCTIONS
                  //

                  break;
                case "Bioretention":
                  var _calculate = CalculateBioretention;
                  var _readings = _practice.properties.readings_bioretention;
                  var _loadData = {};

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
                      } else if (_reading.properties.measurement_period === 'Installation') {
                          self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading);
                          self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading);
                      }
                  });

                  self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                  self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;

                  // BIORETENTION: LOAD REDUCTIONS
                  //

                  break;
                case "Enhanced Stream Restoration":
                  var _calculate = CalculateEnhancedStreamRestoration;
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
                      } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_5.installed += _calculate.milesOfStreambankRestored(_reading);
                        self.rollups.metrics.metric_6.installed += _calculate.acresTreated(_reading);
                        self.rollups.metrics.metric_7.installed += _reading.properties.connected_floodplain_surface_area;
                      }
                  });

                  self.rollups.metrics.metric_5.chart = (self.rollups.metrics.metric_5.installed/self.rollups.metrics.metric_5.total)*100;
                  self.rollups.metrics.metric_6.chart = (self.rollups.metrics.metric_6.installed/self.rollups.metrics.metric_6.total)*100;
                  self.rollups.metrics.metric_7.chart = (self.rollups.metrics.metric_7.installed/self.rollups.metrics.metric_7.total)*100;

                  // ENHANCED STREAM RESTORATION: LOAD REDUCTIONS
                  //

                  break;
                case "Forest Buffer":
                  var _calculate = CalculateForestBuffer;
                  var _readings = _practice.properties.readings_forest_buffer;

                  // FOREST BUFFER: CHESAPEAKE BAY METRICS
                  //
                  // 1. Acres of Riparian Restoration
                  // 2. Miles of Riparian Restoration
                  // 3. Number of Trees Planted
                  //
                  //
                  angular.forEach(_readings, function(_reading, _readingIndex){
                      if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_8.total += 0; // calculateForestBuffer.GetConversionWithArea(report.properties.length_of_buffer, report.properties.average_width_of_buffer, 43560)
                        self.rollups.metrics.metric_9.total += 0; // calculateForestBuffer.GetConversion(report.properties.length_of_buffer, 5280)
                        self.rollups.metrics.metric_3.total += _reading.properties.number_of_trees_planted;
                      } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_8.installed += 0;
                        self.rollups.metrics.metric_9.installed += 0;
                        self.rollups.metrics.metric_3.installed +=  _reading.properties.number_of_trees_planted;
                      }
                  });

                  self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                  self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;
                  self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;

                  // FOREST BUFFER: LOAD REDUCTIONS
                  //

                  break;
                case "Grass Buffer":
                  var _calculate = CalculateGrassBuffer;
                  var _readings = _practice.properties.readings_grass_buffer;

                  // GRASS BUFFER: CHESAPEAKE BAY METRICS
                  //
                  // 1. Acres of Riparian Restoration
                  // 2. Miles of Riparian Restoration
                  //
                  angular.forEach(_readings, function(_reading, _readingIndex){
                      if (_reading.properties.measurement_period === 'Planning') {
                        self.rollups.metrics.metric_8.total += 0; // calculateForestBuffer.GetConversionWithArea(report.properties.length_of_buffer, report.properties.average_width_of_buffer, 43560)
                        self.rollups.metrics.metric_9.total += 0; // calculateForestBuffer.GetConversion(report.properties.length_of_buffer, 5280)
                      } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_8.installed += 0;
                        self.rollups.metrics.metric_9.installed += 0;
                      }
                  });

                  self.rollups.metrics.metric_8.chart = (self.rollups.metrics.metric_8.installed/self.rollups.metrics.metric_8.total)*100;
                  self.rollups.metrics.metric_9.chart = (self.rollups.metrics.metric_9.installed/self.rollups.metrics.metric_9.total)*100;

                  // GRASS BUFFER: LOAD REDUCTIONS
                  //

                  break;
                case "In-stream Habitat":
                  var _calculate = CalculateInstreamHabitat;
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
                        self.rollups.metrics.metric_10.total += _reading.properties.metrics_areas_protected; // calculateForestBuffer.GetConversionWithArea(report.properties.length_of_buffer, report.properties.average_width_of_buffer, 43560)
                      } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_10.installed += _reading.properties.metrics_areas_protected;
                      }
                  });

                  self.rollups.metrics.metric_10.chart = (self.rollups.metrics.metric_10.installed/self.rollups.metrics.metric_10.total)*100;

                  // IN-STREAM HABITAT: LOAD REDUCTIONS
                  //

                  break;
                case "Livestock Exclusion":
                  var _calculate = CalculateLivestockExclusion;
                  var _readings = _practice.properties.readings_livestock_exclusion;

                  // LIVESTOCK EXCLUSION: CHESAPEAKE BAY METRICS
                  //
                  // 1. Miles of Fencing Installed
                  //
                  //

                  // LIVESTOCK EXCLUSION: LOAD REDUCTIONS
                  //

                  break;
                case "Non-tidal Wetlands":
                  var _calculate = CalculateWetlandsNonTidal;
                  var _readings = _practice.properties.readings_wetlands_nontidal;

                  // NON-TIDAL WETLANDS: CHESAPEAKE BAY METRICS
                  //
                  // 1. Acres of Wetland Restored
                  //
                  //

                  // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                  //

                  break;
                case "Shoreline Management":
                  var _calculate = CalculateShorelineManagement;
                  var _readings = _practice.properties.readings_shoreline_management;

                  // SHORELINE MANAGEMENT: CHESAPEAKE BAY METRICS
                  //
                  // 1. Acres of Wetland Restored
                  // 2. Miles of Living Shoreline Restored
                  //
                  //

                  // SHORELINE MANAGEMENT: LOAD REDUCTIONS
                  //

                  break;
                case "Urban Homeowner":
                  var _calculate = CalculateUrbanHomeowner;
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
                      } else if (_reading.properties.measurement_period === 'Installation') {
                        self.rollups.metrics.metric_1.installed += _calculate.gallonsReducedPerYear(_reading.properties);
                        self.rollups.metrics.metric_2.installed += _calculate.acresProtected(_reading.properties);
                        self.rollups.metrics.metric_3.installed += _calculate.quantityInstalled(_readings, 'tree_planting');
                        self.rollups.metrics.metric_4.installed += _calculate.quantityInstalled(_readings, 'impervious_cover_removal_area');
                      }
                  });

                  self.rollups.metrics.metric_1.chart = (self.rollups.metrics.metric_1.installed/self.rollups.metrics.metric_1.total)*100;
                  self.rollups.metrics.metric_2.chart = (self.rollups.metrics.metric_2.installed/self.rollups.metrics.metric_2.total)*100;
                  self.rollups.metrics.metric_3.chart = (self.rollups.metrics.metric_3.installed/self.rollups.metrics.metric_3.total)*100;
                  self.rollups.metrics.metric_4.chart = (self.rollups.metrics.metric_4.installed/self.rollups.metrics.metric_4.total)*100;

                  // URBAN HOMEOWNER: LOAD REDUCTIONS
                  //

                  break;
              }

            });

            return;
        },
        readings: function(_these) {}
    };

  });

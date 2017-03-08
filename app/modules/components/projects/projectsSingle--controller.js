'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:ProjectviewCtrl
 * @description
 * # ProjectviewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('ProjectViewCtrl', function (Account, Calculate, CalculateAgricultureGeneric, CalculateBankStabilization, CalculateBioretention, CalculateEnhancedStreamRestoration, CalculateForestBuffer, CalculateGrassBuffer, CalculateInstreamHabitat, CalculateLivestockExclusion, CalculateShorelineManagement, CalculateWetlandsNonTidal, CalculateUrbanHomeowner, LoadData, Notifications, $rootScope, Project, $route, $scope, $location, mapbox, project, Site, UALStateLoad, user, $window) {

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




    //
    // Process rollup statistics for the entire `project`.
    //
    self.statistics = {
        sites: function(_thisProject) {

          var _self = this;

          angular.forEach(_thisProject.properties.sites, function(_site, _siteIndex) {

            var _thesePractices = _self.practices(_site, _site.properties.practices);

          });
        },
        calculations: function(_thisSite, _thesePractices, _loadData) {

          var _self = this;

          angular.forEach(_thesePractices, function(_practice, _practiceIndex){

            switch(_practice.properties.practice_type) {
              case "Other Agricultural Practices":
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
                            if (_reading.properties.measurement_period === 'Planning') {
                                self.rollups.metrics.metric_23.total += _reading.properties.custom_practice_extent_acres

                                // Agriculture Generic: LOAD REDUCTIONS
                                //
                                _tempReadings.nitrogen.total += (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                                _tempReadings.phosphorus.total += (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                                _tempReadings.sediment.total += (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)

                            } else if (_reading.properties.measurement_period === 'Installation') {
                                self.rollups.metrics.metric_23.installed += _reading.properties.custom_practice_extent_acres

                                // Agriculture Generic: LOAD REDUCTIONS
                                //
                                _tempReadings.nitrogen.installed += (_reading.properties.custom_model_nitrogen === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.generic_agriculture_efficiency.properties.n_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["nitrogen"]*(_reading.properties.custom_model_nitrogen/100)
                                _tempReadings.phosphorus.installed += (_reading.properties.custom_model_phosphorus === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.generic_agriculture_efficiency.properties.p_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["phosphorus"]*(_reading.properties.custom_model_phosphorus/100)
                                _tempReadings.sediment.installed += (_reading.properties.custom_model_sediment === null) ? _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.generic_agriculture_efficiency.properties.s_efficiency/100) : _reading.properties.custom_practice_extent_acres*_calculate.ual["sediment"]*(_reading.properties.custom_model_sediment/100)
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
                var _calculate = CalculateBankStabilization;
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
                var _calculate = CalculateBioretention;
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

                _calculate.site = _thisSite;

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

                          _tempReadings.nitrogen.total += totalPlannedLoad.nitrogen;
                          _tempReadings.phosphorus.total += totalPlannedLoad.phosphorus;
                          _tempReadings.sediment.total += totalPlannedLoad.sediment;

                        } else if (_reading.properties.measurement_period === 'Installation') {

                          var _installed = _calculate.GetSingleInstalledLoad(_reading)

                          self.rollups.metrics.metric_8.installed += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.installed += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);
                          self.rollups.metrics.metric_3.installed +=  _reading.properties.number_of_trees_planted;

                          _tempReadings.nitrogen.installed += _installed.nitrogen;
                          _tempReadings.phosphorus.installed += _installed.phosphorus;
                          _tempReadings.sediment.installed += _installed.sediment;
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

                _calculate.site = _thisSite;

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
                          self.rollups.metrics.metric_8.total += _calculate.GetConversionWithArea(_reading.properties.length_of_buffer, _reading.properties.average_width_of_buffer, 43560);
                          self.rollups.metrics.metric_9.total += _calculate.GetConversion(_reading.properties.length_of_buffer, 5280);

                          _tempReadings.nitrogen.total += totalPlannedLoad.nitrogen;
                          _tempReadings.phosphorus.total += totalPlannedLoad.phosphorus;
                          _tempReadings.sediment.total += totalPlannedLoad.sediment;

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
                    self.rollups.nitrogen.total += _tempReadings.nitrogen.total
                    self.rollups.phosphorus.total += _tempReadings.phosphorus.total
                    self.rollups.sediment.total += _tempReadings.sediment.total

                    self.rollups.nitrogen.installed += _tempReadings.nitrogen.installed
                    self.rollups.phosphorus.installed += _tempReadings.phosphorus.installed
                    self.rollups.sediment.installed += _tempReadings.sediment.installed

                  });

                });

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
                var _calculate = CalculateWetlandsNonTidal;
                var _readings = _practice.properties.readings_wetlands_nontidal;

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
                      self.rollups.nitrogen.total += _results.planned.nitrogen
                      self.rollups.phosphorus.total += _results.planned.phosphorus
                      self.rollups.sediment.total += _results.planned.sediment
                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_14.installed += _calculate.milesRestored(_readings, 'Installation');

                      // NON-TIDAL WETLANDS: LOAD REDUCTIONS
                      //
                      self.rollups.nitrogen.installed += _calculate.plannedLoad(_reading, 'nitrogen')
                      self.rollups.phosphorus.installed += _calculate.plannedLoad(_reading, 'phosphorus')
                      self.rollups.sediment.installed += _calculate.plannedLoad(_reading, 'sediment')
                    }
                });

                self.rollups.metrics.metric_14.chart = (self.rollups.metrics.metric_14.installed/self.rollups.metrics.metric_14.total)*100;

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

              self.statistics.calculations(_thisSite, _thesePractices, _loadData);
            }, function(errorResponse) {
              console.log('ERROR LOADING LOAD DATA', errorResponse)
            });

            return;
        },
        readings: function(_these) {}
    };

  });

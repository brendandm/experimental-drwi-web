'use strict';

/**
 * @ngdoc function
 * @name FieldDoc.controller:SiteViewCtrl
 * @description
 * # SiteViewCtrl
 * Controller of the FieldDoc
 */
angular.module('FieldDoc')
  .controller('SiteViewCtrl', function (Account, Calculate, CalculateBankStabilization, CalculateBioretention, CalculateEnhancedStreamRestoration, CalculateForestBuffer, CalculateGrassBuffer, CalculateInstreamHabitat, CalculateLivestockExclusion, CalculateShorelineManagement, CalculateWetlandsNonTidal, CalculateUrbanHomeowner, leafletData, $location, mapbox, site, Practice, practices, project, $rootScope, $route, UALStateLoad, user) {

    var self = this;

    $rootScope.page = {};

    self.mapbox = mapbox;

    self.practices = practices;

    self.rollups = {
      active: "all",
      all: {
        practices: []
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
            console.log('Processing practice', _practice.properties.practice_type)
            switch(_practice.properties.practice_type) {
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
                      self.rollups.metrics.metric_8.total += 1; // calculateForestBuffer.GetConversionWithArea(report.properties.length_of_buffer, report.properties.average_width_of_buffer, 43560)
                      self.rollups.metrics.metric_9.total += 1; // calculateForestBuffer.GetConversion(report.properties.length_of_buffer, 5280)
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

                // GRASS BUFFER: CHESAPEAKE BAY METRICS
                //
                // 1. Acres of Riparian Restoration
                // 2. Miles of Riparian Restoration
                //
                // TODO: This is not finished ... Grass buffers has no calculation functions
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_8.total += 1; // calculateForestBuffer.GetConversionWithArea(report.properties.length_of_buffer, report.properties.average_width_of_buffer, 43560)
                      self.rollups.metrics.metric_9.total += 1; // calculateForestBuffer.GetConversion(report.properties.length_of_buffer, 5280)
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
                var _calculate = CalculateLivestockExclusion;
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

                // LIVESTOCK EXCLUSION: CHESAPEAKE BAY METRICS
                //
                // 1. Miles of Fencing Installed
                //
                //
                angular.forEach(_readings, function(_reading, _readingIndex){
                    if (_reading.properties.measurement_period === 'Planning') {
                      self.rollups.metrics.metric_22.total += _calculate.toMiles(_reading.properties.length_of_fencing);
                    } else if (_reading.properties.measurement_period === 'Installation') {
                      self.rollups.metrics.metric_22.installed += _calculate.toMiles(_reading.properties.length_of_fencing);
                    }
                });

                self.rollups.metrics.metric_22.chart = (self.rollups.metrics.metric_22.installed/self.rollups.metrics.metric_22.total)*100;

                // LIVESTOCK EXCLUSION: LOAD REDUCTIONS
                //

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
                  total: _tempReadings.sediment.total
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


  });

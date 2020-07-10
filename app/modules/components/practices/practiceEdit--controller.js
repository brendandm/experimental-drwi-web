 'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeEditController', function(Account, Image,
        $log, $location, Media, Practice, PracticeType, practice,
        Project, $q, $rootScope, $route, $scope, $timeout, $interval,
        site, user, Utility) {

        var self = this;

        $rootScope.toolbarState = {
            'edit': true
        };

        $rootScope.page = {};

        self.status = {
            loading: true,
            processing: true
        };

        self.alerts = [];

        function closeAlerts() {

            self.alerts = [];

        }

         function closeRoute() {

                    if(self.practice.site != null){
                         $location.path(self.practice.links.site.html);
                    }else{

                    } $location.path("/projects/"+self.practice.project.id);

         }

        self.confirmDelete = function(obj) {

            console.log('self.confirmDelete', obj);

            self.deletionTarget = self.deletionTarget ? null : obj;

        };

        self.cancelDelete = function() {

            self.deletionTarget = null;

        };

        /*COPY LOGIC*/

            self.confirmCopy = function(obj, targetCollection) {

                console.log('self.confirmCopy', obj, targetCollection);

                if (self.copyTarget &&
                    self.copyTarget.collection === 'project') {

                    self.cancelCopy();

                } else {

                    self.copyTarget = {
                        'collection': targetCollection,
                        'feature': obj
                    };

                }

            };

            self.cancelCopy = function() {

                self.copyTarget = null;

            };

            self.copyFeature = function(featureType, index) {

                var targetCollection,
                    targetId;

                switch (featureType) {

                    case 'practice':

                        targetCollection = Practice;

                        break;

                    case 'site':

                        targetCollection = Site;

                        break;

                    default:

                        targetCollection = Project;

                        break;

                }

                if (self.copyTarget.feature.properties) {

                    targetId = self.copyTarget.feature.properties.id;

                } else {

                    targetId = self.copyTarget.feature.id;

                }

                Practice.copy({
                    id: +targetId
                }).$promise.then(function(data) {

                    self.alerts.push({
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Successfully copied this ' + featureType + '.',
                        'prompt': 'OK'
                    });

                    console.log("COPIED PRACTICE DATA", data)

                        self.cancelCopy();

                        $timeout(closeAlerts, 2000);


                }).catch(function(errorResponse) {

                    console.log('self.copyFeature.errorResponse', errorResponse);

                    if (errorResponse.status === 409) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Unable to copy “' + self.copyTarget.feature.name + '”. There are pending tasks affecting this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else if (errorResponse.status === 403) {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'You don’t have permission to copy this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    } else {

                        self.alerts = [{
                            'type': 'error',
                            'flag': 'Error!',
                            'msg': 'Something went wrong while attempting to copy this ' + featureType + '.',
                            'prompt': 'OK'
                        }];

                    }

                    $timeout(closeAlerts, 2000);

                });

            };
/*END COPY LOGIC*/

        self.showElements = function() {

            $timeout(function() {

                self.status.loading = false;

                self.status.processing = false;

            }, 1000);

        };

        self.loadSite = function() {

            site.$promise.then(function(successResponse) {

                console.log('self.site', successResponse);

                self.site = successResponse;

                self.loadPractice();

            }, function(errorResponse) {

                //

            });

        };

        self.loadPractice = function() {

            practice.$promise.then(function(successResponse) {

                console.log('self.practice', successResponse);

                self.practice = successResponse;

                if (!successResponse.permissions.read &&
                    !successResponse.permissions.write) {

                    self.makePrivate = true;

                    return;

                }

                self.permissions.can_edit = successResponse.permissions.write;
                self.permissions.can_delete = successResponse.permissions.write;

                if (successResponse.practice_type) {

                    self.practiceType = successResponse.practice_type;

                }

                if (successResponse.site_id){
                    self.site = successResponse.site;
                }

                $rootScope.page.title = self.practice.name ? self.practice.name : 'Un-named Practice';

                 self.loadSites();

                self.processSetup(self.practice.setup);

                //
                // Load practice types
                //

                PracticeType.collection({
                    program: self.practice.project.program_id,
                    limit: 500,
                    simple_bool: 'true',
                    minimal: 'true'
                }).$promise.then(function(successResponse) {

                    console.log('self.practiceTypes', successResponse);

                    successResponse.features.forEach(function(item) {

                        item.category = item.group;

                        item.practice_type = item.group;

                    });

                    self.practiceTypes = successResponse.features;

                    self.showElements();

                }, function(errorResponse) {

                    //

                    self.showElements();

                });

            }, function(errorResponse) {

                //

            });

        };

        /*START STATE CALC*/

        self.processSetup = function(setup){

            const next_action = setup.next_action;

            self.states = setup.states;

            self.next_action = next_action;

            console.log("self.states",self.states);

            console.log("self.next_action",self.next_action);

            console.log("self.next_action_lable",self.next_action_lable);



        };

        /*END STATE CALC*/


           self.loadSites = function() {

                console.log('self.loadSites --> Starting...');

                Project.sites({

                    id: self.practice.project.id,

                    currentTime: Date.UTC()

                }).$promise.then(function(successResponse) {

                    console.log('Project sites --> ', successResponse);

                 //   self.sites = successResponse.features;

                    //self.sites = [];

                  var sites = [];
                   successResponse.features.forEach(function(item){
                        sites.push(item.properties);
                    });
                    sites.push(
                                {
                                    "name"  :   "None - this Practice is not associated with a Site",
                                    "id"    :   null
                                });
                    self.sites = sites;


               ///     self.showElements(true);


                    // self.populateMap(self.map, siteCollection, null, true);

                    // self.addMapPreviews(self.sites);

                }, function(errorResponse) {

                    console.log('loadSites.errorResponse', errorResponse);

                 //   self.showElements(false);

                });

            };



        self.scrubFeature = function(feature) {

            var excludedKeys = [
                'allocations',
                'creator',
                'dashboards',
                'geographies',
                'geometry',
                'last_modified_by',
                'members',
                'metrics',
                'metric_types',
                'organization',
                'partners',
                'partnerships',
                'practices',
                'practice_types',
                'program',
                'project',
                'reports',
                'sites',
                'status',
                'tags',
                'tasks',
                'users'
            ];

            var reservedProperties = [
                'links',
                'map_options',
                'permissions',
                '$promise',
                '$resolved'
            ];

            excludedKeys.forEach(function(key) {

                if (feature.properties) {

                    delete feature.properties[key];

                } else {

                    delete feature[key];

                }

            });

            reservedProperties.forEach(function(key) {

                delete feature[key];

            });

        };

        self.savePractice = function() {

            self.status.processing = true;

            self.scrubFeature(self.practice);

            if (self.practiceType) {

                self.practice.category_id = self.practiceType.id;

            }

            Practice.update({
                id: self.practice.id
            }, self.practice).then(function(successResponse) {

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice changes saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            }).catch(function(errorResponse) {

                // Error message

                self.alerts = [{
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Practice changes could not be saved.',
                    'prompt': 'OK'
                }];

                $timeout(closeAlerts, 2000);

                self.showElements();

            });

        };

        self.deleteFeature = function() {

            Practice.delete({
                id: +self.deletionTarget.id
            }).$promise.then(function(data) {

                self.alerts.push({
                    'type': 'success',
                    'flag': 'Success!',
                    'msg': 'Successfully deleted this practice.',
                    'prompt': 'OK'
                });

                $timeout(closeRoute, 2000);

            }).catch(function(errorResponse) {

                console.log('self.deleteFeature.errorResponse', errorResponse);

                if (errorResponse.status === 409) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Unable to delete “' + self.deletionTarget.name + '”. There are pending tasks affecting this practice.',
                        'prompt': 'OK'
                    }];

                } else if (errorResponse.status === 403) {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'You don’t have permission to delete this practice.',
                        'prompt': 'OK'
                    }];

                } else {

                    self.alerts = [{
                        'type': 'error',
                        'flag': 'Error!',
                        'msg': 'Something went wrong while attempting to delete this practice.',
                        'prompt': 'OK'
                    }];

                }

                $timeout(closeAlerts, 2000);

            });

        };

        self.setPracticeType = function($item, $model, $label) {

            console.log('self.practiceType', $item);

            self.practiceType = $item;

            self.practice.practice_type_id = $item.id;

        };

         self.setSite = function($item) {

            console.log('self.site', $item);

            self.site = $item;

            self.practice.site_id = $item.id;

        };





        //
        // Verify Account information for proper UI element display
        //
        if (Account.userObject && user) {

            user.$promise.then(function(userResponse) {

                $rootScope.user = Account.userObject = userResponse;

                self.permissions = {
                    isLoggedIn: Account.hasToken(),
                    role: $rootScope.user.properties.roles[0],
                    account: ($rootScope.account && $rootScope.account.length) ? $rootScope.account[0] : null,
                    can_edit: false
                };

            //    self.loadSite();
                self.loadPractice();
            });

        } else {

            $location.path('/logout');

        }

    });
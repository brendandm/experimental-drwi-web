'use strict';

/**
 * @ngdoc function
 * @name
 * @description
 */
angular.module('FieldDoc')
    .controller('PracticeTagController',
        function(Account, Image, $location, $log, Practice, practice, $q,
            $rootScope, $route, $scope, $timeout, $interval, user,
            Utility, SearchService, $window) {

            var self = this;

            self.practiceId = $route.current.params.practiceId;

            $rootScope.viewState = {
                'practice': true
            };

            $rootScope.toolbarState = {
                'editTags': true
            };

            $rootScope.page = {};

            self.status = {
                loading: true,
                processing: true
            };

            // 
            // Initialize container for storing grouped
            // tag selections.
            // 

            self.groupTags = {};

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

            self.searchTags = function(value) {

                var exclude = [];

                angular.forEach(self.tempTags, function(tag) {

                    exclude.push(tag.id);

                });

                return SearchService.tag({
                    q: value,
                    exclude: exclude.join(',')
                }).$promise.then(function(response) {

                    console.log('SearchService response', response);

                    return response.results.slice(0, 5);

                });

            };

            self.searchGroups = function(value) {

                return SearchService.tagGroup({
                    q: value
                }).$promise.then(function(response) {

                    console.log('SearchService response', response);

                    response.results.forEach(function(result) {

                        result.category = null;

                    });

                    return response.results.slice(0, 5);

                });

            };

            self.loadPractice = function() {

                practice.$promise.then(function(successResponse) {

                    console.log('self.practice', successResponse);

                    self.practice = successResponse;

                    self.processSetup(self.practice.setup);

                    // self.tempTags = successResponse.tags;

                    if (!successResponse.permissions.read &&
                        !successResponse.permissions.write) {

                        self.makePrivate = true;

                        return;

                    }

                    self.permissions.can_edit = successResponse.permissions.write;
                    self.permissions.can_delete = successResponse.permissions.write;

                    $rootScope.page.title = self.practice.name || 'Un-named Practice';

                    self.showElements();

                }, function(errorResponse) {

                    self.showElements();

                });

            };

            /*START STATE CALC*/

            self.processSetup = function(setup){

                const next_action = setup.next_action;

                self.states = setup.states;

                self.next_action = next_action;

                console.log("self.states",self.states);

                console.log("self.next_action",self.next_action);

            };

            /*END STATE CALC*/


            self.setGroupSelection = function(group) {

                angular.forEach(group.tags, function(tag) {

                    if (tag.selected) {

                        self.groupTags[group.id] = tag; 

                    }

                });

            };

            self.loadGroups = function() {

                Practice.tagGroups({
                    id: self.practiceId
                }).$promise.then(function(successResponse) {

                    console.log('self.groups.successResponse', successResponse);

                    self.groups = successResponse.features.grouped;

                    self.ungrouped = successResponse.features.ungrouped;

                    angular.forEach(self.groups, function(group) {

                        self.setGroupSelection(group);

                    });

                }, function(errorResponse) {

                    self.showElements();

                });

            };

            self.loadTags = function() {

                Practice.tags({
                    id: self.practiceId
                }).$promise.then(function(successResponse) {

                    console.log('self.groups.successResponse', successResponse);

                    self.tempTags = successResponse.features;

                }, function(errorResponse) {

                    self.showElements();

                });

            };

            self.scrubFeature = function(feature) {

                var excludedKeys = [
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
                    'reports',
                    'sites',
                    'status',
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

            self.addTag = function(item, model, label) {

                var existingMatch = false;

                angular.forEach(self.tempTags, function(tag) {

                    console.log('tagCheck', tag, item);

                    if (tag.id === item.id) {

                        self.tagQuery = null;

                        existingMatch = true;

                    }

                });

                if (existingMatch) return;

                self.ungrouped.push(item);

                self.tempTags.push(item);

                self.tagQuery = null;

                console.log('Updated tags (addition)', self.tempTags);

            };

            self.removeTag = function(tag) {

                var _index;

                self.ungrouped.forEach(function(item, idx) {

                    if (item.id === tag.id) {

                        _index = idx;

                    }

                });

                console.log('Remove tag at index', _index, tag);

                if (typeof _index === 'number') {

                    self.ungrouped.splice(_index, 1);

                    var tags = [];

                    angular.forEach(self.tempTags, function(_tag) {

                        if (_tag.id !== tag.id) {

                            tags.push(_tag);

                        }

                    });

                    self.tempTags = tags;

                }

                console.log('Updated tags (removal)', self.tempTags);

            };

            self.manageGroup = function(group, tag) {

                console.log('Manage group', group, tag);

                console.log('self.manageGroup --> self.tempTags', self.tempTags);

                var _index;

                // 
                // Determine if a tag from the target group is
                // already present in `self.tempTags`.
                // 

                angular.forEach(self.tempTags, function(item, idx) {

                    console.log('Seeking tag match', item, tag);

                    if (item.group && item.group.id === group.id) {

                        console.log('Match found in group', item, group);

                        _index = idx;

                    }

                });

                // 
                // If a match was found, remove it from `self.tempTags`.
                // 

                if (typeof _index === 'number') {

                    self.tempTags.splice(_index, 1);

                }

                // 
                // Add target tag to `self.tempTags`.
                // 

                self.tempTags.push(tag);

                console.log('self.tempTags.groupManaged', self.tempTags);

            };

            self.processRelations = function(list, checkSelected) {

                var _list = [];

                angular.forEach(list, function(item) {

                    var _datum = {};

                    if (item && item.id) {

                        _datum.id = item.id;

                    }

                    _list.push(_datum);

                });

                return _list;

            };

            self.processGroups = function(list) {

                var _list = [];

                console.log('self.groups', self.groups);

                angular.forEach(self.groups, function(item) {

                    var selection = self.processRelations(item.tags, true);

                    _list.push.apply(_list, selection);

                });

                console.log('processGroups._list', _list);

                return _list;

            };

            self.saveFeature = function() {

                self.status.processing = true;

                var data = {
                    tags: self.processRelations(self.tempTags)
                };

                console.log('self.saveFeature.data', data);

                Practice.update({
                    id: self.practice.id
                }, data).$promise.then(function(successResponse) {

                    self.alerts = [{
                        'type': 'success',
                        'flag': 'Success!',
                        'msg': 'Practice changes saved.',
                        'prompt': 'OK'
                    }];

                    $timeout(closeAlerts, 2000);

                    $window.scrollTo(0, 0);

                    self.loadTags();

                    self.showElements();

                }, function(errorResponse) {

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
                            'msg': 'Unable to delete “' + self.deletionTarget.properties.name + '”. There are pending tasks affecting this practice.',
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

                    self.loadPractice();

                    self.loadGroups();

                    self.loadTags();

                });

            } else {

                $location.path('/logout');

            }

        });
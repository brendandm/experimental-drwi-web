(function() {

    'use strict';

    angular.module('FieldDoc')
        .service('ProjectStore', function() {

            this.filteredProjects = [];

            this.projects = [];

            this.filterProjects = function($item) {

                console.log('ProjectStore.filterProjects.$item', $item);

                var matches;

                var collection = $item.category;

                switch (collection) {

                    case 'organization':

                        matches = this.projects.filter(function(datum) {

                            return datum.organizations.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'geography':

                        matches = this.projects.filter(function(datum) {

                            return datum.geographies.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'practice':

                        matches = this.projects.filter(function(datum) {

                            return datum.practices.indexOf($item.name) >= 0;

                        });

                        break;

                    case 'project':

                        matches = this.projects.filter(function(datum) {

                            return datum.name === $item.name;

                        });

                        break;

                    case 'project status':

                        matches = this.projects.filter(function(datum) {

                            return datum.workflow_state === $item.name;

                        });

                        break;

                    default:

                        break;

                }

                this.filteredProjects = matches;

                return matches;

            };

            this.createSet = function(a, b) {

                var primaryIndex = [],
                    secondaryIndex = [],
                    mergedIndex = [],
                    set = [];

                //
                // Create indices of numeric project identifiers
                //

                a.forEach(function(datum) {

                    primaryIndex.push(datum.id);

                });

                console.log('ProjectStore.createSet.primaryIndex', primaryIndex);

                b.forEach(function(datum) {

                    secondaryIndex.push(datum.id);

                });

                console.log('ProjectStore.createSet.secondaryIndex', secondaryIndex);

                //
                // Merge the arrays
                //

                a.concat(b);

                //
                // Populate a new array with projects
                // whose numeric identifiers appear in
                // both indices.
                //

                a.forEach(function(datum) {

                    if ((primaryIndex.indexOf(datum.id) >= 0 &&
                        secondaryIndex.indexOf(datum.id) >= 0) &&
                        mergedIndex.indexOf(datum.id) < 0) {

                        mergedIndex.push(datum.id);

                        set.push(datum);

                    }

                });

                return set;

            };

            this.filterAll = function(list) {

                var a,
                    b;

                if (!list || list.length < 1) {

                    this.reset();

                    return;

                }

                if (list.length === 1) {

                    this.filterProjects(list[0]);

                } else {

                    a = this.filterProjects(list[0]);

                    console.log('ProjectStore.filterAll.a', a);

                    b = this.filterProjects(list[1]);

                    console.log('ProjectStore.filterAll.b', b);

                    this.filteredProjects = this.createSet(a, b);

                }

            };

            this.setProjects = function(list) {

                this.projects = list;

                this.filteredProjects = list;

            };

            this.reset = function() {

                this.filteredProjects = this.projects.slice(0);

            };

        });
}());
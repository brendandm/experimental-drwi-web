(function() {

    'use strict';

    angular.module('FieldDoc')
        .factory('FilterStore', function() {

            return {
                // index: {
                //     'geography': null,
                //     'practice': null,
                //     'project': null,
                //     'organization': null,
                //     'status': null
                // },
                index: [],
                addItem: function(obj) {
                    // this.index[category] = obj;

                    this.index.push(obj);

                    // if (this.index.length < 2) {

                    //     this.index.push(obj);

                    // } else {

                    //     this.index[1] = obj;

                    // }

                },
                clearItem: function(obj) {

                    var items = this.index.filter(function(item) {

                        return (item.name !== obj.name);

                    });

                    this.index = items;

                },
                clearAll: function(obj) {

                    this.index = [];

                }

            };

        });

}());
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
                    this.index.append(obj);

                },
                clearItem: function(obj) {

                    var items = this.index.filter(function(item) {

                        return (item.name !== obj.name &&
                            item.category !== obj.category);

                    });

                    this.index = items;

                }

            };

        });

}());
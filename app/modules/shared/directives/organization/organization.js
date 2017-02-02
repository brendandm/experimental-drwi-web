(function() {

  'use strict';

  angular.module('FieldDoc')
    .directive('organization', function (environment, $http, $timeout) {
      return {
        scope: {
          table: '=',
          field: '=',
          display: '=',
          model: '=',
          tabindexnumber: '=',
          placeholder: '='
        },
        templateUrl: '/modules/shared/directives/organization/organization.html',
        restrict: 'E',
        link: function (scope, el, attrs) {

          var container = el.children()[0],
              input = angular.element(container.children[0]),
              dropdown = angular.element(container.children[1]),
              timeout;

          scope.relationship_focus = false;

          var getFilteredResults = function(table){
            var url = environment.apiUrl.concat('/v1/data/', table);

            $http({
              method: 'GET',
              url: url,
              params: {
                'q': {
                  'filters':
                  [
                    {
                      'name': scope.field,
                      'op': 'ilike',
                      'val': scope.searchText + '%'
                    }
                  ]
                },
                'results_per_page': 25
              }
            }).success(function(data){

              var features = data.features;

              scope.features = [];

              //
              // Process features prior to display
              //
              angular.forEach(features, function(feature, $index) {

                var result = [];

                angular.forEach(scope.display, function(field) {
                  result.push(feature.properties[field]);
                });

                scope.features.push({
                  'id': feature.id,
                  'feature': feature,
                  'text': result.join(', ')
                });
              });

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
              scope.model.push(feature);
              scope.model = set(scope.model);
            } else {
              scope.model = feature;
            }


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
      };
  });

}());

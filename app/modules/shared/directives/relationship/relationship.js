(function() {

  'use strict';

  angular.module('FieldStack')
    .directive('relationship', function ($http, $timeout) {
      return {
        scope: {
          table: '=',
          model: '=',
          multiple: '=',
          placeholder: '='
        },
        templateUrl: '/modules/shared/directives/relationship/relationship.html',
        restrict: 'E',
        link: function (scope, el, attrs) {

          var container = el.children()[0],
              input = angular.element(container.children[0]),
              dropdown = angular.element(container.children[1]),
              timeout;

          scope.relationship_focus = false;
          console.log('multiple', scope.multiple);
          console.log('placeholder', scope.placeholder);

          var getFilteredResults = function(table){
            var url = '//api.commonscloud.org/v2/' + table + '.json';

            $http({
              method: 'GET',
              url: url,
              params: {
                'q': {
                  'filters':
                  [
                    {
                      'name': 'name',
                      'op': 'ilike',
                      'val': scope.searchText + '%'
                    }
                  ]
                },
                'results_per_page': 25
              }
            }).success(function(data){
              //assign feature objects to scope for use in template
              scope.features = data.response.features;
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
            } else {
              scope.model = [];
              scope.model.push(feature);
            }

            scope.model = set(scope.model);

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

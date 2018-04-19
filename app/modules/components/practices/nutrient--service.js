(function() {

  'use strict';

  /**
   * @ngdoc function
   * @name
   * @description
   */
  angular.module('FieldDoc')
    .service('Nutrients', function ($log, Nutrient) {

      var nutrients = {};

      //
      // Custom Nutrient Interactions
      //
      nutrients.showNutrientForm = [];
      nutrients.showNutrientFormSaved = [];
      nutrients.showNutrientFormUpdated = [];
      nutrients.showNutrientFormDeleted = [];

      nutrients.addCustomNutrients = function(report_id) {
        nutrients.showNutrientForm[report_id] = true;

        //
        // RESET ALL MESSAGES TO HIDDEN
        //
        nutrients.showNutrientFormSaved[report_id] = false;
        nutrients.showNutrientFormUpdated[report_id] = false;
        nutrients.showNutrientFormDeleted[report_id] = false;
      }

      nutrients.cancelCustomNutrients = function(report_id) {
        nutrients.showNutrientForm[report_id] = false;

        //
        // RESET ALL MESSAGES TO HIDDEN
        //
        nutrients.showNutrientFormSaved[report_id] = false;
        nutrients.showNutrientFormUpdated[report_id] = false;
        nutrients.showNutrientFormDeleted[report_id] = false;
      }

      nutrients.saveCustomNutrients = function(report_, practice_type) {
        nutrients.showNutrientForm[report_.id] = false;

        var newNutrient = new Nutrient({
          "nitrogen": report_.properties.custom_nutrient_reductions.nitrogen,
          "nitrogen_2": report_.properties.custom_nutrient_reductions.nitrogen_2,
          "phosphorus": report_.properties.custom_nutrient_reductions.phosphorus,
          "phosphorus_2": report_.properties.custom_nutrient_reductions.phosphorus_2,
          "sediment": report_.properties.custom_nutrient_reductions.sediment,
          "sediment_2": report_.properties.custom_nutrient_reductions.sediment_2
        });

        newNutrient[practice_type] = [
          {
            "id": report_.id
          }
        ]

        newNutrient.$save().then(
          function(successResponse) {
            $log.log('saveCustomNutrients::successResponse', successResponse)
            report_.properties.custom_nutrient_reductions.id = successResponse.id;
          },
          function(errorResponse) {
            $log.log('saveCustomNutrients::errorResponse', errorResponse)
          }
        );

        nutrients.showNutrientFormSaved[report_.id] = true;
      };

      nutrients.updateCustomNutrients = function(report_) {
        nutrients.showNutrientForm[report_.id] = false;

        var existingNutrient = new Nutrient({
          "nitrogen": report_.properties.custom_nutrient_reductions.nitrogen,
          "nitrogen_2": report_.properties.custom_nutrient_reductions.nitrogen_2,
          "phosphorus": report_.properties.custom_nutrient_reductions.phosphorus,
          "phosphorus_2": report_.properties.custom_nutrient_reductions.phosphorus_2,
          "sediment": report_.properties.custom_nutrient_reductions.sediment,
          "sediment_2": report_.properties.custom_nutrient_reductions.sediment_2
        });

        existingNutrient.$update({
          "id": report_.properties.custom_nutrient_reductions.id
        }).then(
          function(successResponse) {
            $log.log('updateCustomNutrients::successResponse', successResponse)
          },
          function(errorResponse) {
            $log.log('updateCustomNutrients::errorResponse', errorResponse)
          }
        );

        nutrients.showNutrientFormUpdated[report_.id] = true;
      };

      nutrients.deleteCustomNutrients = function(report_) {
        nutrients.showNutrientForm[report_.id] = false;

        var tmp = new Nutrient({
          "id": report_.properties.custom_nutrient_reductions.id
        });

        tmp.$delete().then(
          function(successResponse) {
            $log.log('deleteCustomNutrients::successResponse', successResponse);
            report_.properties.custom_nutrient_reductions = null;
          },
          function(errorResponse) {
            $log.log('deleteCustomNutrients::errorResponse', errorResponse)
          }
        );

        nutrients.showNutrientFormDeleted[report_.id] = true;
      };

      return nutrients;

    });

}());

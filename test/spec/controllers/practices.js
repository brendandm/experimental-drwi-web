'use strict';

describe('Controller: PracticesCtrl', function () {

  // load the controller's module
  beforeEach(module('FieldStack'));

  var PracticesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PracticesCtrl = $controller('PracticesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

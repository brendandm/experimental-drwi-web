'use strict';

describe('Controller: ReportEditCtrl', function () {

  // load the controller's module
  beforeEach(module('FieldStack'));

  var ReportEditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ReportEditCtrl = $controller('ReportEditCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

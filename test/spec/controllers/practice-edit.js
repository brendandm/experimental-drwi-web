'use strict';

describe('Controller: PracticeEditCtrl', function () {

  // load the controller's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  var PracticeEditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PracticeEditCtrl = $controller('PracticeEditCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

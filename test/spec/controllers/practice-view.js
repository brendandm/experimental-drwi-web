'use strict';

describe('Controller: PracticeViewCtrl', function () {

  // load the controller's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  var PracticeViewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PracticeViewCtrl = $controller('PracticeViewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

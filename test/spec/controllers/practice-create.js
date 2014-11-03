'use strict';

describe('Controller: PracticeCreateCtrl', function () {

  // load the controller's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  var PracticeCreateCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    PracticeCreateCtrl = $controller('PracticeCreateCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

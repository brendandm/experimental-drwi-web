'use strict';

describe('Controller: ProjectviewCtrl', function () {

  // load the controller's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  var ProjectviewCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectviewCtrl = $controller('ProjectviewCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

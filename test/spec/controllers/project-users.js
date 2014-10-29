'use strict';

describe('Controller: ProjectUsersCtrl', function () {

  // load the controller's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  var ProjectUsersCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjectUsersCtrl = $controller('ProjectUsersCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

'use strict';

describe('Controller: ProjecteditCtrl', function () {

  // load the controller's module
  beforeEach(module('FieldStack'));

  var ProjecteditCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ProjecteditCtrl = $controller('ProjecteditCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

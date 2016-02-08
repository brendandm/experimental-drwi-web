'use strict';

describe('Controller: SitesCtrl', function () {

  // load the controller's module
  beforeEach(module('FieldStack'));

  var SitesCtrl,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SitesCtrl = $controller('SitesCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
    expect(scope.awesomeThings.length).toBe(3);
  });
});

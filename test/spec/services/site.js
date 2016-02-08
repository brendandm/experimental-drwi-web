'use strict';

describe('Service: Site', function () {

  // load the service's module
  beforeEach(module('FieldStack'));

  // instantiate service
  var Site;
  beforeEach(inject(function (_Site_) {
    Site = _Site_;
  }));

  it('should do something', function () {
    expect(!!Site).toBe(true);
  });

});

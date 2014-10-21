'use strict';

describe('Service: feature', function () {

  // load the service's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  // instantiate service
  var feature;
  beforeEach(inject(function (_feature_) {
    feature = _feature_;
  }));

  it('should do something', function () {
    expect(!!feature).toBe(true);
  });

});

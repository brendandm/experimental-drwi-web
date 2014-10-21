'use strict';

describe('Service: field', function () {

  // load the service's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  // instantiate service
  var field;
  beforeEach(inject(function (_field_) {
    field = _field_;
  }));

  it('should do something', function () {
    expect(!!field).toBe(true);
  });

});

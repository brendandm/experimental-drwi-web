'use strict';

describe('Service: attachment', function () {

  // load the service's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  // instantiate service
  var attachment;
  beforeEach(inject(function (_attachment_) {
    attachment = _attachment_;
  }));

  it('should do something', function () {
    expect(!!attachment).toBe(true);
  });

});

'use strict';

describe('Service: template', function () {

  // load the service's module
  beforeEach(module('practiceMonitoringAssessmentApp'));

  // instantiate service
  var template;
  beforeEach(inject(function (_template_) {
    template = _template_;
  }));

  it('should do something', function () {
    expect(!!template).toBe(true);
  });

});

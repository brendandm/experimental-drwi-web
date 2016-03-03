'use strict';

/**
 * @ngdoc service
 * @name
 * @description
 */
angular.module('FieldDoc')
  .constant('Storage', {
    'forest-buffer': {
      landuse: 'for',
      storage: 'type_ed657deb908b483a9e96d3a05e420c50',
      templateId: 141,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/forest-buffer/views/report--view.html',
        form: '/modules/components/practices/modules/forest-buffer/views/form--view.html'
      }
    },
    'grass-buffer': {
      landuse: 'hyo',
      storage: 'type_a1ee0564f2f94eda9c0ca3d6c277cf14',
      templateId: 373,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/grass-buffer/views/report--view.html',
        form: '/modules/components/practices/modules/grass-buffer/views/form--view.html'
      }
    },
    'livestock-exclusion': {
      landuse: 'hyo',
      storage: 'type_035455995db040158f5a4a107b5d8a6c',
      templateId: 375,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/livestock-exclusion/views/report--view.html',
        form: '/modules/components/practices/modules/livestock-exclusion/views/form--view.html'
      }
    },
    'urban-homeowner': {
      landuse: null,
      storage: 'type_6da15b74f6564feb90c3d581d97700fd',
      templateId: 377,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/urban-homeowner/views/report--view.html',
        form: '/modules/components/practices/modules/urban-homeowner/views/form--view.html'
      }
    },
    'bioretention': {
      landuse: null,
      storage: 'type_64d08a6ba8874ed5a76ae3f4abeb68ca',
      templateId: 380,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/bioretention/views/report--view.html',
        form: '/modules/components/practices/modules/bioretention/views/form--view.html'
      }
    },
    'instream-habitat': {
      landuse: null,
      storage: 'type_6800a0c907494118b9a8872a70ee26da',
      templateId: 381,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/instream-habitat/views/report--view.html',
        form: '/modules/components/practices/modules/instream-habitat/views/form--view.html'
      }
    },
    'bank-stabilization': {
      landuse: null,
      storage: 'type_907ba68d848c4131a0cf58a3682ff50e',
      templateId: 382,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/bank-stabilization/views/report--view.html',
        form: '/modules/components/practices/modules/bank-stabilization/views/form--view.html'
      }
    },
    'enhanced-stream-restoration': {
      landuse: null,
      storage: 'type_ff74e5abd79f4b2fbf04bf28168eaf97',
      templateId: 383,
      fields: {
        Planning: [],
        Installation: [],
        Monitoring: []
      },
      templates: {
        report: '/modules/components/practices/modules/enhanced-stream-restoration/views/report--view.html',
        form: '/modules/components/practices/modules/enhanced-stream-restoration/views/form--view.html'
      }
    }
  });

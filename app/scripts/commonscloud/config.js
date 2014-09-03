'use strict';

angular.module('commons.config', [])
//basic API configuration constants that can be used throughout the application
.constant('API_CONFIG', {
	baseURL: '//api.commonscloud.org/v2/',
	applicationURL: 'applications/:id.json',
	featureURL: ':storage.json',
	singleFeatureURL: ':storage/:featureId.json',
	fieldsURL: 'templates/:templateId/fields.json',
	singleFieldURL: 'templates/:templateId/fields/:fieldId.json',
	statsURL: 'templates/:templateId/statistics.json',
	singleStatURL: 'templates/:templateId/statistics/:statisticId.json',
	templateURL: 'applications/:id/templates.json',
	singleTemplateURL: 'templates/:templateId.json'
});
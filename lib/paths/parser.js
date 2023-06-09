'use strict';

const Path = require('./path');
const PathsStruct = require('./structs');

const { knownHttpMethods } = require('../utils/http-methods');
const enhanceStructValidationError = require('../utils/enhance-struct-validation-error');

class Parser {

	parse(schema) {

		const { paths } = schema;

		if(!paths)
			return [];

		// this.validatePaths(paths);

		return Object.entries(paths)
			.map(([uri, operations]) => this.parsePath(uri, operations))
			.reduce((acum, operations) => (acum.length ? [...acum, ...operations] : operations), []);
	}

	validatePaths(paths) {

		try {
			return PathsStruct(paths);
		} catch(e) {
			throw enhanceStructValidationError(e, 'paths');
		}
	}

	parsePath(uri, operations) {

		const pathLevelParameters = operations.parameters || [];

		return Object.entries(operations)
			.map(([httpMethod, operationData]) => this.parseOperation(uri, httpMethod, operationData, pathLevelParameters))
			.filter(Boolean);
	}

	parseOperation(uri, httpMethod, { parameters, requestBody, responses }, pathLevelParameters) {

		if(!knownHttpMethods.includes(httpMethod.toLowerCase()))
			return;

		return new Path({
			uri,
			httpMethod,
			parameters: [
				...(parameters || []),
				...pathLevelParameters
			],
			requestBody,
			responses
		});
	}

}

module.exports = Parser;

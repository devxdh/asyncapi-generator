const log = require('loglevel');
const logMessage = require('./logMessages');
const jmespath = require('jmespath');

/**
 * Determines whether the generation of a file or folder should be skipped
 * based on conditions defined in the template configuration.
 *
 * @param {Object} templateConfig - The template configuration containing conditional logic.
 * @param {string} matchedConditionPath - The matched path used to find applicable conditions.
 * @param {Object} templateParams - Parameters passed to the template.
 * @param {AsyncAPIDocument} asyncapiDocument - The AsyncAPI document used for evaluating conditions.
 * @returns {Promise<boolean>} A promise that resolves to `true` if the condition is met, allowing the file or folder to render; otherwise, resolves to `false`. 
 */
async function isGenerationConditionMet (
  templateConfig,
  matchedConditionPath,
  templateParams,
  asyncapiDocument 
) {
  const conditionalGeneration = templateConfig?.conditionalGeneration?.[matchedConditionPath];

  if (!conditionalGeneration || Object.keys(conditionalGeneration).length === 0) {
    return true;
  }

  const { subject, parameter } = conditionalGeneration;

  if (subject) {
    return conditionalSubjectGeneration(
      asyncapiDocument,
      templateConfig,
      matchedConditionPath,
      templateParams
    );
  } else if (parameter) {
    return conditionalParameterGeneration(templateConfig, matchedConditionPath, templateParams);
  }

  return true;
}

/**
 * Evaluates whether a template path should be conditionally generated 
 * based on a parameter defined in the template configuration.
 * @private
 * @async
 * @function conditionalParameterGeneration
 * @param {Object} templateConfig - The full template configuration object.
 * @param {string} matchedConditionPath - The path of the file/folder being conditionally generated.
 * @param {Object} templateParams - The parameters passed to the generator, usually user input or default values.
 * @returns {Promise<boolean>} - Resolves to `true` if the parameter passes validation, `false` otherwise.
 */
async function conditionalParameterGeneration(templateConfig, matchedConditionPath, templateParams) {
  const conditionalGenerationConfig = templateConfig.conditionalGeneration?.[matchedConditionPath];
  const parameterName = conditionalGenerationConfig.parameter;
  const parameterValue = templateParams ? templateParams[parameterName] : undefined;
  return validateStatus(parameterValue, matchedConditionPath, templateConfig);
}

/**
 * Determines whether a file should be conditionally included based on the provided subject expression
 * and optional validation logic defined in the template configuration.
 * @private
 * @param {Object} asyncapiDocument - The parsed AsyncAPI document instance used for context evaluation.
 * @param {Object} templateConfig - The configuration object that contains `conditionalGeneration` rules.
 * @param {String} matchedConditionPath - The relative path to the directory or file of the source.
 * @param {Object} templateParams - Parameters passed to the template.
 * @returns {Boolean} - Returns `true` if the file should be included; `false` if it should be skipped.
 */
async function conditionalSubjectGeneration (
  asyncapiDocument,
  templateConfig,
  matchedConditionPath,
  templateParams
) {
  const fileCondition = templateConfig.conditionalGeneration?.[matchedConditionPath];
  if (!fileCondition || !fileCondition.subject) {
    return true; 
  }
  const { subject } = fileCondition;
  const server = templateParams?.server && typeof asyncapiDocument?.servers === 'function' ? asyncapiDocument.servers().get(templateParams.server) : undefined;
  const documentJson = typeof asyncapiDocument?.json === 'function' ? asyncapiDocument.json() : asyncapiDocument;
  const source = jmespath.search({
    ...documentJson,
    server: server && typeof server.json === 'function' ? server.json() : undefined,
  }, subject);

  if (!source) {
    log.debug(logMessage.relativeSourceFileNotGenerated(matchedConditionPath, subject));
    return false;
  } 
  return validateStatus(source, matchedConditionPath, templateConfig);
}

/**
 * Validates the argument value based on the provided validation schema.
 *
 * @param {any} argument The value to validate.
 * @param {String} matchedConditionPath The matched condition path.
 * @param {Object} templateConfig - The template configuration containing conditional logic.
 * @return {Promise<Boolean>} A promise that resolves to false if the generation should be skipped, true otherwise.
 */
async function validateStatus(
  argument,
  matchedConditionPath,
  templateConfig
) {
  const validation = templateConfig.conditionalGeneration?.[matchedConditionPath]?.validate;
  if (!validation) {
    return false; 
  }
  const isValid = validation(argument);

  if (!isValid) {
    log.debug(logMessage.conditionalGenerationMatched(matchedConditionPath));
    return false;
  }
  return true;
}

module.exports = {
  isGenerationConditionMet
};
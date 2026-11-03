import type { AsyncAPIDocumentInterface, InfoInterface } from '@asyncapi/parser';
import type { AsyncAPIDocumentLike } from './types';

export { AsyncAPIDocumentLike };

/**
 * Validate and retrieve the AsyncAPI info object from an AsyncAPI document.
 *
 * Throws an error if the provided AsyncAPI document has no `info` section.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @returns {InfoInterface} The validated info object from the AsyncAPI document.
 */
export const getInfo = (asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike): InfoInterface => {
  if (!asyncapi) {
    throw new Error('Make sure you pass AsyncAPI document as an argument.');
  }
  if (!asyncapi.info) {
    throw new Error("Provided AsyncAPI document doesn't contain Info object.");
  }
  const info = asyncapi.info();
  if (!info) {
    throw new Error('AsyncAPI document info object cannot be empty.');
  }
  return info as InfoInterface;
};

/**
 * Validate and retrieve the AsyncAPI title parameter in the info object.
 *
 * Throws an error if the provided AsyncAPI info object lacks a `title` parameter.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @throws {Error} When `title` is `null` or `undefined` or `empty string`.
 * @returns {string} The retrieved `title` parameter.
 */
export const getTitle = (asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike): string => {
  const info = getInfo(asyncapi);
  if (!info.title) {
    throw new Error("Provided AsyncAPI document info field doesn't contain title.");
  }
  const title = typeof info.title === 'function' ? info.title() : (info as any).title;
  if (title === '') {
    throw new Error('AsyncAPI document title cannot be an empty string.');
  }
  
  return title;
};

/**
 * Get client name from AsyncAPI info.title or uses a custom name if provided.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @param {boolean} [appendClientSuffix] - Whether to append "Client" to the generated name
 * @param {string} [customClientName] - Optional custom client name to use instead of generating from title
 * 
 * @returns {string} The formatted client name, either the custom name or a generated name based on the title
 */
export const getClientName = (
  asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike,
  appendClientSuffix?: boolean,
  customClientName?: string
): string => {
  if (customClientName) {
    return customClientName;
  }
  const title = getTitle(asyncapi);
  const baseName = `${title.replace(/\s+/g, '') // Remove all spaces
    .replace(/^./, char => char.toUpperCase())}`; // Make the first letter uppercase
  return appendClientSuffix ? `${baseName}Client` : baseName;
};

/**
 * Convert a camelCase or PascalCase string to snake_case.
 * If the string is already in snake_case, it will be returned unchanged.
 * 
 * @param {string} inputStr - The string to convert to snake_case
 * @returns {string} The converted snake_case string
 */
export const toSnakeCase = (inputStr: string): string => {
  return inputStr
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};

/**
 * Convert a string to camelCase.
 *
 * @param {string} inputStr - The string to convert to camelCase
 * @returns {string} The converted camelCase string
 */
export const toCamelCase = (inputStr: string): string => {
  return inputStr
    .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => chr ? chr.toUpperCase() : '')
    .replace(/^./, (match) => match.toLowerCase());
};

/**
 * Convert the first character of a string to lowercase.
 *
 * @param {string} inputStr - The input string
 * @returns {string} The string with first character in lowercase
 */
export const lowerFirst = (inputStr: string): string => {
  return inputStr.charAt(0).toLowerCase() + inputStr.slice(1);
};

/**
 * Convert the first character of a string to uppercase.
 *
 * @param {string} inputStr - The input string
 * @returns {string} The string with first character in uppercase
 */
export const upperFirst = (inputStr: string): string => {
  return inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
};

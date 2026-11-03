import type { AsyncAPIDocumentInterface, InfoInterface } from '@asyncapi/parser';
import type { AsyncAPIDocumentLike } from './types';

export type { AsyncAPIDocumentLike };

/**
 * Validate and retrieve the AsyncAPI info object from an AsyncAPI document.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @throws {Error} If asyncapi is not provided, does not contain info method, or info returns null.
 * @returns {InfoInterface} The validated info object.
 */
export const getInfo = (asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike): InfoInterface => {
  if (!asyncapi || typeof asyncapi !== 'object') {
    throw new Error('Make sure you pass AsyncAPI document as an argument.');
  }
  if (typeof asyncapi.info !== 'function') {
    throw new Error("Provided AsyncAPI document doesn't contain Info object.");
  }
  const info = asyncapi.info();
  if (!info) {
    throw new Error('AsyncAPI document info object cannot be empty.');
  }
  return info as InfoInterface;
};

/**
 * Validate and retrieve the AsyncAPI title parameter from the info object.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @throws {Error} When title is missing or is an empty string.
 * @returns {string} The non-empty title string.
 */
export const getTitle = (asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike): string => {
  const info = getInfo(asyncapi);
  if (!('title' in info) || (info as { title?: unknown }).title === undefined) {
    throw new Error("Provided AsyncAPI document info field doesn't contain title.");
  }
  
  const titleVal = typeof info.title === 'function' 
    ? info.title() 
    : (info as { title: unknown }).title;

  if (typeof titleVal !== 'string') {
    throw new Error("Provided AsyncAPI document info field doesn't contain title.");
  }
  if (titleVal === '') {
    throw new Error('AsyncAPI document title cannot be an empty string.');
  }
  
  return titleVal;
};

/**
 * Get client name from AsyncAPI info.title or uses a custom name if provided.
 *
 * Strips whitespace, capitalizes the first character, and optionally appends 'Client'.
 *
 * @param {AsyncAPIDocumentInterface | AsyncAPIDocumentLike} asyncapi - The AsyncAPI document object.
 * @param {boolean} [appendClientSuffix=false] - Whether to append "Client" to the generated name.
 * @param {string} [customClientName] - Optional custom client name to use instead of generating from title.
 * @returns {string} The formatted client name.
 */
export const getClientName = (
  asyncapi: AsyncAPIDocumentInterface | AsyncAPIDocumentLike,
  appendClientSuffix = false,
  customClientName?: string
): string => {
  if (customClientName && customClientName.length > 0) {
    return customClientName;
  }
  const title = getTitle(asyncapi);
  const baseName = `${title.replace(/\s+/g, '').replace(/^./, char => char.toUpperCase())}`;
  return appendClientSuffix ? `${baseName}Client` : baseName;
};

/**
 * Convert a camelCase, PascalCase, or delimiter-separated string to snake_case.
 *
 * @param {string} inputStr - The string to convert.
 * @returns {string} The converted snake_case string.
 */
export const toSnakeCase = (inputStr: string): string => {
  return inputStr
    .replace(/\W+/g, ' ')
    .split(/ |\B(?=[A-Z])/)
    .map((word) => word.toLowerCase())
    .join('_');
};

/**
 * Convert a delimiter-separated or kebab/snake string to camelCase.
 *
 * @param {string} inputStr - The string to convert.
 * @returns {string} The converted camelCase string.
 */
export const toCamelCase = (inputStr: string): string => {
  return inputStr
    .replace(/[^a-zA-Z0-9]+(.)?/g, (match, chr) => (chr ? chr.toUpperCase() : ''))
    .replace(/^./, (match) => match.toLowerCase());
};

/**
 * Convert the first character of a string to lowercase.
 *
 * @param {string} inputStr - The input string.
 * @returns {string} The string with first character in lowercase.
 */
export const lowerFirst = (inputStr: string): string => {
  return inputStr.charAt(0).toLowerCase() + inputStr.slice(1);
};

/**
 * Convert the first character of a string to uppercase.
 *
 * @param {string} inputStr - The input string.
 * @returns {string} The string with first character in uppercase.
 */
export const upperFirst = (inputStr: string): string => {
  return inputStr.charAt(0).toUpperCase() + inputStr.slice(1);
};

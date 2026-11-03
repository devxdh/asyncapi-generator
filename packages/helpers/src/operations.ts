import type { OperationInterface, MessageInterface } from '@asyncapi/parser';
import type { OperationLike, MessageLike } from './types';

export type { OperationLike, MessageLike };

/**
 * Get messages related to the provided operation.
 *
 * @param {OperationInterface | OperationLike} operation - The AsyncAPI operation object.
 * @throws {Error} If operation object is not provided or is invalid.
 * @returns {MessageInterface[] | null} Array of messages resulting from operation, or null if there are no messages.
 */
export function getOperationMessages(
  operation: OperationInterface | OperationLike
): MessageInterface[] | null {
  if (!operation || typeof operation !== 'object') {
    throw new Error('Operation object must be provided.');
  }
  if (typeof operation.messages !== 'function') {
    throw new Error('Operation object must be provided.');
  }
  const messages = operation.messages();
  if (!messages || typeof messages !== 'object') {
    return null;
  }
  if (typeof messages.isEmpty === 'function' && messages.isEmpty()) {
    return null;
  }
  if (typeof messages.all !== 'function') {
    return null;
  }
  const allMessages = messages.all();
  if (!allMessages || allMessages.length === 0) {
    return null;
  }
  return allMessages as MessageInterface[];
}

/**
 * Get examples related to the provided message.
 *
 * @param {MessageInterface | MessageLike} message - The AsyncAPI message object.
 * @throws {Error} If message object is not provided or is invalid.
 * @returns {unknown[] | null} An array of examples for the provided message, or null if there are no examples.
 */
export function getMessageExamples(
  message: MessageInterface | MessageLike
): unknown[] | null {
  if (!message || typeof message !== 'object') {
    throw new Error('Message object must be provided.');
  }
  if (typeof message.examples !== 'function') {
    throw new Error('Message object must be provided.');
  }
  const examples = message.examples();
  if (!examples || typeof examples !== 'object') {
    return null;
  }
  if (typeof examples.isEmpty === 'function' && examples.isEmpty()) {
    return null;
  }
  if (Array.isArray(examples) && examples.length === 0) {
    return null;
  }
  return examples as unknown as unknown[];
}

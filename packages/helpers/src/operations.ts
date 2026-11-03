import type { OperationInterface, MessageInterface } from '@asyncapi/parser';
import type { OperationLike, MessageLike } from './types';

export { OperationLike, MessageLike };

/**
 * Get messages related to the provided operation.
 * @param {OperationInterface | OperationLike} operation - The AsyncAPI operation object. 
 * @throws {Error} If operation object is not provided or is invalid.
 * 
 * @returns {null} if there are no messages
 * @returns {MessageInterface[] | null} messages resulting from operation
 */
export function getOperationMessages(
  operation: OperationInterface | OperationLike
): MessageInterface[] | null {
  if (!operation) {
    throw new Error('Operation object must be provided.');
  }
  const messages = operation.messages();
  if (messages.isEmpty?.() ?? false) {
    return null;
  }
  return messages.all() as MessageInterface[];
}

/**
 * Get examples related to the provided message.
 * @param {MessageInterface | MessageLike} message - The AsyncAPI message object.
 * @returns {unknown[] | null} - An array of examples for the provided message, or null if there are no examples.
 * @throws {Error} If message object is not provided or is invalid.
 */
export function getMessageExamples(
  message: MessageInterface | MessageLike
): unknown[] | null {
  if (!message) {
    throw new Error('Message object must be provided.');
  }
  const examples = message.examples?.();
  if (!examples || (examples.isEmpty?.() ?? false)) {
    return null;
  }
  return examples as unknown as unknown[];
}
